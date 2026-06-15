import { db } from "@/lib/db";
import { ContentClient } from "./client";

export const dynamic = "force-dynamic";

export default async function ContentStudio({ searchParams }: { searchParams: { productId?: string } }) {
  const products = await db.product.findMany({ where: { isPublished: true }, orderBy: { soldCount: "desc" } });
  const initialId = searchParams.productId ?? products[0]?.id ?? null;
  const initial = initialId ? await db.product.findUnique({ where: { id: initialId } }) : null;
  return <ContentClient products={products} initial={initial ? JSON.parse(JSON.stringify(initial)) : null} />;
}
