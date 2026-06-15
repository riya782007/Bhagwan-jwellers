import { db } from "../db";
import { searchIndiaMart, type IndiaMartSupplier } from "./indiamart";

/**
 * Tries to find an Indian supplier for a product title.
 * Strategy: simplify the title to 2–3 keywords, query IndiaMART, persist the best match.
 */
export async function findSupplierForTitle(title: string) {
  const query = simplify(title);
  const matches = await searchIndiaMart(query);
  if (!matches.length) return null;

  const best = pickBest(matches);
  const saved = await db.supplier.create({
    data: {
      source: "indiamart",
      name: best.name,
      contactName: best.contactName,
      phone: best.phone,
      whatsapp: best.whatsapp,
      city: best.city, state: best.state, country: "IN",
      gstNumber: best.gstNumber,
      url: best.url,
      productMatch: query,
      unitPrice: best.unitPrice,
      moq: best.moq,
      rating: best.rating
    }
  });
  return saved;
}

export async function listAllMatches(title: string): Promise<IndiaMartSupplier[]> {
  return searchIndiaMart(simplify(title));
}

function simplify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP.has(w))
    .slice(0, 4)
    .join(" ");
}

const STOP = new Set(["the","and","with","for","from","into","over","under","best","new","mini","pro","set","of","pack","kit","pcs"]);

function pickBest(items: IndiaMartSupplier[]): IndiaMartSupplier {
  // prefer: has phone > rating > lower unitPrice > lower MOQ
  return [...items].sort((a, b) => {
    const ph = (b.phone ? 1 : 0) - (a.phone ? 1 : 0);
    if (ph) return ph;
    const r = (b.rating ?? 0) - (a.rating ?? 0);
    if (r) return r;
    const p = (a.unitPrice ?? 9e9) - (b.unitPrice ?? 9e9);
    if (p) return p;
    return (a.moq ?? 9e9) - (b.moq ?? 9e9);
  })[0];
}
