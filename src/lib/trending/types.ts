export type TrendingCandidate = {
  source: "aliexpress" | "amazon_in" | "google_trends" | "meesho" | "youtube";
  externalId?: string;
  title: string;
  url?: string;
  imageUrl?: string;
  videoUrl?: string;
  priceSource?: number;     // paise — landed cost estimate
  priceTarget?: number;     // paise — recommended sell price
  category?: string;
  signals: {
    trendVelocity: number;
    marginPotent: number;
    visualWow: number;
    problemSolving: number;
    impulse: number;
    shipFriendly: number;
    competitionIN: number;
  };
  raw?: unknown;
};

export interface Connector {
  id: string;
  fetch(): Promise<TrendingCandidate[]>;
}
