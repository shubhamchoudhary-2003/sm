"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-[#6b1a2a] text-white px-8 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#5a1522] transition flex items-center gap-2"
    >
      🖨️ Print Card
    </button>
  );
}
