import { db } from "@/lib/db";
import { inr } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function OrdersAdmin() {
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { customer: true, items: true }
  });

  return (
    <div className="space-y-4">
      <h1 className="font-black text-2xl">Orders</h1>
      <div className="bg-white rounded-2xl border border-black/5 overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-muted-soft text-left text-xs uppercase">
            <tr><th className="p-3">#</th><th>Customer</th><th>Items</th><th>Total</th><th>Method</th><th>Status</th><th>Created</th></tr>
          </thead>
          <tbody>
            {orders.length === 0 && <tr><td colSpan={7} className="p-6 text-muted text-center">No orders yet — go shoot your first short.</td></tr>}
            {orders.map(o => (
              <tr key={o.id} className="border-t border-black/5">
                <td className="p-3 font-medium"><a href={`/order/${o.id}`} target="_blank" className="text-brand">{o.number}</a></td>
                <td>{o.customer.name}<br/><span className="text-xs text-muted">{o.customer.phone}</span></td>
                <td className="text-xs">{o.items.map(i => `${i.title} ×${i.quantity}`).join(", ")}</td>
                <td>{inr(o.total)}</td>
                <td>{o.paymentMethod}</td>
                <td><span className={`text-xs px-2 py-0.5 rounded-full ${o.status === "PAID" || o.status === "DELIVERED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{o.status}</span></td>
                <td className="text-xs text-muted">{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
