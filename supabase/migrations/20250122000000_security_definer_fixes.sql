/*
  # Security DEFINER Function Permission Hardening

  Addresses 3 "Signed-In Users Can Execute SECURITY DEFINER Function" advisories.

  ## Query Description:
  Restricts EXECUTE permissions on all three SECURITY DEFINER functions so that
  only the appropriate roles can call them. This prevents authenticated users from
  calling privileged functions they should not have access to directly.

  ## Metadata:
  - Schema-Category: "Safe"
  - Impact-Level: "Low"
  - Requires-Backup: false
  - Reversible: true

  ## Structure Details:
  - Affects: handle_new_user(), update_updated_at_column(), delete_user_account()
  - Revokes public/authenticated EXECUTE where not appropriate
  - Sets explicit search_path to prevent search-path injection

  ## Security Implications:
  - RLS Status: Unchanged
  - Policy Changes: No
  - Auth Requirements: Functions become callable only by their intended callers

  ## Performance Impact:
  - Indexes: None
  - Triggers: None changed
  - Estimated Impact: Negligible
*/

-- ============================================================
-- 1. handle_new_user() — called only by the auth trigger,
--    not directly by any role.
-- ============================================================
ALTER FUNCTION public.handle_new_user()
  SET search_path = public;

-- Revoke direct execution from public roles (trigger fires as owner)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;

-- Grant to postgres (trigger owner) only
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;

-- ============================================================
-- 2. update_updated_at_column() — called only by row-level
--    triggers, never directly by a user.
-- ============================================================
ALTER FUNCTION public.update_updated_at_column()
  SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM authenticated;

GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO postgres;

-- ============================================================
-- 3. delete_user_account() — called via supabase.rpc() by
--    authenticated users ONLY. Anon users must not call it.
-- ============================================================
ALTER FUNCTION public.delete_user_account()
  SET search_path = public;

-- Remove blanket public access
REVOKE EXECUTE ON FUNCTION public.delete_user_account() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.delete_user_account() FROM anon;

-- Only authenticated (signed-in) users may call this via RPC
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;
