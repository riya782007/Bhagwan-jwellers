"use client";
import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  const num = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919999999999").replace(/\D/g, "");
  const href = `https://wa.me/${num}?text=${encodeURIComponent("Hi NewVora, I have a question about a product")}`;
  return (
    <a
      href={href} target="_blank" rel="noreferrer"
      className="fixed bottom-4 right-4 z-40 w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:scale-105 transition"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
    </a>
  );
}
