/*
  # Voice Prompts Feature

  Adds voice prompt support to the HeartSync profile system.

  ## Query Description:
  This migration adds a nullable voice_prompt_url text column to the profiles table
  and creates a Supabase Storage bucket for audio recordings. Existing profile data
  is completely unaffected. The column is nullable so no existing rows are impacted.
  Each user can only access their own audio files via RLS storage policies.

  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "Low"
  - Requires-Backup: false
  - Reversible: true

  ## Structure Details:
  - profiles.voice_prompt_url (text, nullable) — public URL of the saved voice prompt
  - storage bucket: voice-prompts (public: false)

  ## Security Implications:
  - RLS Status: Enabled on bucket via storage policies
  - Policy Changes: Yes — per-user read/write/delete on voice-prompts bucket
  - Auth Requirements: Authenticated users only; each user is scoped to their own folder

  ## Performance Impact:
  - Indexes: None added (url column not queried in filters)
  - Triggers: None added
  - Estimated Impact: Negligible
*/

-- 1. Add voice_prompt_url column to profiles (nullable, no default — safe for existing rows)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS voice_prompt_url text DEFAULT NULL;

-- 2. Create the storage bucket for voice prompts (not public — access via signed URLs)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'voice-prompts',
  'voice-prompts',
  false,
  5242880,  -- 5 MB limit per file
  ARRAY['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/wav', 'audio/mpeg']
)
ON CONFLICT (id) DO NOTHING;

-- 3. RLS: users can upload their own voice prompt (INSERT)
CREATE POLICY "Users can upload own voice prompt"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'voice-prompts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 4. RLS: users can read their own voice prompt (SELECT)
CREATE POLICY "Users can read own voice prompt"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'voice-prompts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 5. RLS: users can replace their own voice prompt (UPDATE)
CREATE POLICY "Users can update own voice prompt"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'voice-prompts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 6. RLS: users can delete their own voice prompt (DELETE)
CREATE POLICY "Users can delete own voice prompt"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'voice-prompts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
