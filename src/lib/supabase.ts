import { createClient } from "@supabase/supabase-js";

const defaultUrl = "https://dwjnnhhoiggddnoucnre.supabase.co";
const defaultAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3am5uaGhvaWdnZGRub3VjbnJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMTkxMzQsImV4cCI6MjEwMzU5NTEzNH0.IsBRayBNK_7Gs0GM8bmwR796pKDNmfPRdsRXiQ-CIaI";

function isValidUrl(url: unknown): url is string {
  if (typeof url !== 'string') return false;
  const trimmed = url.trim();
  return trimmed.startsWith('https://') && trimmed.includes('.supabase.co');
}

function isValidAnonKey(key: unknown): key is string {
  if (typeof key !== 'string') return false;
  const trimmed = key.trim();
  return trimmed.startsWith('eyJ') && trimmed.split('.').length === 3;
}

const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseUrl = isValidUrl(envUrl) ? envUrl.trim() : defaultUrl;
export const supabaseAnonKey = isValidAnonKey(envKey) ? envKey.trim() : defaultAnonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'sb-dwjnnhhoiggddnoucnre-auth-token',
  },
});
