import { NextRequest, NextResponse } from "next/server";
import { loginWithCredentials } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) return NextResponse.json({ error: "missing" }, { status: 400 });
  const user = await loginWithCredentials(email, password);
  if (!user) return NextResponse.json({ error: "invalid credentials" }, { status: 401 });
  return NextResponse.json({ ok: true });
}
