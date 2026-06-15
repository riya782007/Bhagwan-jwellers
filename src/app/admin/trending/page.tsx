import { db } from "@/lib/db";
import { TrendingClient } from "./client";

export const dynamic = "force-dynamic";

export default async function TrendingAdminPage() {
  const items = await db.trendingProduct.findMany({
    orderBy: [{ status: "asc" }, { score: "desc" }],
    take: 80
  });
  return <TrendingClient initial={items.map(i => ({
    id: i.id, source: i.source, title: i.title, url: i.url, imageUrl: i.imageUrl,
    priceTarget: i.priceTarget, score: i.score, status: i.status, supplierFound: i.supplierFound, category: i.category
  }))} />;
}
