import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { inr, percentOff } from "@/lib/format";
import { Globe, Video, Layers, BadgeCheck } from "lucide-react";

export const revalidate = 60;

const WA = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919654353586").replace(/\D/g, "");

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const p = await db.product.findUnique({ where: { slug: params.slug } });
  if (!p) return {};
  return { title: p.title, description: p.tagline ?? p.description.slice(0, 160) };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const p = await db.product.findUnique({
    where: { slug: params.slug },
    include: { reviews: { where: { isApproved: true }, orderBy: { createdAt: "desc" }, take: 8 } }
  });
  if (!p || !p.isPublished) notFound();

  const images: string[] = safeJson<string[]>(p.imagesJson) ?? [];
  const bullets: string[] = safeJson<string[]>(p.bullets) ?? [];
  const faq: { q: string; a: string }[] = safeJson(p.faqJson || "[]") ?? [];
  const off = percentOff(p.price, p.compareAt);

  const enquire = `https://wa.me/${WA}?text=${encodeURIComponent(`Hello Bhagwan Jewellers, I'm interested in "${p.title}". Please share wholesale pricing and minimum order quantity.`)}`;

  const related = await db.product.findMany({
    where: { isPublished: true, NOT: { id: p.id } },
    orderBy: { soldCount: "desc" }, take: 4
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      <div className="grid lg:grid-cols-2 gap-10">
        {/* GALLERY */}
        <div className="space-y-3">
          <div className="relative aspect-square bg-ivory-soft rounded-2xl overflow-hidden border border-gold/15">
            {images[0] && (
              <Image src={images[0]} alt={p.title} fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" priority />
            )}
            {off > 0 && (
              <div className="absolute top-3 left-3 bg-wine text-ivory text-xs font-medium px-3 py-1 rounded-full">{off}% off</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.slice(1, 5).map((src, i) => (
                <div key={i} className="relative aspect-square bg-ivory-soft rounded-xl overflow-hidden border border-gold/10">
                  <Image src={src} alt="" fill sizes="20vw" className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* INFO */}
        <div>
          <p className="text-gold-dark text-xs uppercase tracking-luxe">Bhagwan Jewellers · Wholesale</p>
          <h1 className="font-serif text-3xl sm:text-4xl leading-tight mt-2 text-ink">{p.title}</h1>
          {p.tagline && <p className="text-muted mt-2">{p.tagline}</p>}

          <div className="mt-5 flex items-baseline gap-3">
            <div className="text-2xl font-serif text-gold-dark">{inr(p.price)}</div>
            {p.compareAt && p.compareAt > p.price && (
              <div className="text-muted line-through">{inr(p.compareAt)}</div>
            )}
            <span className="text-xs text-muted">· indicative · bulk pricing on enquiry</span>
          </div>

          {bullets.length > 0 && (
            <ul className="mt-5 space-y-2">
              {bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-ink/80">
                  <span className="text-gold mt-0.5">✦</span><span>{b}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <a href={enquire} target="_blank" rel="noreferrer"
               className="flex-1 text-center bg-ink text-gold-light rounded-full py-3.5 text-sm font-medium hover:bg-ink-soft transition">
              Enquire on WhatsApp
            </a>
            <a href={`tel:+91${WA.slice(2)}`}
               className="flex-1 text-center border border-gold/50 text-gold-dark rounded-full py-3.5 text-sm font-medium hover:bg-gold/5 transition">
              Call to order
            </a>
          </div>
          <p className="text-xs text-muted mt-2 text-center sm:text-left">Bulk &amp; MOQ on request · Worldwide export · Video-call shopping available</p>

          {/* WHOLESALE TRUST */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <Trust icon={<Layers className="w-4 h-4" />} label="Bulk / MOQ" />
            <Trust icon={<Globe className="w-4 h-4" />} label="Worldwide export" />
            <Trust icon={<Video className="w-4 h-4" />} label="Video-call shopping" />
            <Trust icon={<BadgeCheck className="w-4 h-4" />} label="Since 1982" />
          </div>

          {p.founderNote && (
            <div className="mt-6 bg-ivory-soft border border-gold/15 rounded-2xl p-4 text-sm">
              <div className="font-serif text-base mb-1 text-ink">From the Gulati family</div>
              <p className="text-muted">{p.founderNote}</p>
            </div>
          )}
        </div>
      </div>

      {/* DESCRIPTION */}
      <section className="mt-16 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="font-serif text-2xl mb-3">About this piece</h2>
          <p className="text-ink/75 whitespace-pre-line leading-relaxed">{p.description}</p>
        </div>
        <aside className="bg-ivory-soft border border-gold/15 rounded-2xl p-5 h-fit">
          <h3 className="font-serif text-lg mb-3">Wholesale details</h3>
          <ul className="text-sm space-y-2 text-ink/80">
            <li className="flex justify-between"><span>Indicative price</span><b className="text-gold-dark">{inr(p.price)}</b></li>
            <li className="flex justify-between"><span>MOQ</span><b>On request</b></li>
            <li className="flex justify-between"><span>Shipping</span><b>India &amp; worldwide</b></li>
            <li className="flex justify-between"><span>Ordering</span><b>WhatsApp / video call</b></li>
          </ul>
        </aside>
      </section>

      {/* TESTIMONIALS */}
      {p.reviews.length > 0 && (
        <section className="mt-16">
          <h2 className="font-serif text-2xl mb-5">What buyers say</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {p.reviews.map(r => (
              <div key={r.id} className="border border-gold/15 bg-white rounded-2xl p-4">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span><b className="text-ink">{r.name}</b>{r.city ? ` · ${r.city}` : ""}</span>
                  <span className="text-gold">{"★".repeat(r.rating)}</span>
                </div>
                {r.title && <div className="font-serif text-base mt-1 text-ink">{r.title}</div>}
                <p className="text-sm text-muted mt-1">{r.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      {faq.length > 0 && (
        <section className="mt-16">
          <h2 className="font-serif text-2xl mb-4">Frequently asked</h2>
          <div className="space-y-2">
            {faq.map((f, i) => (
              <details key={i} className="border border-gold/15 bg-white rounded-2xl p-4">
                <summary className="font-medium cursor-pointer text-ink">{f.q}</summary>
                <p className="text-sm text-muted mt-2">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* RELATED */}
      <section className="mt-16">
        <h2 className="font-serif text-2xl mb-5">You may also like</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5">
          {related.map(rp => (
            <Link key={rp.id} href={`/product/${rp.slug}`} className="block border border-gold/15 bg-white rounded-2xl overflow-hidden hover:border-gold transition">
              <div className="relative aspect-square bg-ivory-soft">
                {safeJson<string[]>(rp.imagesJson)?.[0] && (
                  <Image src={safeJson<string[]>(rp.imagesJson)![0]} alt={rp.title} fill sizes="25vw" className="object-cover" />
                )}
              </div>
              <div className="p-3 text-sm">
                <div className="line-clamp-1 font-serif text-ink">{rp.title}</div>
                <div className="text-gold-dark font-semibold mt-1">{inr(rp.price)}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function Trust({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 border border-gold/15 rounded-xl p-2 bg-white">
      <div className="text-gold-dark">{icon}</div>
      <span className="text-ink/80">{label}</span>
    </div>
  );
}

function safeJson<T>(s: string | null | undefined): T | null {
  if (!s) return null;
  try { return JSON.parse(s) as T; } catch { return null; }
}
