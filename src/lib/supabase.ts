import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Ensure globalThis.WebSocket is available so @supabase/realtime-js does not throw in Node runtimes
if (typeof globalThis !== "undefined" && typeof (globalThis as any).WebSocket === "undefined") {
  (globalThis as any).WebSocket = class DummyWebSocket {} as any;
}

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

function fetchWithTimeout(url: any, opts: any) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 8000);
  return fetch(url, {
    ...opts,
    signal: controller.signal,
  }).finally(() => clearTimeout(id));
}

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!cachedClient) {
    try {
      cachedClient = createClient(supabaseUrl!, supabaseAnonKey!, {
        auth: { persistSession: false },
        global: { fetch: fetchWithTimeout },
      });
    } catch (err) {
      console.error("Failed to initialize Supabase client:", err);
      return null;
    }
  }
  return cachedClient;
}

export function getSupabaseAdmin(): SupabaseClient | null {
  if (!isSupabaseAdminConfigured) return null;
  if (!cachedAdminClient) {
    try {
      cachedAdminClient = createClient(supabaseUrl!, supabaseServiceKey!, {
        auth: { persistSession: false },
        global: { fetch: fetchWithTimeout },
      });
    } catch (err) {
      console.error("Failed to initialize Supabase admin client:", err);
      return null;
    }
  }
  return cachedAdminClient;
}

