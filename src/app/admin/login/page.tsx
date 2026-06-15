"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const r = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(null);
    const res = await fetch("/api/admin/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (res.ok) r.push("/admin");
    else { const d = await res.json().catch(()=>({})); setErr(d.error || "Login failed"); }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm border border-black/5 rounded-2xl p-6 space-y-3">
        <h1 className="font-black text-2xl">Admin login</h1>
        <p className="text-xs text-muted">NewVora HQ · founders only</p>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="email" className="w-full border rounded-xl px-3 py-2 text-sm" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="password" className="w-full border rounded-xl px-3 py-2 text-sm" />
        {err && <div className="text-brand text-sm">{err}</div>}
        <button className="w-full bg-ink text-white rounded-full py-2 text-sm font-semibold">Sign in</button>
      </form>
    </div>
  );
}
