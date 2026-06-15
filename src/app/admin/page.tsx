import { db } from "@/lib/db";
import { inr } from "@/lib/format";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [orders, products, trendingHot, recentOrders] = await Promise.all([
    db.order.aggregate({ _sum: { total: true }, _count: { _all: true } }),
    db.product.count({ where: { isPublished: true } }),
    db.trendingProduct.findMany({ where: { status: "NEW" }, orderBy: { score: "desc" }, take: 6 }),
    db.order.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { customer: true } })
  ]);

  return (
    <div className="space-y-6">
      <h1 className="font-black text-2xl">Dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Total revenue" value={inr(orders._sum.total ?? 0)} />
        <Stat label="Total orders" value={String(orders._count._all)} />
        <Stat label="Live products" value={String(products)} />
        <Stat label="Trending unimported" value={String(trendingHot.length)} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="🔥 Top trending — ready to import" cta={{ href: "/admin/trending", label: "See all →" }}>
          <ul className="text-sm divide-y">
            {trendingHot.length === 0 && <li className="text-muted py-2">No new candidates. Run a scan from the Trending tab.</li>}
            {trendingHot.map(t => (
              <li key={t.id} className="py-2 flex items-center justify-between">
                <span className="line-clamp-1">{t.title}</span>
                <span className="text-xs font-bold text-brand">{Math.round(t.score)}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Recent orders" cta={{ href: "/admin/orders", label: "All orders →" }}>
          <ul className="text-sm divide-y">
            {recentOrders.length === 0 && <li className="text-muted py-2">No orders yet — ship the first short!</li>}
            {recentOrders.map(o => (
              <li key={o.id} className="py-2 flex items-center justify-between">
                <span><b>{o.number}</b> · {o.customer.name} · {o.status}</span>
                <span>{inr(o.total)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="Quick actions">
        <div className="flex flex-wrap gap-2 text-sm">
          <Link href="/admin/trending" className="bg-ink text-white rounded-full px-4 py-2">Run trending scan</Link>
          <Link href="/admin/products" className="border rounded-full px-4 py-2">Manage products</Link>
          <Link href="/admin/content" className="border rounded-full px-4 py-2">Generate hooks</Link>
          <Link href="/admin/suppliers" className="border rounded-full px-4 py-2">Find suppliers</Link>
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-black/5">
      <div className="text-xs text-muted">{label}</div>
      <div className="font-black text-xl mt-1">{value}</div>
    </div>
  );
}

function Card({ title, children, cta }: { title: string; children: React.ReactNode; cta?: { href: string; label: string } }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-black/5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold">{title}</h2>
        {cta && <Link href={cta.href} className="text-xs text-brand">{cta.label}</Link>}
      </div>
      {children}
    </div>
  );
}
