interface CardPreviewProps {
  articleNo: string;
  name: string;
  weightMg: number;
  karat: string;
  photoUrl: string;
  qrSvg: string;
}

function formatWeight(mg: number): string {
  if (mg >= 1000) {
    const g = mg / 1000;
    return `${g % 1 === 0 ? g.toFixed(0) : g.toFixed(3).replace(/\.?0+$/, "")}g`;
  }
  return `${mg % 1 === 0 ? mg : mg}mg`;
}

export default function CardPreview({ articleNo, name, weightMg, karat, photoUrl, qrSvg }: CardPreviewProps) {
  return (
    <div
      id="card-print-zone"
      style={{
        width: "54mm",
        height: "65mm",
        backgroundColor: "#ffffff",
        padding: "3.5mm",
        boxSizing: "border-box",
        fontFamily: "Georgia, 'Times New Roman', serif",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        overflow: "hidden",
      }}
    >
      {/* Top info block */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        <div style={{ marginBottom: "2.5mm" }}>
          <div style={{ fontSize: "5.5pt", color: "#666", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.6pt", fontFamily: "Arial, sans-serif" }}>
            Article No.
          </div>
          <div style={{ fontSize: "9pt", fontWeight: "bold", color: "#111", letterSpacing: "0.2pt", lineHeight: 1.2 }}>
            {articleNo}
          </div>
        </div>

        <div style={{ marginBottom: "2.5mm" }}>
          <div style={{ fontSize: "5.5pt", color: "#666", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.6pt", fontFamily: "Arial, sans-serif" }}>
            Name
          </div>
          <div style={{ fontSize: "8pt", fontWeight: "bold", color: "#111", lineHeight: 1.25 }}>
            {name}
          </div>
        </div>

        <div>
          <div style={{ fontSize: "5.5pt", color: "#666", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.6pt", fontFamily: "Arial, sans-serif" }}>
            Weight &amp; Karat
          </div>
          <div style={{ fontSize: "8pt", fontWeight: "bold", color: "#111" }}>
            {formatWeight(weightMg)} – {karat}
          </div>
        </div>
      </div>

      {/* Bottom: photo + QR */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "2mm" }}>
        <div
          style={{
            width: "23mm",
            height: "23mm",
            border: "0.3mm solid #e0e0e0",
            borderRadius: "1mm",
            overflow: "hidden",
            backgroundColor: "#fafafa",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photoUrl} alt="product" style={{ width: "100%", height: "100%", objectFit: "contain", padding: "1mm" }} />
        </div>

        <div
          style={{ width: "23mm", height: "23mm", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
          dangerouslySetInnerHTML={{ __html: qrSvg }}
        />
      </div>
    </div>
  );
}
