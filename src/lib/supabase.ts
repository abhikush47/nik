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
let supabaseDisabled = false;

export function isSupabaseServiceDisabled(): boolean {
  return supabaseDisabled;
}

export function disableSupabaseService(reason?: string) {
  if (!supabaseDisabled) {
    console.warn(`[Supabase Service Disabled] ${reason || "Service restricted"}. Switching to SQLite database fallback.`);
    supabaseDisabled = true;
    cachedClient = null;
    cachedAdminClient = null;
  }
}

export function isQuotaOrRestrictionError(error: any): boolean {
  if (!error) return false;
  const msg = typeof error === "string" ? error : error.message || error.details || JSON.stringify(error);
  return (
    msg.includes("exceed_cached_egress_quota") ||
    msg.includes("exceed_quota") ||
    msg.includes("restricted due to the following violations") ||
    msg.includes("402") ||
    msg.includes("Payment Required")
  );
}

async function fetchWithTimeout(url: any, opts: any) {
  if (supabaseDisabled) {
    throw new Error("Supabase is disabled due to quota restriction; using SQLite fallback.");
  }
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      ...opts,
      signal: controller.signal,
    });
    if (res.status === 402) {
      disableSupabaseService("HTTP 402 Payment Required / Egress Quota Exceeded");
    }
    return res;
  } finally {
    clearTimeout(id);
  }
}

export function getSupabase(): SupabaseClient | null {
  if (supabaseDisabled || !isSupabaseConfigured) return null;
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
  if (supabaseDisabled || !isSupabaseAdminConfigured) return null;
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


