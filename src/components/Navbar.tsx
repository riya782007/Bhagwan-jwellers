"use client";
import Link from "next/link";
import { ShoppingBag, Search } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useEffect, useState } from "react";

export function Navbar() {
  const count = useCart(s => s.count());
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-black/5">
      <div className="max-w-6xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
        <Link href="/" className="font-black text-xl sm:text-2xl tracking-tight">
          new<span className="text-brand">vora</span>.
        </Link>

        <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-muted-soft w-72">
          <Search className="w-4 h-4 text-muted" />
          <input className="bg-transparent text-sm w-full" placeholder="Search viral finds…" />
        </div>

        <Link href="/cart" className="relative inline-flex items-center gap-1 px-3 py-2 rounded-full bg-ink text-white text-sm">
          <ShoppingBag className="w-4 h-4" />
          <span className="hidden sm:inline">Cart</span>
          {mounted && count > 0 && (
            <span className="absolute -top-1 -right-1 bg-brand text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {count}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
