import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import { inr, percentOff } from "@/lib/format";
import { scarcityLine, TRUST_BADGES } from "@/lib/psych";
import { ScarcityTimer } from "@/components/ScarcityTimer";
import { AddToCartButtons } from "@/components/AddToCartButtons";
import { Star, Truck, ShieldCheck, RotateCcw, Wallet } from "lucide-react";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const p = await db.product.findUnique({ where: { slug: params.slug } });
  if (!p) return {};
  return {
    title: p.title,
    description: p.tagline ?? p.description.slice(0, 160)
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const p = await db.product.findUnique({
    where: { slug: params.slug },
    include: { reviews: { where: { isApproved: true }, orderBy: { createdAt: "desc" }, take: 12 } }
  });
  if (!p || !p.isPublished) notFound();

  const images: string[] = safeJson<string[]>(p.imagesJson) ?? [];
  const bullets: string[] = safeJson<string[]>(p.bullets) ?? [];
  const faq: { q: string; a: string }[] = safeJson(p.faqJson || "[]") ?? [];
  const off = percentOff(p.price, p.compareAt);
  const stockMsg = scarcityLine(p.stock);

  const related = await db.product.findMany({
    where: { isPublished: true, NOT: { id: p.id } },
    orderBy: { soldCount: "desc" }, take: 4
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-10">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* GALLERY */}
        <div className="space-y-3">
          <div className="relative aspect-square bg-muted-soft rounded-2xl overflow-hidden">
            {images[0] && (
              <Image src={images[0]} alt={p.title} fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" priority />
            )}
            {off > 0 && (
              <div className="absolute top-3 left-3 bg-brand text-white text-xs font-bold px-3 py-1 rounded-full">
                {off}% OFF
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.slice(1, 5).map((src, i) => (
                <div key={i} className="relative aspect-square bg-muted-soft rounded-xl overflow-hidden">
                  <Image src={src} alt="" fill sizes="20vw" className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* INFO */}
        <div>
          <h1 className="font-black text-2xl sm:text-3xl leading-tight">{p.title}</h1>
          {p.tagline && <p className="text-muted mt-1">{p.tagline}</p>}

          <div className="flex items-center gap-2 mt-3 text-sm">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-accent text-accent" />
              <span className="font-semibold">{p.rating.toFixed(1)}</span>
            </div>
            <span className="text-muted">·</span>
            <span className="text-muted">{p.reviewCount.toLocaleString("en-IN")} reviews</span>
            <span className="text-muted">·</span>
            <span className="text-muted">{p.soldCount.toLocaleString("en-IN")}+ sold</span>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <div className="text-3xl font-black">{inr(p.price)}</div>
            {p.compareAt && p.compareAt > p.price && (
              <>
                <div className="text-muted line-through">{inr(p.compareAt)}</div>
                <div className="text-brand font-semibold text-sm">You save {inr(p.compareAt - p.price)}</div>
              </>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2 items-center">
            <span className={`text-xs px-2 py-1 rounded-full ${
              stockMsg.tone === "danger" ? "bg-brand-light text-brand-dark" :
              stockMsg.tone === "warn" ? "bg-yellow-100 text-yellow-700" :
              "bg-green-100 text-green-700"
            }`}>
              {stockMsg.text}
            </span>
            <ScarcityTimer />
          </div>

          {bullets.length > 0 && (
            <ul className="mt-5 space-y-2">
              {bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-brand mt-0.5">●</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6">
            <AddToCartButtons
              productId={p.id} slug={p.slug} title={p.title}
              image={images[0] ?? ""} price={p.price}
            />
            <p className="text-xs text-muted mt-2 text-center">UPI · Cards · Netbanking · Wallets · COD</p>
          </div>

          {/* TRUST */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <Trust icon={<Wallet className="w-4 h-4" />} label="Cash on Delivery" />
            <Trust icon={<RotateCcw className="w-4 h-4" />} label="7-Day Returns" />
            <Trust icon={<ShieldCheck className="w-4 h-4" />} label="Razorpay Secure" />
            <Trust icon={<Truck className="w-4 h-4" />} label="Ships in 24h" />
          </div>

          {/* Founder note */}
          {p.founderNote && (
            <div className="mt-6 bg-muted-soft rounded-2xl p-4 text-sm">
              <div className="font-semibold mb-1">A note from the founder</div>
              <p className="text-muted">{p.founderNote}</p>
            </div>
          )}
        </div>
      </div>

      {/* DESCRIPTION */}
      <section className="mt-14 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 prose prose-sm max-w-none">
          <h2 className="font-black text-xl mb-2">Why people love it</h2>
          <p className="text-muted whitespace-pre-line">{p.description}</p>
        </div>

        <aside className="bg-muted-soft rounded-2xl p-5">
          <h3 className="font-bold mb-2">Compare</h3>
          <ul className="text-sm space-y-2">
            <li className="flex justify-between"><span>Price</span><b>{inr(p.price)}</b></li>
            {p.compareAt && <li className="flex justify-between text-muted"><span>Branded equivalent</span><span className="line-through">{inr(p.compareAt)}</span></li>}
            <li className="flex justify-between"><span>Shipping</span><b>FREE over ₹699</b></li>
            <li className="flex justify-between"><span>Returns</span><b>7 days</b></li>
            <li className="flex justify-between"><span>COD</span><b>Yes</b></li>
          </ul>
        </aside>
      </section>

      {/* REVIEWS */}
      {p.reviews.length > 0 && (
        <section className="mt-14">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-xl">Reviews ({p.reviewCount})</h2>
            <div className="text-sm">⭐ {p.rating.toFixed(1)} / 5</div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {p.reviews.map(r => (
              <div key={r.id} className="border border-black/5 rounded-2xl p-4">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span><b className="text-ink">{r.name}</b>{r.city ? ` · ${r.city}` : ""}</span>
                  <span>{r.isVerified ? "✓ Verified buyer" : ""}</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-accent text-accent" />
                  ))}
                </div>
                {r.title && <div className="font-semibold mt-1">{r.title}</div>}
                <p className="text-sm text-muted mt-1">{r.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      {faq.length > 0 && (
        <section className="mt-14">
          <h2 className="font-black text-xl mb-4">Frequently asked</h2>
          <div className="space-y-2">
            {faq.map((f, i) => (
              <details key={i} className="border border-black/5 rounded-2xl p-4">
                <summary className="font-semibold cursor-pointer">{f.q}</summary>
                <p className="text-sm text-muted mt-2">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* RELATED */}
      <section className="mt-14">
        <h2 className="font-black text-xl mb-4">You might also like</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {related.map(rp => (
            <a key={rp.id} href={`/product/${rp.slug}`} className="block border border-black/5 rounded-2xl overflow-hidden">
              <div className="relative aspect-square bg-muted-soft">
                {safeJson<string[]>(rp.imagesJson)?.[0] && (
                  <Image src={safeJson<string[]>(rp.imagesJson)![0]} alt={rp.title} fill sizes="25vw" className="object-cover" />
                )}
              </div>
              <div className="p-3 text-sm">
                <div className="line-clamp-1 font-semibold">{rp.title}</div>
                <div className="font-bold mt-1">{inr(rp.price)}</div>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

function Trust({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 border border-black/5 rounded-xl p-2">
      <div className="text-brand">{icon}</div>
      <span>{label}</span>
    </div>
  );
}

function safeJson<T>(s: string | null | undefined): T | null {
  if (!s) return null;
  try { return JSON.parse(s) as T; } catch { return null; }
}
