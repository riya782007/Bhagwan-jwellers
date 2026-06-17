"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";

function firstImage(imagesJson: string): string | null {
  try { const a = JSON.parse(imagesJson); return Array.isArray(a) && a[0] ? a[0] : null; } catch { return null; }
}
const inr = (paise: number) => paise ? `₹${Math.round(paise / 100).toLocaleString("en-IN")}` : "On enquiry";

export function ProductsTable({ products }: { products: any[] }) {
  const r = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function togglePublish(p: any) {
    setBusy(p.id);
    await fetch(`/api/admin/products/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isPublished: !p.isPublished }) });
    setBusy(null); r.refresh();
  }
  async function remove(p: any) {
    if (!confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    setBusy(p.id);
    await fetch(`/api/admin/products/${p.id}`, { method: "DELETE" });
    setBusy(null); r.refresh();
  }

  const live = products.filter((p) => p.isPublished).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-serif text-2xl text-ink">Products</h1>
          <p className="text-sm text-muted">{products.length} total · {live} live on site</p>
        </div>
        <Link href="/admin/add" className="inline-flex items-center gap-2 bg-gold text-ink rounded-full px-5 py-2.5 text-sm font-semibold">
          <Plus className="w-4 h-4" /> Add by Photo + Voice
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => {
          const img = firstImage(p.imagesJson);
          return (
            <div key={p.id} className="bg-white rounded-2xl border border-black/5 overflow-hidden flex flex-col">
              <div className="relative aspect-[4/3] bg-ivory-soft">
                {img && <Image src={img} alt={p.title} fill className="object-cover" sizes="(min-width:1024px) 33vw, 100vw" />}
                <span className={`absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full ${p.isPublished ? "bg-green-600 text-white" : "bg-black/60 text-white"}`}>
                  {p.isPublished ? "Live" : "Draft"}
                </span>
              </div>
              <div className="p-3 flex flex-col gap-1 flex-1">
                <div className="text-[10px] uppercase tracking-wide text-gold-dark">{p.category || "—"}</div>
                <div className="font-serif text-ink leading-snug line-clamp-2 min-h-[2.6rem]">{p.title}</div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gold-dark font-semibold">{inr(p.price)}</span>
                  <span className="text-xs text-muted">Stock: {p.stock}</span>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Link href={`/admin/products/${p.id}`} className="flex-1 inline-flex items-center justify-center gap-1 border border-black/15 rounded-full py-2 text-xs font-medium"><Pencil className="w-3.5 h-3.5" /> Edit</Link>
                  <button disabled={busy === p.id} onClick={() => togglePublish(p)}
                    className={`flex-1 rounded-full py-2 text-xs font-medium ${p.isPublished ? "border border-black/15" : "bg-ink text-gold-light"}`}>
                    {p.isPublished ? "Unpublish" : "Publish"}
                  </button>
                  <button disabled={busy === p.id} onClick={() => remove(p)} className="rounded-full p-2 border border-wine/30 text-wine" aria-label="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
