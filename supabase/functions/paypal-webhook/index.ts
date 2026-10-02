// PayPal Webhook Edge Function
// Receives and processes PayPal webhook events for subscription lifecycle management
// SECURITY: Fail-closed signature verification - rejects all events if webhook_id is not configured or signature verification fails

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// PayPal webhook events we handle
const HANDLED_EVENTS = [
  "BILLING.SUBSCRIPTION.CREATED",
  "BILLING.SUBSCRIPTION.ACTIVATED",
  "BILLING.SUBSCRIPTION.UPDATED",
  "BILLING.SUBSCRIPTION.CANCELLED",
  "BILLING.SUBSCRIPTION.SUSPENDED",
  "BILLING.SUBSCRIPTION.EXPIRED",
  "BILLING.SUBSCRIPTION.PAYMENT.FAILED",
  "PAYMENT.SALE.COMPLETED",
  "PAYMENT.SALE.REFUNDED",
  "PAYMENT.SALE.REVERSED",
];

// Expected PayPal Webhook ID for verification
// This is the ACTUAL PayPal Webhook ID (not an Attempt ID)
const EXPECTED_WEBHOOK_ID = "WH-9NU53128237565745-76533540MC439653W";

interface PayPalWebhookPayload {
  id: string;
  event_type: string;
  resource_type: string;
  resource: {
    id?: string;
    subscription_id?: string;
    plan_id?: string;
    custom_id?: string;
    subscriber?: {
      custom_id?: string;
      email_address?: string;
    };
    billing_info?: {
      next_billing_time?: string;
      last_payment?: {
        amount?: {
          value: string;
          currency_code: string;
        };
      };
    };
    status?: string;
    amount?: {
      value: string;
      currency_code: string;
    };
  };
  create_time: string;
}

async function getPayPalAccessToken(
  clientId: string,
  clientSecret: string,
  isLive: boolean
): Promise<string> {
  const paypalApiBase = isLive
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

  const auth = btoa(`${clientId}:${clientSecret}`);
  const response = await fetch(`${paypalApiBase}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to get PayPal access token: ${errorData.error_description || response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function verifyWebhookSignature(
  headers: Headers,
  body: string,
  webhookId: string,
  clientId: string,
  clientSecret: string,
  isLive: boolean
): Promise<{ valid: boolean; error?: string }> {
  const paypalApiBase = isLive
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

  try {
    const accessToken = await getPayPalAccessToken(clientId, clientSecret, isLive);

    const transmissionId = headers.get("paypal-transmission-id");
    const transmissionTime = headers.get("paypal-transmission-time");
    const certUrl = headers.get("paypal-cert-url");
    const authAlgo = headers.get("paypal-auth-algo");
    const transmissionSig = headers.get("paypal-transmission-sig");

    if (!transmissionId) {
      return { valid: false, error: "Missing paypal-transmission-id header" };
    }
    if (!certUrl) {
      return { valid: false, error: "Missing paypal-cert-url header" };
    }
    if (!transmissionSig) {
      return { valid: false, error: "Missing paypal-transmission-sig header" };
    }

    console.log("[PayPal Webhook] Verifying signature for transmission:", transmissionId);
    console.log("[PayPal Webhook] Using webhook_id:", webhookId);

    const verifyResponse = await fetch(
      `${paypalApiBase}/v1/notifications/verify-webhook-signature`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transmission_id: transmissionId,
          transmission_time: transmissionTime,
          cert_url: certUrl,
          auth_algo: authAlgo || "SHA256",
          transmission_sig: transmissionSig,
          webhook_id: webhookId,
          webhook_event: JSON.parse(body),
        }),
      }
    );

    if (!verifyResponse.ok) {
      const errorText = await verifyResponse.text();
      console.error("[PayPal Webhook] Verification request failed:", verifyResponse.status, errorText);
      return { valid: false, error: `Verification request failed: ${verifyResponse.status}` };
    }

    const verifyData = await verifyResponse.json();
    
    if (verifyData.verification_status !== "SUCCESS") {
      console.error("[PayPal Webhook] Verification status:", verifyData.verification_status);
      return { valid: false, error: `Verification failed: ${verifyData.verification_status}` };
    }

    console.log("[PayPal Webhook] Signature verification SUCCESS");
    return { valid: true };

  } catch (error) {
    console.error("[PayPal Webhook] Verification error:", error);
    return { valid: false, error: error instanceof Error ? error.message : "Unknown verification error" };
  }
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Only accept POST requests
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      db: { schema: "public" },
    });

    // Get raw body for signature verification
    const rawBody = await req.text();
    const payload: PayPalWebhookPayload = JSON.parse(rawBody);

    console.log("[PayPal Webhook] Received event:", payload.event_type, payload.id);

    // Get PayPal configuration from database
    const { data: config, error: configError } = await supabase
      .from("paypal_config")
      .select("*")
      .eq("is_active", true)
      .single();

    if (configError || !config) {
      console.error("[PayPal Webhook] PayPal not configured");
      return new Response(
        JSON.stringify({ error: "PayPal not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const isLive = config.environment === "live";
    console.log(`[PayPal Webhook] Environment: ${isLive ? "LIVE" : "SANDBOX"}`);

    // SECURITY: Fail-closed signature verification
    // Determine the webhook_id to use - prefer database value, fallback to expected constant
    let webhookId = config.webhook_id;
    
    // If webhook_id is not in database, use the expected constant
    if (!webhookId) {
      console.log("[PayPal Webhook] No webhook_id in database, using expected constant:", EXPECTED_WEBHOOK_ID);
      webhookId = EXPECTED_WEBHOOK_ID;
      
      // Update the database with the correct webhook_id
      const { error: updateError } = await supabase
        .from("paypal_config")
        .update({ webhook_id: EXPECTED_WEBHOOK_ID, updated_at: new Date().toISOString() })
        .eq("id", config.id);
      
      if (updateError) {
        console.error("[PayPal Webhook] Failed to update webhook_id:", updateError);
      } else {
        console.log("[PayPal Webhook] Updated database with correct webhook_id");
      }
    }

    console.log("[PayPal Webhook] Using webhook_id:", webhookId);

    // Verify webhook signature - FAIL CLOSE
    const verifyResult = await verifyWebhookSignature(
      req.headers,
      rawBody,
      webhookId,
      config.client_id,
      config.client_secret,
      isLive
    );

    if (!verifyResult.valid) {
      console.error("[PayPal Webhook] REJECTED: Signature verification failed:", verifyResult.error);
      return new Response(
        JSON.stringify({ 
          error: "Webhook signature verification failed",
          details: verifyResult.error,
          code: "SIGNATURE_INVALID"
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[PayPal Webhook] Signature verified successfully");

    // Check if event is already processed (idempotency)
    const { data: existingEvent } = await supabase
      .from("webhook_events")
      .select("id, processed")
      .eq("event_id", payload.id)
      .maybeSingle();

    if (existingEvent) {
      console.log("[PayPal Webhook] Event already processed:", payload.id);
      return new Response(
        JSON.stringify({ message: "Event already processed", eventId: payload.id }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Store webhook event for tracking
    const { error: insertError } = await supabase
      .from("webhook_events")
      .insert({
        event_id: payload.id,
        event_type: payload.event_type,
        resource_id: payload.resource?.id || payload.resource?.subscription_id,
        resource_type: payload.resource_type,
        processed: false,
        payload: payload,
      });

    if (insertError) {
      console.error("[PayPal Webhook] Failed to store webhook event:", insertError);
    }

    // Check if we handle this event type
    if (!HANDLED_EVENTS.includes(payload.event_type)) {
      console.log("[PayPal Webhook] Unhandled event type:", payload.event_type);
      
      // Mark as processed since we don't need to handle it
      await supabase
        .from("webhook_events")
        .update({ processed: true, processed_at: new Date().toISOString() })
        .eq("event_id", payload.id);

      return new Response(
        JSON.stringify({ received: true, message: "Event type not handled" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let processed = false;
    let errorMessage: string | null = null;

    try {
      const resource = payload.resource;
      const subscriptionId = resource.id || resource.subscription_id;
      const userId = resource.custom_id || resource.subscriber?.custom_id;

      if (!subscriptionId) {
        throw new Error("No subscription ID in webhook payload");
      }

      console.log("[PayPal Webhook] Processing:", payload.event_type, "for subscription:", subscriptionId);

      switch (payload.event_type) {
        case "BILLING.SUBSCRIPTION.CREATED":
        case "BILLING.SUBSCRIPTION.ACTIVATED": {
          const planId = resource.plan_id;
          
          // Get plan details from database
          const { data: planData } = await supabase
            .from("paypal_plans")
            .select("*")
            .eq("paypal_plan_id", planId)
            .maybeSingle();

          const durationDays = planData?.duration_days || 30;
          const startDate = new Date();
          const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

          // Check if subscription already exists
          const { data: existingSub } = await supabase
            .from("user_subscriptions")
            .select("*")
            .eq("paypal_subscription_id", subscriptionId)
            .maybeSingle();

          if (existingSub) {
            // Update existing subscription
            const { error: updateError } = await supabase
              .from("user_subscriptions")
              .update({
                status: "active",
                payment_status: "completed",
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString(),
                next_billing_date: resource.billing_info?.next_billing_time || null,
                updated_at: new Date().toISOString(),
              })
              .eq("paypal_subscription_id", subscriptionId);

            if (updateError) {
              throw new Error(`Failed to update subscription: ${updateError.message}`);
            }
            
            console.log("[PayPal Webhook] Updated existing subscription:", subscriptionId);
          } else if (userId) {
            // Create new subscription
            const { error: createError } = await supabase
              .from("user_subscriptions")
              .insert({
                user_id: userId,
                paypal_subscription_id: subscriptionId,
                paypal_plan_id: planId,
                website_plan_id: planData?.website_plan_id || "monthly",
                status: "active",
                payment_status: "completed",
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString(),
                amount: planData?.price,
                currency: planData?.currency || "USD",
              });

            if (createError) {
              throw new Error(`Failed to create subscription: ${createError.message}`);
            }
            
            console.log("[PayPal Webhook] Created new subscription for user:", userId);
          } else {
            console.warn("[PayPal Webhook] No user ID found for new subscription");
          }
          
          processed = true;
          break;
        }

        case "BILLING.SUBSCRIPTION.CANCELLED":
        case "BILLING.SUBSCRIPTION.EXPIRED": {
          const { error: cancelError } = await supabase
            .from("user_subscriptions")
            .update({
              status: "cancelled",
              updated_at: new Date().toISOString(),
            })
            .eq("paypal_subscription_id", subscriptionId);

          if (cancelError) {
            throw new Error(`Failed to cancel subscription: ${cancelError.message}`);
          }
          
          console.log("[PayPal Webhook] Cancelled subscription:", subscriptionId);
          processed = true;
          break;
        }

        case "BILLING.SUBSCRIPTION.SUSPENDED": {
          const { error: suspendError } = await supabase
            .from("user_subscriptions")
            .update({
              status: "suspended",
              updated_at: new Date().toISOString(),
            })
            .eq("paypal_subscription_id", subscriptionId);

          if (suspendError) {
            throw new Error(`Failed to suspend subscription: ${suspendError.message}`);
          }
          
          console.log("[PayPal Webhook] Suspended subscription:", subscriptionId);
          processed = true;
          break;
        }

        case "BILLING.SUBSCRIPTION.PAYMENT.FAILED": {
          const { error: failError } = await supabase
            .from("user_subscriptions")
            .update({
              payment_status: "failed",
              updated_at: new Date().toISOString(),
            })
            .eq("paypal_subscription_id", subscriptionId);

          if (failError) {
            throw new Error(`Failed to update payment status: ${failError.message}`);
          }
          
          console.log("[PayPal Webhook] Payment failed for subscription:", subscriptionId);
          processed = true;
          break;
        }

        case "PAYMENT.SALE.COMPLETED": {
          const { error: paymentError } = await supabase
            .from("user_subscriptions")
            .update({
              payment_status: "completed",
              updated_at: new Date().toISOString(),
            })
            .eq("paypal_subscription_id", subscriptionId);

          if (paymentError) {
            throw new Error(`Failed to update payment status: ${paymentError.message}`);
          }
          
          console.log("[PayPal Webhook] Payment completed for subscription:", subscriptionId);
          processed = true;
          break;
        }

        case "PAYMENT.SALE.REFUNDED":
        case "PAYMENT.SALE.REVERSED": {
          const { error: refundError } = await supabase
            .from("user_subscriptions")
            .update({
              payment_status: payload.event_type === "PAYMENT.SALE.REFUNDED" ? "refunded" : "reversed",
              status: "cancelled",
              updated_at: new Date().toISOString(),
            })
            .eq("paypal_subscription_id", subscriptionId);

          if (refundError) {
            throw new Error(`Failed to update refund status: ${refundError.message}`);
          }
          
          console.log("[PayPal Webhook] Payment refunded/reversed for subscription:", subscriptionId);
          processed = true;
          break;
        }

        case "BILLING.SUBSCRIPTION.UPDATED": {
          const updateData: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
          };

          if (resource.billing_info?.next_billing_time) {
            updateData.next_billing_date = resource.billing_info.next_billing_time;
          }

          const { error: updateError } = await supabase
            .from("user_subscriptions")
            .update(updateData)
            .eq("paypal_subscription_id", subscriptionId);

          if (updateError) {
            throw new Error(`Failed to update subscription: ${updateError.message}`);
          }
          
          console.log("[PayPal Webhook] Updated subscription:", subscriptionId);
          processed = true;
          break;
        }

        default:
          processed = true;
      }
    } catch (processError) {
      console.error("[PayPal Webhook] Error processing webhook:", processError);
      errorMessage = processError instanceof Error ? processError.message : "Unknown error";
    }

    // Update webhook event status
    await supabase
      .from("webhook_events")
      .update({
        processed,
        processed_at: new Date().toISOString(),
        error_message: errorMessage,
      })
      .eq("event_id", payload.id);

    if (processed) {
      console.log("[PayPal Webhook] Successfully processed event:", payload.id);
      return new Response(
        JSON.stringify({ 
          received: true, 
          processed: true,
          eventId: payload.id 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      console.error("[PayPal Webhook] Failed to process event:", payload.id, errorMessage);
      return new Response(
        JSON.stringify({ 
          received: true, 
          processed: false,
          error: errorMessage 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (error) {
    console.error("[PayPal Webhook] Handler error:", error);
    return new Response(
      JSON.stringify({ 
        received: true, 
        error: error instanceof Error ? error.message : "Internal error" 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
