"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Square, Loader2, Check, X, ArrowRight, Sparkles, Send } from "lucide-react";

type Action = {
  intent: string; productId?: string | null; productTitle?: string | null;
  value?: number | string | null; field?: string | null; route?: string | null;
  tier: "safe" | "confirm" | "guide" | "clarify"; say: string; executed?: boolean;
};

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

  useEffect(() => {
    const h = () => openAndRecord();
    window.addEventListener("vbrain:open", h as EventListener);
    return () => window.removeEventListener("vbrain:open", h as EventListener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function resetConvo() { setHeard(""); setAction(null); setDone(null); setError(""); }

  function openAndRecord() {
    setOpen(true);
    if (mediaRef.current?.state === "recording") return;
    startRec();
  }

  async function startRec() {
    resetConvo();
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("Voice recording isn't available in this browser — just type your command below.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = pickMime();
      const mr = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      chunks.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunks.current.push(e.data); };
      mr.onstop = async () => {
        const blob = new Blob(chunks.current, { type: mr.mimeType || "audio/webm" });
        stream.getTracks().forEach((t) => t.stop());
        await transcribe(blob);
      };
      mr.start(); mediaRef.current = mr; setRecording(true);
    } catch {
      setError("Couldn't access the microphone. Allow mic permission in your browser, or type your command below.");
    }
  }
  function stopRec() { try { mediaRef.current?.stop(); } catch {} setRecording(false); }

  async function transcribe(blob: Blob) {
    setStatus("transcribing"); setError("");
    try {
      const ext = blob.type.includes("mp4") ? "mp4" : blob.type.includes("ogg") ? "ogg" : "webm";
      const fd = new FormData();
      fd.append("file", new File([blob], `cmd.${ext}`, { type: blob.type || "audio/webm" }));
      fd.append("language", "auto");
      const tr = await fetch("/api/transcribe", { method: "POST", body: fd });
      const tj = await tr.json();
      if (!tr.ok) { setError(tj.error || "Couldn't hear that — type your command below."); setStatus("idle"); return; }
      setHeard(tj.text || "");
      await runAgent(tj.text || "");
    } catch { setError("Voice failed — type your command below."); setStatus("idle"); }
  }

  async function runAgent(text: string) {
    if (!text.trim()) { setStatus("idle"); return; }
    setStatus("thinking"); setError(""); setAction(null); setDone(null); setHeard(text);
    try {
      const ar = await fetch("/api/agent", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ transcript: text }) });
      const aj = await ar.json();
      if (!ar.ok) { setError(aj.error || "Couldn't process that."); setStatus("idle"); return; }
      const a: Action = aj.action; setAction(a); setStatus("idle"); setTyped("");
      const navTarget = a.route || (a.productId && ["open_editor", "delete", "edit_field"].includes(a.intent) ? `/admin/products/${a.productId}` : a.intent === "add_product" ? "/admin/add" : null);
      if (a.tier === "safe" && !a.executed && navTarget) setTimeout(() => { window.location.href = navTarget; }, 900);
      if (a.executed) r.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong."); setStatus("idle"); }
  }

  async function confirmAction() {
    if (!action) return;
    setStatus("working");
    const res = await fetch("/api/agent", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ execute: { intent: action.intent, productId: action.productId, value: action.value, field: action.field } }) });
    const j = await res.json(); setStatus("idle");
    if (!res.ok) { setError(j.error || "Couldn't complete that."); return; }
    setDone(j.say || "Done."); setAction(null); r.refresh();
  }

  const navTarget = action ? (action.route || (action.productId ? `/admin/products/${action.productId}` : null)) : null;

  return (
    <>
      {open && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 w-[min(94vw,440px)] bg-white rounded-2xl border border-gold/30 shadow-2xl p-4 animate-slide-up">
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center gap-1.5 text-sm font-serif text-ink"><Sparkles className="w-4 h-4 text-gold-dark" /> vBrain</span>
            <button onClick={() => { stopRec(); setOpen(false); }} className="text-muted hover:text-ink"><X className="w-4 h-4" /></button>
          </div>

          {heard && <p className="text-xs text-muted mb-2">You: “{heard}”</p>}
          {recording && <p className="text-sm text-wine inline-flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-wine animate-pulse" /> Listening… tap the mic to stop</p>}
          {status === "transcribing" && <p className="text-sm text-gold-dark inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Converting voice…</p>}
          {status === "thinking" && <p className="text-sm text-gold-dark inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Understanding…</p>}
          {status === "working" && <p className="text-sm text-gold-dark inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Working…</p>}
          {error && <p className="text-sm text-wine">{error}</p>}
          {done && <p className="text-sm text-green-700 inline-flex items-center gap-1.5"><Check className="w-4 h-4" /> {done}</p>}

          {action && status === "idle" && (
            <div className="space-y-3">
              <p className="text-sm text-ink">{action.say}</p>
              {action.tier === "confirm" && (
                <div className="flex gap-2">
                  <button onClick={confirmAction} className="flex-1 rounded-full bg-ink text-gold-light py-2 text-sm font-semibold">Confirm</button>
                  <button onClick={() => setAction(null)} className="flex-1 rounded-full border border-black/15 py-2 text-sm">Cancel</button>
                </div>
              )}
              {action.tier === "guide" && navTarget && (
                <button onClick={() => { window.location.href = navTarget; }} className="w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-ink text-gold-light py-2 text-sm font-semibold">Take me there <ArrowRight className="w-4 h-4" /></button>
              )}
              {action.executed && <p className="text-sm text-green-700 inline-flex items-center gap-1.5"><Check className="w-4 h-4" /> Done.</p>}
            </div>
          )}

          {/* Type fallback — always available */}
          <form onSubmit={(e) => { e.preventDefault(); runAgent(typed); }} className="mt-3 flex items-center gap-2">
            <input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="…or type a command"
              className="flex-1 text-sm border border-black/10 rounded-full px-3 py-2" />
            <button type="submit" disabled={!typed.trim() || status !== "idle"} className="rounded-full bg-gold text-ink p-2 disabled:opacity-40" aria-label="Send"><Send className="w-4 h-4" /></button>
          </form>
        </div>
      )}

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2">
        <button
          onClick={() => (recording ? stopRec() : openAndRecord())}
          className={`relative w-16 h-16 rounded-full grid place-items-center text-ink transition hover:scale-110 ${recording ? "bg-wine text-white vb-rec" : "bg-gradient-to-br from-gold-light to-gold vb-glow"}`}
          aria-label="Talk to your store"
        >
          {recording ? <Square className="w-6 h-6" /> : <Mic className="w-7 h-7" />}
        </button>
        <span className="text-[11px] font-medium text-ink/70 bg-white/80 backdrop-blur px-2 py-0.5 rounded-full border border-gold/20">
          {recording ? "Listening… tap to stop" : "Tap & tell me what to do"}
        </span>
      </div>
    </>
  );
}
