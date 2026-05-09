import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ articleNo: string }>;
}): Promise<Metadata> {
  const { articleNo } = await params;
  const product = await prisma.product.findUnique({ where: { articleNo } });
  return {
    title: product ? `${product.name} — Sri Alankar Mandir` : "Product Not Found",
    description: product
      ? `${product.name} · ${product.weightMg}Mg · ${product.karat} Gold · Article ${product.articleNo}`
      : undefined,
  };
}

export default async function ProductPublicPage({
  params,
}: {
  params: Promise<{ articleNo: string }>;
}) {
  const { articleNo } = await params;
  const product = await prisma.product.findUnique({ where: { articleNo } });
  if (!product) notFound();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #0d0608;
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
        }

        .page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: radial-gradient(ellipse at 50% 0%, #2a0d14 0%, #0d0608 60%);
          padding: 0 0 60px;
        }

        /* ── Top bar ── */
        .topbar {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px 24px 0;
          gap: 12px;
        }
        .topbar-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(to right, transparent, #c9a84c44);
          max-width: 80px;
        }
        .topbar-line.right {
          background: linear-gradient(to left, transparent, #c9a84c44);
        }
        .brand-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(201,168,76,0.08);
          border: 1px solid rgba(201,168,76,0.25);
          border-radius: 50px;
          padding: 8px 18px 8px 8px;
        }
        .brand-logo {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #c9a84c, #f0d080, #a07830);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Playfair Display', serif;
          font-weight: 700;
          font-size: 13px;
          color: #3a0a14;
          letter-spacing: -0.5px;
        }
        .brand-text { line-height: 1.2; }
        .brand-name {
          font-family: 'Playfair Display', serif;
          font-size: 13px;
          font-weight: 600;
          color: #f5e6c8;
          letter-spacing: 0.3px;
        }
        .brand-sub {
          font-size: 9px;
          color: #c9a84c;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        /* ── Hero image ── */
        .hero {
          width: 100%;
          max-width: 420px;
          margin: 28px auto 0;
          padding: 0 20px;
          position: relative;
        }
        .hero-glow {
          position: absolute;
          inset: 20px;
          background: radial-gradient(circle, rgba(201,168,76,0.15) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }
        .hero-frame {
          width: 100%;
          aspect-ratio: 1;
          background: radial-gradient(ellipse at 50% 30%, #1e1218, #0d0608);
          border: 1px solid rgba(201,168,76,0.2);
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 28px;
          position: relative;
          overflow: hidden;
        }
        .hero-frame::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(to right, transparent, #c9a84c88, transparent);
        }
        .hero-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: drop-shadow(0 8px 32px rgba(201,168,76,0.3));
          transition: transform 0.4s ease;
        }
        .hero-img:hover { transform: scale(1.04); }

        /* ── Corner decorations ── */
        .corner {
          position: absolute;
          width: 18px;
          height: 18px;
          opacity: 0.5;
        }
        .corner-tl { top: 12px; left: 12px; border-top: 1.5px solid #c9a84c; border-left: 1.5px solid #c9a84c; border-radius: 3px 0 0 0; }
        .corner-tr { top: 12px; right: 12px; border-top: 1.5px solid #c9a84c; border-right: 1.5px solid #c9a84c; border-radius: 0 3px 0 0; }
        .corner-bl { bottom: 12px; left: 12px; border-bottom: 1.5px solid #c9a84c; border-left: 1.5px solid #c9a84c; border-radius: 0 0 0 3px; }
        .corner-br { bottom: 12px; right: 12px; border-bottom: 1.5px solid #c9a84c; border-right: 1.5px solid #c9a84c; border-radius: 0 0 3px 0; }

        /* ── Info card ── */
        .card {
          width: 100%;
          max-width: 420px;
          margin: 20px auto 0;
          padding: 0 20px;
        }
        .card-inner {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          overflow: hidden;
          backdrop-filter: blur(12px);
        }

        /* Product name block */
        .name-block {
          padding: 24px 24px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          text-align: center;
        }
        .product-name {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 700;
          color: #f5e6c8;
          line-height: 1.3;
          letter-spacing: 0.2px;
        }
        .article-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 8px;
          background: rgba(201,168,76,0.1);
          border: 1px solid rgba(201,168,76,0.2);
          border-radius: 6px;
          padding: 4px 10px;
        }
        .article-dot {
          width: 5px; height: 5px;
          background: #c9a84c;
          border-radius: 50%;
        }
        .article-no {
          font-family: 'Inter', monospace;
          font-size: 11px;
          font-weight: 500;
          color: #c9a84c;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        /* Stats row */
        .stats {
          display: grid;
          grid-template-columns: 1fr 1px 1fr;
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .stat-divider {
          background: rgba(255,255,255,0.08);
          align-self: stretch;
        }
        .stat {
          text-align: center;
          padding: 0 8px;
        }
        .stat-label {
          font-size: 9px;
          font-weight: 500;
          color: rgba(255,255,255,0.35);
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .stat-value {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 700;
          color: #f5e6c8;
          line-height: 1;
        }
        .stat-unit {
          font-size: 11px;
          color: #c9a84c;
          font-weight: 400;
          font-family: 'Inter', sans-serif;
        }

        /* Purity badge */
        .purity-row {
          padding: 16px 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .purity-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, rgba(201,168,76,0.12), rgba(201,168,76,0.06));
          border: 1px solid rgba(201,168,76,0.3);
          border-radius: 10px;
          padding: 10px 20px;
          width: 100%;
          justify-content: center;
        }
        .purity-icon {
          font-size: 18px;
        }
        .purity-text {
          font-size: 12px;
          color: rgba(255,255,255,0.5);
          letter-spacing: 0.5px;
        }
        .purity-val {
          font-family: 'Playfair Display', serif;
          font-size: 16px;
          font-weight: 700;
          color: #c9a84c;
        }

        /* Footer contact */
        .contact-row {
          padding: 16px 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .contact-icon {
          font-size: 14px;
          opacity: 0.5;
        }
        .contact-text {
          font-size: 11px;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.3px;
        }

        /* ── Quality seal ── */
        .seal {
          width: 100%;
          max-width: 420px;
          margin: 16px auto 0;
          padding: 0 20px;
        }
        .seal-inner {
          background: rgba(201,168,76,0.05);
          border: 1px solid rgba(201,168,76,0.12);
          border-radius: 14px;
          padding: 14px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .seal-icon {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.05));
          border: 1px solid rgba(201,168,76,0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
        }
        .seal-text { flex: 1; }
        .seal-title {
          font-size: 11px;
          font-weight: 600;
          color: #c9a84c;
          letter-spacing: 0.5px;
        }
        .seal-desc {
          font-size: 10px;
          color: rgba(255,255,255,0.3);
          margin-top: 2px;
          line-height: 1.4;
        }

        /* ── Gold shimmer animation on name ── */
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .shimmer-text {
          background: linear-gradient(90deg, #f5e6c8 30%, #c9a84c 50%, #f5e6c8 70%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
      `}</style>

      <div className="page">
        {/* Top brand bar */}
        <div className="topbar">
          <div className="topbar-line"></div>
          <div className="brand-pill">
            <div className="brand-logo">SM</div>
            <div className="brand-text">
              <div className="brand-name">Sri Alankar Mandir</div>
              <div className="brand-sub">Fine Jewellery · Est. 1963</div>
            </div>
          </div>
          <div className="topbar-line right"></div>
        </div>

        {/* Hero image */}
        <div className="hero">
          <div className="hero-glow"></div>
          <div className="hero-frame">
            <div className="corner corner-tl"></div>
            <div className="corner corner-tr"></div>
            <div className="corner corner-bl"></div>
            <div className="corner corner-br"></div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.photoUrl}
              alt={product.name}
              className="hero-img"
            />
          </div>
        </div>

        {/* Info card */}
        <div className="card">
          <div className="card-inner">

            {/* Name + article */}
            <div className="name-block">
              <div className="product-name shimmer-text">{product.name}</div>
              <div className="article-badge">
                <div className="article-dot"></div>
                <span className="article-no">{product.articleNo}</span>
              </div>
            </div>

            {/* Weight + Karat stats */}
            <div className="stats">
              <div className="stat">
                <div className="stat-label">Weight</div>
                <div className="stat-value">
                  {product.weightMg}
                  <span className="stat-unit"> mg</span>
                </div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat">
                <div className="stat-label">Purity</div>
                <div className="stat-value">
                  {product.karat.replace("K", "")}
                  <span className="stat-unit"> kt</span>
                </div>
              </div>
            </div>

            {/* Gold purity badge */}
            <div className="purity-row">
              <div className="purity-badge">
                <span className="purity-icon">✦</span>
                <span className="purity-text">Certified</span>
                <span className="purity-val">{product.karat} Gold</span>
                <span className="purity-text">· Hallmarked</span>
              </div>
            </div>

            {/* Contact */}
            <div className="contact-row">
              <span className="contact-icon">✉</span>
              <span className="contact-text">srialankarmandir.muz@gmail.com</span>
            </div>
          </div>
        </div>

        {/* Quality seal */}
        <div className="seal">
          <div className="seal-inner">
            <div className="seal-icon">🛡️</div>
            <div className="seal-text">
              <div className="seal-title">Quality Guaranteed</div>
              <div className="seal-desc">Packed after rigid quality check on weight, purity & workmanship</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
