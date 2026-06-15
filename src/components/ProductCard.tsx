import Link from "next/link";
import Image from "next/image";
import { inr, percentOff } from "@/lib/format";

type Props = {
  slug: string;
  title: string;
  tagline?: string | null;
  price: number;
  compareAt?: number | null;
  imagesJson: string;
  rating: number;
  reviewCount: number;
  soldCount: number;
};

export function ProductCard(p: Props) {
  const images: string[] = safeImages(p.imagesJson);
  const off = percentOff(p.price, p.compareAt);

  return (
    <Link href={`/product/${p.slug}`} className="group block bg-white rounded-2xl border border-gold/15 overflow-hidden hover:border-gold hover:shadow-[0_12px_30px_rgba(20,17,14,0.08)] transition">
      <div className="relative aspect-square bg-ivory-soft overflow-hidden">
        {images[0] && (
          <Image
            src={images[0]}
            alt={p.title}
            fill
            sizes="(min-width: 768px) 25vw, 50vw"
            className="object-cover group-hover:scale-105 transition duration-700"
          />
        )}
        {p.soldCount > 500 && (
          <div className="absolute top-2 right-2 bg-ink/90 text-gold text-[10px] tracking-wide px-2 py-1 rounded-full">
            Bestseller
          </div>
        )}
        {off > 0 && (
          <div className="absolute top-2 left-2 bg-wine text-ivory text-[10px] font-medium px-2 py-1 rounded-full">
            {off}% off
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-serif text-base leading-snug text-ink line-clamp-2 min-h-[2.6rem]">{p.title}</h3>
        {p.tagline && <p className="text-xs text-muted mt-1 line-clamp-1">{p.tagline}</p>}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-gold-dark font-semibold">{inr(p.price)}</span>
          {p.compareAt && p.compareAt > p.price && (
            <span className="text-xs text-muted line-through">{inr(p.compareAt)}</span>
          )}
        </div>
        <span className="mt-2 inline-block text-[11px] uppercase tracking-wide text-ink/50 group-hover:text-gold-dark transition">Enquire for bulk →</span>
      </div>
    </Link>
  );
}

function safeImages(json: string): string[] {
  try { const v = JSON.parse(json); return Array.isArray(v) ? v : []; } catch { return []; }
}
