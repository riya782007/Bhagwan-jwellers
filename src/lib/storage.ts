// Uploads a product photo to Supabase Storage (public "products" bucket)
// and returns its public URL. Uses the storage REST API (no SDK needed).
export async function uploadProductImage(file: File): Promise<string> {
  const base = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !serviceKey) {
    throw new Error("Image storage not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const res = await fetch(`${base}/storage/v1/object/products/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
      "Content-Type": file.type || "image/jpeg",
      "x-upsert": "true"
    },
    body: bytes
  });
  if (!res.ok) throw new Error(`Image upload failed (${res.status}): ${await res.text()}`);
  return `${base}/storage/v1/object/public/products/${path}`;
}
