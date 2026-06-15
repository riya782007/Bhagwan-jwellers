import Link from "next/link";
import Image from "next/image";
import { inr, percentOff } from "@/lib/format";
import { Star } from "lucide-react";

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
    <Link href={`/product/${p.slug}`} className="group block bg-white rounded-2xl border border-black/5 overflow-hidden hover:shadow-lg transition">
      <div className="relative aspect-square bg-muted-soft overflow-hidden">
        {images[0] && (
          <Image
            src={images[0]}
            alt={p.title}
            fill
            sizes="(min-width: 768px) 25vw, 50vw"
            className="object-cover group-hover:scale-105 transition duration-500"
          />
        )}
        {off > 0 && (
          <div className="absolute top-2 left-2 bg-brand text-white text-[10px] font-bold px-2 py-1 rounded-full">
            {off}% OFF
          </div>
        )}
        {p.soldCount > 500 && (
          <div className="absolute top-2 right-2 bg-ink text-white text-[10px] px-2 py-1 rounded-full">
            🔥 Bestseller
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm leading-snug line-clamp-2 min-h-[2.5rem]">{p.title}</h3>
        {p.tagline && <p className="text-xs text-muted mt-1 line-clamp-1">{p.tagline}</p>}
        <div className="flex items-center gap-1 mt-2 text-xs text-muted">
          <Star className="w-3 h-3 fill-accent text-accent" />
          <span className="font-medium text-ink">{p.rating.toFixed(1)}</span>
          <span>({p.reviewCount})</span>
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-bold">{inr(p.price)}</span>
          {p.compareAt && p.compareAt > p.price && (
            <span className="text-xs text-muted line-through">{inr(p.compareAt)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

function safeImages(json: string): string[] {
  try { const v = JSON.parse(json); return Array.isArray(v) ? v : []; } catch { return []; }
}
