"use client";
import { useMemo, useState } from "react";
import { generateHooks, generateScript } from "@/lib/content/hooks";

export function ContentClient({ products, initial }: { products: any[]; initial: any | null }) {
  const [productId, setProductId] = useState(initial?.id ?? products[0]?.id);
  const product = products.find(p => p.id === productId) ?? initial;
  const [hooks, setHooks] = useState<string[]>(product ? generateHooks(product.title, 8) : []);

  const script = useMemo(() => {
    if (!product) return "";
    const bullets = parseJSON<string[]>(product.bullets) ?? [];
    return generateScript({ title: product.title, benefits: bullets, price: product.price, ctaUrl: `newvora.in/product/${product.slug}` });
  }, [product]);

  const regen = () => product && setHooks(generateHooks(product.title, 8));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-black text-2xl">Content Studio</h1>
        <select value={productId ?? ""} onChange={e=>{
          setProductId(e.target.value);
          const p = products.find(x => x.id === e.target.value);
          if (p) setHooks(generateHooks(p.title, 8));
        }} className="border rounded-xl px-3 py-2 text-sm">
          {products.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
      </div>

      <p className="text-muted text-sm">Pick a product → get 8 scroll-stopping hooks + a 30-second script. Shoot 3 variants today, post all three to Shorts/Reels.</p>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-black/5 p-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold">Hooks (first 3 seconds)</h2>
            <button onClick={regen} className="text-xs text-brand">↻ regenerate</button>
          </div>
          <ol className="text-sm space-y-2 list-decimal pl-5">
            {hooks.map((h, i) => <li key={i}><HookRow text={h} /></li>)}
          </ol>
        </div>

        <div className="bg-white rounded-2xl border border-black/5 p-5">
          <h2 className="font-bold mb-2">30-second script</h2>
          <pre className="whitespace-pre-wrap text-sm leading-relaxed bg-muted-soft p-4 rounded-xl">{script}</pre>
          <button onClick={() => navigator.clipboard.writeText(script)} className="mt-2 bg-ink text-white rounded-full px-4 py-2 text-xs">Copy script</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 p-5 text-sm">
        <h2 className="font-bold mb-2">Posting checklist</h2>
        <ol className="space-y-1 list-decimal pl-5 text-muted">
          <li>Shoot 3 variants of hook + first 5 seconds. Same payoff.</li>
          <li>Edit in CapCut: 9:16, captions on, viral sound, hook on screen as text.</li>
          <li>Title + first comment: include the product link `newvora.in/product/{product?.slug}`.</li>
          <li>Post all 3 spread across the day (10am, 1pm, 7pm IST).</li>
          <li>Cross-post the best one to Instagram Reels + Pinterest pin.</li>
          <li>Track 6h: variant with highest CTR → post 2 more in that style tomorrow.</li>
        </ol>
      </div>
    </div>
  );
}

function HookRow({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="flex-1">{text}</span>
      <button onClick={() => navigator.clipboard.writeText(text)} className="text-xs text-brand">copy</button>
    </div>
  );
}

function parseJSON<T>(s: string | null | undefined): T | null { if (!s) return null; try { return JSON.parse(s); } catch { return null; } }
