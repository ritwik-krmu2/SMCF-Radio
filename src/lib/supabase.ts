import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default public endpoint and publishable key for SMCF Radio cloud database
const DEFAULT_SUPABASE_URL = 'https://wcnnmmeiysdsbxqqiagf.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_UHehFgJPlFEXTnyazkpc7g_VlPB0iL9';

// Environment variables for Supabase connection (supporting both Vite and Next.js / SSR naming)
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  import.meta.env.VITE_DATABASE_URL ||
  DEFAULT_SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  DEFAULT_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

// Only initialize client if valid URL and Key are provided
if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey);
    console.info('[SMCF Radio] Supabase client initialized with endpoint:', supabaseUrl);
  } catch (err) {
    console.warn('[SMCF Radio] Supabase initialization failed, running in persistent LocalRepository mode:', err);
  }
} else {
  console.info('[SMCF Radio] Supabase credentials not detected; running in persistent LocalRepository mode.');
}

export const supabase = client;

export const isSupabaseConfigured = (): boolean => {
  return !!supabase;
};

