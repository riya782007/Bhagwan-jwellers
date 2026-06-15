"use client";
import { useState } from "react";

export default function TrackPage() {
  const [number, setNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(null); setResult(null);
    const r = await fetch(`/api/track?number=${encodeURIComponent(number)}&phone=${encodeURIComponent(phone)}`);
    const d = await r.json();
    if (!r.ok) setErr(d.error || "Not found");
    else setResult(d.order);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="font-black text-2xl">Track your order</h1>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <input value={number} onChange={e=>setNumber(e.target.value)} placeholder="Order #NV-00001" className="w-full border rounded-xl px-3 py-2 text-sm" required />
        <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Phone (10-digit)" className="w-full border rounded-xl px-3 py-2 text-sm" required />
        <button className="w-full bg-brand text-white rounded-full py-2 font-semibold text-sm">Track</button>
      </form>
      {err && <div className="mt-3 text-sm text-brand">{err}</div>}
      {result && (
        <div className="mt-6 border rounded-2xl p-4 text-sm">
          <div><b>{result.number}</b> · {result.status}</div>
          <div className="text-muted">Total ₹{Math.round(result.total/100)} · {result.paymentMethod}</div>
          {result.trackingUrl && <a href={result.trackingUrl} className="text-brand">Live tracking →</a>}
          {!result.trackingUrl && <div className="text-muted text-xs mt-1">Tracking link will be sent on WhatsApp once shipped.</div>}
        </div>
      )}
    </div>
  );
}
