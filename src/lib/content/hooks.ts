/**
 * Hook & script generator for YouTube Shorts / Instagram Reels.
 *
 * No LLM dependency required — uses templated, battle-tested hook patterns.
 * If you wire an LLM later, swap `generateHooks` to a model call.
 */

const HOOK_TEMPLATES = [
  (p: string) => `Stop buying [normal version of ${p}]. This is 10x better.`,
  (p: string) => `Your mom doesn't know ${p} like this exists.`,
  (p: string) => `I found this for ₹X and it changed how I [use ${p}].`,
  (p: string) => `POV: you discover the laziest ${p} ever made.`,
  (p: string) => `₹299 vs ₹2,999 — guess which ${p} I bought?`,
  (p: string) => `This ${p} shouldn't be legal.`,
  (p: string) => `Tag someone who needs this ${p} RIGHT NOW.`,
  (p: string) => `If you scroll past this ${p}, you'll regret it.`,
  (p: string) => `Wait till you see what this ${p} does at 0:15.`,
  (p: string) => `3 things you can do with this ${p} you didn't know.`,
  (p: string) => `Indian household hack — ${p} edition.`,
  (p: string) => `Why is no one talking about this ${p}?`,
  (p: string) => `Plot twist: this ${p} costs less than your chai.`
];

export function generateHooks(productTitle: string, count = 8): string[] {
  // Reduce title to its core noun phrase ("Self-Stirring Mug" → "self-stirring mug")
  const noun = productTitle.replace(/\b(the|a|an|new|pro|smart|premium)\b/gi, "").trim().toLowerCase();
  const shuffled = [...HOOK_TEMPLATES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(t => t(noun));
}

export function generateScript(args: { title: string; benefits: string[]; price: number; ctaUrl?: string }) {
  const hook = generateHooks(args.title, 1)[0];
  const b = args.benefits;
  const price = `₹${Math.round(args.price / 100)}`;
  return [
    `[0–3s HOOK on camera, eye contact]`,
    `${hook}`,
    ``,
    `[3–8s — show product, big visual]`,
    `Look at this. ${b[0] ?? "It's a game-changer."}`,
    ``,
    `[8–18s — show 2 angles + use it once]`,
    `${b[1] ?? "Watch this."} … ${b[2] ?? "I had to keep one for myself."}`,
    ``,
    `[18–25s — price + scarcity]`,
    `Only ${price}. Cash on delivery. Link in bio — but only the first 50 today.`,
    ``,
    `[25–30s — CTA]`,
    `Tag someone who needs this. ${args.ctaUrl ?? "newvora.in"}.`
  ].join("\n");
}
