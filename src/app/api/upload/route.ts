import { NextRequest, NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { uploadProductImage } from "@/lib/storage";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const form = await req.formData();
    const files = form.getAll("files").filter((f): f is File => f instanceof File);
    if (!files.length) return NextResponse.json({ error: "No files provided" }, { status: 400 });
    const urls: string[] = [];
    for (const f of files) urls.push(await uploadProductImage(f));
    return NextResponse.json({ urls });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Upload failed" }, { status: 500 });
  }
}
