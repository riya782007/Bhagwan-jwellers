"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function ProductEditor({ product }: { product: any }) {
  const r = useRouter();
  const [p, setP] = useState({
    ...product,
    bullets: parseJSON<string[]>(product.bullets) ?? [],
    images: parseJSON<string[]>(product.imagesJson) ?? [],
    faq: parseJSON<{q:string;a:string}[]>(product.faqJson) ?? []
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const save = async () => {
    setBusy(true); setMsg(null);
    const body = {
      title: p.title, slug: p.slug, tagline: p.tagline, description: p.description,
      bullets: JSON.stringify(p.bullets),
      imagesJson: JSON.stringify(p.images.filter(Boolean)),
      faqJson: JSON.stringify(p.faq.filter((x: any) => x.q || x.a)),
      videoUrl: p.videoUrl, category: p.category, tags: p.tags, founderNote: p.founderNote,
      price: Number(p.price), compareAt: p.compareAt ? Number(p.compareAt) : null,
      costPrice: p.costPrice ? Number(p.costPrice) : null,
      stock: Number(p.stock), isPublished: !!p.isPublished, isHero: !!p.isHero,
      rating: Number(p.rating)
    };
    const res = await fetch(`/api/admin/products/${p.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
    });
    setBusy(false);
    if (res.ok) { setMsg("Saved ✓"); r.refresh(); }
    else { const d = await res.json().catch(()=>({})); setMsg(d.error || "Save failed"); }
  };

  const seedReviews = async () => {
    const seeds = [
      { name: "Aarav S.", city: "Mumbai", rating: 5, title: "Worth every rupee", body: "Got it in 4 days. Build is way better than expected." },
      { name: "Priya K.", city: "Bengaluru", rating: 5, title: "Made my morning easier", body: "Saves time daily. Smart buy." },
      { name: "Rohan M.", city: "Delhi", rating: 4, title: "Good quality", body: "Works as advertised." },
      { name: "Anjali R.", city: "Pune", rating: 5, title: "Gifted to mom", body: "She loves it. Solid build." }
    ];
    for (const s of seeds) {
      await fetch("/api/admin/reviews", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...s, productId: p.id, isApproved: true, isVerified: true })
      });
    }
    setMsg("Seeded 4 reviews ✓");
    r.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-black text-2xl">Edit · {p.title}</h1>
        <div className="flex gap-2">
          <a href={`/product/${p.slug}`} target="_blank" className="border rounded-full px-4 py-2 text-sm">View</a>
          <button onClick={save} disabled={busy} className="bg-brand text-white rounded-full px-5 py-2 text-sm font-semibold disabled:opacity-50">
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {msg && <div className="bg-brand-light text-brand-dark rounded-xl p-3 text-sm">{msg}</div>}

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card title="Basics">
            <Field label="Title" value={p.title} on={(v:string)=>setP({...p,title:v})} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Slug" value={p.slug} on={(v:string)=>setP({...p,slug:v})} />
              <Field label="Category" value={p.category ?? ""} on={(v:string)=>setP({...p,category:v})} />
            </div>
            <Field label="Tagline (1-line punch)" value={p.tagline ?? ""} on={(v:string)=>setP({...p,tagline:v})} />
            <Field label="Tags (comma)" value={p.tags ?? ""} on={(v:string)=>setP({...p,tags:v})} />
          </Card>

          <Card title="Pricing & stock (₹ shown ÷ 100 = paise stored)">
            <div className="grid grid-cols-3 gap-3">
              <NumField label="Price (paise)" value={p.price} on={(v:number)=>setP({...p,price:v})} />
              <NumField label="Compare at (paise)" value={p.compareAt ?? 0} on={(v:number)=>setP({...p,compareAt:v})} />
              <NumField label="Cost (paise)" value={p.costPrice ?? 0} on={(v:number)=>setP({...p,costPrice:v})} />
              <NumField label="Stock" value={p.stock} on={(v:number)=>setP({...p,stock:v})} />
              <NumField label="Rating" value={p.rating} step={0.1} on={(v:number)=>setP({...p,rating:v})} />
            </div>
            <div className="flex gap-4 mt-2 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked={p.isPublished} onChange={e=>setP({...p,isPublished:e.target.checked})} /> Published</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={p.isHero} onChange={e=>setP({...p,isHero:e.target.checked})} /> Hero</label>
            </div>
          </Card>

          <Card title="Story">
            <TextArea label="Description (markdown)" value={p.description} on={(v:string)=>setP({...p,description:v})} rows={6} />
            <TextArea label="Founder note" value={p.founderNote ?? ""} on={(v:string)=>setP({...p,founderNote:v})} rows={3} />
          </Card>

          <Card title="3 benefit bullets (PDP)">
            {[0,1,2].map(i => (
              <Field key={i} label={`Bullet ${i+1}`} value={p.bullets[i] ?? ""} on={(v:string)=> {
                const next = [...p.bullets]; next[i] = v; setP({...p,bullets:next});
              }} />
            ))}
          </Card>

          <Card title="Images (one URL per line)">
            <textarea
              rows={4}
              value={p.images.join("\n")}
              onChange={e=>setP({...p,images:e.target.value.split("\n").map((s:string)=>s.trim()).filter(Boolean)})}
              className="w-full border rounded-xl p-3 text-sm"
            />
            <Field label="Hero video URL (Cloudinary / YouTube embed)" value={p.videoUrl ?? ""} on={(v:string)=>setP({...p,videoUrl:v})} />
          </Card>

          <Card title="FAQ">
            {(p.faq as any[]).concat([{q:"",a:""}]).slice(0,6).map((row:any, i:number) => (
              <div key={i} className="grid grid-cols-2 gap-2 mb-2">
                <input value={row.q} onChange={e=>{
                  const next = [...p.faq]; next[i] = { ...row, q: e.target.value };
                  setP({...p,faq:next});
                }} placeholder="Question" className="border rounded-xl px-3 py-2 text-sm" />
                <input value={row.a} onChange={e=>{
                  const next = [...p.faq]; next[i] = { ...row, a: e.target.value };
                  setP({...p,faq:next});
                }} placeholder="Answer" className="border rounded-xl px-3 py-2 text-sm" />
              </div>
            ))}
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Quick actions">
            <button onClick={seedReviews} className="w-full bg-ink text-white rounded-full py-2 text-sm">Seed 4 starter reviews</button>
            <a href={`/admin/content?productId=${p.id}`} className="block text-center w-full border rounded-full py-2 text-sm">Generate hooks for this</a>
            <a href={`/admin/suppliers?q=${encodeURIComponent(p.title)}`} className="block text-center w-full border rounded-full py-2 text-sm">Find suppliers</a>
          </Card>

          {p.supplier && (
            <Card title="Linked supplier">
              <div className="text-sm">
                <div className="font-semibold">{p.supplier.name}</div>
                <div className="text-muted">{p.supplier.city}, {p.supplier.state}</div>
                <div>Phone: {p.supplier.phone}</div>
                {p.supplier.gstNumber && <div>GST: {p.supplier.gstNumber}</div>}
                {p.supplier.unitPrice != null && <div>Unit: ₹{Math.round(p.supplier.unitPrice/100)} · MOQ {p.supplier.moq ?? "—"}</div>}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="bg-white rounded-2xl p-5 border border-black/5 space-y-3"><div className="font-semibold text-sm">{title}</div>{children}</div>;
}
function Field({ label, value, on }: { label: string; value: string; on: (v:string)=>void }) {
  return <label className="block"><span className="text-xs text-muted">{label}</span><input value={value} onChange={e=>on(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2 text-sm" /></label>;
}
function NumField({ label, value, on, step }: { label: string; value: number; on: (v:number)=>void; step?: number }) {
  return <label className="block"><span className="text-xs text-muted">{label}</span><input type="number" step={step} value={value} onChange={e=>on(Number(e.target.value))} className="mt-1 w-full border rounded-xl px-3 py-2 text-sm" /></label>;
}
function TextArea({ label, value, on, rows = 4 }: { label: string; value: string; on:(v:string)=>void; rows?: number }) {
  return <label className="block"><span className="text-xs text-muted">{label}</span><textarea rows={rows} value={value} onChange={e=>on(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2 text-sm" /></label>;
}
function parseJSON<T>(s: string | null | undefined): T | null { if (!s) return null; try { return JSON.parse(s); } catch { return null; } }
