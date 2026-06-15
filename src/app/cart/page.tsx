"use client";
import Image from "next/image";
import Link from "next/link";
import { useCart, FREE_SHIPPING_THRESHOLD_PAISE } from "@/lib/cart";
import { inr } from "@/lib/format";
import { Trash2 } from "lucide-react";

export default function CartPage() {
  const { lines, setQty, remove, subtotal, shipping, total } = useCart();
  const sub = subtotal();
  const ship = shipping();
  const tot = total();
  const remainingForFreeShip = Math.max(0, FREE_SHIPPING_THRESHOLD_PAISE - sub);

  if (!lines.length) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl">🛒</div>
        <h1 className="font-black text-2xl mt-4">Your cart is empty</h1>
        <p className="text-muted mt-1">Discover something you didn't know you needed.</p>
        <Link href="/" className="inline-block mt-6 bg-ink text-white rounded-full px-6 py-3 font-semibold text-sm">Shop the drop</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="font-black text-2xl">Cart</h1>
      <div className="grid lg:grid-cols-3 gap-8 mt-6">
        <div className="lg:col-span-2 space-y-3">
          {lines.map(l => (
            <div key={l.productId + (l.variantName ?? "")} className="flex gap-4 border border-black/5 rounded-2xl p-3">
              <div className="relative w-20 h-20 bg-muted-soft rounded-xl overflow-hidden flex-shrink-0">
                {l.image && <Image src={l.image} alt={l.title} fill sizes="80px" className="object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/product/${l.slug}`} className="font-semibold text-sm line-clamp-2">{l.title}</Link>
                {l.variantName && <div className="text-xs text-muted">{l.variantName}</div>}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center border border-black/10 rounded-full text-sm">
                    <button onClick={() => setQty(l.productId, l.quantity - 1, l.variantName)} className="px-3 py-1">−</button>
                    <span className="px-2">{l.quantity}</span>
                    <button onClick={() => setQty(l.productId, l.quantity + 1, l.variantName)} className="px-3 py-1">+</button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="font-bold text-sm">{inr(l.price * l.quantity)}</div>
                    <button onClick={() => remove(l.productId, l.variantName)} className="text-muted hover:text-brand">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="border border-black/5 rounded-2xl p-5 h-fit space-y-3">
          {remainingForFreeShip > 0 ? (
            <div className="bg-brand-light text-brand-dark text-xs rounded-xl p-3">
              Add <b>{inr(remainingForFreeShip)}</b> more for FREE shipping
            </div>
          ) : (
            <div className="bg-green-50 text-green-700 text-xs rounded-xl p-3">🎉 You unlocked FREE shipping</div>
          )}
          <div className="flex justify-between text-sm"><span>Subtotal</span><span>{inr(sub)}</span></div>
          <div className="flex justify-between text-sm"><span>Shipping</span><span>{ship === 0 ? "FREE" : inr(ship)}</span></div>
          <div className="border-t pt-3 flex justify-between font-bold"><span>Total</span><span>{inr(tot)}</span></div>
          <Link href="/checkout" className="block text-center bg-brand hover:bg-brand-dark text-white rounded-full py-3 font-semibold text-sm">
            Checkout · UPI / COD
          </Link>
          <p className="text-[11px] text-muted text-center">Razorpay secure · Ships in 24h</p>
        </aside>
      </div>
    </div>
  );
}
