import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdmin } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const data = await req.json();

  // Whitelist editable fields
  const allow = ["title","slug","tagline","description","bullets","price","compareAt","costPrice","imagesJson","videoUrl","category","tags","faqJson","founderNote","isPublished","isHero","stock","rating","reviewCount","supplierId"];
  const update: any = {};
  for (const k of allow) if (k in data) update[k] = data[k];

  const product = await db.product.update({ where: { id: params.id }, data: update });
  return NextResponse.json({ product });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  await db.product.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
