import { NextRequest, NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 30;

const GROQ = process.env.GROQ_API_KEY;
const OPENAI = process.env.OPENAI_API_KEY;

const SYSTEM = `You are "vBrain", the voice admin assistant for Bhagwan Jewellers' website dashboard.
The owner speaks a command in Hindi / Hinglish / English. Pick the single best action.

You receive the current PRODUCTS as JSON (id, title, category, priceINR, stock, published).
Identify which product the owner means from their words. If unclear or no match, use tier "clarify".

ACTION TIERS:
- "safe"  -> executed instantly, no confirmation. Intents: "publish", "unpublish", "set_stock", "add_product", "open_editor", "navigate".
- "confirm" -> proposed, owner taps confirm before it runs. Intents: "set_price", "edit_field".
- "guide" -> NEVER executed. Only explain + send them to the right screen. Intents: "delete", "supplier" (suppliers, cost price, sourcing, supply chain), "billing".
- "clarify" -> ask one short question when the product or value is ambiguous.

ROUTES you may set: "/admin/add", "/admin/products/{id}", "/admin/products", "/admin/orders", "/admin/reviews".
- add_product -> route "/admin/add".
- open_editor / delete / edit_field / supplier -> route "/admin/products/{id}" for the matched product.
- navigate -> the relevant route.

VALUES: set_stock value = number of pieces. set_price value = price in rupees (number). edit_field: also set "field" to "title" | "tagline" | "description" and "value" to the new text.

Output ONLY JSON:
{"intent":"...","productId":"<id|null>","productTitle":"<title|null>","value":<number|string|null>,"field":"<title|tagline|description|null>","route":"<path|null>","tier":"safe|confirm|guide|clarify","say":"<one short, warm line in the owner's language>"}`;

async function callLLM(endpoint: string, key: string, model: string, user: string) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model, temperature: 0.2, response_format: { type: "json_object" },
      messages: [{ role: "system", content: SYSTEM }, { role: "user", content: user }]
    })
  });
  if (!res.ok) throw new Error(`agent ${res.status}: ${await res.text()}`);
  const j = await res.json();
  return JSON.parse(j.choices[0].message.content);
}

async function runLLM(user: string) {
  if (GROQ) { try { return await callLLM("https://api.groq.com/openai/v1/chat/completions", GROQ, "llama-3.3-70b-versatile", user); } catch (e) { console.warn("Groq agent failed:", e); } }
  if (OPENAI) return await callLLM("https://api.openai.com/v1/chat/completions", OPENAI, "gpt-4o", user);
  throw new Error("No AI provider configured (GROQ_API_KEY or OPENAI_API_KEY).");
}

export async function POST(req: NextRequest) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const body = await req.json();

    // ---- Execute a confirmed action (whitelist only — never delete/supplier) ----
    if (body.execute) {
      const { intent, productId, value, field } = body.execute;
      if (!productId) return NextResponse.json({ error: "Missing product" }, { status: 400 });
      if (intent === "set_price") {
        await db.product.update({ where: { id: productId }, data: { price: Math.round(Number(value) * 100) } });
        return NextResponse.json({ ok: true, say: `Done — price set to ₹${Number(value).toLocaleString("en-IN")}.` });
      }
      if (intent === "set_stock") {
        await db.product.update({ where: { id: productId }, data: { stock: Math.round(Number(value)) } });
        return NextResponse.json({ ok: true, say: `Done — stock set to ${value}.` });
      }
      if (intent === "edit_field" && ["title", "tagline", "description"].includes(field)) {
        await db.product.update({ where: { id: productId }, data: { [field]: String(value) } });
        return NextResponse.json({ ok: true, say: `Done — ${field} updated.` });
      }
      return NextResponse.json({ error: "Action not permitted" }, { status: 400 });
    }

    // ---- Parse a spoken command ----
    const transcript = (body.transcript || "").trim();
    if (!transcript) return NextResponse.json({ error: "No command" }, { status: 400 });

    const products = await db.product.findMany({
      orderBy: { createdAt: "desc" }, take: 100,
      select: { id: true, title: true, category: true, price: true, stock: true, isPublished: true }
    });
    const list = products.map(p => ({ id: p.id, title: p.title, category: p.category, priceINR: Math.round(p.price / 100), stock: p.stock, published: p.isPublished }));

    const action = await runLLM(`PRODUCTS:\n${JSON.stringify(list)}\n\nOWNER SAID: "${transcript}"`);

    // ---- Auto-execute safe writes ----
    if (action?.tier === "safe" && action.productId) {
      try {
        if (action.intent === "publish") { await db.product.update({ where: { id: action.productId }, data: { isPublished: true } }); action.executed = true; }
        else if (action.intent === "unpublish") { await db.product.update({ where: { id: action.productId }, data: { isPublished: false } }); action.executed = true; }
        else if (action.intent === "set_stock" && action.value != null) { await db.product.update({ where: { id: action.productId }, data: { stock: Math.round(Number(action.value)) } }); action.executed = true; }
      } catch {
        action.tier = "guide"; action.say = "I couldn't complete that automatically — open it from Products and I'll guide you.";
      }
    }

    return NextResponse.json({ action, transcript });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Agent error" }, { status: 500 });
  }
}
