// delete-account Edge Function
// Securely deletes the authenticated user's own account.
// Security model:
// - User ID is extracted from the VERIFIED Supabase JWT (server-side).
// - Client CANNOT supply an arbitrary user ID.
// - Service-role key stays server-side; never exposed to the browser.
// - Deletes user_subscriptions (no FK cascade) then auth user (which CASCADE-deletes profiles).

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // --- 1. Verify the caller's JWT and extract their user ID ---
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized — missing or invalid token." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const accessToken = authHeader.replace("Bearer ", "").trim();

    // Use an anon-level client to verify the token
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") || supabaseServiceKey);
    const { data: { user: callerUser }, error: userError } = await anonClient.auth.getUser(accessToken);

    if (userError || !callerUser) {
      console.error("[delete-account] Token verification failed:", userError?.message);
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized — session could not be verified." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = callerUser.id;
    console.log("[delete-account] Authenticated delete request for user:", userId);

    // --- 2. Use the service-role admin client for privileged operations ---
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // --- 3. Delete user_subscriptions (no ON DELETE CASCADE for this table) ---
    const { error: subError } = await adminClient
      .from("user_subscriptions")
      .delete()
      .eq("user_id", userId);

    if (subError) {
      console.error("[delete-account] Failed to delete user_subscriptions:", subError.message);
      // Non-fatal — log and continue; subscription records are not blocking
    } else {
      console.log("[delete-account] user_subscriptions deleted for user:", userId);
    }

    // --- 4. Delete the profile row explicitly (belt-and-suspenders;
    //        the ON DELETE CASCADE on profiles.id -> auth.users.id handles this too) ---
    const { error: profileError } = await adminClient
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileError) {
      console.error("[delete-account] Failed to delete profile:", profileError.message);
      // Non-fatal — auth deletion will cascade
    } else {
      console.log("[delete-account] Profile deleted for user:", userId);
    }

    // --- 5. Delete the Supabase Auth user (admin-only operation) ---
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error("[delete-account] Failed to delete auth user:", deleteError.message);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to delete account. Please try again or contact support.",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[delete-account] Auth user deleted successfully:", userId);

    return new Response(
      JSON.stringify({ success: true, message: "Account deleted successfully." }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[delete-account] Unhandled error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "An unexpected error occurred. Please try again.",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
