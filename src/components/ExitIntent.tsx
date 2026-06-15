"use client";
import { useEffect, useState } from "react";

export function ExitIntent() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("nv_exit_seen")) return;
    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) { setShow(true); sessionStorage.setItem("nv_exit_seen", "1"); }
    };
    document.addEventListener("mouseleave", onLeave);
    return () => document.removeEventListener("mouseleave", onLeave);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source: "exit_intent" })
    }).catch(() => null);
    setDone(true);
    setTimeout(() => setShow(false), 2500);
  };

  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShow(false)}>
      <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        {done ? (
          <div className="text-center py-6">
            <div className="text-3xl">🎉</div>
            <h3 className="font-bold text-xl mt-2">Code: <span className="text-brand">FIRST100</span></h3>
            <p className="text-muted text-sm mt-1">₹100 off your first order. Use at checkout.</p>
          </div>
        ) : (
          <>
            <div className="text-3xl">⏳</div>
            <h3 className="font-black text-2xl mt-2 leading-tight">Wait! Don't go empty-handed.</h3>
            <p className="text-muted text-sm mt-1">Drop your email — get ₹100 off + early access to new viral drops.</p>
            <form onSubmit={submit} className="mt-4 flex gap-2">
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="flex-1 border border-black/10 rounded-full px-4 py-2 text-sm"
              />
              <button className="bg-ink text-white rounded-full px-5 text-sm font-semibold">Get ₹100 off</button>
            </form>
            <p className="text-[10px] text-muted mt-2">No spam. Unsubscribe anytime.</p>
          </>
        )}
      </div>
    </div>
  );
}
