// PayPal Setup Edge Function
// Creates PayPal Product and Billing Plans via PayPal API
// Idempotent - safe to run multiple times without creating duplicates

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

interface PlanConfig {
  website_plan_id: string;
  name: string;
  price: number;
  currency: string;
  duration_days: number;
  interval_unit: "DAY" | "WEEK" | "MONTH" | "YEAR";
  interval_count: number;
}

const PLANS: PlanConfig[] = [
  {
    website_plan_id: "weekly",
    name: "HeartSync Weekly",
    price: 4.99,
    currency: "USD",
    duration_days: 7,
    interval_unit: "DAY",
    interval_count: 7,
  },
  {
    website_plan_id: "monthly",
    name: "HeartSync Monthly",
    price: 14.99,
    currency: "USD",
    duration_days: 30,
    interval_unit: "MONTH",
    interval_count: 1,
  },
  {
    website_plan_id: "yearly",
    name: "HeartSync Yearly",
    price: 59.99,
    currency: "USD",
    duration_days: 365,
    interval_unit: "YEAR",
    interval_count: 1,
  },
];

const PRODUCT_NAME = "HeartSync Premium";
const PRODUCT_DESCRIPTION =
  "Premium subscription for HeartSync dating platform with unlimited messaging and exclusive features.";

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
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Failed to get PayPal access token: ${errorData.error_description || response.statusText}`
    );
  }

  const data = await response.json();
  return data.access_token;
}

async function findExistingProduct(
  accessToken: string,
  isLive: boolean,
  productName: string
): Promise<string | null> {
  const paypalApiBase = isLive
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

  try {
    const response = await fetch(
      `${paypalApiBase}/v1/catalogs/products?page_size=100`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("Failed to list products:", await response.text());
      return null;
    }

    const data = await response.json();
    const existingProduct = data.products?.find(
      (p: { name: string; id: string }) => p.name === productName
    );

    return existingProduct?.id || null;
  } catch (error) {
    console.error("Error finding product:", error);
    return null;
  }
}

async function createProduct(
  accessToken: string,
  isLive: boolean,
  name: string,
  description: string
): Promise<string> {
  const paypalApiBase = isLive
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

  const response = await fetch(`${paypalApiBase}/v1/catalogs/products`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": `heartsync-product-${Date.now()}`,
    },
    body: JSON.stringify({
      name,
      description,
      type: "SERVICE",
      category: "SOFTWARE",
      image_url: "https://heartsyncone.com/logo.png",
      home_url: "https://heartsyncone.com",
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Failed to create product: ${errorData.message || response.statusText}`
    );
  }

  const data = await response.json();
  return data.id;
}

async function findExistingPlan(
  accessToken: string,
  isLive: boolean,
  productId: string,
  planName: string
): Promise<string | null> {
  const paypalApiBase = isLive
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

  try {
    const response = await fetch(
      `${paypalApiBase}/v1/billing/plans?page_size=100&product_id=${productId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("Failed to list plans:", await response.text());
      return null;
    }

    const data = await response.json();
    const existingPlan = data.plans?.find(
      (p: { name: string; id: string }) => p.name === planName
    );

    return existingPlan?.id || null;
  } catch (error) {
    console.error("Error finding plan:", error);
    return null;
  }
}

async function createBillingPlan(
  accessToken: string,
  isLive: boolean,
  productId: string,
  plan: PlanConfig
): Promise<string> {
  const paypalApiBase = isLive
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

  const billingCycles = [
    {
      frequency: {
        interval_unit: plan.interval_unit,
        interval_count: plan.interval_count,
      },
      tenure_type: "REGULAR",
      sequence: 1,
      total_cycles: 0,
      pricing_scheme: {
        fixed_price: {
          value: plan.price.toFixed(2),
          currency_code: plan.currency,
        },
      },
    },
  ];

  const response = await fetch(`${paypalApiBase}/v1/billing/plans`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": `heartsync-plan-${plan.website_plan_id}-${Date.now()}`,
    },
    body: JSON.stringify({
      product_id: productId,
      name: plan.name,
      description: `${plan.name} subscription plan for HeartSync Premium`,
      status: "ACTIVE",
      billing_cycles: billingCycles,
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee: {
          value: "0",
          currency_code: plan.currency,
        },
        setup_fee_failure_action: "CONTINUE",
        payment_failure_threshold: 3,
      },
      taxes: {
        percentage: "0",
        inclusive: false,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Failed to create billing plan: ${errorData.message || response.statusText}`
    );
  }

  const data = await response.json();
  return data.id;
}

async function verifyPlanStatus(
  accessToken: string,
  isLive: boolean,
  planId: string
): Promise<{ status: string; valid: boolean }> {
  const paypalApiBase = isLive
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

  try {
    const response = await fetch(
      `${paypalApiBase}/v1/billing/plans/${planId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      return { status: "UNKNOWN", valid: false };
    }

    const data = await response.json();
    return { status: data.status || "UNKNOWN", valid: data.status === "ACTIVE" };
  } catch (error) {
    console.error("Error verifying plan:", error);
    return { status: "ERROR", valid: false };
  }
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed. Use POST to run setup." }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      db: { schema: "public" },
    });

    // Get PayPal configuration from database
    const { data: config, error: configError } = await supabase
      .from("paypal_config")
      .select("*")
      .eq("is_active", true)
      .single();

    if (configError || !config) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "PayPal not configured. Please configure PayPal credentials first.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const paypalConfig: PayPalConfig = {
      environment: config.environment,
      clientId: config.client_id,
      clientSecret: config.client_secret,
      webhookId: config.webhook_id,
    };

    const isLive = paypalConfig.environment === "live";

    console.log(`Starting PayPal setup for ${isLive ? "LIVE" : "SANDBOX"} environment`);

    // Get access token
    const accessToken = await getPayPalAccessToken(
      paypalConfig.clientId,
      paypalConfig.clientSecret,
      isLive
    );

    console.log("PayPal access token obtained successfully");

    // Check for existing product
    let productId = await findExistingProduct(
      accessToken,
      isLive,
      PRODUCT_NAME
    );

    let productCreated = false;
    if (!productId) {
      console.log("Creating new PayPal product...");
      productId = await createProduct(
        accessToken,
        isLive,
        PRODUCT_NAME,
        PRODUCT_DESCRIPTION
      );
      productCreated = true;
      console.log(`Product created with ID: ${productId}`);
    } else {
      console.log(`Found existing product: ${productId}`);
    }

    // Process each plan
    const results: {
      website_plan_id: string;
      paypal_plan_id: string | null;
      status: string;
      created: boolean;
      valid: boolean;
      error?: string;
    }[] = [];

    for (const plan of PLANS) {
      try {
        // Check for existing plan
        let planId = await findExistingPlan(
          accessToken,
          isLive,
          productId,
          plan.name
        );

        let planCreated = false;
        if (!planId) {
          console.log(`Creating billing plan: ${plan.name}`);
          planId = await createBillingPlan(
            accessToken,
            isLive,
            productId,
            plan
          );
          planCreated = true;
          console.log(`Plan created with ID: ${planId}`);
        } else {
          console.log(`Found existing plan: ${plan.name} (${planId})`);
        }

        // Verify plan status
        const planStatus = await verifyPlanStatus(
          accessToken,
          isLive,
          planId
        );

        // Update database
        await supabase.from("paypal_plans").upsert(
          {
            website_plan_id: plan.website_plan_id,
            paypal_plan_id: planId,
            name: plan.name,
            price: plan.price,
            currency: plan.currency,
            duration_days: plan.duration_days,
            is_active: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "website_plan_id" }
        );

        results.push({
          website_plan_id: plan.website_plan_id,
          paypal_plan_id: planId,
          status: planStatus.status,
          created: planCreated,
          valid: planStatus.valid,
        });
      } catch (planError) {
        console.error(`Error processing plan ${plan.name}:`, planError);
        results.push({
          website_plan_id: plan.website_plan_id,
          paypal_plan_id: null,
          status: "ERROR",
          created: false,
          valid: false,
          error: planError instanceof Error ? planError.message : "Unknown error",
        });
      }
    }

    // Verify database mappings
    const { data: dbPlans, error: dbError } = await supabase
      .from("paypal_plans")
      .select("*")
      .in("website_plan_id", PLANS.map((p) => p.website_plan_id));

    if (dbError) {
      console.error("Error fetching plans from database:", dbError);
    }

    const allPlansValid = results.every((r) => r.valid && r.paypal_plan_id);
    const allPlansMapped = dbPlans?.length === PLANS.length;

    return new Response(
      JSON.stringify({
        success: allPlansValid && allPlansMapped,
        message: allPlansValid
          ? "PayPal setup completed successfully"
          : "PayPal setup completed with some errors",
        environment: isLive ? "LIVE" : "SANDBOX",
        product: {
          id: productId,
          name: PRODUCT_NAME,
          created: productCreated,
        },
        plans: results,
        database: {
          plans_count: dbPlans?.length || 0,
          all_mapped: allPlansMapped,
        },
        summary: {
          product_created: productCreated,
          plans_created: results.filter((r) => r.created).length,
          plans_existing: results.filter((r) => !r.created).length,
          plans_valid: results.filter((r) => r.valid).length,
          plans_invalid: results.filter((r) => !r.valid).length,
        },
      }),
      {
        status: allPlansValid ? 200 : 207,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("PayPal setup error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
