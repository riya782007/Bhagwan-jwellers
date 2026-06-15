import type { Connector, TrendingCandidate } from "../types";

/**
 * YouTube connector — searches Shorts in product-discovery niches and turns
 * fast-rising videos into product candidates (you scrape the thumbnail product
 * and use the video as your hook reference).
 */

const NICHE_QUERIES = [
  "kitchen gadgets india", "home gadgets shorts", "amazon finds india",
  "must have products", "viral gadgets", "tiktok made me buy it"
];

export const YouTubeConnector: Connector = {
  id: "youtube",
  async fetch(): Promise<TrendingCandidate[]> {
    const key = process.env.YOUTUBE_API_KEY;
    if (!key) return [];
    const out: TrendingCandidate[] = [];
    for (const q of NICHE_QUERIES.slice(0, 3)) {
      try {
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoDuration=short&order=viewCount&maxResults=5&q=${encodeURIComponent(q)}&key=${key}`;
        const res = await fetch(url, { next: { revalidate: 3600 } });
        if (!res.ok) continue;
        const data: any = await res.json();
        for (const item of data.items ?? []) {
          out.push({
            source: "youtube",
            externalId: item.id?.videoId,
            title: item.snippet?.title ?? q,
            url: `https://youtube.com/watch?v=${item.id?.videoId}`,
            videoUrl: `https://youtube.com/watch?v=${item.id?.videoId}`,
            imageUrl: item.snippet?.thumbnails?.high?.url,
            signals: { trendVelocity: 0.75, marginPotent: 0.6, visualWow: 0.85, problemSolving: 0.4, impulse: 0.7, shipFriendly: 0.6, competitionIN: 0.55 }
          });
        }
      } catch { /* swallow */ }
    }
    return out;
  }
};
