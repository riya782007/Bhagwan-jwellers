"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Square, Loader2, Check, X, ArrowRight, Sparkles } from "lucide-react";

type Action = {
  intent: string; productId?: string | null; productTitle?: string | null;
  value?: number | string | null; field?: string | null; route?: string | null;
  tier: "safe" | "confirm" | "guide" | "clarify"; say: string; executed?: boolean;
};

export function AdminVoice() {
  const r = useRouter();
  const [open, setOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState<"idle" | "transcribing" | "thinking" | "working">("idle");
  const [heard, setHeard] = useState("");
  const [action, setAction] = useState<Action | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState("");

  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  function resetConversation() { setHeard(""); setAction(null); setDone(null); setError(""); }

  async function startRec() {
    resetConversation(); setOpen(true); setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunks.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunks.current.push(e.data); };
      mr.onstop = async () => { stream.getTracks().forEach((t) => t.stop()); await process(new Blob(chunks.current, { type: "audio/webm" })); };
      mr.start(); mediaRef.current = mr; setRecording(true);
    } catch { setError("Allow microphone access to use voice."); }
  }
  function stopRec() { mediaRef.current?.stop(); setRecording(false); }

  async function process(blob: Blob) {
    try {
      setStatus("transcribing");
      const fd = new FormData();
      fd.append("file", new File([blob], "cmd.webm", { type: "audio/webm" }));
      fd.append("language", "auto");
      const tr = await fetch("/api/transcribe", { method: "POST", body: fd });
      const tj = await tr.json();
      if (!tr.ok) { setError(tj.error || "Couldn't hear that."); setStatus("idle"); return; }
      setHeard(tj.text || "");

      setStatus("thinking");
      const ar = await fetch("/api/agent", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ transcript: tj.text }) });
      const aj = await ar.json();
      if (!ar.ok) { setError(aj.error || "Couldn't process that."); setStatus("idle"); return; }
      const a: Action = aj.action;
      setAction(a);
      setStatus("idle");

      // Safe + navigation intents → go there
      const navTarget = a.route || (a.productId && ["open_editor", "delete", "edit_field", "supplier"].includes(a.intent) ? `/admin/products/${a.productId}` : a.intent === "add_product" ? "/admin/add" : null);
      if (a.tier === "safe" && !a.executed && navTarget) {
        setTimeout(() => { r.push(navTarget); setOpen(false); }, 900);
      }
      if (a.executed) r.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong."); setStatus("idle"); }
  }

  async function confirmAction() {
    if (!action) return;
    setStatus("working");
    const res = await fetch("/api/agent", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ execute: { intent: action.intent, productId: action.productId, value: action.value, field: action.field } })
    });
    const j = await res.json();
    setStatus("idle");
    if (!res.ok) { setError(j.error || "Couldn't complete that."); return; }
    setDone(j.say || "Done."); setAction(null); r.refresh();
  }

  const navTarget = action ? (action.route || (action.productId ? `/admin/products/${action.productId}` : null)) : null;

  return (
    <>
      {/* Panel */}
      {open && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 w-[min(92vw,440px)] bg-white rounded-2xl border border-gold/30 shadow-2xl p-4 animate-slide-up">
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center gap-1.5 text-sm font-serif text-ink"><Sparkles className="w-4 h-4 text-gold-dark" /> vBrain</span>
            <button onClick={() => setOpen(false)} className="text-muted hover:text-ink"><X className="w-4 h-4" /></button>
          </div>

          {heard && <p className="text-xs text-muted mb-2">You: “{heard}”</p>}

          {status === "transcribing" && <p className="text-sm text-gold-dark inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Listening…</p>}
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
                <button onClick={() => { r.push(navTarget); setOpen(false); }} className="w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-ink text-gold-light py-2 text-sm font-semibold">
                  Take me there <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {action.tier === "clarify" && <p className="text-xs text-muted">Tap the mic and tell me again.</p>}
              {action.executed && <p className="text-sm text-green-700 inline-flex items-center gap-1.5"><Check className="w-4 h-4" /> Done.</p>}
            </div>
          )}
        </div>
      )}

      {/* Prominent mic */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2">
        <button
          onClick={() => (recording ? stopRec() : startRec())}
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
