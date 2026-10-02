// PayPal Configuration Edge Function
// Handles saving and retrieving PayPal configuration securely

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PayPalConfig {
  environment: "sandbox" | "live";
  clientId: string;
  clientSecret: string;
  webhookId?: string;
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

    const url = new URL(req.url);
    const method = req.method;

    // GET /paypal-config - Check connection status
    if (method === "GET") {
      const authHeader = req.headers.get("authorization");
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: config, error } = await supabase
        .from("paypal_config")
        .select("environment, client_id, webhook_id, is_active, created_at, updated_at")
        .eq("is_active", true)
        .single();

      if (error || !config) {
        return new Response(
          JSON.stringify({
            connected: false,
            environment: null,
            clientIdMasked: null,
            lastConfigured: null,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          connected: true,
          environment: config.environment,
          clientIdMasked: config.client_id.slice(-8),
          lastConfigured: config.updated_at,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // POST /paypal-config - Save configuration
    if (method === "POST") {
      const authHeader = req.headers.get("authorization");
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const body: PayPalConfig = await req.json();

      if (!body.environment || !body.clientId || !body.clientSecret) {
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (body.environment !== "sandbox" && body.environment !== "live") {
        return new Response(
          JSON.stringify({ error: "Invalid environment" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const paypalApiBase = body.environment === "live"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com";

      try {
        const auth = btoa(`${body.clientId}:${body.clientSecret}`);
        const tokenResponse = await fetch(`${paypalApiBase}/v1/oauth2/token`, {
          method: "POST",
          headers: {
            "Authorization": `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: "grant_type=client_credentials",
        });

        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.json();
          console.error("PayPal auth failed:", errorData);
          return new Response(
            JSON.stringify({ 
              success: false,
              error: "Failed to authenticate with PayPal. Please check your credentials." 
            }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log("PayPal connection successful for environment:", body.environment);

      } catch (paypalError) {
        console.error("PayPal connection error:", paypalError);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: "Failed to connect to PayPal API" 
          }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await supabase
        .from("paypal_config")
        .update({ is_active: false })
        .eq("is_active", true);

      const { error: insertError } = await supabase
        .from("paypal_config")
        .insert({
          environment: body.environment,
          client_id: body.clientId,
          client_secret: body.clientSecret,
          webhook_id: body.webhookId || null,
          is_active: true,
        });

      if (insertError) {
        console.error("Failed to save config:", insertError);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: "Failed to save configuration" 
          }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "PayPal configuration saved successfully",
          status: "connected",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
