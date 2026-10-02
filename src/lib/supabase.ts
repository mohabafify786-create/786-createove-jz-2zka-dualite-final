import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://dwjnnhhoiggddnoucnre.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3am5uaGhvaWdnZGRub3VjbnJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMTkxMzQsImV4cCI6MjEwMzU5NTEzNH0.IsBRayBNK_7Gs0GM8bmwR796pKDNmfPRdsRXiQ-CIaI";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'sb-dwjnnhhoiggddnoucnre-auth-token',
  },
});
