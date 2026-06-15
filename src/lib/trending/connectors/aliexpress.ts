import type { Connector, TrendingCandidate } from "../types";

/**
 * AliExpress trending connector.
 *
 * Two strategies:
 *  1) If APIFY_TOKEN is set, call an Apify actor (e.g. "epctex/aliexpress-scraper")
 *     against AliExpress "Choice / Hot" listings and parse the response.
 *  2) Otherwise, returns a curated, hand-tuned set of demonstrative candidates so
 *     the admin trending tab is never empty during local dev.
 *
 * Replace the demo set with a live actor call in production.
 */
const DEMO: TrendingCandidate[] = [
  {
    source: "aliexpress",
    externalId: "ae-1001",
    title: "Mini Portable Blender (USB-rechargeable, 380ml)",
    url: "https://www.aliexpress.com/",
    imageUrl: "https://images.unsplash.com/photo-1570696516188-ade861b84a49?w=800",
    priceSource: 32000, priceTarget: 99900, category: "Kitchen",
    signals: { trendVelocity: 0.85, marginPotent: 0.78, visualWow: 0.8, problemSolving: 0.6, impulse: 0.7, shipFriendly: 0.7, competitionIN: 0.55 }
  },
  {
    source: "aliexpress",
    externalId: "ae-1002",
    title: "LED Sunset Lamp Projector",
    url: "https://www.aliexpress.com/",
    imageUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800",
    priceSource: 22000, priceTarget: 79900, category: "Home",
    signals: { trendVelocity: 0.9, marginPotent: 0.82, visualWow: 0.95, problemSolving: 0.2, impulse: 0.9, shipFriendly: 0.75, competitionIN: 0.7 }
  },
  {
    source: "aliexpress",
    externalId: "ae-1003",
    title: "Posture Corrector Smart Brace",
    url: "https://www.aliexpress.com/",
    imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800",
    priceSource: 28000, priceTarget: 99900, category: "Health",
    signals: { trendVelocity: 0.7, marginPotent: 0.8, visualWow: 0.5, problemSolving: 0.95, impulse: 0.6, shipFriendly: 0.85, competitionIN: 0.4 }
  }
];

export const AliExpressConnector: Connector = {
  id: "aliexpress",
  async fetch() {
    const token = process.env.APIFY_TOKEN;
    if (!token) return DEMO;
    // TODO: live call:
    // const res = await fetch(`https://api.apify.com/v2/acts/epctex~aliexpress-scraper/run-sync-get-dataset-items?token=${token}`, {...})
    // map results into TrendingCandidate[].
    return DEMO;
  }
};
