"use client";
import { useState } from "react";

type Supplier = any;

export function SuppliersClient({ initial, initialQuery }: { initial: Supplier[]; initialQuery: string }) {
  const [q, setQ] = useState(initialQuery);
  const [matches, setMatches] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  const search = async () => {
    if (!q.trim()) return;
    setBusy(true);
    const r = await fetch(`/api/suppliers/find?q=${encodeURIComponent(q)}`);
    const d = await r.json();
    setMatches(d.matches ?? []);
    setBusy(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="font-black text-2xl">Suppliers</h1>

      <div className="bg-white rounded-2xl p-5 border border-black/5">
        <div className="font-semibold mb-2">Find supplier (IndiaMART)</div>
        <div className="flex gap-2">
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="e.g. self stirring mug" className="flex-1 border rounded-xl px-3 py-2 text-sm" />
          <button onClick={search} disabled={busy} className="bg-ink text-white rounded-full px-4 py-2 text-sm">{busy?"Searching…":"Search"}</button>
        </div>

        {matches.length > 0 && (
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            {matches.map((m, i) => (
              <div key={i} className="border rounded-xl p-3 text-sm space-y-1">
                <div className="font-semibold">{m.name}</div>
                <div className="text-muted">{m.city}, {m.state}</div>
                {m.phone && <div>📞 {m.phone}</div>}
                {m.gstNumber && <div className="text-xs text-muted">GST {m.gstNumber}</div>}
                {m.unitPrice != null && <div>Unit ₹{Math.round(m.unitPrice/100)} · MOQ {m.moq ?? "—"} · ★ {m.rating ?? "—"}</div>}
                {m.url && <a href={m.url} target="_blank" rel="noreferrer" className="text-brand text-xs">View on IndiaMART →</a>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="font-semibold mb-2">Saved suppliers ({initial.length})</h2>
        <div className="bg-white rounded-2xl border border-black/5 overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-muted-soft text-left text-xs uppercase">
              <tr><th className="p-3">Name</th><th>Source</th><th>City</th><th>Phone</th><th>GST</th><th>Match</th><th>Unit ₹</th><th>MOQ</th></tr>
            </thead>
            <tbody>
              {initial.length === 0 && <tr><td colSpan={8} className="p-6 text-muted text-center">No suppliers saved yet.</td></tr>}
              {initial.map(s => (
                <tr key={s.id} className="border-t border-black/5">
                  <td className="p-3 font-medium">{s.name}</td>
                  <td>{s.source}</td>
                  <td>{s.city}</td>
                  <td>{s.phone}</td>
                  <td className="text-xs">{s.gstNumber}</td>
                  <td className="text-xs">{s.productMatch}</td>
                  <td>{s.unitPrice != null ? Math.round(s.unitPrice/100) : "—"}</td>
                  <td>{s.moq ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
