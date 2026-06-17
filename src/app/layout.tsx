import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { StoreChrome } from "@/components/StoreChrome";

const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-cormorant", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Bhagwan Jewellers";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bhagwanjewellers.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${siteName} — Wholesale Bridal & Fashion Jewellery, Sadar Bazar (Since 1982)`, template: `%s · ${siteName}` },
  description: "Bhagwan Jewellers — wholesale manufacturers & exporters of handcrafted bridal jewellery, Polki & Kundan, Korean hair accessories and fashion jewellery. Rui Mandi, Sadar Bazar, Delhi. Serving buyers worldwide since 1982.",
  keywords: ["wholesale artificial jewellery Delhi", "bridal jewellery wholesale Sadar Bazar", "Polki Kundan wholesale", "Korean hair accessories wholesale India", "imitation jewellery exporter Delhi"],
  openGraph: { type: "website", siteName, url: siteUrl, title: `${siteName} — Wholesale Bridal & Fashion Jewellery since 1982` }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <body>
        <StoreChrome><AnnouncementBar /><Navbar /></StoreChrome>
        <main className="min-h-[60vh]">{children}</main>
        <StoreChrome><Footer /><WhatsAppButton /></StoreChrome>
      </body>
    </html>
  );
}
