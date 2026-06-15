import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdmin } from "@/lib/auth";
import { generateHooks } from "@/lib/content/hooks";

/** One-click import a TrendingProduct → Product (draft, unpublished). */
export async function POST(req: NextRequest) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await req.json();
  const tp = await db.trendingProduct.findUnique({ where: { id } });
  if (!tp) return NextResponse.json({ error: "not found" }, { status: 404 });

  const slug = baseSlug(tp.title);
  const existing = await db.product.findUnique({ where: { slug } });
  if (existing) return NextResponse.json({ error: "slug exists", productId: existing.id }, { status: 409 });

  const product = await db.product.create({
    data: {
      slug,
      title: tp.title,
      tagline: null,
      description: `Imported from ${tp.source}. Edit me before publishing.`,
      bullets: JSON.stringify(["Benefit 1 — edit me", "Benefit 2 — edit me", "Benefit 3 — edit me"]),
      price: tp.priceTarget ?? 79900,
      compareAt: tp.priceTarget ? Math.round(tp.priceTarget * 1.8) : null,
      costPrice: tp.priceSource ?? null,
      imagesJson: JSON.stringify(tp.imageUrl ? [tp.imageUrl] : []),
      videoUrl: tp.videoUrl ?? null,
      category: tp.category ?? null,
      tags: "viral,imported",
      isPublished: false,
      isHero: false,
      stock: 50,
      trendScore: tp.score,
      sourceUrl: tp.url ?? null
    }
  });

  // Auto-generate 6 content hooks for this product
  const hooks = generateHooks(tp.title, 6);
  for (const h of hooks) {
    await db.contentIdea.create({
      data: { productId: product.id, title: h, hook: h, script: "", format: "YT_SHORT", status: "IDEA" }
    });
  }

  // Mark trending row as imported
  await db.trendingProduct.update({ where: { id: tp.id }, data: { status: "IMPORTED" } });

  return NextResponse.json({ ok: true, productId: product.id });
}

function baseSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
}
