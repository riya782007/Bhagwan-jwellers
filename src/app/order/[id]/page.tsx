import { db } from "@/lib/db";
import { inr } from "@/lib/format";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function OrderPage({ params }: { params: { id: string } }) {
  const order = await db.order.findUnique({
    where: { id: params.id },
    include: { items: true, customer: true }
  });
  if (!order) notFound();

  const isPaid = order.status === "PAID" || order.status === "COD_CONFIRMED";

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <div className="text-5xl">{isPaid ? "🎉" : "⏳"}</div>
      <h1 className="font-black text-3xl mt-3">
        {order.paymentMethod === "COD" ? "Order placed!" : "Payment received!"}
      </h1>
      <p className="text-muted mt-1">Order <b>{order.number}</b></p>
      <p className="text-sm text-muted mt-1">We'll WhatsApp you the tracking link within 24 hours.</p>

      <div className="mt-8 text-left border border-black/5 rounded-2xl p-5 space-y-3">
        <div className="font-semibold">Order summary</div>
        {order.items.map(i => (
          <div key={i.id} className="flex justify-between text-sm">
            <span className="line-clamp-1">{i.title} × {i.quantity}</span>
            <span>{inr(i.price * i.quantity)}</span>
          </div>
        ))}
        <div className="border-t pt-2 flex justify-between text-sm"><span>Subtotal</span><span>{inr(order.subtotal)}</span></div>
        <div className="flex justify-between text-sm"><span>Shipping</span><span>{order.shipping === 0 ? "FREE" : inr(order.shipping)}</span></div>
        <div className="flex justify-between font-bold"><span>Total</span><span>{inr(order.total)}</span></div>
        <div className="text-xs text-muted pt-2">Payment: {order.paymentMethod}</div>
      </div>

      <div className="mt-6 flex gap-3 justify-center">
        <a href="/" className="border border-ink/20 rounded-full px-6 py-3 font-semibold text-sm">Continue shopping</a>
        <a href={`https://wa.me/${(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g,"")}?text=${encodeURIComponent("Order " + order.number + " status?")}`}
           target="_blank" rel="noreferrer"
           className="bg-[#25D366] text-white rounded-full px-6 py-3 font-semibold text-sm">
          WhatsApp us
        </a>
      </div>
    </div>
  );
}
