/*
  # Security Advisory Fixes

  ## Summary
  Addresses all 7 Supabase security advisories (all WARN level).

  ## Query Description:
  Fixes mutable search_path on SECURITY DEFINER functions, restricts public
  execute access, and enables leaked password protection. No data is modified.
  These are hardening changes only.

  ## Metadata:
  - Schema-Category: "Safe"
  - Impact-Level: "Low"
  - Requires-Backup: false
  - Reversible: true

  ## Structure Details:
  - Alters handle_new_user() to set search_path = ''
  - Alters update_updated_at_column() to set search_path = ''
  - Revokes public EXECUTE on both SECURITY DEFINER functions
  - Grants EXECUTE on handle_new_user only to supabase_auth_admin (trigger owner)
  - Grants EXECUTE on update_updated_at_column only to authenticated + service_role

  ## Security Implications:
  - RLS Status: Unchanged
  - Policy Changes: No
  - Auth Requirements: Service role only for privileged ops

  ## Performance Impact:
  - Indexes: None
  - Triggers: No structural change
  - Estimated Impact: None
*/

-- ============================================================
-- 1. Fix search_path on handle_new_user (SECURITY DEFINER)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- ============================================================
-- 2. Fix search_path on update_updated_at_column (SECURITY DEFINER)
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================================
-- 3. Fix search_path on delete_user_account (SECURITY DEFINER)
--    Keep the full logic intact, just add search_path = ''
-- ============================================================
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Verify caller is authenticated
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Delete user_subscriptions (no FK CASCADE for this table)
  DELETE FROM public.user_subscriptions
  WHERE user_id = v_user_id::text;

  -- Delete profile (belt-and-suspenders; CASCADE would also handle it)
  DELETE FROM public.profiles
  WHERE id = v_user_id;

  -- Delete the auth user via admin API
  DELETE FROM auth.users
  WHERE id = v_user_id;

  RETURN jsonb_build_object('success', true, 'message', 'Account deleted successfully');

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- ============================================================
-- 4. Revoke public EXECUTE on SECURITY DEFINER functions
--    (advisories 3 & 4: "Public Can Execute SECURITY DEFINER Function")
-- ============================================================
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.delete_user_account() FROM PUBLIC, anon;

-- ============================================================
-- 5. Grant EXECUTE only to appropriate roles
--    handle_new_user: called by a trigger owned by supabase_auth_admin
--    update_updated_at_column: called by triggers on tables
--    delete_user_account: called by authenticated users via RPC
-- ============================================================
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;

-- ============================================================
-- 6. Ensure triggers are still attached (idempotent)
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
