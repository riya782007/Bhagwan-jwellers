import { db } from "../db";
import { computeScore } from "./score";
import type { Connector, TrendingCandidate } from "./types";
import { AliExpressConnector } from "./connectors/aliexpress";
import { AmazonInConnector } from "./connectors/amazon";
import { GoogleTrendsConnector } from "./connectors/googleTrends";
import { MeeshoConnector } from "./connectors/meesho";
import { YouTubeConnector } from "./connectors/youtube";
import { findSupplierForTitle } from "../suppliers";

const CONNECTORS: Connector[] = [
  AliExpressConnector,
  AmazonInConnector,
  GoogleTrendsConnector,
  MeeshoConnector,
  YouTubeConnector
];

/** One pass: fetch from every connector, score, upsert. */
export async function runTrendingScan() {
  const allCandidates: TrendingCandidate[] = [];

  for (const c of CONNECTORS) {
    try {
      const items = await c.fetch();
      allCandidates.push(...items);
      console.log(`[trending] ${c.id}: +${items.length}`);
    } catch (e) {
      console.error(`[trending] ${c.id} failed:`, e);
    }
  }

  let upserts = 0;
  for (const cand of allCandidates) {
    // Try to find an Indian supplier — bumps score significantly.
    const supplier = await findSupplierForTitle(cand.title).catch(() => null);
    const supplierFound = !!supplier;

    const score = computeScore({ ...cand.signals, supplierFound });

    const margin =
      cand.priceTarget && cand.priceSource
        ? Math.round(((cand.priceTarget - cand.priceSource) / cand.priceTarget) * 100) / 100
        : null;

    await db.trendingProduct.upsert({
      where: { id: idFor(cand) },
      update: {
        title: cand.title, url: cand.url, imageUrl: cand.imageUrl, videoUrl: cand.videoUrl,
        priceSource: cand.priceSource, priceTarget: cand.priceTarget,
        category: cand.category,
        trendVelocity: cand.signals.trendVelocity,
        marginPotent: margin ?? cand.signals.marginPotent,
        visualWow: cand.signals.visualWow,
        problemSolving: cand.signals.problemSolving,
        impulse: cand.signals.impulse,
        shipFriendly: cand.signals.shipFriendly,
        competitionIN: cand.signals.competitionIN,
        supplierFound,
        score,
        rawJson: JSON.stringify(cand.raw ?? {}),
        fetchedAt: new Date()
      },
      create: {
        id: idFor(cand),
        source: cand.source,
        externalId: cand.externalId,
        title: cand.title, url: cand.url, imageUrl: cand.imageUrl, videoUrl: cand.videoUrl,
        priceSource: cand.priceSource, priceTarget: cand.priceTarget,
        category: cand.category,
        trendVelocity: cand.signals.trendVelocity,
        marginPotent: margin ?? cand.signals.marginPotent,
        visualWow: cand.signals.visualWow,
        problemSolving: cand.signals.problemSolving,
        impulse: cand.signals.impulse,
        shipFriendly: cand.signals.shipFriendly,
        competitionIN: cand.signals.competitionIN,
        supplierFound,
        score,
        rawJson: JSON.stringify(cand.raw ?? {})
      }
    });
    upserts++;
  }
  return { fetched: allCandidates.length, upserts };
}

function idFor(c: TrendingCandidate) {
  return `${c.source}:${c.externalId ?? slug(c.title)}`;
}
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60);
