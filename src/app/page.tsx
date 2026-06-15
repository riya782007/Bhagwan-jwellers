import { db } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";
import Link from "next/link";

export const revalidate = 60;

const WA = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919654353586").replace(/\D/g, "");
const waHref = `https://wa.me/${WA}?text=${encodeURIComponent("Hello Bhagwan Jewellers, I would like to enquire about your collection / a wholesale order.")}`;

const CATEGORIES = [
  { name: "Bridal Jewellery", note: "Statement sets for the wedding season" },
  { name: "Polki & Kundan", note: "Handcrafted heritage pieces" },
  { name: "Korean Hair Accessories", note: "Trending clips, pins & bands" },
  { name: "Fashion Jewellery", note: "Everyday & western styles" }
];

export default async function HomePage() {
  const all = await db.product.findMany({
    where: { isPublished: true },
    orderBy: [{ soldCount: "desc" }, { createdAt: "desc" }],
    take: 12
  });

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-ink text-ivory">
        <div className="absolute inset-0 opacity-[0.15] pointer-events-none"
             style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #C5A150 0, transparent 40%), radial-gradient(circle at 85% 75%, #6E2433 0, transparent 45%)" }} />
        <div className="relative max-w-4xl mx-auto px-4 py-20 sm:py-28 text-center">
          <p className="text-gold text-xs sm:text-sm uppercase tracking-luxe">Wholesale Bridal &amp; Fashion Jewellery</p>
          <h1 className="mt-5 font-serif text-4xl sm:text-6xl leading-[1.08]">
            Handcrafted jewellery,<br/>trusted by buyers <span className="text-gold">across the world</span>.
          </h1>
          <p className="mt-5 text-ivory/70 text-base sm:text-lg max-w-2xl mx-auto">
            Four decades of craftsmanship from Rui Mandi, Sadar Bazar — bridal sets, Polki &amp; Kundan,
            Korean hair accessories and fashion jewellery, supplied in bulk to retailers and exporters worldwide.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link href="#collection" className="rounded-full bg-gold text-ink px-7 py-3 font-medium text-sm hover:bg-gold-light transition">
              Explore the Collection
            </Link>
            <a href={waHref} target="_blank" rel="noreferrer"
               className="rounded-full border border-gold/50 text-gold px-7 py-3 font-medium text-sm hover:bg-white/5 transition">
              Enquire on WhatsApp
            </a>
          </div>
          <div className="mx-auto mt-12 max-w-xl gold-rule" />
          <div className="mt-6 grid grid-cols-3 gap-4 text-center max-w-xl mx-auto">
            <div><div className="font-serif text-2xl text-gold">1982</div><div className="text-[11px] uppercase tracking-wide text-ivory/60">Established</div></div>
            <div><div className="font-serif text-2xl text-gold">Worldwide</div><div className="text-[11px] uppercase tracking-wide text-ivory/60">Export</div></div>
            <div><div className="font-serif text-2xl text-gold">Bulk · MOQ</div><div className="text-[11px] uppercase tracking-wide text-ivory/60">Wholesale</div></div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-b border-gold/15 bg-ivory">
        <div className="max-w-6xl mx-auto px-4 py-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm text-center text-ink/80">
          <div><b className="text-ink">Est. 1982</b> · family-run</div>
          <div><b className="text-ink">Rui Mandi</b> · Sadar Bazar, Delhi</div>
          <div><b className="text-ink">Worldwide</b> export &amp; shipping</div>
          <div><b className="text-ink">Bulk orders</b> &amp; video-call shopping</div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center">
          <p className="text-gold-dark text-xs uppercase tracking-luxe">What we craft</p>
          <h2 className="font-serif text-3xl sm:text-4xl mt-2">Explore the Collection</h2>
        </div>
        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map(c => (
            <Link key={c.name} href="#collection"
                  className="group relative rounded-2xl border border-gold/25 bg-white p-6 min-h-[180px] flex flex-col justify-end overflow-hidden hover:border-gold transition">
              <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-gold/10 group-hover:bg-gold/20 transition" />
              <h3 className="relative font-serif text-xl text-ink">{c.name}</h3>
              <p className="relative text-sm text-muted mt-1">{c.note}</p>
              <span className="relative mt-3 text-xs uppercase tracking-wide text-gold-dark">View →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* COLLECTION GRID */}
      <section id="collection" className="max-w-6xl mx-auto px-4 pb-16">
        <div className="text-center mb-10">
          <p className="text-gold-dark text-xs uppercase tracking-luxe">Latest pieces</p>
          <h2 className="font-serif text-3xl sm:text-4xl mt-2">From Our Atelier</h2>
          <p className="text-muted text-sm mt-2 max-w-xl mx-auto">
            A selection from our current collection. For pricing, bulk quantities and export orders, enquire on WhatsApp.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {all.map(p => <ProductCard key={p.id} {...p} />)}
        </div>
      </section>

      {/* HERITAGE STORY */}
      <section className="bg-ivory-soft border-y border-gold/15">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-gold-dark text-xs uppercase tracking-luxe">Our Story</p>
          <h2 className="font-serif text-3xl sm:text-4xl mt-2">Four decades on Rui Mandi</h2>
          <p className="text-ink/75 mt-5 leading-relaxed">
            Since 1982, Bhagwan Jewellers has crafted and supplied jewellery from the heart of Sadar Bazar, Delhi —
            now run by the second and third generation of the Gulati family. From bridal Polki sets to the latest
            Korean hair accessories, our pieces reach retailers, resellers and exporters across India and the world.
            Every order is backed by hands-on craftsmanship and decades of trust.
          </p>
        </div>
      </section>

      {/* ENQUIRY BAND */}
      <section className="bg-ink text-ivory">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h3 className="font-serif text-3xl sm:text-4xl">Bring your store the Bhagwan collection.</h3>
          <p className="text-ivory/70 mt-3">Wholesale pricing, bulk quantities, worldwide export — one message away.</p>
          <div className="mt-7 flex flex-wrap gap-3 justify-center">
            <a href={waHref} target="_blank" rel="noreferrer"
               className="rounded-full bg-gold text-ink px-7 py-3 font-medium text-sm hover:bg-gold-light transition">
              Enquire on WhatsApp
            </a>
            <a href="https://www.youtube.com/@Bhagwanjewellers" target="_blank" rel="noreferrer"
               className="rounded-full border border-gold/50 text-gold px-7 py-3 font-medium text-sm hover:bg-white/5 transition">
              Watch our collections on YouTube
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
