import { db } from "@/lib/db";
import { ProductsTable } from "./table";

export const dynamic = "force-dynamic";

export default async function ProductsAdmin() {
  const products = await db.product.findMany({
    orderBy: [{ isPublished: "desc" }, { isHero: "desc" }, { createdAt: "desc" }]
  });
  return <ProductsTable products={JSON.parse(JSON.stringify(products))} />;
}
