"use client";
import { usePathname } from "next/navigation";

export function StoreChrome({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  if (path && path.startsWith("/admin")) return null;
  return <>{children}</>;
}
