import { db } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 60;

const WA = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919654353586").replace(/\D/g, "");
const waHref = `https://wa.me/${WA}?text=${encodeURIComponent("Hello Bhagwan Jewellers, I would like to enquire about your collection / a wholesale order.")}`;

const CATEGORIES = [
  { name: "Bridal Jewellery", note: "Complete sets for the wedding season", img: "/products/1b.jpg" },
  { name: "Polki & Kundan", note: "Handcrafted heritage pieces", img: "/products/2b.jpg" },
  { name: "Fashion Jewellery", note: "Antique, temple & everyday styles", img: "/products/5b.jpg" },
  { name: "Korean Hair Accessories", note: "Trending clips, pins & bands", img: null as string | null }
];

export default async function HomePage({ searchParams }: { searchParams?: { cat?: string } }) {
  const activeCat = searchParams?.cat;

  const all = await db.product.findMany({
    where: { isPublished: true, ...(activeCat ? { category: activeCat } : {}) },
    orderBy: [{ isHero: "desc" }, { soldCount: "desc" }, { createdAt: "desc" }],
    take: 24
  });

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-ink text-ivory">
        <div className="absolute inset-0 opacity-[0.13] pointer-events-none"
             style={{ backgroundImage: "radial-gradient(circle at 18% 18%, #C5A150 0, transparent 42%), radial-gradient(circle at 88% 80%, #6E2433 0, transparent 46%)" }} />
        <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-20 grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          <div className="text-center lg:text-left">
            <p className="text-gold text-xs sm:text-sm uppercase tracking-luxe">Wholesale Bridal &amp; Fashion Jewellery</p>
            <h1 className="mt-4 font-serif text-4xl sm:text-5xl xl:text-6xl leading-[1.08]">
              Handcrafted jewellery,<br/>trusted by buyers <span className="text-gold">across the world</span>.
            </h1>
            <p className="mt-5 text-ivory/70 text-base sm:text-lg max-w-xl mx-auto lg:mx-0">
              Four decades of craftsmanship from Rui Mandi, Sadar Bazar — bridal sets, Polki &amp; Kundan,
              Korean hair accessories and fashion jewellery, supplied in bulk to retailers and exporters worldwide.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 justify-center lg:justify-start">
              <Link href="#collection" className="rounded-full bg-gold text-ink px-7 py-3 font-medium text-sm hover:bg-gold-light transition">
                Explore the Collection
              </Link>
              <a href={waHref} target="_blank" rel="noreferrer"
                 className="rounded-full border border-gold/50 text-gold px-7 py-3 font-medium text-sm hover:bg-white/5 transition">
                Enquire on WhatsApp
              </a>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
              <div><div className="font-serif text-2xl text-gold">1982</div><div className="text-[11px] uppercase tracking-wide text-ivory/60">Established</div></div>
              <div><div className="font-serif text-2xl text-gold">Worldwide</div><div className="text-[11px] uppercase tracking-wide text-ivory/60">Export</div></div>
              <div><div className="font-serif text-2xl text-gold">Bulk · MOQ</div><div className="text-[11px] uppercase tracking-wide text-ivory/60">Wholesale</div></div>
            </div>
          </div>

          {/* Real store reel */}
          <div className="relative mx-auto w-full max-w-[300px]">
            <div className="absolute -inset-3 rounded-[2.4rem] bg-gold/10 blur-xl" />
            <div className="relative rounded-[2rem] border border-gold/30 overflow-hidden shadow-2xl aspect-[9/16] bg-black">
              <video src="/hero-reel-web.mp4" poster="/hero-reel-poster.jpg" autoPlay muted loop playsInline preload="metadata"
                     className="w-full h-full object-cover" />
            </div>
            <p className="mt-3 text-center text-[11px] uppercase tracking-luxe text-ivory/50">Heritage Elegance · our latest collection</p>
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
          <h2 className="font-serif text-3xl sm:text-4xl mt-2">Shop by Category</h2>
        </div>
        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map(c => {
            const active = activeCat === c.name;
            return (
              <Link key={c.name} href={`/?cat=${encodeURIComponent(c.name)}#collection`}
                    className={`group relative rounded-2xl overflow-hidden aspect-[4/5] flex flex-col justify-end transition ${active ? "ring-2 ring-gold" : "ring-1 ring-gold/20 hover:ring-gold"}`}>
                {c.img ? (
                  <Image src={c.img} alt={c.name} fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover group-hover:scale-105 transition duration-700" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-ink to-wine-dark" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />
                <div className="relative p-4">
                  <h3 className="font-serif text-lg sm:text-xl text-ivory leading-tight">{c.name}</h3>
                  <p className="text-xs text-ivory/70 mt-0.5">{c.note}</p>
                  <span className="mt-2 inline-block text-[11px] uppercase tracking-wide text-gold">{active ? "Viewing →" : "View →"}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* COLLECTION GRID */}
      <section id="collection" className="max-w-6xl mx-auto px-4 pb-16">
        <div className="text-center mb-10">
          <p className="text-gold-dark text-xs uppercase tracking-luxe">{activeCat ? "Category" : "Latest pieces"}</p>
          <h2 className="font-serif text-3xl sm:text-4xl mt-2">{activeCat || "From Our Atelier"}</h2>
          <p className="text-muted text-sm mt-2 max-w-xl mx-auto">
            {activeCat
              ? <>Showing {activeCat}. <Link href="/#collection" className="text-gold-dark underline">View all pieces</Link></>
              : "A selection from our current collection. For pricing, bulk quantities and export orders, enquire on WhatsApp."}
          </p>
        </div>
        {all.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {all.map(p => <ProductCard key={p.id} {...p} />)}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted">New pieces in this category are coming soon.</p>
            <a href={waHref} target="_blank" rel="noreferrer" className="inline-block mt-4 rounded-full bg-ink text-gold-light px-6 py-3 text-sm font-medium">Enquire on WhatsApp</a>
          </div>
        )}
      </section>

      {/* EDITORIAL — STORE GALLERY */}
      <section className="bg-ink text-ivory">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center">
            <p className="text-gold text-xs uppercase tracking-luxe">From our counter</p>
            <h2 className="font-serif text-3xl sm:text-4xl mt-2">Straight from our Rui Mandi store</h2>
            <p className="text-ivory/60 text-sm mt-2 max-w-xl mx-auto">A glimpse of the trays our buyers choose from — earrings, bracelets, chains and more, restocked constantly.</p>
          </div>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {["/products/store-1.jpg", "/products/store-2.jpg", "/products/store-3.jpg"].map((src, i) => (
              <div key={i} className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-gold/20">
                <Image src={src} alt="Bhagwan Jewellers store display" fill sizes="(min-width:640px) 33vw, 100vw" className="object-cover hover:scale-105 transition duration-700" />
              </div>
            ))}
          </div>
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
