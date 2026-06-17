import Link from "next/link";
import { Search } from "lucide-react";

const WA = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919654353586").replace(/\D/g, "");
const waHref = `https://wa.me/${WA}?text=${encodeURIComponent("Hello Bhagwan Jewellers, I would like to enquire about your collection.")}`;

const categories = [
  { label: "Bridal", href: "/#collection" },
  { label: "Polki & Kundan", href: "/#collection" },
  { label: "Korean Accessories", href: "/#collection" },
  { label: "Fashion", href: "/#collection" }
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-ivory/90 backdrop-blur border-b border-gold/20">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Monogram + wordmark */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <span className="grid place-items-center w-10 h-10 rounded-full border border-gold text-gold font-serif font-semibold text-lg leading-none">BJ</span>
          <span className="leading-tight">
            <span className="block font-serif text-lg sm:text-xl text-ink tracking-wide">Bhagwan Jewellers</span>
            <span className="block text-[9px] uppercase tracking-luxe text-gold-dark">Since 1982 · Delhi</span>
          </span>
        </Link>

        {/* Category nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-ink/80">
          {categories.map(c => (
            <Link key={c.label} href={c.href} className="hover:text-gold-dark transition">{c.label}</Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gold/20 w-56">
            <Search className="w-4 h-4 text-muted" />
            <input className="bg-transparent text-sm w-full" placeholder="Search the collection…" />
          </div>
          <a href="/admin" className="text-xs sm:text-sm text-ink/55 hover:text-gold-dark transition whitespace-nowrap">Admin</a>
          <a href={waHref} target="_blank" rel="noreferrer"
             className="inline-flex items-center rounded-full bg-ink text-gold-light px-4 py-2 text-sm font-medium hover:bg-ink-soft transition whitespace-nowrap">
            Enquire
          </a>
        </div>
      </div>
    </header>
  );
}
