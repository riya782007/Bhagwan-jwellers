"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, Trash2, X, Loader2, Eye, Check } from "lucide-react";

const CATEGORIES = ["Bridal Jewellery", "Polki & Kundan", "Korean Hair Accessories", "Fashion Jewellery"];

export function ProductEditor({ product }: { product: any }) {
  const r = useRouter();
  const [p, setP] = useState({
    ...product,
    bullets: parseJSON<string[]>(product.bullets) ?? [],
    images: parseJSON<string[]>(product.imagesJson) ?? [],
    faq: parseJSON<{ q: string; a: string }[]>(product.faqJson) ?? []
  });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [showAdv, setShowAdv] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const rupees = (paise: number) => (paise ? Math.round(paise / 100) : 0);

  async function uploadPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true); setMsg(null);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("files", f));
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const j = await res.json();
      if (!res.ok) setMsg(j.error || "Upload failed");
      else setP({ ...p, images: [...p.images, ...j.urls] });
    } catch { setMsg("Upload failed"); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  }

  function removeImage(i: number) {
    setP({ ...p, images: p.images.filter((_: string, idx: number) => idx !== i) });
  }

  async function save() {
    setBusy(true); setMsg(null);
    const body = {
      title: p.title, slug: p.slug, tagline: p.tagline, description: p.description,
      bullets: JSON.stringify((p.bullets as string[]).filter(Boolean)),
      imagesJson: JSON.stringify((p.images as string[]).filter(Boolean)),
      faqJson: JSON.stringify((p.faq as any[]).filter((x) => x.q || x.a)),
      videoUrl: p.videoUrl, category: p.category, tags: p.tags, founderNote: p.founderNote,
      price: Number(p.price), compareAt: p.compareAt ? Number(p.compareAt) : null,
      stock: Number(p.stock), isPublished: !!p.isPublished, isHero: !!p.isHero
    };
    const res = await fetch(`/api/admin/products/${p.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
    });
    setBusy(false);
    if (res.ok) { setMsg("Saved ✓"); r.refresh(); } else { const d = await res.json().catch(() => ({})); setMsg(d.error || "Save failed"); }
  }

  async function remove() {
    if (!confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    setBusy(true);
    const res = await fetch(`/api/admin/products/${p.id}`, { method: "DELETE" });
    if (res.ok) r.push("/admin/products"); else { setBusy(false); setMsg("Delete failed"); }
  }

  const catOptions = CATEGORIES.includes(p.category) ? CATEGORIES : [p.category, ...CATEGORIES].filter(Boolean);

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h1 className="font-serif text-2xl text-ink">Edit piece</h1>
        <div className="flex gap-2">
          <a href={`/product/${p.slug}`} target="_blank" className="inline-flex items-center gap-1 border border-black/15 rounded-full px-4 py-2 text-sm"><Eye className="w-4 h-4" /> View</a>
          <button onClick={save} disabled={busy} className="inline-flex items-center gap-1 bg-ink text-gold-light rounded-full px-5 py-2 text-sm font-semibold disabled:opacity-50">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save
          </button>
        </div>
      </div>

      {msg && <div className="bg-ivory-soft border border-gold/20 text-ink rounded-xl p-3 text-sm">{msg}</div>}

      {/* Publish toggle — prominent */}
      <div className="bg-white rounded-2xl border border-black/5 p-4 flex items-center justify-between">
        <div>
          <div className="font-semibold text-sm">{p.isPublished ? "Live on the website" : "Draft (hidden)"}</div>
          <div className="text-xs text-muted">Turn on to show this piece in the public collection.</div>
        </div>
        <button onClick={() => setP({ ...p, isPublished: !p.isPublished })}
          className={`relative w-14 h-8 rounded-full transition ${p.isPublished ? "bg-green-600" : "bg-black/20"}`}>
          <span className={`absolute top-1 w-6 h-6 bg-white rounded-full transition ${p.isPublished ? "left-7" : "left-1"}`} />
        </button>
      </div>

      {/* Photos */}
      <Card title="Photos">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {(p.images as string[]).map((src, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-black/10 bg-ivory-soft group">
              <Image src={src} alt="" fill className="object-cover" />
              <button onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"><X className="w-3.5 h-3.5" /></button>
              {i === 0 && <span className="absolute bottom-1 left-1 bg-gold text-ink text-[9px] px-1.5 py-0.5 rounded-full">Main</span>}
            </div>
          ))}
          <button onClick={() => fileRef.current?.click()} disabled={uploading}
            className="aspect-square rounded-xl border-2 border-dashed border-gold/40 flex flex-col items-center justify-center text-muted text-xs hover:border-gold disabled:opacity-50">
            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Upload className="w-5 h-5 mb-1 text-gold-dark" />Upload</>}
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={uploadPhotos} className="hidden" />
        <p className="text-xs text-muted">First photo is the main image. Hover a photo to remove it.</p>
      </Card>

      {/* Basics */}
      <Card title="Details">
        <Field label="Name" value={p.title} on={(v: string) => setP({ ...p, title: v })} />
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs text-muted">Category</span>
            <select value={p.category ?? ""} onChange={(e) => setP({ ...p, category: e.target.value })} className="mt-1 w-full border rounded-xl px-3 py-2 text-sm bg-white">
              {catOptions.map((c: string) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <Field label="Short tagline" value={p.tagline ?? ""} on={(v: string) => setP({ ...p, tagline: v })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block"><span className="text-xs text-muted">Price (₹)</span>
            <input type="number" value={rupees(p.price)} onChange={(e) => setP({ ...p, price: Number(e.target.value) * 100 })} className="mt-1 w-full border rounded-xl px-3 py-2 text-sm" /></label>
          <label className="block"><span className="text-xs text-muted">Stock (pieces)</span>
            <input type="number" value={p.stock} onChange={(e) => setP({ ...p, stock: Number(e.target.value) })} className="mt-1 w-full border rounded-xl px-3 py-2 text-sm" /></label>
        </div>
      </Card>

      <Card title="Description">
        <TextArea label="About this piece" value={p.description} on={(v: string) => setP({ ...p, description: v })} rows={5} />
        {[0, 1, 2, 3].map((i) => (
          <Field key={i} label={`Highlight ${i + 1}`} value={p.bullets[i] ?? ""} on={(v: string) => { const next = [...p.bullets]; next[i] = v; setP({ ...p, bullets: next }); }} />
        ))}
      </Card>

      {/* Advanced */}
      <button onClick={() => setShowAdv(!showAdv)} className="text-sm text-gold-dark">{showAdv ? "− Hide" : "+ Show"} advanced options</button>
      {showAdv && (
        <Card title="Advanced">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="URL slug" value={p.slug} on={(v: string) => setP({ ...p, slug: v })} />
            <label className="block"><span className="text-xs text-muted">Compare-at price (₹, optional)</span>
              <input type="number" value={rupees(p.compareAt ?? 0)} onChange={(e) => setP({ ...p, compareAt: Number(e.target.value) * 100 })} className="mt-1 w-full border rounded-xl px-3 py-2 text-sm" /></label>
          </div>
          <Field label="Search tags (comma separated)" value={p.tags ?? ""} on={(v: string) => setP({ ...p, tags: v })} />
          <Field label="Hero video URL (optional)" value={p.videoUrl ?? ""} on={(v: string) => setP({ ...p, videoUrl: v })} />
          <TextArea label="Founder note (optional)" value={p.founderNote ?? ""} on={(v: string) => setP({ ...p, founderNote: v })} rows={2} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={p.isHero} onChange={(e) => setP({ ...p, isHero: e.target.checked })} /> Feature on homepage hero</label>
        </Card>
      )}

      {/* Delete */}
      <div className="pt-2">
        <button onClick={remove} disabled={busy} className="inline-flex items-center gap-2 text-sm text-wine border border-wine/30 rounded-full px-4 py-2 hover:bg-wine/5"><Trash2 className="w-4 h-4" /> Delete this piece</button>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="bg-white rounded-2xl p-5 border border-black/5 space-y-3"><div className="font-semibold text-sm">{title}</div>{children}</div>;
}
function Field({ label, value, on }: { label: string; value: string; on: (v: string) => void }) {
  return <label className="block"><span className="text-xs text-muted">{label}</span><input value={value} onChange={(e) => on(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2 text-sm" /></label>;
}
function TextArea({ label, value, on, rows = 4 }: { label: string; value: string; on: (v: string) => void; rows?: number }) {
  return <label className="block"><span className="text-xs text-muted">{label}</span><textarea rows={rows} value={value} onChange={(e) => on(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2 text-sm" /></label>;
}
function parseJSON<T>(s: string | null | undefined): T | null { if (!s) return null; try { return JSON.parse(s); } catch { return null; } }
