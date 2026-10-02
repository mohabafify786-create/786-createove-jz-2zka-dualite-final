/*
  # Fix Voice Prompts Storage Policies

  ## Query Description:
  The previous migration (20250125000000_voice_prompts.sql) already created
  the storage RLS policies for the voice-prompts bucket. This migration
  safely drops those policies first (if they exist) and recreates them,
  making the setup fully idempotent. No data is lost or modified.

  ## Metadata:
  - Schema-Category: "Safe"
  - Impact-Level: "Low"
  - Requires-Backup: false
  - Reversible: true

  ## Structure Details:
  - Drops and recreates 4 storage.objects RLS policies for voice-prompts bucket
  - Does NOT touch profiles table (voice_prompt_url column already exists)
  - Does NOT recreate the bucket (already exists)

  ## Security Implications:
  - RLS Status: Enabled (unchanged)
  - Policy Changes: Yes — drop + recreate (same logic)
  - Auth Requirements: auth.uid() scoped per-user folder

  ## Performance Impact:
  - Indexes: None
  - Triggers: None
  - Estimated Impact: Negligible
*/

-- Drop existing policies if they exist so this migration is idempotent
DROP POLICY IF EXISTS "Users can upload own voice prompt"   ON storage.objects;
DROP POLICY IF EXISTS "Users can update own voice prompt"   ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own voice prompt"   ON storage.objects;
DROP POLICY IF EXISTS "Users can read own voice prompt"     ON storage.objects;

-- Recreate per-user scoped storage policies for the voice-prompts bucket
-- Each user may only access objects under their own folder: {userId}/...

CREATE POLICY "Users can upload own voice prompt"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'voice-prompts'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  );

CREATE POLICY "Users can update own voice prompt"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'voice-prompts'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  );

CREATE POLICY "Users can delete own voice prompt"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'voice-prompts'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  );

CREATE POLICY "Users can read own voice prompt"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'voice-prompts'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  );
