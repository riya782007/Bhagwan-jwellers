import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const data = await req.json();
  const review = await db.review.create({ data });

  // Recompute aggregate on product
  const agg = await db.review.aggregate({
    where: { productId: data.productId, isApproved: true },
    _avg: { rating: true }, _count: { _all: true }
  });
  await db.product.update({
    where: { id: data.productId },
    data: { rating: Math.round((agg._avg.rating ?? 4.7) * 10) / 10, reviewCount: agg._count._all }
  });

  return NextResponse.json({ review });
}
