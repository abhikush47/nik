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
let supabaseDisabledReason = "";
let lastDisabledTimestamp = 0;
const RETRY_COOLDOWN_MS = 60000; // 60 seconds cooldown before retrying a failed Supabase connection

export function isSupabaseServiceDisabled(): boolean {
  if (supabaseDisabled) {
    // If cooldown has passed, allow an attempt to recover
    if (Date.now() - lastDisabledTimestamp > RETRY_COOLDOWN_MS) {
      supabaseDisabled = false;
      return false;
    }
    return true;
  }
  return false;
}

export function getSupabaseDisabledReason(): string {
  return supabaseDisabledReason;
}

export function disableSupabaseService(reason?: string) {
  const msg = reason || "Service restricted";
  if (!supabaseDisabled || supabaseDisabledReason !== msg) {
    console.warn(`[Supabase Circuit Breaker] ${msg}. Using local SQLite fallback.`);
  }
  supabaseDisabled = true;
  supabaseDisabledReason = msg;
  lastDisabledTimestamp = Date.now();
  cachedClient = null;
  cachedAdminClient = null;
}

export function enableSupabaseService() {
  supabaseDisabled = false;
  supabaseDisabledReason = "";
  lastDisabledTimestamp = 0;
  cachedClient = null;
  cachedAdminClient = null;
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

// Ultra-fast fetch wrapper with 2-second timeout to prevent UI freezes
async function fetchWithTimeout(url: any, opts: any) {
  if (supabaseDisabled && Date.now() - lastDisabledTimestamp <= RETRY_COOLDOWN_MS) {
    throw new Error("Supabase is disabled due to quota restriction; using SQLite fallback.");
  }
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 2000);
  try {
    const res = await fetch(url, {
      ...opts,
      signal: controller.signal,
    });
    if (res.status === 402) {
      disableSupabaseService("HTTP 402 Payment Required: exceed_cached_egress_quota (free bandwidth exceeded)");
    }
    return res;
  } catch (err: any) {
    if (err.name === "AbortError") {
      disableSupabaseService("Network timeout (2000ms exceeded)");
    }
    throw err;
  } finally {
    clearTimeout(id);
  }
}

export function getSupabase(): SupabaseClient | null {
  if (isSupabaseServiceDisabled() || !isSupabaseConfigured) return null;
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
  if (isSupabaseServiceDisabled() || !isSupabaseAdminConfigured) return null;
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

export interface SupabaseHealthResult {
  configured: boolean;
  online: boolean;
  statusCode?: number;
  status: "connected" | "restricted_quota" | "missing_tables" | "not_configured" | "unreachable";
  message: string;
  url: string | null;
  tables: {
    resources: boolean;
    resource_categories: boolean;
    site_settings: boolean;
    announcements: boolean;
  };
}

export async function checkSupabaseHealth(forceRetry: boolean = false): Promise<SupabaseHealthResult> {
  if (forceRetry) {
    enableSupabaseService();
  }

  if (!isSupabaseAdminConfigured) {
    return {
      configured: false,
      online: false,
      status: "not_configured",
      message: "Supabase credentials are not configured in .env.local",
      url: supabaseUrl || null,
      tables: { resources: false, resource_categories: false, site_settings: false, announcements: false },
    };
  }

  const client = createClient(supabaseUrl!, supabaseServiceKey!, {
    auth: { persistSession: false },
  });

  const tables = {
    resources: false,
    resource_categories: false,
    site_settings: false,
    announcements: false,
  };

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);

    // Test ping via site_settings
    const { data, error, status } = await client
      .from("site_settings")
      .select("id")
      .limit(1)
      .abortSignal(controller.signal);

    clearTimeout(timer);

    if (status === 402 || (error && isQuotaOrRestrictionError(error))) {
      disableSupabaseService("HTTP 402 Payment Required: exceed_cached_egress_quota");
      return {
        configured: true,
        online: false,
        statusCode: 402,
        status: "restricted_quota",
        message: "Supabase cloud project has exceeded its cached egress bandwidth quota (HTTP 402). Uncap spend or upgrade in the Supabase Dashboard to unrestrict.",
        url: supabaseUrl || null,
        tables,
      };
    }

    if (!error) {
      tables.site_settings = true;
    }

    // Check resources table
    const { error: resErr } = await client.from("resources").select("id").limit(1);
    if (!resErr) tables.resources = true;

    // Check resource_categories table
    const { error: catErr } = await client.from("resource_categories").select("id").limit(1);
    if (!catErr) tables.resource_categories = true;

    // Check announcements table
    const { error: annErr } = await client.from("announcements").select("id").limit(1);
    if (!annErr) tables.announcements = true;

    if (!tables.resources || !tables.resource_categories) {
      return {
        configured: true,
        online: true,
        status: "missing_tables",
        message: "Supabase is reachable, but the 'resources' or 'resource_categories' table does not exist yet. Run the SQL migration to create them.",
        url: supabaseUrl || null,
        tables,
      };
    }

    enableSupabaseService();
    return {
      configured: true,
      online: true,
      status: "connected",
      message: "Supabase is fully connected, operational, and storing resources.",
      url: supabaseUrl || null,
      tables,
    };
  } catch (err: any) {
    const isAbort = err?.name === "AbortError";
    const msg = isAbort ? "Connection timed out after 3500ms" : err?.message || String(err);
    if (isQuotaOrRestrictionError(err)) {
      disableSupabaseService("HTTP 402 Payment Required: exceed_cached_egress_quota");
      return {
        configured: true,
        online: false,
        statusCode: 402,
        status: "restricted_quota",
        message: "Supabase project is restricted: exceed_cached_egress_quota (HTTP 402).",
        url: supabaseUrl || null,
        tables,
      };
    }
    return {
      configured: true,
      online: false,
      status: "unreachable",
      message: `Failed to connect to Supabase: ${msg}`,
      url: supabaseUrl || null,
      tables,
    };
  }
}



