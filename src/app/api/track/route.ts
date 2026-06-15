import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const number = req.nextUrl.searchParams.get("number") || "";
  const phone = req.nextUrl.searchParams.get("phone") || "";
  if (!number || !phone) return NextResponse.json({ error: "missing" }, { status: 400 });

  const order = await db.order.findFirst({
    where: { number, customer: { phone: phone.replace(/\D/g, "") } },
    include: { items: true }
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ order });
}
