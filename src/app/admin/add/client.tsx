"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { Mic, Square, Camera, Sparkles, Check, Copy, Loader2 } from "lucide-react";

type GenResult = {
  product: { id: string; slug: string; title: string; price: number; category?: string | null };
  transcript: string;
  whatsappCaption: string;
  generated: {
    title: string; tagline: string; description: string; bullets: string[];
    category: string; material: string; colour: string; priceINR: number | null; moq: string;
  };
};

export function AddClient() {
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [language, setLanguage] = useState("auto");
  const [transcript, setTranscript] = useState("");

  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GenResult | null>(null);
  const [published, setPublished] = useState(false);
  const [copied, setCopied] = useState(false);

  function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) { setPhoto(f); setPhotoUrl(URL.createObjectURL(f)); }
  }

  async function startRec() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunks.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunks.current.push(e.data); };
      mr.onstop = async () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
        await transcribe(blob);
      };
      mr.start(); mediaRef.current = mr; setRecording(true);
    } catch {
      setError("Could not access the microphone. Allow mic permission, or type the details below.");
    }
  }
  function stopRec() { mediaRef.current?.stop(); setRecording(false); }

  // Voice → text (voice2wa transcription) so the owner can see/confirm what was heard
  async function transcribe(blob: Blob) {
    setTranscribing(true); setError("");
    try {
      const fd = new FormData();
      fd.append("file", new File([blob], "voice.webm", { type: "audio/webm" }));
      fd.append("language", language);
      const res = await fetch("/api/transcribe", { method: "POST", body: fd });
      const j = await res.json();
      if (!res.ok) setError(j.error || "Could not transcribe — type the details instead.");
      else setTranscript((prev) => (prev ? prev + " " : "") + (j.text || ""));
    } catch {
      setError("Transcription failed — type the details instead.");
    } finally { setTranscribing(false); }
  }

  async function generate() {
    if (!photo) { setError("Please add a photo first."); return; }
    if (!transcript.trim()) { setError("Record or type the details first."); return; }
    setLoading(true); setError(""); setResult(null); setPublished(false);
    try {
      const fd = new FormData();
      fd.append("photo", photo);
      fd.append("transcript", transcript.trim());
      fd.append("language", language);
      const res = await fetch("/api/generate-product", { method: "POST", body: fd });
      const j = await res.json();
      if (!res.ok) setError(j.error || "Generation failed.");
      else setResult(j);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally { setLoading(false); }
  }

  async function publish() {
    if (!result) return;
    const res = await fetch(`/api/admin/products/${result.product.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: true })
    });
    if (res.ok) setPublished(true); else setError("Could not publish — open it in Products to publish.");
  }

  function reset() {
    setPhoto(null); setPhotoUrl(""); setAudioUrl("");
    setTranscript(""); setResult(null); setPublished(false); setError("");
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* LEFT: capture */}
      <div className="bg-white rounded-2xl border border-black/5 p-5 space-y-5">
        <div>
          <label className="block text-sm font-semibold mb-2">1 · Photo</label>
          <label className="group relative flex items-center justify-center aspect-video rounded-xl border-2 border-dashed border-gold/40 bg-ivory-soft cursor-pointer overflow-hidden">
            {photoUrl ? (
              <Image src={photoUrl} alt="preview" fill className="object-contain" />
            ) : (
              <span className="flex flex-col items-center text-muted text-sm"><Camera className="w-7 h-7 mb-1 text-gold-dark" />Tap to take / choose a photo</span>
            )}
            <input type="file" accept="image/*" capture="environment" onChange={onPhoto} className="hidden" />
          </label>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">2 · Speak the details</label>
          <div className="flex items-center gap-3">
            {!recording ? (
              <button onClick={startRec} disabled={transcribing} className="inline-flex items-center gap-2 rounded-full bg-ink text-gold-light px-5 py-2.5 text-sm font-medium disabled:opacity-50">
                <Mic className="w-4 h-4" /> {audioUrl ? "Record again" : "Record"}
              </button>
            ) : (
              <button onClick={stopRec} className="inline-flex items-center gap-2 rounded-full bg-wine text-white px-5 py-2.5 text-sm font-medium animate-pulse">
                <Square className="w-4 h-4" /> Stop
              </button>
            )}
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="text-sm border border-black/10 rounded-full px-3 py-2 bg-white">
              <option value="auto">Auto-detect</option>
              <option value="hinglish">Hinglish</option>
              <option value="hindi">Hindi</option>
              <option value="english">English</option>
            </select>
          </div>
          {audioUrl && <audio src={audioUrl} controls className="mt-3 w-full h-9" />}
          <p className="text-xs text-muted mt-2">e.g. “Halki neeli Polki choker, bridal, ₹1800 piece, minimum 12 pieces, bahut halki hai.”</p>

          <div className="mt-3">
            <span className="text-xs text-muted">{transcribing ? "Listening…" : "What we heard (edit if needed)"}</span>
            <textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} placeholder="Your spoken details will appear here — or type them"
              className="mt-1 w-full text-sm border border-black/10 rounded-xl p-3 min-h-[80px]" />
            {transcribing && <div className="text-xs text-gold-dark inline-flex items-center gap-1 mt-1"><Loader2 className="w-3 h-3 animate-spin" /> converting voice to text…</div>}
          </div>
        </div>

        {error && <div className="bg-brand-light text-brand-dark text-sm rounded-xl p-3">{error}</div>}

        <button onClick={generate} disabled={loading || transcribing || !photo}
          className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gold text-ink px-6 py-3 font-semibold text-sm disabled:opacity-50">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating listing…</> : <><Sparkles className="w-4 h-4" /> Generate listing</>}
        </button>
      </div>

      {/* RIGHT: result */}
      <div className="bg-white rounded-2xl border border-black/5 p-5">
        {!result ? (
          <div className="h-full grid place-items-center text-center text-muted text-sm min-h-[300px]">
            <div>
              <Sparkles className="w-8 h-8 mx-auto text-gold/50 mb-2" />
              The generated listing will appear here for your review.
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              {photoUrl && <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-ivory-soft"><Image src={photoUrl} alt="" fill className="object-cover" /></div>}
              <div>
                <div className="text-[11px] uppercase tracking-luxe text-gold-dark">{result.generated.category}</div>
                <h3 className="font-serif text-xl text-ink leading-snug">{result.generated.title}</h3>
                <p className="text-sm text-muted">{result.generated.tagline}</p>
                <div className="mt-1 text-gold-dark font-semibold">
                  {result.generated.priceINR ? `₹${result.generated.priceINR.toLocaleString("en-IN")}` : "Price on enquiry"}
                  {result.generated.moq ? <span className="text-xs text-muted font-normal"> · MOQ {result.generated.moq}</span> : null}
                </div>
              </div>
            </div>

            <p className="text-sm text-ink/80">{result.generated.description}</p>
            <ul className="text-sm space-y-1">
              {result.generated.bullets?.map((b, i) => <li key={i} className="flex gap-2"><span className="text-gold">✦</span>{b}</li>)}
            </ul>

            <div className="bg-ivory-soft rounded-xl p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink">WhatsApp caption</span>
                <button onClick={() => { navigator.clipboard.writeText(result.whatsappCaption); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                  className="text-xs inline-flex items-center gap-1 text-gold-dark">
                  {copied ? <><Check className="w-3 h-3" />Copied</> : <><Copy className="w-3 h-3" />Copy</>}
                </button>
              </div>
              <p className="text-sm text-muted mt-1 whitespace-pre-line">{result.whatsappCaption}</p>
            </div>

            {!published ? (
              <div className="flex gap-2 pt-1">
                <button onClick={publish} className="flex-1 rounded-full bg-ink text-gold-light py-3 text-sm font-semibold">Publish to site</button>
                <a href={`/admin/products/${result.product.id}`} className="flex-1 text-center rounded-full border border-black/15 py-3 text-sm font-semibold">Edit first</a>
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                <div className="bg-green-50 text-green-700 rounded-xl p-3 text-sm inline-flex items-center gap-2"><Check className="w-4 h-4" /> Live on the site!</div>
                <div className="flex gap-2">
                  <a href={`/product/${result.product.slug}`} target="_blank" rel="noreferrer" className="flex-1 text-center rounded-full bg-gold text-ink py-3 text-sm font-semibold">View live page</a>
                  <button onClick={reset} className="flex-1 rounded-full border border-black/15 py-3 text-sm font-semibold">Add another</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
