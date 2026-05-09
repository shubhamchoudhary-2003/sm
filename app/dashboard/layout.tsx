"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-[#6b1a2a] text-white px-6 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#c9a84c] rounded-full flex items-center justify-center text-xs font-bold text-[#6b1a2a]">SM</div>
          <div>
            <div className="font-semibold text-sm tracking-wide">Sri Alankar Mandir</div>
            <div className="text-xs text-red-200 tracking-widest uppercase">Admin</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className={`text-sm px-3 py-1.5 rounded transition ${pathname === "/dashboard" ? "bg-white/20" : "hover:bg-white/10"}`}
          >
            Products
          </Link>
          <Link
            href="/products/new"
            className="text-sm bg-[#c9a84c] text-[#3a0a14] px-4 py-1.5 rounded font-semibold hover:bg-[#b8973b] transition"
          >
            + Add Product
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-sm text-red-200 hover:text-white transition"
          >
            Sign Out
          </button>
        </div>
      </nav>
      <main className="p-6 max-w-6xl mx-auto">{children}</main>
    </div>
  );
}
