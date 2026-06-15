import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { SocialProofToast } from "@/components/SocialProofToast";
import { ExitIntent } from "@/components/ExitIntent";
import { WhatsAppButton } from "@/components/WhatsAppButton";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "NewVora";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://newvora.in";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${siteName} — Things you didn't know you needed`, template: `%s · ${siteName}` },
  description: "Curated viral gadgets & lifestyle finds. Cash on Delivery. Ships in 24 hours.",
  openGraph: { type: "website", siteName, url: siteUrl }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AnnouncementBar />
        <Navbar />
        <main className="min-h-[60vh]">{children}</main>
        <Footer />
        <SocialProofToast />
        <ExitIntent />
        <WhatsAppButton />
      </body>
    </html>
  );
}
