import { db } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ReviewsAdmin() {
  const reviews = await db.review.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { product: true } });
  return (
    <div className="space-y-4">
      <h1 className="font-black text-2xl">Reviews</h1>
      <div className="bg-white rounded-2xl border border-black/5 overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-muted-soft text-left text-xs uppercase">
            <tr><th className="p-3">Product</th><th>Reviewer</th><th>★</th><th>Title</th><th>Body</th><th>Verified</th></tr>
          </thead>
          <tbody>
            {reviews.map(r => (
              <tr key={r.id} className="border-t border-black/5">
                <td className="p-3"><Link href={`/admin/products/${r.product.id}`} className="text-brand">{r.product.title}</Link></td>
                <td>{r.name}<br/><span className="text-xs text-muted">{r.city}</span></td>
                <td>{r.rating}</td>
                <td>{r.title}</td>
                <td className="text-xs text-muted line-clamp-2">{r.body}</td>
                <td className="text-xs">{r.isVerified ? "✓" : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
