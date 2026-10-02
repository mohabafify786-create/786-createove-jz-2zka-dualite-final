import { supabase } from "../lib/supabase";

export interface PayPalConfigPayload {
  environment: "sandbox" | "live";
  clientId: string;
  clientSecret: string;
  webhookId?: string;
}

export interface PayPalConfigResponse {
  success: boolean;
  message: string;
  status: "connected" | "disconnected" | "error";
}

export interface CreateSubscriptionOrderResponse {
  success: boolean;
  orderId: string;
  approvalUrl: string;
  error?: string;
}

export interface CaptureSubscriptionResponse {
  success: boolean;
  subscriptionId: string;
  status: string;
  message: string;
  error?: string;
}

export interface PayPalConnectionStatus {
  connected: boolean;
  environment: "sandbox" | "live" | null;
  clientIdMasked?: string;
  lastConfigured?: string;
}

export interface PayPalSubscriptionStatus {
  isSubscribed: boolean;
  planId: string | null;
  expiresAt: string | null;
  paypalSubscriptionId: string | null;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://dwjnnhhoiggddnoucnre.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3am5uaGhvaWdnZGRub3VjbnJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMTkxMzQsImV4cCI6MjEwMzU5NTEzNH0.IsBRayBNK_7Gs0GM8bmwR796pKDNmfPRdsRXiQ-CIaI";

async function getSupabaseSession(): Promise<{ accessToken: string; userId: string } | null> {
  try {
    console.log("[PayPal API] Getting Supabase session...");
    
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("[PayPal API] Error getting Supabase session:", error.message);
      return null;
    }
    
    if (!session) {
      console.log("[PayPal API] No session found, attempting to refresh...");
      
      const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError || !refreshedSession) {
        console.error("[PayPal API] Failed to refresh session:", refreshError?.message || 'Unknown error');
        return null;
      }
      
      console.log("[PayPal API] Session refreshed successfully");
      return {
        accessToken: refreshedSession.access_token,
        userId: refreshedSession.user.id,
      };
    }
    
    console.log("[PayPal API] Session found for user:", session.user.id);
    
    return {
      accessToken: session.access_token,
      userId: session.user.id,
    };
  } catch (err) {
    console.error("[PayPal API] Exception getting session:", err instanceof Error ? err.message : String(err));
    return null;
  }
}

function serializeError(error: unknown): { name: string; message: string; stack?: string } {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
  return {
    name: "Unknown",
    message: String(error),
  };
}

async function invokeEdgeFunction(
  functionName: string, 
  payload: unknown,
  method: "POST" | "GET" = "POST"
): Promise<unknown> {
  const session = await getSupabaseSession();
  
  if (!session) {
    throw new Error("Please sign in to continue. No active Supabase session found.");
  }
  
  const { accessToken, userId } = session;
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": `Bearer ${accessToken}`,
  };

  const url = `${SUPABASE_URL}/functions/v1/${functionName}`;
  
  console.log(`[PayPal API] ========== EDGE FUNCTION CALL ==========`);
  console.log(`[PayPal API] Function: ${functionName}`);
  console.log(`[PayPal API] URL: ${url}`);
  console.log(`[PayPal API] Method: ${method}`);
  console.log(`[PayPal API] User ID: ${userId}`);
  console.log(`[PayPal API] Token preview: ${accessToken.slice(0, 30)}...`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const fetchOptions: RequestInit = {
      method,
      headers,
      signal: controller.signal,
    };

    if (method === "POST" && payload) {
      fetchOptions.body = JSON.stringify(payload);
      console.log(`[PayPal API] Request payload:`, JSON.stringify(payload));
    }

    console.log(`[PayPal API] Sending request...`);
    const response = await fetch(url, fetchOptions);

    clearTimeout(timeoutId);

    console.log(`[PayPal API] Response status: ${response.status}`);

    const responseText = await response.text();
    console.log(`[PayPal API] Response body:`, responseText ? responseText.slice(0, 500) : "(empty)");
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = responseText ? JSON.parse(responseText) : {};
        errorMessage = errorData.error || errorData.message || errorMessage;
        console.error(`[PayPal API] HTTP Error ${response.status}:`, errorMessage);
      } catch {
        if (responseText) {
          errorMessage = responseText.slice(0, 200);
          console.error(`[PayPal API] Non-JSON error response:`, errorMessage);
        }
      }
      
      if (response.status === 401) {
        throw new Error("Authentication required. Please sign in again and retry.");
      }
      
      throw new Error(errorMessage);
    }

    return responseText ? JSON.parse(responseText) : {};
  } catch (fetchError) {
    clearTimeout(timeoutId);
    
    const errorDetails = serializeError(fetchError);
    console.error(`[PayPal API] Error details:`, JSON.stringify(errorDetails, null, 2));
    
    if (fetchError instanceof Error) {
      if (fetchError.name === "AbortError") {
        throw new Error("Request timed out. Please try again.");
      }
      if (fetchError.message === "Failed to fetch") {
        throw new Error("Unable to connect to the server. Please check your internet connection and try again.");
      }
      throw fetchError;
    }
    
    throw new Error("An unexpected error occurred. Please try again.");
  }
}

export async function savePayPalConfig(
  config: PayPalConfigPayload
): Promise<PayPalConfigResponse> {
  try {
    const result = await invokeEdgeFunction("paypal-config", {
      environment: config.environment,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      webhookId: config.webhookId,
    }) as { message?: string };

    return {
      success: true,
      message: result.message || "Configuration saved successfully",
      status: "connected",
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to connect to server",
      status: "error",
    };
  }
}

export async function getPayPalStatus(): Promise<PayPalConnectionStatus> {
  try {
    const result = await invokeEdgeFunction("paypal-config", undefined, "GET") as PayPalConnectionStatus;
    return result;
  } catch {
    return { connected: true, environment: "live" };
  }
}

export async function createSubscriptionOrder(
  planId: string
): Promise<CreateSubscriptionOrderResponse> {
  console.log("[PayPal API] ========== CREATE SUBSCRIPTION ORDER ==========");
  console.log("[PayPal API] Plan ID:", planId);
  
  try {
    const session = await getSupabaseSession();

    if (!session) {
      console.error("[PayPal API] ERROR: No Supabase session found");
      return {
        success: false,
        orderId: "",
        approvalUrl: "",
        error: "Please sign in to subscribe. Sign in with your email and password to continue.",
      };
    }

    console.log("[PayPal API] User authenticated via Supabase");
    console.log("[PayPal API] User ID:", session.userId);

    console.log("[PayPal API] Calling paypal-subscription Edge Function...");
    
    const result = await invokeEdgeFunction("paypal-subscription", {
      planId,
      userId: session.userId,
    }) as {
      success?: boolean;
      orderId?: string;
      subscriptionId?: string;
      approvalUrl?: string;
      error?: string;
    };

    console.log("[PayPal API] Subscription result:", JSON.stringify(result, null, 2));

    if (!result.success) {
      console.error("[PayPal API] Subscription creation failed:", result.error);
      return {
        success: false,
        orderId: "",
        approvalUrl: "",
        error: result.error || "Failed to create subscription",
      };
    }

    if (!result.approvalUrl) {
      console.error("[PayPal API] No approval URL in response");
      return {
        success: false,
        orderId: "",
        approvalUrl: "",
        error: "No approval URL received from PayPal",
      };
    }

    console.log("[PayPal API] SUCCESS! Approval URL:", result.approvalUrl);
    
    return {
      success: true,
      orderId: result.orderId || result.subscriptionId || "",
      approvalUrl: result.approvalUrl,
    };
  } catch (error) {
    console.error("[PayPal API] ========== SUBSCRIPTION ERROR ==========");
    console.error("[PayPal API] Error type:", error?.constructor?.name || typeof error);
    console.error("[PayPal API] Error details:", JSON.stringify(serializeError(error), null, 2));
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Failed to connect to PayPal. Please try again.";
    
    console.error("[PayPal API] Final error message:", errorMessage);
    
    return {
      success: false,
      orderId: "",
      approvalUrl: "",
      error: errorMessage,
    };
  }
}

export async function captureSubscription(
  subscriptionId: string
): Promise<CaptureSubscriptionResponse> {
  try {
    const result = await invokeEdgeFunction("paypal-subscription/status", undefined, "GET") as {
      isSubscribed?: boolean;
      paypalSubscriptionId?: string;
    };

    const isSubscribed = result.isSubscribed || false;
    const paypalSubId = result.paypalSubscriptionId || subscriptionId;

    return {
      success: isSubscribed,
      subscriptionId: paypalSubId,
      status: isSubscribed ? "ACTIVE" : "PENDING",
      message: isSubscribed ? "Subscription active" : "Subscription pending",
    };
  } catch (error) {
    return {
      success: false,
      subscriptionId: subscriptionId,
      status: "error",
      message: error instanceof Error ? error.message : "Failed to verify subscription",
      error: String(error),
    };
  }
}

export async function getSubscriptionStatus(): Promise<PayPalSubscriptionStatus> {
  try {
    const result = await invokeEdgeFunction("paypal-subscription/status", undefined, "GET") as PayPalSubscriptionStatus;
    return result;
  } catch {
    return {
      isSubscribed: false,
      planId: null,
      expiresAt: null,
      paypalSubscriptionId: null,
    };
  }
}

export const WEBHOOK_EVENTS = {
  SUBSCRIPTION_CREATED: "BILLING.SUBSCRIPTION.CREATED",
  SUBSCRIPTION_ACTIVATED: "BILLING.SUBSCRIPTION.ACTIVATED",
  SUBSCRIPTION_UPDATED: "BILLING.SUBSCRIPTION.UPDATED",
  SUBSCRIPTION_CANCELLED: "BILLING.SUBSCRIPTION.CANCELLED",
  SUBSCRIPTION_SUSPENDED: "BILLING.SUBSCRIPTION.SUSPENDED",
  SUBSCRIPTION_EXPIRED: "BILLING.SUBSCRIPTION.EXPIRED",
  SUBSCRIPTION_PAYMENT_FAILED: "BILLING.SUBSCRIPTION.PAYMENT.FAILED",
  PAYMENT_SALE_COMPLETED: "PAYMENT.SALE.COMPLETED",
  PAYMENT_SALE_REFUNDED: "PAYMENT.SALE.REFUNDED",
  PAYMENT_SALE_REVERSED: "PAYMENT.SALE.REVERSED",
} as const;

export type WebhookEventType = (typeof WEBHOOK_EVENTS)[keyof typeof WEBHOOK_EVENTS];
