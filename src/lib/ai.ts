// AI pipeline for Bhagwan Jewellers: voice -> transcript -> structured product.
// Uses Groq (fast/cheap) for speech + text, OpenAI gpt-4o for vision. REST only.

const GROQ = process.env.GROQ_API_KEY;
const OPENAI = process.env.OPENAI_API_KEY;

export type GeneratedProduct = {
  title: string;
  tagline: string;
  description: string;
  bullets: string[];
  category: "Bridal Jewellery" | "Polki & Kundan" | "Korean Hair Accessories" | "Fashion Jewellery";
  material: string;
  colour: string;
  priceINR: number | null;
  moq: string;
  tags: string[];
  whatsappCaption: string;
};

// ---------- Speech to text ----------
function langCodeFor(language?: string): string | undefined {
  if (language === "hindi" || language === "hinglish") return "hi";
  if (language === "english") return "en";
  return undefined; // auto-detect
}

async function whisper(endpoint: string, key: string, model: string, file: File, langCode?: string): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("model", model);
  fd.append("response_format", "json");
  if (langCode) fd.append("language", langCode);
  const res = await fetch(endpoint, { method: "POST", headers: { Authorization: `Bearer ${key}` }, body: fd });
  if (!res.ok) throw new Error(`Transcription failed (${res.status}): ${await res.text()}`);
  const j = await res.json();
  return (j.text as string) || "";
}

export async function transcribeAudio(file: File, language?: string): Promise<string> {
  const code = langCodeFor(language);
  if (GROQ) {
    try { return await whisper("https://api.groq.com/openai/v1/audio/transcriptions", GROQ, "whisper-large-v3", file, code); }
    catch (e) { console.warn("Groq transcription failed, falling back:", e); }
  }
  if (OPENAI) return await whisper("https://api.openai.com/v1/audio/transcriptions", OPENAI, "whisper-1", file, code);
  throw new Error("No transcription provider configured (GROQ_API_KEY or OPENAI_API_KEY).");
}

// ---------- Structured product generation ----------
const SYSTEM = `You are the cataloguing assistant for Bhagwan Jewellers — a wholesale bridal & fashion jewellery house in Rui Mandi, Sadar Bazar, Delhi, established 1982. They serve retailers, resellers and exporters worldwide.

You are given a PRODUCT PHOTO and a short VOICE NOTE transcript (often Hindi / Hinglish) describing a jewellery piece. Produce one polished catalogue listing for global wholesale buyers.

RULES:
- Use the PHOTO to infer type, colour, stones, metal tone and style. Use the VOICE NOTE for price, MOQ, material and any specifics.
- Write the listing in clean, professional English (buyers are global), but keep Indian product terms where natural (Polki, Kundan, choker, jhumka, maang tikka, etc.).
- NEVER invent a price. If no price is clearly stated in the voice note, set "priceINR" to null.
- "category" MUST be exactly one of: "Bridal Jewellery", "Polki & Kundan", "Korean Hair Accessories", "Fashion Jewellery".
- "tagline" = one elegant line. "description" = 2-4 sentences. "bullets" = 3-5 short selling points (material, occasion, finish, etc.).
- "whatsappCaption" = a ready-to-send WhatsApp message a salesperson can forward to a buyer (include the piece, key detail, and a call to enquire for bulk). Keep it warm and short.
- Output ONLY a valid JSON object with EXACTLY these keys:
{"title":string,"tagline":string,"description":string,"bullets":string[],"category":string,"material":string,"colour":string,"priceINR":number|null,"moq":string,"tags":string[],"whatsappCaption":string}`;

export async function generateProduct(opts: { imageUrl?: string; transcript?: string }): Promise<GeneratedProduct> {
  const transcript = opts.transcript?.trim() || "(no voice note provided)";
  const userText = `Voice note transcript (may be Hindi/Hinglish): "${transcript}"\nProduce the catalogue listing as specified.`;

  // Preferred: OpenAI gpt-4o with vision (reads the actual photo)
  if (OPENAI && opts.imageUrl) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o",
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: [
            { type: "text", text: userText },
            { type: "image_url", image_url: { url: opts.imageUrl } }
          ] }
        ]
      })
    });
    if (res.ok) {
      const j = await res.json();
      return JSON.parse(j.choices[0].message.content) as GeneratedProduct;
    }
    console.warn("OpenAI vision failed, falling back to text-only:", await res.text());
  }

  // Fallback: Groq text-only (no image understanding)
  if (GROQ) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${GROQ}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userText + "\n(No image analysis available — infer from the transcript only.)" }
        ]
      })
    });
    if (!res.ok) throw new Error(`Product generation failed (${res.status}): ${await res.text()}`);
    const j = await res.json();
    return JSON.parse(j.choices[0].message.content) as GeneratedProduct;
  }

  throw new Error("No AI provider configured (OPENAI_API_KEY for vision, or GROQ_API_KEY).");
}
