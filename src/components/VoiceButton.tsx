"use client";
import { Mic } from "lucide-react";

export function VoiceButton() {
  return (
    <button
      onClick={() => window.dispatchEvent(new CustomEvent("vbrain:open"))}
      className="group relative w-full overflow-hidden rounded-3xl bg-ink text-ivory p-8 text-left transition hover:shadow-2xl"
    >
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gold/10 group-hover:bg-gold/20 transition" />
      <div className="relative flex items-center gap-5">
        <span className="relative grid place-items-center w-20 h-20 rounded-full bg-gradient-to-br from-gold-light to-gold text-ink vb-glow group-hover:scale-110 transition">
          <Mic className="w-9 h-9" />
        </span>
        <div>
          <div className="text-gold text-xs uppercase tracking-luxe">vBrain · your assistant</div>
          <div className="font-serif text-2xl sm:text-3xl mt-1">Tell me what to do</div>
          <div className="text-ivory/70 text-sm mt-1">“Stock 50 kar do” · “price 1799 karo” · “naya product daalo” · “orders dikhao” — just speak.</div>
        </div>
      </div>
    </button>
  );
}
