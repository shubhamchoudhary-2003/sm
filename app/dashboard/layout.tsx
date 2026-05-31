"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Plus, LogOut, Gem, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

function pageTitle(pathname: string) {
  if (pathname === "/dashboard") return "Products";
  if (pathname === "/print-sheet") return "Sheet Print";
  if (pathname.includes("/card")) return "Print Card";
  if (pathname.includes("/edit")) return "Edit Product";
  if (pathname.includes("/new")) return "Add Product";
  return "";
}

const NAV = [
  { href: "/dashboard", label: "Products", icon: LayoutDashboard, exact: true },
  { href: "/print-sheet", label: "Sheet Print", icon: Layers, exact: true },
  { href: "/products/new", label: "Add Product", icon: Plus, exact: false },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-60 bg-[#6b1a2a] text-white flex-col shrink-0 print:hidden min-h-screen sticky top-0">
        <div className="px-5 py-5 flex items-center gap-3 border-b border-white/10">
          <div className="w-9 h-9 rounded-full bg-[#c9a84c] flex items-center justify-center text-[#6b1a2a] font-bold text-sm shrink-0">SM</div>
          <div>
            <div className="text-sm font-semibold leading-tight">Sri Alankar Mandir</div>
            <div className="text-[10px] text-red-300 uppercase tracking-widest">Admin Portal</div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive(href, exact) ? "bg-white/20 text-white font-medium" : "text-red-100 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" /> {label}
            </Link>
          ))}
        </nav>
        <div className="px-3 pb-4 border-t border-white/10 pt-3">
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-100 hover:bg-white/10 hover:text-white transition-colors text-left">
            <LogOut className="w-4 h-4 shrink-0" /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Mobile ── */}
      <div className="md:hidden flex-1 flex flex-col print:hidden">
        <header className="bg-[#6b1a2a] text-white px-4 py-3 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#c9a84c] flex items-center justify-center text-[#6b1a2a] font-bold text-xs shrink-0">SM</div>
            <span className="text-sm font-semibold">{pageTitle(pathname) || "Sri Alankar Mandir"}</span>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="text-red-200 hover:text-white">
            <LogOut className="w-4 h-4" />
          </button>
        </header>

        <main className="flex-1 p-4 pb-24">{children}</main>

        {/* Bottom tab bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 flex print:hidden">
          {NAV.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-[10px] font-medium transition-colors",
                isActive(href, exact) ? "text-[#6b1a2a]" : "text-gray-400"
              )}
            >
              <Icon className="w-5 h-5" />
              {label === "Add Product" ? "Add" : label}
            </Link>
          ))}
        </nav>
      </div>

      {/* ── Desktop main ── */}
      <div className="hidden md:flex flex-1 flex-col min-w-0">
        <header className="h-14 border-b bg-white flex items-center px-6 gap-3 print:hidden shrink-0">
          <Gem className="w-4 h-4 text-[#c9a84c]" />
          <span className="text-sm font-medium text-muted-foreground">{pageTitle(pathname)}</span>
        </header>
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">{children}</main>
      </div>

    </div>
  );
}
