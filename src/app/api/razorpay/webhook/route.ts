import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyWebhook } from "@/lib/razorpay";

/**
 * Configure this URL in Razorpay dashboard → Settings → Webhooks.
 * Subscribe to: payment.captured, payment.failed, refund.processed.
 */
export async function POST(req: NextRequest) {
  const raw = await req.text();
  const sig = req.headers.get("x-razorpay-signature") || "";
  if (!verifyWebhook(raw, sig)) {
    return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  }
  const event = JSON.parse(raw);

  if (event.event === "payment.captured") {
    const payment = event.payload?.payment?.entity;
    const orderId = payment?.notes?.orderId;
    if (orderId) {
      await db.order.update({
        where: { id: orderId },
        data: { status: "PAID", razorpayPaymentId: payment.id }
      }).catch(() => null);
    }
  }

  if (event.event === "payment.failed") {
    const payment = event.payload?.payment?.entity;
    const orderId = payment?.notes?.orderId;
    if (orderId) {
      await db.order.update({ where: { id: orderId }, data: { status: "CANCELLED" } }).catch(() => null);
    }
  }

  return NextResponse.json({ ok: true });
}
