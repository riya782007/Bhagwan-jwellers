import { NextRequest, NextResponse } from "next/server";
import { listAllMatches } from "@/lib/suppliers";
import { getAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const q = req.nextUrl.searchParams.get("q") || "";
  if (!q) return NextResponse.json({ error: "q required" }, { status: 400 });
  const matches = await listAllMatches(q);
  return NextResponse.json({ matches });
}
