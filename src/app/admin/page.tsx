import { db } from "@/lib/db";
import Link from "next/link";
import { VoiceButton } from "@/components/VoiceButton";
import { Camera, Boxes, Eye, FileEdit, Inbox, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const [live, drafts, total, leads] = await Promise.all([
    db.product.count({ where: { isPublished: true } }),
    db.product.count({ where: { isPublished: false } }),
    db.product.count(),
    db.lead.count()
  ]);

  const stats = [
    { label: "Live on site", value: live, icon: <Eye className="w-5 h-5" /> },
    { label: "Drafts", value: drafts, icon: <FileEdit className="w-5 h-5" /> },
    { label: "Total pieces", value: total, icon: <Boxes className="w-5 h-5" /> },
    { label: "Enquiries", value: leads, icon: <Inbox className="w-5 h-5" /> }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-ink">Your store</h1>
        <p className="text-muted text-sm mt-1">Run everything by voice — or do it yourself below.</p>
      </div>

      {/* HERO: voice + add */}
      <div className="grid lg:grid-cols-2 gap-5">
        <VoiceButton />
        <Link href="/admin/add" className="group relative overflow-hidden rounded-3xl bg-white border border-gold/30 p-8 transition hover:shadow-2xl hover:border-gold">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gold/10 group-hover:bg-gold/20 transition" />
          <div className="relative flex items-center gap-5">
            <span className="grid place-items-center w-20 h-20 rounded-full border-2 border-gold text-gold-dark group-hover:scale-110 transition">
              <Camera className="w-9 h-9" />
            </span>
            <div>
              <div className="text-gold-dark text-xs uppercase tracking-luxe">Add a piece</div>
              <div className="font-serif text-2xl sm:text-3xl mt-1 text-ink">Photo + voice</div>
              <div className="text-muted text-sm mt-1">Snap a photo, speak the details — the assistant writes the listing & picks the category.</div>
            </div>
          </div>
        </Link>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-black/5 p-5">
            <div className="flex items-center justify-between text-gold-dark">
              <span className="text-xs uppercase tracking-wide text-muted">{s.label}</span>
              {s.icon}
            </div>
            <div className="font-serif text-3xl text-ink mt-2">{s.value}</div>
          </div>
        ))}
      </div>

      {/* MANAGE */}
      <div className="bg-white rounded-2xl border border-black/5 p-5">
        <div className="font-semibold text-sm mb-3">Manage manually</div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/products" className="inline-flex items-center gap-1.5 bg-ink text-gold-light rounded-full px-4 py-2 text-sm font-medium">Manage products <ArrowRight className="w-4 h-4" /></Link>
          <Link href="/admin/add" className="inline-flex items-center gap-1.5 border border-black/15 rounded-full px-4 py-2 text-sm">Add a piece</Link>
          <Link href="/admin/orders" className="inline-flex items-center gap-1.5 border border-black/15 rounded-full px-4 py-2 text-sm">Orders</Link>
          <Link href="/admin/reviews" className="inline-flex items-center gap-1.5 border border-black/15 rounded-full px-4 py-2 text-sm">Reviews</Link>
        </div>
      </div>
    </div>
  );
}
