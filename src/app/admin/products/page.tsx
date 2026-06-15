import { db } from "@/lib/db";
import Link from "next/link";
import { inr } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ProductsAdmin() {
  const products = await db.product.findMany({
    orderBy: [{ isPublished: "desc" }, { createdAt: "desc" }],
    include: { _count: { select: { reviews: true } } }
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-black text-2xl">Products</h1>
        <Link href="/admin/trending" className="bg-ink text-white rounded-full px-4 py-2 text-sm">Import from trending</Link>
      </div>
      <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted-soft text-left text-xs uppercase">
            <tr><th className="p-3">Title</th><th>Status</th><th>Price</th><th>Stock</th><th>Sold</th><th>★</th><th></th></tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-t border-black/5">
                <td className="p-3 font-medium line-clamp-1">{p.title}</td>
                <td>{p.isPublished ? <span className="text-green-700">live</span> : <span className="text-muted">draft</span>}{p.isHero ? " · hero" : ""}</td>
                <td>{inr(p.price)}</td>
                <td>{p.stock}</td>
                <td>{p.soldCount}</td>
                <td>{p.rating.toFixed(1)} ({p._count.reviews})</td>
                <td className="p-3"><Link href={`/admin/products/${p.id}`} className="text-brand">edit →</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
