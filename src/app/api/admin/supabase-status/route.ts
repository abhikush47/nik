import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { checkSupabaseHealth, enableSupabaseService } from "@/lib/supabase";
import { syncAllResourcesToSupabase } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const health = await checkSupabaseHealth(true);
    return NextResponse.json({ health });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to check Supabase status" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    enableSupabaseService();
    const health = await checkSupabaseHealth(true);

    if (health.status === "restricted_quota") {
      return NextResponse.json({
        success: false,
        health,
        error: "Supabase project is restricted: exceed_cached_egress_quota (HTTP 402). Please uncap spend or upgrade in your Supabase Dashboard first.",
      }, { status: 402 });
    }

    if (health.status === "missing_tables") {
      return NextResponse.json({
        success: false,
        health,
        error: "Tables 'resources' or 'resource_categories' do not exist in Supabase yet. Please execute the migration SQL in your Supabase SQL Editor.",
      }, { status: 400 });
    }

    const syncResult = await syncAllResourcesToSupabase();
    return NextResponse.json({
      success: syncResult.success,
      health,
      syncResult,
    });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to sync Supabase" }, { status: 500 });
  }
}
