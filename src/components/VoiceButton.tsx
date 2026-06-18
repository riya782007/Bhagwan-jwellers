"use client";

function HeroAvatar() {
  return (
    <svg viewBox="0 0 64 64" width="76" height="76" aria-hidden>
      <defs>
        <linearGradient id="vbgh" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#EADCAA" /><stop offset="1" stopColor="#C5A150" /></linearGradient>
      </defs>
      <circle cx="32" cy="32" r="32" fill="url(#vbgh)" />
      <path d="M15 34c0-12 8-20 17-20s17 8 17 20c0 3-1 6-2 8 0-9-3-15-15-15S17 33 17 42c-1-2-2-5-2-8z" fill="#2A1E12" />
      <path d="M20 30c0-7 5-12 12-12s12 5 12 12v6c0 8-6 13-12 13s-12-5-12-13z" fill="#E8B98E" />
      <circle cx="27" cy="33" r="1.7" fill="#2A1E12" /><circle cx="37" cy="33" r="1.7" fill="#2A1E12" />
      <circle cx="32" cy="27.5" r="1.3" fill="#7A2E3A" />
      <path d="M28 40c2 2 6 2 8 0" stroke="#7A2E3A" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <circle cx="20.5" cy="38" r="1.6" fill="#C5A150" stroke="#2A1E12" strokeWidth="0.4" /><circle cx="43.5" cy="38" r="1.6" fill="#C5A150" stroke="#2A1E12" strokeWidth="0.4" />
    </svg>
  );
}

export function VoiceButton() {
  return (
    <button
      onClick={() => window.dispatchEvent(new CustomEvent("vbrain:open"))}
      className="group relative w-full overflow-hidden rounded-3xl bg-ink text-ivory p-8 text-left transition hover:shadow-2xl"
    >
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gold/10 group-hover:bg-gold/20 transition" />
      <div className="relative flex items-center gap-5">
        <span className="rounded-full vb-glow group-hover:scale-105 transition"><HeroAvatar /></span>
        <div>
          <div className="text-gold text-xs uppercase tracking-luxe">Sona · your assistant</div>
          <div className="font-serif text-2xl sm:text-3xl mt-1">Tap & tell me what to do</div>
          <div className="text-ivory/70 text-sm mt-1">“Stock 50 kar do” · “price 1799 karo” · “naya product daalo” — I’ll do it and show you.</div>
        </div>
      </div>
    </button>
  );
}
