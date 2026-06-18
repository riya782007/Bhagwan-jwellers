"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, X, ArrowRight, Send, Square } from "lucide-react";

type Action = {
  intent: string; productId?: string | null; productTitle?: string | null;
  value?: number | string | null; field?: string | null; route?: string | null;
  tier: "safe" | "confirm" | "guide" | "clarify"; say: string; executed?: boolean;
};

const NAME = "Sona";

function Avatar({ size = 64, talking = false }: { size?: number; talking?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden>
      <defs>
        <linearGradient id="vbg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#EADCAA" /><stop offset="1" stopColor="#C5A150" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="32" fill="url(#vbg)" />
      {/* hair */}
      <path d="M15 34c0-12 8-20 17-20s17 8 17 20c0 3-1 6-2 8 0-9-3-15-15-15S17 33 17 42c-1-2-2-5-2-8z" fill="#2A1E12" />
      {/* face */}
      <path d="M20 30c0-7 5-12 12-12s12 5 12 12v6c0 8-6 13-12 13s-12-5-12-13z" fill="#E8B98E" />
      {/* eyes */}
      <circle cx="27" cy="33" r="1.7" fill="#2A1E12" /><circle cx="37" cy="33" r="1.7" fill="#2A1E12" />
      {/* bindi */}
      <circle cx="32" cy="27.5" r="1.3" fill="#7A2E3A" />
      {/* smile */}
      <path d={talking ? "M28 40c2 3 6 3 8 0" : "M28 40c2 2 6 2 8 0"} stroke="#7A2E3A" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {/* earrings (jewellery touch) */}
      <circle cx="20.5" cy="38" r="1.6" fill="#C5A150" stroke="#2A1E12" strokeWidth="0.4" />
      <circle cx="43.5" cy="38" r="1.6" fill="#C5A150" stroke="#2A1E12" strokeWidth="0.4" />
    </svg>
  );
}

function pickMime(): string {
  if (typeof MediaRecorder === "undefined") return "";
  for (const t of ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"]) {
    try { if (MediaRecorder.isTypeSupported(t)) return t; } catch {}
  }
  return "";
}

export function AdminVoice() {
  const r = useRouter();
  const [open, setOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState<"idle" | "transcribing" | "thinking" | "working">("idle");
  const [heard, setHeard] = useState("");
  const [typed, setTyped] = useState("");
  const [action, setAction] = useState<Action | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState("");
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const startedAt = useRef(0);

  useEffect(() => {
    const h = () => openPanelAndListen();
    window.addEventListener("vbrain:open", h as EventListener);
    return () => window.removeEventListener("vbrain:open", h as EventListener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function resetConvo() { setHeard(""); setAction(null); setDone(null); setError(""); }

  function openPanelAndListen() {
    setOpen(true);
    if (mediaRef.current?.state === "recording") return; // already listening — ignore extra taps
    startRec();
  }

  async function startRec() {
    resetConvo();
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("Voice isn't available in this browser — just type below."); return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 }
      });
      const mime = pickMime();
      const mr = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      chunks.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunks.current.push(e.data); };
      mr.onstop = async () => {
        const dur = Date.now() - startedAt.current;
        const blob = new Blob(chunks.current, { type: mr.mimeType || "audio/webm" });
        stream.getTracks().forEach((t) => t.stop());
        if (dur < 700 || blob.size < 1200) { setError("I barely caught that — tap me and speak again."); return; }
        await transcribe(blob);
      };
      startedAt.current = Date.now();
      mr.start(); mediaRef.current = mr; setRecording(true);
    } catch {
      setError("I couldn't reach the mic. Allow microphone permission, or type below.");
    }
  }
  function stopAndSend() { try { mediaRef.current?.stop(); } catch {} setRecording(false); }

  async function transcribe(blob: Blob) {
    setStatus("transcribing"); setError("");
    try {
      const ext = blob.type.includes("mp4") ? "mp4" : blob.type.includes("ogg") ? "ogg" : "webm";
      const fd = new FormData();
      fd.append("file", new File([blob], `cmd.${ext}`, { type: blob.type || "audio/webm" }));
      fd.append("language", "auto");
      const tr = await fetch("/api/transcribe", { method: "POST", body: fd });
      const tj = await tr.json();
      if (!tr.ok) { setError(tj.error || "Couldn't hear that — type below."); setStatus("idle"); return; }
      const text = (tj.text || "").trim();
      if (text.length < 2) { setStatus("idle"); setError("I didn't catch that — tap me and speak again, a little closer."); return; }
      await runAgent(text);
    } catch { setError("Voice failed — type below."); setStatus("idle"); }
  }

  async function runAgent(text: string) {
    if (!text.trim()) { setStatus("idle"); return; }
    setStatus("thinking"); setError(""); setAction(null); setDone(null); setHeard(text);
    try {
      const ar = await fetch("/api/agent", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ transcript: text }) });
      const aj = await ar.json();
      if (!ar.ok) { setError(aj.error || "Couldn't process that."); setStatus("idle"); return; }
      const a: Action = aj.action; setAction(a); setStatus("idle"); setTyped("");
      if (a.executed && a.productId) { setTimeout(() => { window.location.href = `/admin/products/${a.productId}`; }, 1400); return; }
      const navTarget = a.route || (a.intent === "add_product" ? "/admin/add" : a.productId && ["open_editor", "delete", "edit_field"].includes(a.intent) ? `/admin/products/${a.productId}` : null);
      if (a.tier === "safe" && navTarget) setTimeout(() => { window.location.href = navTarget; }, 1100);
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong."); setStatus("idle"); }
  }

  async function confirmAction() {
    if (!action) return;
    setStatus("working");
    const res = await fetch("/api/agent", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ execute: { intent: action.intent, productId: action.productId, value: action.value, field: action.field } }) });
    const j = await res.json(); setStatus("idle");
    if (!res.ok) { setError(j.error || "Couldn't complete that."); return; }
    setDone(j.say || "Done.");
    const pid = action.productId; setAction(null); r.refresh();
    if (pid) setTimeout(() => { window.location.href = `/admin/products/${pid}`; }, 1400);
  }

  const navTarget = action ? (action.route || (action.productId ? `/admin/products/${action.productId}` : null)) : null;

  return (
    <>
      {open && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 w-[min(94vw,440px)] bg-white rounded-2xl border border-gold/30 shadow-2xl p-4 animate-slide-up">
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center gap-2 text-sm font-serif text-ink"><Avatar size={22} /> {NAME} · your assistant</span>
            <button onClick={() => { stopAndSend(); setOpen(false); }} className="text-muted hover:text-ink"><X className="w-4 h-4" /></button>
          </div>

          {recording && (
            <div className="rounded-xl bg-ivory-soft p-3 text-center">
              <p className="text-sm text-wine inline-flex items-center gap-2 mb-2"><span className="w-2.5 h-2.5 rounded-full bg-wine animate-pulse" /> Listening… speak now</p>
              <button onClick={stopAndSend} className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-ink text-gold-light py-2.5 text-sm font-semibold">
                <Square className="w-4 h-4" /> Stop &amp; send
              </button>
            </div>
          )}

          {heard && !recording && <p className="text-xs text-muted mb-2">You said: “{heard}”</p>}
          {status === "transcribing" && <p className="text-sm text-gold-dark inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Listening to you…</p>}
          {status === "thinking" && <p className="text-sm text-gold-dark inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Got it — working on it…</p>}
          {status === "working" && <p className="text-sm text-gold-dark inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Making the change…</p>}
          {error && <p className="text-sm text-wine">{error}</p>}
          {done && <p className="text-sm text-green-700 inline-flex items-center gap-1.5"><Check className="w-4 h-4" /> {done} Taking you there…</p>}

          {action && status === "idle" && !recording && (
            <div className="space-y-3">
              <p className="text-sm text-ink">{action.say}</p>
              {action.executed && <p className="text-xs text-green-700 inline-flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> Done — opening it so you can see.</p>}
              {action.tier === "confirm" && (
                <div className="flex gap-2">
                  <button onClick={confirmAction} className="flex-1 rounded-full bg-ink text-gold-light py-2 text-sm font-semibold">Yes, do it</button>
                  <button onClick={() => setAction(null)} className="flex-1 rounded-full border border-black/15 py-2 text-sm">Cancel</button>
                </div>
              )}
              {action.tier === "guide" && navTarget && (
                <button onClick={() => { window.location.href = navTarget; }} className="w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-ink text-gold-light py-2 text-sm font-semibold">Take me there <ArrowRight className="w-4 h-4" /></button>
              )}
            </div>
          )}

          {!recording && (
            <form onSubmit={(e) => { e.preventDefault(); runAgent(typed); }} className="mt-3 flex items-center gap-2">
              <input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="…or type what you want"
                className="flex-1 text-sm border border-black/10 rounded-full px-3 py-2" />
              <button type="submit" disabled={!typed.trim() || status !== "idle"} className="rounded-full bg-gold text-ink p-2 disabled:opacity-40" aria-label="Send"><Send className="w-4 h-4" /></button>
            </form>
          )}
        </div>
      )}

      {/* The assistant — tap to talk */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-1.5">
        <button
          onClick={() => openPanelAndListen()}
          className={`relative rounded-full transition hover:scale-105 ${recording ? "ring-4 ring-wine/50 vb-rec" : "vb-glow"}`}
          aria-label={`Talk to ${NAME}`}
        >
          <Avatar size={66} talking={recording} />
        </button>
        <span className="text-[11px] font-medium text-ink/80 bg-white/85 backdrop-blur px-2.5 py-0.5 rounded-full border border-gold/25">
          {recording ? "Listening…" : `Tap ${NAME} & speak`}
        </span>
      </div>
    </>
  );
}
