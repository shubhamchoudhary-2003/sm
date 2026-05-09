"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
    if (res?.ok) {
      router.push("/dashboard");
    } else {
      setError("Invalid username or password");
    }
  }

  return (
    <div className="min-h-screen bg-[#1a0a0a] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl font-bold text-[#6b1a2a] font-serif">SM</div>
          <div className="text-sm text-gray-500 mt-1 tracking-widest uppercase">Sri Alankar Mandir</div>
          <div className="text-xs text-gray-400 tracking-widest uppercase">Admin Portal</div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Username</label>
            <input
              name="username"
              type="text"
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b1a2a]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Password</label>
            <input
              name="password"
              type="password"
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b1a2a]"
            />
          </div>
          {error && <p className="text-red-500 text-xs text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#6b1a2a] text-white rounded-lg py-2.5 text-sm font-semibold tracking-wide hover:bg-[#5a1522] transition disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
