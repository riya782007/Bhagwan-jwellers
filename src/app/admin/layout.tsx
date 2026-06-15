import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { ReactNode } from "react";
import { headers } from "next/headers";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const path = headers().get("x-pathname") || "";
  const isLogin = path.includes("/admin/login");

  if (!isLogin) {
    const admin = await getAdmin();
    if (!admin) redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-muted-soft">
      {!isLogin && <AdminNav />}
      <div className="max-w-6xl mx-auto px-4 py-6">{children}</div>
    </div>
  );
}

function AdminNav() {
  const links = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/trending", label: "Trending 🔥" },
    { href: "/admin/suppliers", label: "Suppliers" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/reviews", label: "Reviews" },
    { href: "/admin/content", label: "Content Studio" }
  ];
  return (
    <nav className="bg-white border-b border-black/5">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/admin" className="font-black">NewVora <span className="text-brand">HQ</span></Link>
        <div className="hidden sm:flex items-center gap-1 text-sm">
          {links.map(l => <Link key={l.href} href={l.href} className="px-3 py-1.5 rounded-full hover:bg-muted-soft">{l.label}</Link>)}
        </div>
        <form action="/api/admin/logout" method="POST">
          <button className="text-xs text-muted hover:text-brand">Logout</button>
        </form>
      </div>
    </nav>
  );
}
