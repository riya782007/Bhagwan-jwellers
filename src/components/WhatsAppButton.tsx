"use client";
import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  const num = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919654353586").replace(/\D/g, "");
  const href = `https://wa.me/${num}?text=${encodeURIComponent("Hello Bhagwan Jewellers, I would like to enquire about your collection / wholesale order.")}`;
  return (
    <a
      href={href} target="_blank" rel="noreferrer"
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-[#25D366] text-white pl-3 pr-4 py-3 shadow-lg hover:scale-105 transition"
      aria-label="Enquire on WhatsApp"
    >
      <MessageCircle className="w-5 h-5" />
      <span className="text-sm font-semibold hidden sm:inline">Enquire on WhatsApp</span>
    </a>
  );
}
