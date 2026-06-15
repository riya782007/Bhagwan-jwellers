import type { Connector, TrendingCandidate } from "../types";

/**
 * Amazon India "Movers & Shakers" connector.
 *
 * Public page: https://www.amazon.in/gp/movers-and-shakers
 * Strategy: fetch the page HTML, parse the rank-velocity list (top 100 climbers in 24h).
 * In production: use SerpAPI or a managed scraper to dodge anti-bot. For now we ship a
 * curated demo set so the engine is end-to-end runnable.
 */
const DEMO: TrendingCandidate[] = [
  {
    source: "amazon_in",
    externalId: "az-2001",
    title: "Self-Stirring Mug (350ml)",
    url: "https://www.amazon.in/",
    imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800",
    priceSource: 28000, priceTarget: 79900, category: "Kitchen",
    signals: { trendVelocity: 0.78, marginPotent: 0.72, visualWow: 0.85, problemSolving: 0.4, impulse: 0.8, shipFriendly: 0.9, competitionIN: 0.6 }
  },
  {
    source: "amazon_in",
    externalId: "az-2002",
    title: "Magnetic Spice Rack (Set of 12)",
    url: "https://www.amazon.in/",
    imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
    priceSource: 34000, priceTarget: 89900, category: "Kitchen",
    signals: { trendVelocity: 0.65, marginPotent: 0.65, visualWow: 0.85, problemSolving: 0.5, impulse: 0.7, shipFriendly: 0.6, competitionIN: 0.5 }
  }
];

export const AmazonInConnector: Connector = {
  id: "amazon_in",
  async fetch() {
    return DEMO;
  }
};
