"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      username: fd.get("username"),
      password: fd.get("password"),
      redirect: false,
    });
    setLoading(false);
    if (res?.ok) router.push("/dashboard");
    else setError("Invalid username or password");
  }

  return (
    <div className="min-h-screen bg-[#0d0608] flex items-center justify-center p-5"
      style={{ background: "radial-gradient(ellipse at 50% 0%, #2a0d14 0%, #0d0608 70%)" }}
    >
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center font-bold text-lg font-playfair text-[#3a0a14]"
            style={{ background: "linear-gradient(135deg,#c9a84c,#f0d080,#a07830)" }}
          >SM</div>
          <h1 className="text-white font-semibold text-xl tracking-wide font-playfair">Sri Alankar Mandir</h1>
          <p className="text-[#c9a84c] text-xs tracking-[3px] uppercase mt-1">Admin Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="username" className="text-xs font-semibold uppercase tracking-wide text-gray-500 block">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                autoComplete="username"
                autoCapitalize="none"
                placeholder="admin"
                className="w-full h-12 rounded-xl border border-gray-200 px-4 text-base focus:outline-none focus:ring-2 focus:ring-[#6b1a2a] bg-gray-50"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-gray-500 block">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full h-12 rounded-xl border border-gray-200 px-4 text-base focus:outline-none focus:ring-2 focus:ring-[#6b1a2a] bg-gray-50"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 rounded-xl py-2.5 px-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-[#6b1a2a] text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.98] transition-transform"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
