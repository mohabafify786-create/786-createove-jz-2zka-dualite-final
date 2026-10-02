// PayPal Subscription Edge Function
// Handles creating and managing PayPal subscriptions

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CreateSubscriptionRequest {
  planId: string;
  userId: string;
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
    console.error("PayPal token error:", errorData);
    throw new Error(`Failed to get PayPal access token: ${errorData.error_description || response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
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

    // POST - Create subscription
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
      
      const { planId, userId } = body;

      console.log("[PayPal Subscription] Request:", { planId, userId });

      if (!planId || !userId) {
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
          custom_id: userId,
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
            "PayPal-Request-Id": `${userId}-${planId}-${Date.now()}`,
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
            user_id: userId,
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

    // GET - Check subscription status
    if (method === "GET") {
      const authHeader = req.headers.get("authorization");
      
      if (!authHeader) {
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

      // Get user's active subscription
      const { data: subscription, error } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
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
