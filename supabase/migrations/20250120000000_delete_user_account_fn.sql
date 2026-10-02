/*
  # Add delete_user_account() RPC function

  ## Description
  Replaces the undeployed Edge Function approach with a PostgreSQL
  SECURITY DEFINER function callable via supabase.rpc().

  The function:
  1. Verifies the caller is authenticated (auth.uid() must not be null).
  2. Deletes user_subscriptions rows for this user.
  3. Deletes the profiles row for this user (belt-and-suspenders; CASCADE covers it too).
  4. Deletes the auth.users row via the Supabase admin schema helper.

  ## Metadata
  - Schema-Category: Safe
  - Impact-Level: Low
  - Requires-Backup: false
  - Reversible: false

  ## Security
  - SECURITY DEFINER runs with the function owner's privileges (postgres).
  - search_path is locked to public,auth to prevent search-path injection.
  - The function checks auth.uid() = the target ID before deleting anything.
*/

CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- 1. Identify the calling user from the JWT
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- 2. Delete user_subscriptions (no ON DELETE CASCADE on user_id column)
  DELETE FROM public.user_subscriptions
  WHERE user_id = v_user_id::text;

  -- 3. Delete profile row (also covered by CASCADE from auth.users)
  DELETE FROM public.profiles
  WHERE id = v_user_id;

  -- 4. Delete the Supabase Auth user
  DELETE FROM auth.users
  WHERE id = v_user_id;

  RETURN jsonb_build_object('success', true, 'message', 'Account deleted successfully');

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Revoke public execute, grant only to authenticated role
REVOKE EXECUTE ON FUNCTION public.delete_user_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;
