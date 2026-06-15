import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const Body = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  source: z.string().optional(),
  cartJson: z.string().optional()
});

export async function POST(req: NextRequest) {
  let body;
  try { body = Body.parse(await req.json()); } catch (e: any) {
    return NextResponse.json({ error: "Invalid", detail: e.errors }, { status: 400 });
  }
  if (!body.email && !body.phone) return NextResponse.json({ error: "email or phone required" }, { status: 400 });

  const lead = await db.lead.create({ data: body });
  return NextResponse.json({ ok: true, id: lead.id });
}
