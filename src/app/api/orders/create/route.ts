import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createOrder as createRzpOrder } from "@/lib/razorpay";
import { z } from "zod";
import { orderNumber } from "@/lib/format";

const Body = z.object({
  customer: z.object({
    name: z.string().min(2),
    phone: z.string().regex(/^[6-9]\d{9}$/),
    email: z.string().email().optional().or(z.literal("")),
    pin: z.string().regex(/^\d{6}$/),
    address: z.string().min(5),
    city: z.string().min(1),
    state: z.string().min(1)
  }),
  items: z.array(z.object({
    productId: z.string(),
    title: z.string(),
    price: z.number().int().positive(),
    quantity: z.number().int().positive(),
    variantName: z.string().optional()
  })).min(1),
  paymentMethod: z.enum(["RAZORPAY", "COD"])
});

const FREE_SHIP = 69900;
const FLAT_SHIP = 5900;

export async function POST(req: NextRequest) {
  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch (e: any) {
    return NextResponse.json({ error: "Invalid input", detail: e.errors }, { status: 400 });
  }
  const { customer, items, paymentMethod } = parsed;

  // Re-price server-side from DB (never trust client prices)
  const prodIds = items.map(i => i.productId);
  const products = await db.product.findMany({ where: { id: { in: prodIds }, isPublished: true } });
  const byId = Object.fromEntries(products.map(p => [p.id, p]));

  const lines = items.map(i => {
    const p = byId[i.productId];
    if (!p) throw new Error("Product not found: " + i.productId);
    return { ...i, price: p.price, title: p.title };
  });
  const subtotal = lines.reduce((a, l) => a + l.price * l.quantity, 0);
  const shipping = subtotal >= FREE_SHIP ? 0 : FLAT_SHIP;
  const total = subtotal + shipping;

  // Customer upsert by phone
  const cust = await db.customer.upsert({
    where: { phone: customer.phone },
    update: { name: customer.name, email: customer.email || undefined, pin: customer.pin, city: customer.city, state: customer.state },
    create: { name: customer.name, phone: customer.phone, email: customer.email || undefined, pin: customer.pin, city: customer.city, state: customer.state }
  });

  const count = await db.order.count();
  const number = orderNumber(count + 1);

  const order = await db.order.create({
    data: {
      number,
      customerId: cust.id,
      paymentMethod,
      status: paymentMethod === "COD" ? "COD_CONFIRMED" : "PENDING",
      subtotal, shipping, total,
      shippingAddress: JSON.stringify({
        name: customer.name, phone: customer.phone, email: customer.email,
        line1: customer.address, city: customer.city, state: customer.state, pin: customer.pin
      }),
      items: { create: lines.map(l => ({
        productId: l.productId, title: l.title, price: l.price, quantity: l.quantity, variantName: l.variantName
      })) }
    }
  });

  // Decrement stock + bump soldCount on COD or after Razorpay verify (we do both; refund on cancel)
  if (paymentMethod === "COD") {
    for (const l of lines) {
      await db.product.update({
        where: { id: l.productId },
        data: { stock: { decrement: l.quantity }, soldCount: { increment: l.quantity } }
      });
    }
  }

  if (paymentMethod === "RAZORPAY") {
    try {
      const rzp = await createRzpOrder({
        amountPaise: total,
        receipt: order.number,
        notes: { orderId: order.id, customerPhone: customer.phone }
      });
      await db.order.update({ where: { id: order.id }, data: { razorpayOrderId: rzp.id } });
      return NextResponse.json({ order, razorpay: { id: rzp.id, amount: rzp.amount, currency: rzp.currency } });
    } catch (e: any) {
      // If Razorpay isn't configured locally, still return the order so dev flow continues
      console.error("Razorpay create failed:", e?.message);
      return NextResponse.json({ order, razorpay: null, warning: "Razorpay not configured — switch to COD or set keys." }, { status: 200 });
    }
  }

  return NextResponse.json({ order });
}
