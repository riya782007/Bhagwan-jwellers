"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { inr } from "@/lib/format";

declare global { interface Window { Razorpay: any } }

type FormState = {
  name: string; phone: string; email: string;
  pin: string; address: string; city: string; state: string;
  paymentMethod: "RAZORPAY" | "COD";
};

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, subtotal, shipping, total, clear } = useCart();
  const [form, setForm] = useState<FormState>({
    name: "", phone: "", email: "", pin: "", address: "", city: "", state: "", paymentMethod: "RAZORPAY"
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    // Lazy load Razorpay checkout script
    const id = "razorpay-checkout";
    if (!document.getElementById(id)) {
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.id = id; s.async = true;
      document.body.appendChild(s);
    }
  }, []);

  const sub = subtotal(); const ship = shipping(); const tot = total();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lines.length) return;
    setBusy(true); setErr(null);

    try {
      const orderRes = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: form,
          items: lines,
          paymentMethod: form.paymentMethod
        })
      });
      const data = await orderRes.json();
      if (!orderRes.ok) throw new Error(data.error || "Order failed");

      if (form.paymentMethod === "COD") {
        clear();
        router.push(`/order/${data.order.id}`);
        return;
      }

      // Razorpay flow
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.razorpay.amount,
        currency: data.razorpay.currency,
        name: "NewVora",
        description: `Order ${data.order.number}`,
        order_id: data.razorpay.id,
        prefill: { name: form.name, email: form.email, contact: form.phone },
        notes: { orderId: data.order.id },
        theme: { color: "#FF3D5A" },
        handler: async (resp: any) => {
          const verify = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: data.order.id, ...resp })
          });
          if (verify.ok) {
            clear();
            router.push(`/order/${data.order.id}`);
          } else {
            setErr("Payment verification failed. Please try again or use COD.");
          }
        },
        modal: { ondismiss: () => setBusy(false) }
      };
      const rz = new window.Razorpay(options);
      rz.open();
    } catch (e: any) {
      setErr(e.message);
      setBusy(false);
    }
  };

  if (!lines.length) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="font-black text-2xl">Cart is empty</h1>
        <a href="/" className="text-brand underline">Back to shop</a>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="font-black text-2xl">Checkout</h1>
      <form onSubmit={submit} className="grid lg:grid-cols-3 gap-8 mt-6">
        <div className="lg:col-span-2 space-y-3">
          <Section title="Contact">
            <Field label="Full name" value={form.name} on={(v) => setForm({ ...form, name: v })} required />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone (10-digit)" value={form.phone} on={(v) => setForm({ ...form, phone: v })} required type="tel" pattern="[6-9]\d{9}" />
              <Field label="Email" value={form.email} on={(v) => setForm({ ...form, email: v })} type="email" />
            </div>
          </Section>

          <Section title="Shipping address">
            <Field label="Address" value={form.address} on={(v) => setForm({ ...form, address: v })} required />
            <div className="grid grid-cols-3 gap-3">
              <Field label="Pincode" value={form.pin} on={(v) => setForm({ ...form, pin: v })} required pattern="\d{6}" />
              <Field label="City" value={form.city} on={(v) => setForm({ ...form, city: v })} required />
              <Field label="State" value={form.state} on={(v) => setForm({ ...form, state: v })} required />
            </div>
          </Section>

          <Section title="Payment">
            <label className="flex items-center gap-3 border border-black/10 rounded-xl p-3 cursor-pointer">
              <input type="radio" checked={form.paymentMethod === "RAZORPAY"} onChange={() => setForm({ ...form, paymentMethod: "RAZORPAY" })} />
              <div className="flex-1">
                <div className="font-semibold text-sm">UPI / Cards / Netbanking</div>
                <div className="text-xs text-muted">Powered by Razorpay · 1-tap UPI · 100% secure</div>
              </div>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Recommended</span>
            </label>
            <label className="flex items-center gap-3 border border-black/10 rounded-xl p-3 cursor-pointer">
              <input type="radio" checked={form.paymentMethod === "COD"} onChange={() => setForm({ ...form, paymentMethod: "COD" })} />
              <div className="flex-1">
                <div className="font-semibold text-sm">Cash on Delivery</div>
                <div className="text-xs text-muted">Pay when you receive · ₹0 extra</div>
              </div>
            </label>
          </Section>

          {err && <div className="bg-brand-light text-brand-dark text-sm rounded-xl p-3">{err}</div>}
        </div>

        <aside className="border border-black/5 rounded-2xl p-5 h-fit space-y-2 text-sm sticky top-20">
          {lines.map(l => (
            <div key={l.productId} className="flex justify-between text-xs">
              <span className="line-clamp-1">{l.title} × {l.quantity}</span>
              <span>{inr(l.price * l.quantity)}</span>
            </div>
          ))}
          <div className="border-t pt-2 flex justify-between"><span>Subtotal</span><span>{inr(sub)}</span></div>
          <div className="flex justify-between"><span>Shipping</span><span>{ship === 0 ? "FREE" : inr(ship)}</span></div>
          <div className="border-t pt-2 flex justify-between font-bold text-base"><span>Total</span><span>{inr(tot)}</span></div>
          <button disabled={busy} className="w-full bg-brand hover:bg-brand-dark text-white rounded-full py-3 font-semibold text-sm mt-2 disabled:opacity-50">
            {busy ? "Processing…" : form.paymentMethod === "COD" ? "Place COD order" : `Pay ${inr(tot)}`}
          </button>
          <p className="text-[10px] text-muted text-center">By placing this order, you agree to our terms.</p>
        </aside>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-black/5 rounded-2xl p-5 space-y-3">
      <div className="font-semibold">{title}</div>
      {children}
    </div>
  );
}

function Field({ label, value, on, type = "text", required = false, pattern }: {
  label: string; value: string; on: (v: string) => void; type?: string; required?: boolean; pattern?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs text-muted">{label}{required && " *"}</span>
      <input
        type={type} value={value} onChange={e => on(e.target.value)}
        required={required} pattern={pattern}
        className="mt-1 w-full border border-black/10 rounded-xl px-3 py-2 text-sm"
      />
    </label>
  );
}
