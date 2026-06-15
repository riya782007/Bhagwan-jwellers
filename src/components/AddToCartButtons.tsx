"use client";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { useState } from "react";

type Props = {
  productId: string;
  slug: string;
  title: string;
  image: string;
  price: number;
};

export function AddToCartButtons(p: Props) {
  const add = useCart(s => s.add);
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const addToCart = () => {
    add({ productId: p.productId, slug: p.slug, title: p.title, image: p.image, price: p.price, quantity: 1 });
  };

  const buyNow = () => {
    setBusy(true);
    addToCart();
    router.push("/checkout");
  };

  return (
    <div className="flex gap-2">
      <button onClick={addToCart} className="flex-1 border border-ink/20 hover:border-ink rounded-full py-3 text-sm font-semibold">
        Add to Cart
      </button>
      <button disabled={busy} onClick={buyNow} className="flex-1 bg-brand hover:bg-brand-dark text-white rounded-full py-3 text-sm font-semibold">
        Buy Now · UPI / COD
      </button>
    </div>
  );
}
