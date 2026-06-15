"use client";
import { useEffect, useState } from "react";
import { dealEndsAt } from "@/lib/psych";

export function ScarcityTimer() {
  const [ms, setMs] = useState<number>(0);

  useEffect(() => {
    const target = dealEndsAt(6);
    const tick = () => setMs(Math.max(0, target - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);

  return (
    <div className="flex items-center gap-2 bg-brand-light text-brand-dark rounded-xl px-3 py-2 text-sm">
      <span>⏱ Deal ends in</span>
      <span className="font-mono font-bold tracking-tight">
        {pad(h)}:{pad(m)}:{pad(s)}
      </span>
    </div>
  );
}
const pad = (n: number) => String(n).padStart(2, "0");
