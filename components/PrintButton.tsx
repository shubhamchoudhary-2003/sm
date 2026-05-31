"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="w-full h-12 rounded-xl bg-[#6b1a2a] hover:bg-[#5a1522] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
    >
      <Printer className="w-4 h-4" />
      Print Card
    </button>
  );
}
