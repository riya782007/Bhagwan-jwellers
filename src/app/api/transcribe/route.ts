import { NextRequest, NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { transcribeAudio } from "@/lib/ai";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const language = (form.get("language") as string) || "auto";
    if (!file) return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    const text = await transcribeAudio(file, language);
    return NextResponse.json({ text });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Transcription error" }, { status: 500 });
  }
}
