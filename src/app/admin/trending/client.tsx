"use client";
import { useState, useTransition } from "react";
import Image from "next/image";
import { inr } from "@/lib/format";

type Row = {
  id: string; source: string; title: string;
  url?: string | null; imageUrl?: string | null;
  priceTarget?: number | null; score: number;
  status: string; supplierFound: boolean; category?: string | null;
};

export function TrendingClient({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState(initial);
  const [busy, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const runScan = () => {
    start(async () => {
      setMsg(null);
      const r = await fetch("/api/trending/run", { method: "POST" });
      const d = await r.json().catch(() => ({}));
      if (r.ok) {
        setMsg(`Scan complete · ${d.fetched} fetched, ${d.upserts} saved`);
        // Reload to fetch updated rows
        location.reload();
      } else {
        setMsg(d.error || "Scan failed");
      }
    });
  };

  const importOne = async (id: string) => {
    const r = await fetch("/api/trending/import", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    const d = await r.json().catch(() => ({}));
    if (r.ok) {
      setRows(prev => prev.map(x => x.id === id ? { ...x, status: "IMPORTED" } : x));
      setMsg(`Imported as draft. Edit at /admin/products/${d.productId}`);
    } else {
      setMsg(d.error || "Import failed");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-black text-2xl">Trending products</h1>
          <p className="text-muted text-sm">Sources: AliExpress · Amazon India · Google Trends · Meesho · YouTube. Scored 0–100.</p>
        </div>
        <button onClick={runScan} disabled={busy} className="bg-ink text-white rounded-full px-4 py-2 text-sm disabled:opacity-50">
          {busy ? "Scanning…" : "Run scan now"}
        </button>
      </div>

      {msg && <div className="bg-brand-light text-brand-dark rounded-xl p-3 text-sm">{msg}</div>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {rows.length === 0 && <div className="text-muted col-span-full p-8 text-center bg-white rounded-2xl">No trending data yet — click <b>Run scan now</b>.</div>}
        {rows.map(r => (
          <div key={r.id} className="bg-white rounded-2xl border border-black/5 overflow-hidden flex flex-col">
            <div className="relative aspect-video bg-muted-soft">
              {r.imageUrl && <Image src={r.imageUrl} alt={r.title} fill sizes="33vw" className="object-cover" />}
              <div className="absolute top-2 left-2 bg-ink text-white text-[10px] px-2 py-0.5 rounded-full">{r.source}</div>
              <div className="absolute top-2 right-2 bg-brand text-white text-xs font-bold px-2 py-0.5 rounded-full">{Math.round(r.score)}</div>
            </div>
            <div className="p-3 flex-1 flex flex-col">
              <div className="text-sm font-semibold line-clamp-2 min-h-[2.5rem]">{r.title}</div>
              <div className="text-xs text-muted mt-1 flex gap-2 items-center">
                {r.category && <span>{r.category}</span>}
                {r.supplierFound && <span className="text-green-700">✓ Supplier</span>}
                {r.priceTarget && <span>· Target {inr(r.priceTarget)}</span>}
              </div>
              <div className="mt-3 flex items-center gap-2">
                {r.url && <a href={r.url} target="_blank" rel="noreferrer" className="text-xs text-muted underline">Open source</a>}
                <button
                  disabled={r.status === "IMPORTED"}
                  onClick={() => importOne(r.id)}
                  className="ml-auto bg-brand hover:bg-brand-dark text-white rounded-full text-xs px-3 py-1 disabled:opacity-50"
                >
                  {r.status === "IMPORTED" ? "Imported ✓" : "Import →"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
