interface CardPreviewProps {
  articleNo: string;
  name: string;
  weightMg: number;
  karat: string;
  photoUrl: string;
  qrSvg: string;
}

export default function CardPreview({
  articleNo,
  name,
  weightMg,
  karat,
  photoUrl,
  qrSvg,
}: CardPreviewProps) {
  return (
    <div
      id="card-print-zone"
      style={{
        width: "54mm",
        height: "65mm",
        backgroundColor: "#ffffff",
        padding: "4mm",
        boxSizing: "border-box",
        fontFamily: "Georgia, serif",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        overflow: "hidden",
      }}
    >
      {/* Top info block */}
      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: "3mm" }}>
          <div style={{ fontSize: "6pt", color: "#555", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.5pt" }}>
            Article No.
          </div>
          <div style={{ fontSize: "9pt", fontWeight: "bold", color: "#1a1a1a", letterSpacing: "0.3pt" }}>
            {articleNo}
          </div>
        </div>

        <div style={{ marginBottom: "3mm" }}>
          <div style={{ fontSize: "6pt", color: "#555", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.5pt" }}>
            Name
          </div>
          <div style={{ fontSize: "8pt", fontWeight: "bold", color: "#1a1a1a", lineHeight: "1.3" }}>
            {name}
          </div>
        </div>

        <div>
          <div style={{ fontSize: "6pt", color: "#555", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.5pt" }}>
            Weight &amp; Karat
          </div>
          <div style={{ fontSize: "8pt", fontWeight: "bold", color: "#1a1a1a" }}>
            {weightMg}Mg - {karat}
          </div>
        </div>
      </div>

      {/* Bottom: photo + QR */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "3mm" }}>
        {/* Product photo */}
        <div
          style={{
            width: "22mm",
            height: "22mm",
            border: "0.3mm solid #e5e5e5",
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
          <img
            src={photoUrl}
            alt="product"
            style={{ width: "100%", height: "100%", objectFit: "contain", padding: "1mm" }}
          />
        </div>

        {/* QR code */}
        <div
          style={{
            width: "22mm",
            height: "22mm",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          dangerouslySetInnerHTML={{ __html: qrSvg }}
        />
      </div>
    </div>
  );
}
