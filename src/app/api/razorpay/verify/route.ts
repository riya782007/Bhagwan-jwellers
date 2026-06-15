import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifySignature } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
  if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const ok = verifySignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature });
  if (!ok) return NextResponse.json({ error: "Bad signature" }, { status: 400 });

  const order = await db.order.update({
    where: { id: orderId },
    data: { status: "PAID", razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature },
    include: { items: true }
  });

  // Decrement stock + soldCount now that payment is verified
  for (const it of order.items) {
    await db.product.update({
      where: { id: it.productId },
      data: { stock: { decrement: it.quantity }, soldCount: { increment: it.quantity } }
    });
  }

  return NextResponse.json({ ok: true });
}
