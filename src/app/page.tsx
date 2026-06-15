import { db } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";
import Link from "next/link";

export const revalidate = 60;

export default async function HomePage() {
  const heroes = await db.product.findMany({
    where: { isPublished: true, isHero: true },
    orderBy: { soldCount: "desc" },
    take: 4
  });

  const all = await db.product.findMany({
    where: { isPublished: true },
    orderBy: [{ soldCount: "desc" }, { createdAt: "desc" }],
    take: 24
  });

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-light via-white to-accent/20">
        <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24 grid sm:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-block bg-ink text-white text-[11px] font-bold tracking-wider px-3 py-1 rounded-full uppercase">New Drops Weekly</div>
            <h1 className="mt-3 font-black text-4xl sm:text-6xl leading-[1.05]">
              Things you didn't<br/>know you <span className="text-brand">needed</span>.
            </h1>
            <p className="mt-4 text-muted text-lg max-w-md">
              Curated viral gadgets & lifestyle finds. COD available. Ships in 24 hours from India.
            </p>
            <div className="mt-6 flex gap-3">
              <Link href="#shop" className="bg-ink text-white rounded-full px-6 py-3 font-semibold text-sm">Shop the drop</Link>
              <Link href="/track" className="border border-ink/20 rounded-full px-6 py-3 font-semibold text-sm">Track order</Link>
            </div>
            <div className="mt-6 flex items-center gap-4 text-xs text-muted">
              <span>⭐ 4.7/5 · 12,400+ orders shipped</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {heroes.slice(0, 4).map(p => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="border-y border-black/5 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm text-center">
          <div><b>FREE</b> shipping over ₹699</div>
          <div><b>COD</b> available across India</div>
          <div><b>7-day</b> easy returns</div>
          <div><b>Razorpay</b> secure UPI</div>
        </div>
      </section>

      {/* GRID */}
      <section id="shop" className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black">This week's viral finds</h2>
            <p className="text-muted text-sm">Curated by humans. Shot on Reels. Loved by 12,000+ Indians.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {all.map(p => <ProductCard key={p.id} {...p} />)}
        </div>
      </section>

      {/* SOCIAL FEED CTA */}
      <section className="bg-ink text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <h3 className="text-2xl sm:text-3xl font-black">Watch us find the next viral gadget.</h3>
          <p className="text-white/70 mt-2">New product, new hook, every single day on YouTube Shorts.</p>
          <a href="https://youtube.com/@newvora" target="_blank" rel="noreferrer" className="inline-block mt-6 bg-brand hover:bg-brand-dark rounded-full px-6 py-3 font-semibold text-sm">
            Subscribe on YouTube
          </a>
        </div>
      </section>
    </div>
  );
}
