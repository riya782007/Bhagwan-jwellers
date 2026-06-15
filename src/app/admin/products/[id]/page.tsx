import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ProductEditor } from "./editor";

export const dynamic = "force-dynamic";

export default async function EditProduct({ params }: { params: { id: string } }) {
  const product = await db.product.findUnique({ where: { id: params.id }, include: { reviews: true, supplier: true } });
  if (!product) notFound();
  return <ProductEditor product={JSON.parse(JSON.stringify(product))} />;
}
