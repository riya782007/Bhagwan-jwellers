import { db } from "@/lib/db";
import { SuppliersClient } from "./client";

export const dynamic = "force-dynamic";

export default async function SuppliersAdmin({ searchParams }: { searchParams: { q?: string } }) {
  const all = await db.supplier.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
  return <SuppliersClient initial={all} initialQuery={searchParams.q ?? ""} />;
}
