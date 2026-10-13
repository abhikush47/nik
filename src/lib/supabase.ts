import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseUrl.startsWith("http") && supabaseAnonKey
);

export const isSupabaseAdminConfigured = Boolean(
  supabaseUrl && supabaseUrl.startsWith("http") && supabaseServiceKey
);

let cachedClient: SupabaseClient | null = null;
let cachedAdminClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!cachedClient) {
    cachedClient = createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: { persistSession: false },
    });
  }
  return cachedClient;
}

export function getSupabaseAdmin(): SupabaseClient | null {
  if (!isSupabaseAdminConfigured) return null;
  if (!cachedAdminClient) {
    cachedAdminClient = createClient(supabaseUrl!, supabaseServiceKey!, {
      auth: { persistSession: false },
    });
  }
  return cachedAdminClient;
}
