import type { Connector, TrendingCandidate } from "../types";

/**
 * Google Trends India connector — uses the public "rising searches" daily RSS:
 *   https://trends.google.com/trending/rss?geo=IN
 *
 * We parse query titles, filter for product-shaped phrases ("buy", "review",
 * weight nouns like 'projector', 'mug', 'corrector'), and emit candidates
 * whose signals are estimated heuristically.
 */

const PRODUCT_KEYWORDS = ["buy","review","price","online","best","amazon","gadget","gift","under","near me"];

export const GoogleTrendsConnector: Connector = {
  id: "google_trends",
  async fetch(): Promise<TrendingCandidate[]> {
    try {
      const res = await fetch("https://trends.google.com/trending/rss?geo=IN", {
        next: { revalidate: 3600 },
        headers: { "User-Agent": "Mozilla/5.0 NewVoraTrendBot/1.0" }
      });
      if (!res.ok) return [];
      const xml = await res.text();
      const titles = Array.from(xml.matchAll(/<title>([^<]+)<\/title>/g)).map(m => m[1]).slice(2, 30);
      const productish = titles.filter(t => PRODUCT_KEYWORDS.some(k => t.toLowerCase().includes(k)));
      return productish.slice(0, 10).map((t, i) => ({
        source: "google_trends" as const,
        externalId: `gt-${Date.now()}-${i}`,
        title: t,
        url: `https://www.google.com/search?q=${encodeURIComponent(t)}`,
        priceTarget: 79900,
        signals: { trendVelocity: 0.8, marginPotent: 0.5, visualWow: 0.5, problemSolving: 0.4, impulse: 0.5, shipFriendly: 0.6, competitionIN: 0.5 }
      }));
    } catch {
      return [];
    }
  }
};
