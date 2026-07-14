import { db } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

const WA = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919654353586").replace(/\D/g, "");
const waHref = `https://wa.me/${WA}?text=${encodeURIComponent("Hello Bhagwan Jewellers, I would like to enquire about your collection / a wholesale order.")}`;

const CATEGORIES = [
  { name: "Bridal Jewellery", note: "Complete sets for the wedding season", img: "/products/1b.jpg" },
  { name: "Polki & Kundan", note: "Handcrafted heritage pieces", img: "/products/2b.jpg" },
  { name: "Fashion Jewellery", note: "Antique, temple & everyday styles", img: "/products/5b.jpg" },
  { name: "Korean Hair Accessories", note: "Trending clips, pins & bands", img: null as string | null }
];

/* ── Ornamental helpers ─────────────────────────────────────────── */

function Corner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const cls = {
    tl: "top-4 left-4 sm:top-6 sm:left-6",
    tr: "top-4 right-4 sm:top-6 sm:right-6 rotate-90",
    br: "bottom-4 right-4 sm:bottom-6 sm:right-6 rotate-180",
    bl: "bottom-4 left-4 sm:bottom-6 sm:left-6 -rotate-90"
  }[pos];
  return (
    <svg viewBox="0 0 44 44" aria-hidden
         className={`absolute z-30 w-7 h-7 sm:w-11 sm:h-11 text-gold pointer-events-none drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)] ${cls}`}
         fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M2 42 V14 Q2 2 14 2 H42" />
      <path d="M8 42 V16 Q8 8 16 8 H42" opacity="0.55" />
      <path d="M14 20 L20 14 L26 20 L20 26 Z" fill="currentColor" stroke="none" opacity="0.9" />
    </svg>
  );
}

function Ornament({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const line = tone === "dark" ? "from-transparent via-gold/70 to-gold" : "from-transparent via-gold-dark/60 to-gold-dark";
  const diamond = tone === "dark" ? "bg-gold" : "bg-gold-dark";
  return (
    <div className="flex items-center justify-center gap-3 mt-4" aria-hidden>
      <span className={`h-px w-14 bg-gradient-to-r ${line}`} />
      <span className={`w-1.5 h-1.5 rotate-45 ${diamond}`} />
      <span className={`h-px w-14 bg-gradient-to-l ${line}`} />
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────── */

export default async function HomePage({ searchParams }: { searchParams?: { cat?: string } }) {
  const activeCat = searchParams?.cat;

  const all = await db.product.findMany({
    where: { isPublished: true, ...(activeCat ? { category: activeCat } : {}) },
    orderBy: [{ isHero: "desc" }, { soldCount: "desc" }, { createdAt: "desc" }],
    take: 24
  });

  return (
    <div>
      {/* ── HERO — cinematic film below the menu ─────────────────── */}
      <section className="relative overflow-hidden bg-ink text-ivory">
        {/* ambient palace glow */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.18]"
             style={{ backgroundImage: "radial-gradient(circle at 12% 8%, #C5A150 0, transparent 38%), radial-gradient(circle at 88% 92%, #6E2433 0, transparent 44%), radial-gradient(circle at 50% 120%, #C5A150 0, transparent 34%)" }} />

        <div className="relative max-w-[1360px] mx-auto px-3 sm:px-6 pt-7 sm:pt-10 pb-14 sm:pb-20">
          {/* eyebrow */}
          <div className="flex items-center justify-center gap-4 mb-6 sm:mb-9">
            <span className="hidden sm:block h-px w-20 bg-gradient-to-r from-transparent to-gold/70" />
            <p className="text-gold text-[10px] sm:text-xs uppercase tracking-luxe text-center">
              Wholesale Bridal &amp; Fashion Jewellery · Since 1982
            </p>
            <span className="hidden sm:block h-px w-20 bg-gradient-to-l from-transparent to-gold/70" />
          </div>

          {/* the gilded frame */}
          <div className="relative">
            {/* halo */}
            <div className="absolute -inset-5 sm:-inset-8 rounded-[3rem] bg-gold/15 blur-3xl pointer-events-none" />

            {/* gradient gold border */}
            <div className="relative rounded-[1.7rem] p-[2px] bg-gradient-to-br from-gold-light via-gold to-gold-dark shadow-[0_35px_90px_rgba(0,0,0,0.6)]">
              <div className="relative rounded-[calc(1.7rem-2px)] overflow-hidden bg-black">

                {/* inner hairline frame */}
                <div className="absolute inset-2.5 sm:inset-4 rounded-[1.2rem] border border-gold/35 z-20 pointer-events-none" />
                <Corner pos="tl" /><Corner pos="tr" /><Corner pos="bl" /><Corner pos="br" />

                {/* the film */}
                <video
                  src="/model-hero.mp4"
                  poster="/model-hero-poster.jpg"
                  autoPlay muted loop playsInline preload="metadata"
                  className="w-full h-[72vh] min-h-[430px] sm:h-auto sm:min-h-0 sm:aspect-[16/9] object-cover kenburns"
                />

                {/* legibility veil */}
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-ink via-ink/20 to-ink/5" />
                <div className="absolute inset-0 z-10 bg-gradient-to-r from-ink/30 via-transparent to-ink/30" />

                {/* overlaid statement */}
                <div className="absolute inset-x-0 bottom-0 z-20 px-5 pb-10 sm:px-12 sm:pb-14 text-center">
                  <h1 className="font-serif text-4xl sm:text-6xl xl:text-7xl leading-[1.05] drop-shadow-[0_2px_14px_rgba(0,0,0,0.7)]">
                    Jewellery that makes<br className="hidden sm:block" /> an <span className="text-gold">entrance</span>.
                  </h1>
                  <p className="mt-4 text-ivory/85 text-sm sm:text-lg max-w-2xl mx-auto drop-shadow">
                    Four decades of craftsmanship from Rui Mandi, Sadar Bazar — bridal sets, Polki &amp; Kundan
                    and fashion jewellery, supplied in bulk to retailers and exporters worldwide.
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3 justify-center">
                    <Link href="#collection"
                          className="rounded-full bg-gold text-ink px-8 py-3.5 font-medium text-sm hover:bg-gold-light transition shadow-[0_8px_28px_rgba(197,161,80,0.4)]">
                      Explore the Collection
                    </Link>
                    <a href={waHref} target="_blank" rel="noreferrer"
                       className="rounded-full border border-gold/60 bg-ink/40 backdrop-blur text-gold px-8 py-3.5 font-medium text-sm hover:bg-ink/60 transition">
                      Enquire on WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* heritage stats under the frame */}
          <div className="mt-10 sm:mt-12 grid grid-cols-3 gap-4 max-w-2xl mx-auto text-center">
            {[
              ["1982", "Established"],
              ["Worldwide", "Export & Shipping"],
              ["Bulk · MOQ", "Wholesale Orders"]
            ].map(([big, small]) => (
              <div key={small}>
                <div className="font-serif text-2xl sm:text-3xl text-gold">{big}</div>
                <div className="mt-1 text-[10px] sm:text-[11px] uppercase tracking-luxe text-ivory/55">{small}</div>
              </div>
            ))}
          </div>
        </div>

        {/* gold rule at section base */}
        <div className="gold-rule" />
      </section>

      {/* ── TRUST STRIP ──────────────────────────────────────────── */}
      <section className="border-b border-gold/15 bg-ivory">
        <div className="max-w-6xl mx-auto px-4 py-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm text-center text-ink/80">
          <div><b className="text-ink">Est. 1982</b> · family-run</div>
          <div><b className="text-ink">Rui Mandi</b> · Sadar Bazar, Delhi</div>
          <div><b className="text-ink">Worldwide</b> export &amp; shipping</div>
          <div><b className="text-ink">Bulk orders</b> &amp; video-call shopping</div>
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-16 sm:py-20">
        <div className="text-center">
          <p className="text-gold-dark text-xs uppercase tracking-luxe">What we craft</p>
          <h2 className="font-serif text-3xl sm:text-4xl mt-2">Shop by Category</h2>
          <Ornament tone="light" />
        </div>
        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((c, i) => {
            const active = activeCat === c.name;
            return (
              <Link key={c.name} href={`/?cat=${encodeURIComponent(c.name)}#collection`}
                    className={`group relative rounded-3xl overflow-hidden aspect-[4/5] flex flex-col justify-end transition ${active ? "ring-2 ring-gold" : "ring-1 ring-gold/20 hover:ring-gold"}`}>
                {c.img ? (
                  <Image src={c.img} alt={c.name} fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover group-hover:scale-105 transition duration-700" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-ink to-wine-dark" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />
                <span className="absolute top-3 left-4 font-serif text-gold/70 text-sm tracking-widest">0{i + 1}</span>
                <div className="relative p-4 sm:p-5">
                  <h3 className="font-serif text-lg sm:text-xl text-ivory leading-tight">{c.name}</h3>
                  <p className="text-xs text-ivory/70 mt-0.5">{c.note}</p>
                  <span className="mt-2 inline-block text-[11px] uppercase tracking-wide text-gold">{active ? "Viewing →" : "View →"}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── COLLECTION GRID ──────────────────────────────────────── */}
      <section id="collection" className="max-w-6xl mx-auto px-4 pb-16 sm:pb-20">
        <div className="text-center mb-10">
          <p className="text-gold-dark text-xs uppercase tracking-luxe">{activeCat ? "Category" : "Latest pieces"}</p>
          <h2 className="font-serif text-3xl sm:text-4xl mt-2">{activeCat || "From Our Atelier"}</h2>
          <Ornament tone="light" />
          <p className="text-muted text-sm mt-4 max-w-xl mx-auto">
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

      {/* ── EDITORIAL — STORE GALLERY (with counter reel) ────────── */}
      <section className="bg-ink text-ivory">
        <div className="max-w-6xl mx-auto px-4 py-16 sm:py-20">
          <div className="text-center">
            <p className="text-gold text-xs uppercase tracking-luxe">From our counter</p>
            <h2 className="font-serif text-3xl sm:text-4xl mt-2">Straight from our Rui Mandi store</h2>
            <Ornament />
            <p className="text-ivory/60 text-sm mt-4 max-w-xl mx-auto">A glimpse of the trays our buyers choose from — earrings, bracelets, chains and more, restocked constantly.</p>
          </div>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-gold/20">
              <Image src="/products/store-1.jpg" alt="Bhagwan Jewellers store display" fill sizes="(min-width:640px) 33vw, 100vw" className="object-cover hover:scale-105 transition duration-700" />
            </div>
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-gold/40 shadow-[0_15px_45px_rgba(197,161,80,0.15)]">
              <video src="/hero-reel-web.mp4" poster="/hero-reel-poster.jpg" autoPlay muted loop playsInline preload="metadata"
                     className="w-full h-full object-cover" />
              <span className="absolute bottom-3 inset-x-0 text-center text-[10px] uppercase tracking-luxe text-ivory/80 drop-shadow">Heritage Elegance · latest collection</span>
            </div>
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-gold/20">
              <Image src="/products/store-2.jpg" alt="Bhagwan Jewellers store display" fill sizes="(min-width:640px) 33vw, 100vw" className="object-cover hover:scale-105 transition duration-700" />
            </div>
          </div>
        </div>
      </section>

      {/* ── HERITAGE STORY ───────────────────────────────────────── */}
      <section className="bg-ivory-soft border-y border-gold/15">
        <div className="max-w-3xl mx-auto px-4 py-16 sm:py-20 text-center">
          <p className="text-gold-dark text-xs uppercase tracking-luxe">Our Story</p>
          <h2 className="font-serif text-3xl sm:text-4xl mt-2">Four decades on Rui Mandi</h2>
          <Ornament tone="light" />
          <p className="text-ink/75 mt-6 leading-relaxed">
            Since 1982, Bhagwan Jewellers has crafted and supplied jewellery from the heart of Sadar Bazar, Delhi —
            now run by the second and third generation of the Gulati family. From bridal Polki sets to the latest
            Korean hair accessories, our pieces reach retailers, resellers and exporters across India and the world.
            Every order is backed by hands-on craftsmanship and decades of trust.
          </p>
        </div>
      </section>

      {/* ── ENQUIRY BAND ─────────────────────────────────────────── */}
      <section className="relative bg-ink text-ivory overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.14]"
             style={{ backgroundImage: "radial-gradient(circle at 80% 20%, #C5A150 0, transparent 45%)" }} />
        <div className="relative max-w-4xl mx-auto px-4 py-16 sm:py-20 text-center">
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
