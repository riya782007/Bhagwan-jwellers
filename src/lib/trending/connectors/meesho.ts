import type { Connector, TrendingCandidate } from "../types";

/**
 * Meesho trending — proxies via an Apify actor or a managed scraper.
 * Demo set used until a token is configured.
 */
const DEMO: TrendingCandidate[] = [
  {
    source: "meesho",
    externalId: "msh-3001",
    title: "Reusable Silicone Food Storage Bags (Pack of 6)",
    imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800",
    priceSource: 14000, priceTarget: 39900, category: "Kitchen",
    signals: { trendVelocity: 0.6, marginPotent: 0.65, visualWow: 0.55, problemSolving: 0.7, impulse: 0.55, shipFriendly: 0.9, competitionIN: 0.55 }
  }
];

export const MeeshoConnector: Connector = {
  id: "meesho",
  async fetch() { return DEMO; }
};
