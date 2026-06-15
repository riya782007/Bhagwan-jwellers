import { AddClient } from "./client";

export const metadata = { title: "Add by Photo + Voice" };

export default function AddProductPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-ink">Add a piece — photo + voice</h1>
        <p className="text-muted text-sm mt-1">
          Take one photo, speak the details in Hindi / Hinglish / English, and let the assistant write the listing.
          Review, then publish — no typing required.
        </p>
      </div>
      <AddClient />
    </div>
  );
}
