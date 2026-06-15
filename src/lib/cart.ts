"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = {
  productId: string;
  slug: string;
  title: string;
  image: string;
  price: number;       // paise
  variantName?: string;
  quantity: number;
};

type CartState = {
  lines: CartLine[];
  add: (line: CartLine) => void;
  remove: (productId: string, variantName?: string) => void;
  setQty: (productId: string, qty: number, variantName?: string) => void;
  clear: () => void;
  subtotal: () => number;
  shipping: () => number;
  total: () => number;
  count: () => number;
};

const FREE_SHIP_THRESHOLD = 69900; // ₹699
const FLAT_SHIP = 5900;            // ₹59

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      add: (line) => set((s) => {
        const i = s.lines.findIndex(l => l.productId === line.productId && l.variantName === line.variantName);
        if (i >= 0) {
          const next = [...s.lines];
          next[i] = { ...next[i], quantity: next[i].quantity + line.quantity };
          return { lines: next };
        }
        return { lines: [...s.lines, line] };
      }),
      remove: (productId, variantName) => set((s) => ({
        lines: s.lines.filter(l => !(l.productId === productId && l.variantName === variantName))
      })),
      setQty: (productId, qty, variantName) => set((s) => ({
        lines: s.lines.map(l =>
          l.productId === productId && l.variantName === variantName ? { ...l, quantity: Math.max(1, qty) } : l
        )
      })),
      clear: () => set({ lines: [] }),
      subtotal: () => get().lines.reduce((a, l) => a + l.price * l.quantity, 0),
      shipping: () => (get().subtotal() >= FREE_SHIP_THRESHOLD ? 0 : FLAT_SHIP),
      total: () => get().subtotal() + get().shipping(),
      count: () => get().lines.reduce((a, l) => a + l.quantity, 0)
    }),
    { name: "newvora-cart" }
  )
);

export const FREE_SHIPPING_THRESHOLD_PAISE = FREE_SHIP_THRESHOLD;
