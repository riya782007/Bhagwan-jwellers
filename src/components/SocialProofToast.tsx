"use client";
import { useEffect, useState } from "react";
import { socialProofMessage } from "@/lib/psych";

const SAMPLE_TITLES = [
  "Self-Stirring Magnetic Mug",
  "Posture Corrector Pro",
  "LED Galaxy Star Projector",
  "Magnetic Spice Rack"
];

export function SocialProofToast() {
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const cycle = () => {
      if (cancelled) return;
      const t = SAMPLE_TITLES[Math.floor(Math.random() * SAMPLE_TITLES.length)];
      setMsg(socialProofMessage(t));
      setTimeout(() => !cancelled && setMsg(null), 5500);
      setTimeout(cycle, 11000);
    };
    const initial = setTimeout(cycle, 8000);
    return () => { cancelled = true; clearTimeout(initial); };
  }, []);

  if (!msg) return null;
  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-xs bg-white shadow-lg border border-black/5 rounded-xl p-3 flex items-start gap-3 animate-slide-up">
      <div className="w-9 h-9 rounded-full bg-brand-light flex items-center justify-center text-brand">✓</div>
      <div className="text-xs leading-snug">{msg}</div>
    </div>
  );
}
