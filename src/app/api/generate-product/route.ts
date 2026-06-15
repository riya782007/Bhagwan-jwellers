import { NextRequest, NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { transcribeAudio, generateProduct } from "@/lib/ai";
import { uploadProductImage } from "@/lib/storage";

export const runtime = "nodejs";
export const maxDuration = 60;

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "piece";
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  for (let i = 0; i < 5; i++) {
    const existing = await db.product.findUnique({ where: { slug } });
    if (!existing) return slug;
    slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export async function POST(req: NextRequest) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const form = await req.formData();
    const photo = form.get("photo") as File | null;
    const audio = form.get("audio") as File | null;
    let transcript = (form.get("transcript") as string) || "";
    const language = (form.get("language") as string) || "auto";

    if (!photo) return NextResponse.json({ error: "A product photo is required." }, { status: 400 });

    // 1. Voice note -> transcript (if audio supplied and no transcript already)
    if (!transcript && audio) {
      transcript = await transcribeAudio(audio, language);
    }

    // 2. Upload the photo -> public URL
    const imageUrl = await uploadProductImage(photo);

    // 3. Photo + transcript -> structured product
    const g = await generateProduct({ imageUrl, transcript });

    // 4. Map to schema + persist as an unpublished DRAFT (human-in-the-loop)
    const bullets = [...(g.bullets || [])];
    if (g.material) bullets.push(`Material: ${g.material}`);
    if (g.moq) bullets.push(`Minimum order: ${g.moq}`);

    const tags = [g.category, g.material, g.colour, ...(g.tags || [])]
      .filter(Boolean).join(",").slice(0, 250);

    const product = await db.product.create({
      data: {
        slug: await uniqueSlug(slugify(g.title)),
        title: g.title,
        tagline: g.tagline || null,
        description: g.description || "",
        bullets: JSON.stringify(bullets),
        price: g.priceINR ? Math.round(g.priceINR * 100) : 0,
        currency: "INR",
        imagesJson: JSON.stringify([imageUrl]),
        category: g.category || null,
        tags,
        isPublished: false,
        stock: 100
      }
    });

    return NextResponse.json({ product, transcript, whatsappCaption: g.whatsappCaption, generated: g });
  } catch (e: unknown) {
    console.error("generate-product error:", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Generation error" }, { status: 500 });
  }
}
