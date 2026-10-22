// PayPal Subscription Edge Function
// Handles creating and managing PayPal subscriptions
// Secure: verifies Supabase Auth JWT, prevents IDOR, supports direct verification and cancellation

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CreateSubscriptionRequest {
  planId?: string;
  userId?: string;
  action?: "create" | "cancel";
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
    const errorData = await response.json().catch(() => ({}));
    console.error("PayPal token error:", errorData);
    throw new Error(`Failed to get PayPal access token: ${errorData.error_description || response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function getAuthenticatedUser(
  req: Request,
  supabaseUrl: string,
  serviceKey: string
) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.replace("Bearer ", "").trim();
  const anonClient = createClient(
    supabaseUrl,
    Deno.env.get("SUPABASE_ANON_KEY") || serviceKey
  );
  const { data: { user }, error } = await anonClient.auth.getUser(token);
  if (error || !user) {
    return null;
  }
  return user;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      db: { schema: "public" },
    });

    const method = req.method;
    const url = new URL(req.url);

    // Get PayPal configuration from database
    const { data: config, error: configError } = await supabase
      .from("paypal_config")
      .select("*")
      .eq("is_active", true)
      .single();

    if (configError || !config) {
      console.error("PayPal config error:", configError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "PayPal not configured. Please contact support." 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const isLive = config.environment === "live";
    const paypalApiBase = isLive
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

    console.log(`[PayPal Subscription] Environment: ${isLive ? "LIVE" : "SANDBOX"}`);

    // POST - Create subscription OR Cancel subscription
    if (method === "POST") {
      let body: CreateSubscriptionRequest;
      
      try {
        body = await req.json();
      } catch (parseError) {
        console.error("Failed to parse request body:", parseError);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: "Invalid request body" 
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Security: Authenticate user from Supabase JWT
      const authUser = await getAuthenticatedUser(req, supabaseUrl, supabaseServiceKey);

      // Handle Cancel Subscription Action
      if (body.action === "cancel") {
        if (!authUser) {
          return new Response(
            JSON.stringify({ success: false, error: "Unauthorized. Please sign in to cancel." }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: sub, error: subError } = await supabase
          .from("user_subscriptions")
          .select("*")
          .eq("user_id", authUser.id)
          .in("status", ["active", "pending"])
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (subError || !sub || !sub.paypal_subscription_id) {
          return new Response(
            JSON.stringify({ success: false, error: "No active subscription found to cancel." }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        try {
          const accessToken = await getPayPalAccessToken(config.client_id, config.client_secret, isLive);
          const cancelRes = await fetch(`${paypalApiBase}/v1/billing/subscriptions/${sub.paypal_subscription_id}/cancel`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ reason: "User requested cancellation via HeartSync settings" }),
          });

          if (!cancelRes.ok && cancelRes.status !== 404 && cancelRes.status !== 422) {
            const errData = await cancelRes.json().catch(() => ({}));
            console.warn("PayPal cancel non-200 response:", errData);
          }
        } catch (paypalCancelErr) {
          console.error("Failed to cancel in PayPal API (continuing to update DB):", paypalCancelErr);
        }

        // Update database status to cancelled while preserving end_date
        await supabase
          .from("user_subscriptions")
          .update({
            status: "cancelled",
            updated_at: new Date().toISOString(),
          })
          .eq("id", sub.id);

        return new Response(
          JSON.stringify({
            success: true,
            message: "Subscription auto-renewal has been cancelled. You retain premium benefits until your billing period ends.",
            endDate: sub.end_date,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const { planId, userId } = body;

      // Prevent IDOR: Ensure caller can only create subscriptions for their own user ID
      if (authUser && userId && authUser.id !== userId) {
        return new Response(
          JSON.stringify({ success: false, error: "Forbidden: User ID mismatch." }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const effectiveUserId = authUser?.id || userId;

      console.log("[PayPal Subscription] Request:", { planId, effectiveUserId });

      if (!planId || !effectiveUserId) {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: "Missing planId or userId" 
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Validate plan exists and get PayPal plan ID
      const { data: plan, error: planError } = await supabase
        .from("paypal_plans")
        .select("*")
        .eq("website_plan_id", planId)
        .eq("is_active", true)
        .single();

      if (planError || !plan) {
        console.error("Plan lookup error:", planError);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: "Invalid plan selected. Please try again." 
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!plan.paypal_plan_id) {
        console.error("PayPal plan ID missing for plan:", planId);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: "PayPal plan not configured. Please contact support." 
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`[PayPal Subscription] Found plan: ${plan.name} -> PayPal Plan ID: ${plan.paypal_plan_id}`);

      // Get PayPal access token
      const accessToken = await getPayPalAccessToken(
        config.client_id,
        config.client_secret,
        isLive
      );

      console.log("[PayPal Subscription] Access token obtained");

      // Get site URL for return/cancel URLs
      const siteUrl = Deno.env.get("SITE_URL") || "https://heartsyncone.com";

      // Create PayPal subscription
      const subscriptionPayload = {
        plan_id: plan.paypal_plan_id,
        subscriber: {
          custom_id: effectiveUserId,
        },
        application_context: {
          brand_name: "HeartSync Premium",
          locale: "en-US",
          shipping_preference: "NO_SHIPPING",
          user_action: "SUBSCRIBE_NOW",
          payment_method: {
            payer_selected: "PAYPAL",
            payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED",
          },
          return_url: `${siteUrl}/paypal/return`,
          cancel_url: `${siteUrl}/upgrade?cancelled=true`,
        },
      };

      console.log("[PayPal Subscription] Creating subscription with payload:", JSON.stringify(subscriptionPayload, null, 2));

      const subscriptionResponse = await fetch(
        `${paypalApiBase}/v1/billing/subscriptions`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "PayPal-Request-Id": `${effectiveUserId}-${planId}-${Date.now()}`,
            "Prefer": "return=representation",
          },
          body: JSON.stringify(subscriptionPayload),
        }
      );

      if (!subscriptionResponse.ok) {
        const errorData = await subscriptionResponse.json();
        console.error("PayPal subscription creation failed:", JSON.stringify(errorData, null, 2));
        return new Response(
          JSON.stringify({ 
            success: false,
            error: "Failed to create PayPal subscription. Please try again." 
          }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const subscriptionData = await subscriptionResponse.json();
      console.log("[PayPal Subscription] Created:", subscriptionData.id);

      // Find approval URL
      const approvalLink = subscriptionData.links?.find(
        (l: { rel: string; href: string }) => l.rel === "approve"
      );

      if (!approvalLink?.href) {
        console.error("No approval URL in response:", subscriptionData);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: "No approval URL received from PayPal" 
          }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Store pending subscription in database
      try {
        await supabase
          .from("user_subscriptions")
          .insert({
            user_id: effectiveUserId,
            paypal_subscription_id: subscriptionData.id,
            paypal_plan_id: plan.paypal_plan_id,
            website_plan_id: planId,
            status: "pending",
            payment_status: "pending",
            amount: plan.price,
            currency: plan.currency || "USD",
          });
      } catch (insertError) {
        console.error("Failed to store subscription (non-fatal):", insertError);
      }

      console.log("[PayPal Subscription] Returning approval URL:", approvalLink.href);

      return new Response(
        JSON.stringify({
          success: true,
          orderId: subscriptionData.id,
          subscriptionId: subscriptionData.id,
          approvalUrl: approvalLink.href,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GET - Check subscription status or directly verify returned subscription ID
    if (method === "GET") {
      const authUser = await getAuthenticatedUser(req, supabaseUrl, supabaseServiceKey);
      
      if (!authUser) {
        return new Response(
          JSON.stringify({ 
            isSubscribed: false,
            planId: null,
            expiresAt: null,
            paypalSubscriptionId: null 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const userId = authUser.id;
      const querySubId = url.searchParams.get("subscriptionId") || url.searchParams.get("subscription_id");

      // Direct PayPal Subscription Verification on Return (solves race condition where webhook is delayed)
      if (querySubId) {
        console.log(`[PayPal Subscription] Direct verification requested for subscription ID: ${querySubId}`);
        try {
          const accessToken = await getPayPalAccessToken(config.client_id, config.client_secret, isLive);
          const paypalRes = await fetch(`${paypalApiBase}/v1/billing/subscriptions/${querySubId}`, {
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          });

          if (paypalRes.ok) {
            const subData = await paypalRes.json();
            const paypalStatus = subData.status;
            console.log(`[PayPal Subscription] PayPal API status: ${paypalStatus} for ${querySubId}`);

            const planId = subData.plan_id;
            const { data: planData } = await supabase
              .from("paypal_plans")
              .select("*")
              .eq("paypal_plan_id", planId)
              .maybeSingle();

            const durationDays = planData?.duration_days || 30;

            const { data: existingSub } = await supabase
              .from("user_subscriptions")
              .select("id, user_id, end_date")
              .eq("paypal_subscription_id", querySubId)
              .maybeSingle();

            // Comprehensive Payment Confirmation Check
            // A subscription may have status "ACTIVE", but the initial payment might still be pending capture or failed.
            const billingInfo = subData.billing_info;
            const lastPaymentVal = billingInfo?.last_payment?.amount?.value ? parseFloat(billingInfo.last_payment.amount.value) : 0;
            const failedPaymentsCount = billingInfo?.failed_payments_count || 0;
            const outstandingBalanceVal = billingInfo?.outstanding_balance?.value ? parseFloat(billingInfo.outstanding_balance.value) : 0;
            const cyclesCompleted = billingInfo?.cycle_executions?.reduce(
              (sum: number, c: { cycles_completed?: number }) => sum + (c.cycles_completed || 0), 
              0
            ) || 0;

            const isPaymentConfirmed = paypalStatus === "ACTIVE" && 
              (lastPaymentVal > 0 || cyclesCompleted > 0) && 
              failedPaymentsCount === 0 && 
              outstandingBalanceVal <= 0;

            const isPaymentFailed = paypalStatus === "ACTIVE" && (failedPaymentsCount > 0 || outstandingBalanceVal > 0);
            const isPaymentPending = paypalStatus === "ACTIVE" && !isPaymentConfirmed && !isPaymentFailed;

            // Scenario 1: ACTIVE with confirmed successful payment
            if (isPaymentConfirmed) {
              const startDate = subData.start_time ? new Date(subData.start_time) : new Date();
              const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

              if (existingSub) {
                if (existingSub.user_id === userId) {
                  await supabase
                    .from("user_subscriptions")
                    .update({
                      status: "active",
                      payment_status: "completed",
                      start_date: startDate.toISOString(),
                      end_date: endDate.toISOString(),
                      next_billing_date: subData.billing_info?.next_billing_time || null,
                      updated_at: new Date().toISOString(),
                    })
                    .eq("id", existingSub.id);
                }
              } else {
                await supabase
                  .from("user_subscriptions")
                  .insert({
                    user_id: userId,
                    paypal_subscription_id: querySubId,
                    paypal_plan_id: planId,
                    website_plan_id: planData?.website_plan_id || "monthly",
                    status: "active",
                    payment_status: "completed",
                    start_date: startDate.toISOString(),
                    end_date: endDate.toISOString(),
                    next_billing_date: subData.billing_info?.next_billing_time || null,
                    amount: planData?.price,
                    currency: planData?.currency || "USD",
                  });
              }

              return new Response(
                JSON.stringify({
                  isSubscribed: true,
                  planId: planData?.website_plan_id || "monthly",
                  expiresAt: endDate.toISOString(),
                  paypalSubscriptionId: querySubId,
                  status: "ACTIVE",
                  payment_status: "completed",
                }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
              );
            }

            // Scenario 2: ACTIVE with failed or outstanding payment
            if (isPaymentFailed) {
              if (existingSub && existingSub.user_id === userId) {
                await supabase
                  .from("user_subscriptions")
                  .update({
                    status: "active",
                    payment_status: "failed",
                    updated_at: new Date().toISOString(),
                  })
                  .eq("id", existingSub.id);
              }

              return new Response(
                JSON.stringify({
                  isSubscribed: false,
                  planId: planData?.website_plan_id || "monthly",
                  expiresAt: null,
                  paypalSubscriptionId: querySubId,
                  status: "ACTIVE",
                  payment_status: "failed",
                  message: "Initial subscription payment failed or has outstanding balance.",
                }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
              );
            }

            // Scenario 3: ACTIVE while initial payment is not yet confirmed (e.g. pending capture)
            if (isPaymentPending) {
              if (existingSub && existingSub.user_id === userId) {
                await supabase
                  .from("user_subscriptions")
                  .update({
                    status: "pending",
                    payment_status: "pending",
                    updated_at: new Date().toISOString(),
                  })
                  .eq("id", existingSub.id);
              }

              return new Response(
                JSON.stringify({
                  isSubscribed: false,
                  planId: planData?.website_plan_id || "monthly",
                  expiresAt: null,
                  paypalSubscriptionId: querySubId,
                  status: "ACTIVE",
                  payment_status: "pending",
                  message: "Subscription is active, but initial payment confirmation is pending settlement.",
                }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
              );
            }

            // APPROVED or APPROVAL_PENDING: Agreement approved by buyer, but payment not completed yet.
            // Do NOT mark active or completed; maintain pending status.
            if (paypalStatus === "APPROVED" || paypalStatus === "APPROVAL_PENDING") {
              if (existingSub && existingSub.user_id === userId) {
                await supabase
                  .from("user_subscriptions")
                  .update({
                    status: "pending",
                    payment_status: "pending",
                    updated_at: new Date().toISOString(),
                  })
                  .eq("id", existingSub.id);
              }

              return new Response(
                JSON.stringify({
                  isSubscribed: false,
                  planId: planData?.website_plan_id || "monthly",
                  expiresAt: null,
                  paypalSubscriptionId: querySubId,
                  status: paypalStatus,
                  message: "Subscription approved by PayPal. Payment is processing.",
                }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
              );
            }

            // Other statuses: SUSPENDED, CANCELLED, EXPIRED
            if (existingSub && existingSub.user_id === userId) {
              const mappedStatus = paypalStatus.toLowerCase();
              if (["suspended", "cancelled", "expired"].includes(mappedStatus)) {
                await supabase
                  .from("user_subscriptions")
                  .update({
                    status: mappedStatus,
                    updated_at: new Date().toISOString(),
                  })
                  .eq("id", existingSub.id);
              }
            }

            return new Response(
              JSON.stringify({
                isSubscribed: false,
                planId: planData?.website_plan_id || null,
                expiresAt: null,
                paypalSubscriptionId: querySubId,
                status: paypalStatus,
                message: `Subscription status is ${paypalStatus}`,
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        } catch (verifyErr) {
          console.error("[PayPal Subscription] Direct verification error:", verifyErr);
        }
      }

      // Authoritative DB query: Look up user's active or cancelled (with valid end_date) subscription
      const now = new Date().toISOString();
      const { data: subscription, error } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", userId)
        .in("status", ["active", "cancelled"])
        .eq("payment_status", "completed")
        .gt("end_date", now)
        .order("end_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !subscription) {
        return new Response(
          JSON.stringify({
            isSubscribed: false,
            planId: null,
            expiresAt: null,
            paypalSubscriptionId: null,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          isSubscribed: true,
          planId: subscription.website_plan_id,
          expiresAt: subscription.end_date,
          paypalSubscriptionId: subscription.paypal_subscription_id,
          status: subscription.status,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[PayPal Subscription] Edge function error:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : "Internal server error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
