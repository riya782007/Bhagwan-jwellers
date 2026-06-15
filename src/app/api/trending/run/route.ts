import { NextRequest, NextResponse } from "next/server";
import { runTrendingScan } from "@/lib/trending";
import { getAdmin } from "@/lib/auth";

/**
 * POST /api/trending/run
 *  - Manual trigger from admin UI
 * GET /api/trending/run?cron=1
 *  - Cron trigger (Vercel cron) — protected by AUTH_SECRET as a "cron" key
 */
export async function POST(_req: NextRequest) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const r = await runTrendingScan();
  return NextResponse.json(r);
}

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (key !== process.env.AUTH_SECRET) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const r = await runTrendingScan();
  return NextResponse.json(r);
}
