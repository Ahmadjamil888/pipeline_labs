"use client";
import { useState, useEffect, useRef } from "react";

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
type Theme = "dark" | "light";

/* ─────────────────────────────────────────────
   GLOBAL STYLES (injected once)
───────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.cdnfonts.com/css/helvetica-neue-9');
  @import url('https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }

  body {
    font-family: 'HelveticaWorld', 'Helvetica Neue', 'Helvetica', Arial, sans-serif !important;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }

  /* Dark tokens */
  [data-theme="dark"] {
    --bg:      #0a0a0a;
    --bg2:     #111111;
    --bg3:     #1a1a1a;
    --bg4:     #222222;
    --border:  rgba(255,255,255,0.07);
    --border2: rgba(255,255,255,0.14);
    --text:    #f5f5f5;
    --text2:   rgba(245,245,245,0.52);
    --text3:   rgba(245,245,245,0.28);
    --card:    #111111;
    --nav-bg:  rgba(10,10,10,0.82);
    --shadow:  0 32px 80px rgba(0,0,0,0.7);
  }

  /* Light tokens */
  [data-theme="light"] {
    --bg:      #ffffff;
    --bg2:     #f8f8f8;
    --bg3:     #f0f0f0;
    --bg4:     #e5e5e5;
    --border:  rgba(0,0,0,0.07);
    --border2: rgba(0,0,0,0.14);
    --text:    #0a0a0a;
    --text2:   rgba(10,10,10,0.52);
    --text3:   rgba(10,10,10,0.32);
    --card:    #ffffff;
    --nav-bg:  rgba(255,255,255,0.88);
    --shadow:  0 32px 80px rgba(0,0,0,0.08);
  }

  /* Marquee keyframes */
  @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
  @keyframes blink   { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
  @keyframes spin    { to { transform: rotate(360deg); } }
  @keyframes fadeUp  {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes cursor-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

  .marquee-track { animation: marquee 32s linear infinite; }
  .marquee-section:hover .marquee-track { animation-play-state: paused; }
  .blink-cur { animation: blink 1s step-end infinite; }
  .spin { animation: spin 0.8s linear infinite; }
  .fade-up { animation: fadeUp 0.7s ease both; }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 3px; }

  /* FAQ transition */
  .faq-answer {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.32s ease, padding 0.32s ease;
  }
  .faq-answer.open {
    max-height: 300px;
  }

  /* Code editor styles */
  .code-editor-textarea {
    caret-color: #fff;
    resize: none;
    outline: none;
    border: none;
    background: transparent;
    color: transparent;
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    width: 100%;
    height: 100%;
    padding: 20px 24px;
    font-family: 'Source Code Pro', 'Fira Code', 'Consolas', monospace;
    font-size: 13px;
    line-height: 1.75;
    letter-spacing: 0.01em;
    z-index: 2;
    white-space: pre;
    overflow: auto;
  }
  .code-highlight {
    position: absolute;
    top: 0; left: 0;
    width: 100%;
    padding: 20px 24px;
    font-family: 'Source Code Pro', 'Fira Code', 'Consolas', monospace;
    font-size: 13px;
    line-height: 1.75;
    letter-spacing: 0.01em;
    pointer-events: none;
    white-space: pre;
    z-index: 1;
  }
`;

function GlobalStyle() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = GLOBAL_CSS;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);
  return null;
}

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
const T = {
  font: "'HelveticaWorld', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  mono: "'Source Code Pro', 'Fira Code', 'Consolas', monospace",
  pill: "9999px",
};

/* ─────────────────────────────────────────────
   SMALL REUSABLE COMPONENTS
───────────────────────────────────────────── */
function Divider({ style }: { style?: React.CSSProperties }) {
  return (
    <div style={{
      height: 1,
      background: "linear-gradient(to right, transparent, var(--border2), transparent)",
      opacity: 0.6,
      maxWidth: 560,
      margin: "0 auto",
      ...style,
    }} />
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      fontSize: 11, fontWeight: 600, letterSpacing: "0.1em",
      textTransform: "uppercase", color: "var(--text3)",
      marginBottom: 14, fontFamily: T.font,
    }}>
      {children}
    </div>
  );
}

function SectionTitle({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <h2 style={{
      fontSize: "clamp(28px, 3.6vw, 44px)",
      fontWeight: 300,
      letterSpacing: "-0.04em",
      lineHeight: 1.1,
      color: "var(--text)",
      marginBottom: 14,
      fontFamily: T.font,
      ...style,
    }}>
      {children}
    </h2>
  );
}

function SubText({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <p style={{
      fontSize: 15.5, color: "var(--text2)", lineHeight: 1.68,
      maxWidth: 520, fontFamily: T.font, fontWeight: 400, ...style,
    }}>
      {children}
    </p>
  );
}

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li style={{
      display: "flex", alignItems: "flex-start", gap: 10,
      fontSize: 13, color: "var(--text2)", lineHeight: 1.45,
      fontFamily: T.font,
    }}>
      <span style={{
        width: 17, height: 17, borderRadius: "50%",
        border: "1px solid var(--border2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, marginTop: 1,
      }}>
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="var(--text2)" strokeWidth="3">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
      {children}
    </li>
  );
}

/* ─────────────────────────────────────────────
   LOGO COMPONENT
───────────────────────────────────────────── */
function Logo({ theme, height = 28, fallbackId = "nav-logo-fb" }: { theme: Theme; height?: number; fallbackId?: string }) {
  const src = theme === "dark" ? "https://github.com/Ahmadjamil888/pipeline_labs/blob/main/public/logo-dark.png" : "https://github.com/Ahmadjamil888/pipeline_labs/blob/main/public/logo-light.png";
  return (
    <>
      <img
        src={src}
        alt="Pipeline Labs"
        style={{ height, objectFit: "contain", display: "block" }}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
          const fb = document.getElementById(fallbackId);
          if (fb) fb.style.display = "flex";
        }}
      />
      <span id={fallbackId} style={{
        display: "none", alignItems: "center", gap: 7,
        fontSize: 15, fontWeight: 700, letterSpacing: "-0.3px",
        color: "var(--text)", fontFamily: T.font,
      }}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect x="1" y="1" width="9" height="9" rx="2" fill="var(--text)" />
          <rect x="12" y="1" width="9" height="9" rx="2" fill="var(--text)" opacity="0.5" />
          <rect x="1" y="12" width="9" height="9" rx="2" fill="var(--text)" opacity="0.3" />
          <rect x="12" y="12" width="9" height="9" rx="2" fill="var(--text)" opacity="0.7" />
        </svg>
        Pipeline Labs
      </span>
    </>
  );
}

/* ─────────────────────────────────────────────
   NAV
───────────────────────────────────────────── */
function Nav({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const navLinks = [
    { label: "Product", href: "#product" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "Documentation", href: "https://pipeline.stldocs.app" },
  ];

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
      height: 56,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 36px",
      background: "var(--nav-bg)",
      backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      borderBottom: `1px solid ${scrolled ? "var(--border2)" : "var(--border)"}`,
      transition: "border-color 0.2s",
      fontFamily: T.font,
    }}>
      {/* Logo */}
      <a href="#" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
        <Logo theme={theme} height={28} fallbackId="nav-logo-fb" />
      </a>

      {/* Center links */}
      <ul style={{
        position: "absolute", left: "50%", transform: "translateX(-50%)",
        display: "flex", gap: 30, listStyle: "none", fontFamily: T.font,
      }}>
        {navLinks.map((l) => (
          <li key={l.label}>
            <a
              href={l.href}
              target={l.href.startsWith("http") ? "_blank" : undefined}
              rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
              style={{
                fontSize: 13.5, fontWeight: 400, color: "var(--text2)",
                textDecoration: "none", letterSpacing: "-0.01em",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text2)")}
            >{l.label}</a>
          </li>
        ))}
      </ul>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Theme toggle */}
        <button
          onClick={onToggle}
          aria-label="Toggle theme"
          style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "transparent", border: "1px solid var(--border2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "var(--text2)", transition: "background 0.2s",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--bg3)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
        >
          {theme === "dark" ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          )}
        </button>

        <a href="/login" style={{
          fontSize: 13, color: "var(--text2)", background: "none",
          border: "none", padding: "6px 12px", cursor: "pointer",
          fontFamily: T.font, fontWeight: 400, textDecoration: "none",
        }}>Sign in</a>

        <a href="/contact" style={{
          fontSize: 13, fontWeight: 500, color: "var(--text)",
          background: "transparent", border: "1px solid var(--border2)",
          borderRadius: T.pill, padding: "6px 16px", cursor: "pointer",
          fontFamily: T.font, transition: "background 0.15s", textDecoration: "none",
        }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "var(--bg3)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "transparent")}
        >Contact sales</a>

        <a href="/dashboard" style={{
          fontSize: 13, fontWeight: 500, color: "var(--bg)",
          background: "var(--text)", border: "none",
          borderRadius: T.pill, padding: "7px 20px", cursor: "pointer",
          fontFamily: T.font, transition: "opacity 0.15s", textDecoration: "none",
        }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = "0.78")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = "1")}
        >Get started</a>
      </div>
    </nav>
  );
}

/* ─────────────────────────────────────────────
   HERO
───────────────────────────────────────────── */
function Hero() {
  return (
    <div style={{ paddingTop: 56 }}>
      {/* Text */}
      <div style={{ padding: "108px 44px 0", maxWidth: 1400 }}>
        <h1 style={{
          fontSize: "clamp(36px, 4vw, 52px)",
          fontWeight: 300,
          letterSpacing: "-0.045em",
          lineHeight: 1.15,
          color: "var(--text)",
          maxWidth: 680,
          marginBottom: 32,
          fontFamily: T.font,
        }}>
          Built to automate your entire DevOps,<br />
          Pipeline Labs is the best way to ship with AI.
        </h1>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 60 }}>
          <a href="/dashboard" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "var(--text)", color: "var(--bg)",
            fontSize: 14, fontWeight: 500, letterSpacing: "-0.01em",
            borderRadius: T.pill, padding: "11px 24px",
            border: "none", cursor: "pointer", textDecoration: "none",
            fontFamily: T.font, transition: "opacity 0.15s",
          }}>Start free trial ↓</a>
          <a href="#how-it-works" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "transparent", color: "var(--text)",
            fontSize: 14, fontWeight: 500,
            borderRadius: T.pill, padding: "11px 24px",
            border: "1px solid var(--border2)", cursor: "pointer", textDecoration: "none",
            fontFamily: T.font, transition: "background 0.15s",
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Watch demo
          </a>
        </div>
      </div>

      {/* App shell */}
      <div style={{ padding: "0 20px" }}>
        <div style={{
          background: "linear-gradient(145deg,#c8b89a 0%,#b0a088 30%,#907868 60%,#706050 100%)",
          borderRadius: "14px 14px 0 0", padding: "18px 18px 0", overflow: "hidden",
        }}>
          <div style={{
            background: "#1a1a1a", borderRadius: "10px 10px 0 0",
            overflow: "hidden", minHeight: 260,
            boxShadow: "0 24px 60px rgba(0,0,0,.7),0 0 0 1px rgba(255,255,255,.05)",
          }}>
            {/* Titlebar */}
            <div style={{
              background: "#252525", height: 36,
              display: "flex", alignItems: "center", padding: "0 14px",
              borderBottom: "1px solid rgba(255,255,255,.06)", position: "relative",
            }}>
              <div style={{ display: "flex", gap: 6 }}>
                {["#ff5f57","#febc2e","#28c840"].map((c,i) => (
                  <div key={i} style={{ width: 11, height: 11, borderRadius: "50%", background: c }} />
                ))}
              </div>
              <span style={{
                position: "absolute", left: "50%", transform: "translateX(-50%)",
                fontSize: 12, color: "rgba(255,255,255,.4)", fontFamily: T.font,
              }}>Pipeline Labs</span>
            </div>

            {/* 3 columns */}
            <div style={{ display: "grid", gridTemplateColumns: "260px 1fr 1fr" }}>
              {/* Left */}
              <div style={{ background: "#202020", borderRight: "1px solid rgba(255,255,255,.06)", padding: "12px 0" }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "rgba(255,255,255,.3)", padding: "0 13px 7px", fontFamily: T.font }}>Deploying 2</div>
                <div style={{ padding: "7px 13px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,.8)", marginBottom: 2, fontFamily: T.font }}>
                    <div className="spin" style={{ width: 10, height: 10, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,.2)", borderTopColor: "#fff", flexShrink: 0 }} />
                    auth-service → prod
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", paddingLeft: 16, fontFamily: T.font }}>Canary at 15%…</div>
                </div>
                <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "rgba(255,255,255,.3)", padding: "10px 13px 7px", fontFamily: T.font }}>Ready for review 4</div>
                <div style={{ padding: "7px 13px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,.8)", marginBottom: 2, fontFamily: T.font }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,.28)", flexShrink: 0, position: "relative" }}>
                      <div style={{ position: "absolute", top: 1.5, left: 2.5, width: 5, height: 3, borderLeft: "1.5px solid rgba(255,255,255,.5)", borderBottom: "1.5px solid rgba(255,255,255,.5)", transform: "rotate(-45deg)" }} />
                    </div>
                    api-gateway v3.1
                    <span style={{ fontSize: 10.5, color: "rgba(255,255,255,.25)", marginLeft: "auto", fontFamily: T.font }}>now</span>
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", paddingLeft: 16, fontFamily: T.font }}>Done. Zero downtime achieved.</div>
                </div>
              </div>

              {/* Mid */}
              <div style={{ background: "#1a1a1a", borderRight: "1px solid rgba(255,255,255,.06)", display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "12px 15px 10px", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.82)", borderBottom: "1px solid rgba(255,255,255,.06)", fontFamily: T.font }}>Manage Production Deploy</div>
                <div style={{ margin: "12px 14px", background: "#2a2a2a", borderRadius: 7, padding: "11px 13px", fontSize: 12.5, color: "rgba(255,255,255,.72)", lineHeight: 1.5, border: "1px solid rgba(255,255,255,.06)", fontFamily: T.font }}>
                  let's deploy the new payment service to production with canary rollout and auto-rollback on p99 &gt; 200ms
                </div>
                <div style={{ padding: "2px 14px", display: "flex", flexDirection: "column", gap: 5 }}>
                  {[["Thought","6s",""],["Read","deployment.yaml","#7cb8f0"],["Checked","p99 latency baseline",""]].map(([k,v,c],i) => (
                    <div key={i} style={{ fontSize: 11.5, color: "rgba(255,255,255,.35)", display: "flex", gap: 8, fontFamily: T.font }}>
                      <span style={{ color: "rgba(255,255,255,.22)" }}>{k}</span>
                      <span style={{ color: c || "inherit" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right */}
              <div style={{ background: "#1a1a1a", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", height: 36, padding: "0 4px", gap: 2, borderBottom: "1px solid rgba(255,255,255,.06)" }}>
                  {[["deployment.yaml", true],["metrics.ts", false]].map(([label,active],i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 5, fontSize: 12, color: active ? "rgba(255,255,255,.82)" : "rgba(255,255,255,.38)", background: active ? "rgba(255,255,255,.07)" : "transparent", fontFamily: T.font }}>
                      {label as string}
                      {active && <span style={{ fontSize: 9, color: "rgba(255,255,255,.22)" }}>✕</span>}
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 13px", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
                  <div style={{ fontSize: 11.5, color: "rgba(255,255,255,.35)", display: "flex", gap: 4, fontFamily: T.font }}>
                    <span>Pipelines</span><span style={{ color: "rgba(255,255,255,.18)" }}>›</span><span style={{ color: "rgba(255,255,255,.62)" }}>deployment.yaml</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(255,255,255,.38)", fontFamily: T.font }}>
                    Agent 1 ∨
                    <button style={{ background: "#e0e0e0", color: "#0a0a0a", border: "none", borderRadius: 4, padding: "3px 11px", fontSize: 11.5, fontWeight: 700, cursor: "pointer", fontFamily: T.font }}>Deploy</button>
                  </div>
                </div>
                <div style={{ padding: "16px 18px" }}>
                  <div style={{ fontSize: 19, fontWeight: 700, color: "#fff", marginBottom: 8, letterSpacing: "-0.3px", fontFamily: T.font }}>Payment Service Rollout</div>
                  <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.48)", lineHeight: 1.6, maxWidth: 400, fontFamily: T.font }}>Canary deployment to us-east-1 with automated rollback on latency or error-rate thresholds.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MARQUEE
───────────────────────────────────────────── */
const MARQUEE_ITEMS = [
  "AWS","Kubernetes","GitHub Actions","Terraform","Google Cloud",
  "Datadog","Azure","Docker","Prometheus","Vercel","Fly.io","ArgoCD",
];

function Marquee() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="marquee-section" style={{
      overflow: "hidden",
      borderTop: "1px solid var(--border)",
      borderBottom: "1px solid var(--border)",
      background: "var(--bg2)",
      padding: "18px 0",
      position: "relative",
    }}>
      <div style={{
        position: "absolute", top: 0, bottom: 0, left: 0, width: 160, zIndex: 2,
        background: "linear-gradient(to right, var(--bg2), transparent)", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", top: 0, bottom: 0, right: 0, width: 160, zIndex: 2,
        background: "linear-gradient(to left, var(--bg2), transparent)", pointerEvents: "none",
      }} />
      <div className="marquee-track" style={{ display: "flex", width: "max-content" }}>
        {items.map((label, i) => (
          <span key={i} style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "0 28px", fontSize: 12, fontWeight: 500,
            letterSpacing: "0.06em", textTransform: "uppercase",
            color: "var(--text3)", whiteSpace: "nowrap", fontFamily: T.font,
          }}>
            {label}
            <span style={{ width: 3, height: 3, background: "var(--text3)", borderRadius: "50%", opacity: 0.4, flexShrink: 0 }} />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   VIDEO SECTION
───────────────────────────────────────────── */
function VideoSection() {
  return (
    <section id="how-it-works" style={{
      padding: "96px 44px",
      background: "var(--bg)",
      borderBottom: "1px solid var(--border)",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 48 }}>
          <Eyebrow>How Pipeline Labs works</Eyebrow>
          <SectionTitle>See the AI take over your pipeline</SectionTitle>
          <SubText>From the first git push to full production — watch every step happen automatically, in real time.</SubText>
        </div>

        <div style={{
          width: "100%",
          aspectRatio: "16 / 9",
          borderRadius: 18,
          overflow: "hidden",
          border: "1px solid var(--border2)",
          boxShadow: "var(--shadow)",
          background: "var(--bg3)",
          position: "relative",
        }}>
          <video
            autoPlay muted loop playsInline
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          >
            <source src="https://github.com/Ahmadjamil888/pipeline_labs/blob/main/public/hero-bg-video.mp4" type="video/mp4" />
          </video>
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, transparent 70%, var(--bg) 100%)",
            pointerEvents: "none",
          }} />
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   HOW IT WORKS — 3 steps
───────────────────────────────────────────── */
const STEPS = [
  {
    n: "01", title: "Connect your repos",
    body: "Link GitHub, GitLab, or Bitbucket in seconds. Pipeline Labs learns your deployment topology automatically.",
  },
  {
    n: "02", title: "AI maps your infra",
    body: "Our agent models your cloud resources, pipelines, and SLOs — building a live graph of everything.",
  },
  {
    n: "03", title: "Ship & self-heal",
    body: "Every deploy is canary-gated and rolled out by AI. Anomalies trigger instant remediation.",
  },
];

function HowItWorks() {
  return (
    <section style={{ padding: "96px 44px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 52 }}>
        <Eyebrow>Process</Eyebrow>
        <SectionTitle style={{ margin: "0 auto 12px" }}>From push to production, fully autonomous</SectionTitle>
      </div>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
        gap: 1, background: "var(--border)", borderRadius: 14, overflow: "hidden",
      }}>
        {STEPS.map((s) => (
          <div key={s.n} style={{ background: "var(--card)", padding: "36px 32px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text3)", marginBottom: 18, fontFamily: T.font }}>Step {s.n}</div>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              border: "1px solid var(--border2)",
              display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18,
            }}>
              <span style={{ fontSize: 16, color: "var(--text2)", fontFamily: T.font }}>{s.n}</span>
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 500, letterSpacing: "-0.3px", color: "var(--text)", marginBottom: 9, fontFamily: T.font }}>{s.title}</h3>
            <p style={{ fontSize: 13.5, color: "var(--text2)", lineHeight: 1.6, fontFamily: T.font }}>{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   SDK CODE EDITOR SECTION
───────────────────────────────────────────── */

const DEFAULT_CODE = `from pipeline_labs import Pipeline

# Initialize with your API key
client = Pipeline(PIPELINE_API_KEY="your_api_key")

# List your deployments
deployments = client.deployments.list()
for deployment in deployments.deployments:
    print(f"{deployment.id}: {deployment.status}")

# Trigger a new deployment
deploy = client.deployments.create(
    service="auth-service",
    environment="production",
    strategy="canary",
    canary_percentage=15,
    rollback_on={
        "p99_latency_ms": 200,
        "error_rate_percent": 1.5,
    }
)
print(f"Deploy started: {deploy.id}")

# Monitor deployment health
health = client.deployments.health(deploy.id)
print(f"Status: {health.status} | P99: {health.p99_ms}ms")`;

type Token = { type: string; value: string };

function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  const lines = code.split("\n");
  const keywords = ["from","import","for","in","print","if","else","return","def","class","True","False","None","with","as","try","except","finally","raise","and","or","not","is","lambda","yield","global","nonlocal","del","pass","break","continue","while","assert"];
  const builtins = ["Pipeline","list","create","health","str","int","float","bool","len","range","type","dict","set","tuple"];

  for (let li = 0; li < lines.length; li++) {
    if (li > 0) tokens.push({ type: "newline", value: "\n" });
    const line = lines[li];
    let i = 0;

    while (i < line.length) {
      // Comment
      if (line[i] === "#") {
        tokens.push({ type: "comment", value: line.slice(i) });
        i = line.length;
        continue;
      }
      // String
      if (line[i] === '"' || line[i] === "'") {
        const q = line[i];
        let j = i + 1;
        while (j < line.length && line[j] !== q) j++;
        tokens.push({ type: "string", value: line.slice(i, j + 1) });
        i = j + 1;
        continue;
      }
      // f-string
      if (line[i] === "f" && (line[i+1] === '"' || line[i+1] === "'")) {
        const q = line[i+1];
        let j = i + 2;
        while (j < line.length && line[j] !== q) j++;
        tokens.push({ type: "string", value: line.slice(i, j + 1) });
        i = j + 1;
        continue;
      }
      // Number
      if (/[0-9]/.test(line[i])) {
        let j = i;
        while (j < line.length && /[0-9.]/.test(line[j])) j++;
        tokens.push({ type: "number", value: line.slice(i, j) });
        i = j;
        continue;
      }
      // Identifier/keyword
      if (/[a-zA-Z_]/.test(line[i])) {
        let j = i;
        while (j < line.length && /[a-zA-Z0-9_]/.test(line[j])) j++;
        const word = line.slice(i, j);
        if (keywords.includes(word)) tokens.push({ type: "keyword", value: word });
        else if (builtins.includes(word)) tokens.push({ type: "builtin", value: word });
        else tokens.push({ type: "ident", value: word });
        i = j;
        continue;
      }
      // Operator
      if (/[=<>!+\-*\/|&^%~@]/.test(line[i])) {
        tokens.push({ type: "operator", value: line[i] });
        i++;
        continue;
      }
      // Punctuation
      if (/[()[\]{},.:;]/.test(line[i])) {
        tokens.push({ type: "punct", value: line[i] });
        i++;
        continue;
      }
      // Space
      if (line[i] === " ") {
        let j = i;
        while (j < line.length && line[j] === " ") j++;
        tokens.push({ type: "space", value: line.slice(i, j) });
        i = j;
        continue;
      }
      tokens.push({ type: "other", value: line[i] });
      i++;
    }
  }
  return tokens;
}

const TOKEN_COLORS: Record<string, string> = {
  keyword:  "#c792ea",
  builtin:  "#82aaff",
  string:   "#c3e88d",
  comment:  "#546e7a",
  number:   "#f78c6c",
  operator: "#89ddff",
  punct:    "#89ddff",
  ident:    "#eeffff",
  space:    "inherit",
  newline:  "inherit",
  other:    "#eeffff",
};

function CodeHighlight({ code }: { code: string }) {
  const tokens = tokenize(code);
  return (
    <span className="code-highlight" style={{ color: "#eeffff" }}>
      {tokens.map((tok, i) => {
        if (tok.type === "newline") return "\n";
        if (tok.type === "space") return tok.value;
        return (
          <span key={i} style={{ color: TOKEN_COLORS[tok.type] || "#eeffff" }}>
            {tok.value}
          </span>
        );
      })}
    </span>
  );
}

const OUTPUT_LINES = [
  { delay: 0,    text: "$ python deploy.py", color: "#a3a3a3" },
  { delay: 600,  text: "  Connecting to Pipeline Labs...", color: "#546e7a" },
  { delay: 1200, text: "  ✓ Authenticated as workspace/acme-corp", color: "#c3e88d" },
  { delay: 1800, text: "", color: "" },
  { delay: 2100, text: "  deploy-a1b2c3: running", color: "#a3a3a3" },
  { delay: 2200, text: "  deploy-d4e5f6: succeeded", color: "#a3a3a3" },
  { delay: 2300, text: "  deploy-g7h8i9: pending", color: "#a3a3a3" },
  { delay: 2400, text: "", color: "" },
  { delay: 2700, text: "  Deploy started: deploy-x9y8z7", color: "#82aaff" },
  { delay: 3200, text: "  Status: running | P99: 38ms", color: "#c3e88d" },
];

function SDKSection() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [outputVisible, setOutputVisible] = useState<number[]>([]);
  const [running, setRunning] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  const syncScroll = () => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const runCode = () => {
    setRunning(true);
    setOutputVisible([]);
    OUTPUT_LINES.forEach((line, i) => {
      setTimeout(() => {
        setOutputVisible((prev) => [...prev, i]);
        if (i === OUTPUT_LINES.length - 1) setRunning(false);
      }, line.delay);
    });
  };

  const lineCount = code.split("\n").length;

  return (
    <section style={{
      padding: "96px 0",
      borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)",
      background: "var(--bg2)",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 44px" }}>
        {/* Header */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "flex-start", marginBottom: 44 }}>
          <div>
            <Eyebrow>SDK</Eyebrow>
            <SectionTitle>Integrate in minutes,<br />deploy in seconds</SectionTitle>
            <SubText style={{ marginBottom: 28 }}>
              Pipeline Labs ships a first-class Python SDK. Authenticate once, then programmatically manage deployments, health checks, and rollbacks — all from your own scripts or CI.
            </SubText>
            <div style={{ display: "flex", gap: 10 }}>
              <a
                href="https://pipeline.stldocs.app"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "var(--text)", color: "var(--bg)",
                  fontSize: 13.5, fontWeight: 500, borderRadius: T.pill, padding: "10px 22px",
                  textDecoration: "none", fontFamily: T.font,
                }}
              >View SDK docs →</a>
              <a href="/dashboard" style={{
                display: "inline-flex", alignItems: "center",
                background: "transparent", color: "var(--text)",
                fontSize: 13.5, fontWeight: 500, borderRadius: T.pill, padding: "10px 22px",
                border: "1px solid var(--border2)", textDecoration: "none", fontFamily: T.font,
              }}>Get API key</a>
            </div>
          </div>

          {/* Install pill */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{
              background: "#0c0c0c", borderRadius: 10,
              border: "1px solid rgba(255,255,255,.09)",
              padding: "12px 18px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span style={{ fontFamily: T.mono, fontSize: 13, color: "#c3e88d" }}>pip install pipeline-labs</span>
              <button
                onClick={() => navigator.clipboard?.writeText("pip install pipeline-labs")}
                style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.3)", padding: 4 }}
                title="Copy"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </button>
            </div>
            <div style={{ fontSize: 12, color: "var(--text3)", fontFamily: T.font, paddingLeft: 4 }}>
              Requires Python 3.9+ · MIT License · 2.1k stars on GitHub
            </div>
          </div>
        </div>

        {/* Editor + Output */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          borderRadius: 14, overflow: "hidden",
          border: "1px solid rgba(255,255,255,.08)",
          boxShadow: "0 40px 80px rgba(0,0,0,.55)",
        }}>
          {/* ── Editor pane ── */}
          <div style={{ background: "#1e1e2e", display: "flex", flexDirection: "column", borderRight: "1px solid rgba(255,255,255,.07)" }}>
            {/* Titlebar */}
            <div style={{
              background: "#181825", display: "flex", alignItems: "center",
              padding: "0 14px", height: 38,
              borderBottom: "1px solid rgba(255,255,255,.06)",
              gap: 8,
            }}>
              <div style={{ display: "flex", gap: 6 }}>
                {["#ff5f57","#febc2e","#28c840"].map((c,i) => (
                  <div key={i} style={{ width: 10.5, height: 10.5, borderRadius: "50%", background: c }} />
                ))}
              </div>
              <div style={{ display: "flex", gap: 2, marginLeft: 8 }}>
                {[["deploy.py", true]].map(([label, active], i) => (
                  <div key={i} style={{
                    padding: "4px 12px", borderRadius: "6px 6px 0 0",
                    background: active ? "#1e1e2e" : "transparent",
                    fontSize: 12, color: active ? "rgba(255,255,255,.82)" : "rgba(255,255,255,.38)",
                    fontFamily: T.mono,
                  }}>
                    {label as string}
                  </div>
                ))}
              </div>
              <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ fontSize: 10.5, color: "rgba(255,255,255,.28)", fontFamily: T.mono }}>Python</span>
              </div>
            </div>

            {/* Code area */}
            <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
              {/* Line numbers */}
              <div style={{
                width: 44, flexShrink: 0,
                background: "#1e1e2e",
                borderRight: "1px solid rgba(255,255,255,.04)",
                padding: "20px 0",
                userSelect: "none",
                display: "flex", flexDirection: "column", alignItems: "flex-end",
              }}>
                {Array.from({ length: lineCount }, (_, i) => (
                  <div key={i} style={{
                    height: "1.75em", lineHeight: "1.75",
                    fontSize: 12, color: "rgba(255,255,255,.2)",
                    paddingRight: 10, fontFamily: T.mono,
                    minWidth: 30, textAlign: "right",
                  }}>
                    {i + 1}
                  </div>
                ))}
              </div>

              {/* Editor */}
              <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
                <div
                  ref={highlightRef as any}
                  style={{
                    position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                    overflow: "auto", padding: "20px 24px",
                    fontFamily: T.mono, fontSize: 13, lineHeight: 1.75,
                    pointerEvents: "none", zIndex: 1,
                    color: "#eeffff",
                  }}
                >
                  <CodeHighlight code={code} />
                </div>
                <textarea
                  ref={textareaRef}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onScroll={syncScroll}
                  className="code-editor-textarea"
                  spellCheck={false}
                  style={{
                    position: "absolute", top: 0, left: 0,
                    width: "100%", height: "100%",
                    background: "transparent",
                    color: "transparent",
                    caretColor: "#fff",
                    border: "none", outline: "none",
                    resize: "none",
                    padding: "20px 24px",
                    fontFamily: T.mono, fontSize: 13, lineHeight: 1.75,
                    zIndex: 2,
                    overflow: "auto",
                    whiteSpace: "pre",
                  }}
                />
              </div>
            </div>

            {/* Bottom bar */}
            <div style={{
              background: "#181825", borderTop: "1px solid rgba(255,255,255,.06)",
              padding: "8px 14px", display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", gap: 14, fontSize: 11, color: "rgba(255,255,255,.3)", fontFamily: T.font }}>
                <span>Ln {lineCount}</span>
                <span>UTF-8</span>
              </div>
              <button
                onClick={runCode}
                disabled={running}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: running ? "rgba(255,255,255,.1)" : "#28c840",
                  color: running ? "rgba(255,255,255,.5)" : "#0a0a0a",
                  border: "none", borderRadius: 6, padding: "5px 14px",
                  fontSize: 12, fontWeight: 700, cursor: running ? "not-allowed" : "pointer",
                  fontFamily: T.font, transition: "background 0.2s",
                }}
              >
                {running ? (
                  <>
                    <div className="spin" style={{ width: 10, height: 10, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,.3)", borderTopColor: "#fff" }} />
                    Running…
                  </>
                ) : (
                  <>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                    Run
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ── Output pane ── */}
          <div style={{ background: "#0d0d1a", display: "flex", flexDirection: "column" }}>
            <div style={{
              background: "#0a0a16", height: 38,
              display: "flex", alignItems: "center", padding: "0 16px",
              borderBottom: "1px solid rgba(255,255,255,.06)",
              gap: 8,
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="2">
                <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
              </svg>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,.4)", fontFamily: T.font }}>Output</span>
              {outputVisible.length > 0 && (
                <button
                  onClick={() => setOutputVisible([])}
                  style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.25)", fontSize: 11, fontFamily: T.font }}
                >Clear</button>
              )}
            </div>

            <div style={{
              flex: 1, padding: "20px 20px",
              fontFamily: T.mono, fontSize: 12.5, lineHeight: 1.85,
              overflowY: "auto",
            }}>
              {outputVisible.length === 0 && !running && (
                <div style={{ color: "rgba(255,255,255,.18)", fontStyle: "italic", fontSize: 12, fontFamily: T.font }}>
                  Press Run to execute your script…
                </div>
              )}
              {OUTPUT_LINES.map((line, i) =>
                outputVisible.includes(i) ? (
                  <div key={i} style={{ color: line.color || "transparent", minHeight: "1.85em" }}>
                    {line.text}
                  </div>
                ) : null
              )}
              {running && (
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 4 }}>
                  <div className="spin" style={{ width: 9, height: 9, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,.2)", borderTopColor: "rgba(255,255,255,.7)" }} />
                  <span style={{ color: "rgba(255,255,255,.3)", fontSize: 11.5, fontFamily: T.font }}>executing…</span>
                </div>
              )}
            </div>

            {/* Status bar */}
            <div style={{
              background: "#0a0a16", borderTop: "1px solid rgba(255,255,255,.06)",
              padding: "6px 16px", display: "flex", alignItems: "center", gap: 14,
              fontSize: 11, color: "rgba(255,255,255,.25)", fontFamily: T.font,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: outputVisible.length === OUTPUT_LINES.length ? "#28c840" : "rgba(255,255,255,.2)" }} />
                {outputVisible.length === OUTPUT_LINES.length ? "Done" : "Idle"}
              </div>
              <span>pipeline-labs v1.4.0</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   FEATURES
───────────────────────────────────────────── */
const FEATURES = [
  { title: "Autonomous Deployments", body: "AI-driven canary releases, blue-green switches, and instant rollbacks. No YAML warrior needed." },
  { title: "Predictive Monitoring",  body: "Detect anomalies before they become incidents. Correlates metrics, logs, and traces automatically." },
  { title: "Infra as Conversation",  body: "Provision, resize, or teardown resources via natural language — fully auditable and reversible." },
  { title: "Security & Compliance",  body: "Continuous drift detection, secret scanning, and policy enforcement baked into every run." },
  { title: "Cloud Cost Optimizer",   body: "AI-recommended right-sizing and idle resource cleanup. Teams save 40%+ on cloud spend." },
  { title: "Multi-cloud Orchestration", body: "AWS, GCP, Azure unified under one AI control plane. Move workloads between clouds in minutes." },
];

function Features() {
  return (
    <section id="product" style={{ padding: "96px 44px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 48, gap: 32, flexWrap: "wrap" }}>
        <div><Eyebrow>Features</Eyebrow><SectionTitle>Everything DevOps,<br />nothing manual</SectionTitle></div>
        <SubText>Full operational lifecycle — from CI/CD to cost optimization — end to end.</SubText>
      </div>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(2, 1fr)",
        gap: 1, background: "var(--border)", borderRadius: 14, overflow: "hidden",
      }}>
        {FEATURES.map((f) => (
          <div key={f.title} style={{
            background: "var(--card)", padding: "36px",
            transition: "background 0.2s",
          }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "var(--bg3)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "var(--card)")}
          >
            <div style={{
              width: 38, height: 38, borderRadius: 9, border: "1px solid var(--border2)",
              display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18,
            }}>
              <div style={{ width: 14, height: 14, border: "1.5px solid var(--text3)", borderRadius: 3 }} />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 500, letterSpacing: "-0.3px", marginBottom: 8, color: "var(--text)", fontFamily: T.font }}>{f.title}</h3>
            <p style={{ fontSize: 13.5, color: "var(--text2)", lineHeight: 1.65, fontFamily: T.font }}>{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   STATS
───────────────────────────────────────────── */
const STATS = [
  { n: "98", s: "%", label: "Deployment success rate" },
  { n: "40", s: "%", label: "Average cloud cost savings" },
  { n: "4",  s: "×", label: "Faster release cadence" },
  { n: "<2", s: "m", label: "Mean time to remediate" },
];

function Stats() {
  return (
    <section style={{
      padding: "96px 0",
      borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)",
      background: "var(--bg2)",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 44px" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <Eyebrow>By the numbers</Eyebrow>
          <SectionTitle style={{ margin: "0 auto" }}>Trusted by teams shipping fast</SectionTitle>
        </div>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
          gap: 1, background: "var(--border)", borderRadius: 14, overflow: "hidden",
        }}>
          {STATS.map((s) => (
            <div key={s.label} style={{ background: "var(--card)", padding: "44px 36px", textAlign: "center" }}>
              <div style={{ fontSize: 48, fontWeight: 300, letterSpacing: "-2px", lineHeight: 1, color: "var(--text)", marginBottom: 7, fontFamily: T.font }}>
                {s.n}<span style={{ color: "var(--text2)" }}>{s.s}</span>
              </div>
              <div style={{ fontSize: 13.5, color: "var(--text2)", fontFamily: T.font }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   TESTIMONIALS
───────────────────────────────────────────── */
const TESTIMONIALS = [
  { stars: 5, text: "\"Pipeline Labs cut our deploy time from 40 minutes to under 3. The AI rollback saved us twice in the first week alone.\"", initials: "AS", name: "Aryan Shah", role: "CTO · Nexus Finance", grad: "135deg,#555,#222" },
  { stars: 5, text: "\"I was skeptical about AI managing our infra, but after six months I can't imagine going back. It genuinely understands our system.\"", initials: "LK", name: "Laura Kim", role: "Platform Lead · Orbit AI", grad: "135deg,#444,#111" },
  { stars: 5, text: "\"We saved $24k/month on AWS bills in the first quarter. The cost optimizer alone pays for the Team plan ten times over.\"", initials: "MR", name: "Marcus Reid", role: "DevOps Eng · Stackway", grad: "135deg,#666,#333" },
];

function Testimonials() {
  return (
    <section style={{ padding: "96px 44px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 52 }}>
        <Eyebrow>Testimonials</Eyebrow>
        <SectionTitle style={{ margin: "0 auto" }}>Loved by engineering teams</SectionTitle>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {TESTIMONIALS.map((t) => (
          <div key={t.name} style={{
            background: "var(--card)", border: "1px solid var(--border)",
            borderRadius: 14, padding: 28,
            transition: "border-color 0.2s, transform 0.2s",
          }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border2)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLDivElement).style.transform = "none"; }}
          >
            <div style={{ color: "var(--text2)", fontSize: 13, letterSpacing: 2, marginBottom: 14, fontFamily: T.font }}>{"★".repeat(t.stars)}</div>
            <p style={{ fontSize: 13.5, color: "var(--text2)", lineHeight: 1.7, marginBottom: 22, fontStyle: "italic", fontFamily: T.font }}>{t.text}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: `linear-gradient(${t.grad})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 600, color: "var(--text)", flexShrink: 0, fontFamily: T.font,
              }}>{t.initials}</div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text)", fontFamily: T.font }}>{t.name}</div>
                <div style={{ fontSize: 11.5, color: "var(--text3)", fontFamily: T.font }}>{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   PRICING
───────────────────────────────────────────── */
const PLANS = [
  {
    name: "Free", monthly: 0, annual: 0, desc: "Perfect for solo devs and side projects. No credit card required.",
    features: ["Up to 3 repos","50 AI deployments / mo","Basic monitoring","Community support","1 cloud provider"],
    cta: "Get started free", featured: false,
  },
  {
    name: "Pro", monthly: 29, annual: 22, desc: "For growing teams that need full automation and advanced observability.",
    features: ["Unlimited repos","Unlimited AI deployments","Predictive monitoring + alerts","Cost optimizer","3 cloud providers","Priority email support"],
    cta: "Start 14-day free trial", featured: true,
  },
  {
    name: "Team", monthly: 109, annual: 82, desc: "For engineering orgs that need SOC 2, SSO, and dedicated support.",
    features: ["Everything in Pro","Up to 20 seats","SSO / SAML","SOC 2 Type II","All cloud providers","Dedicated Slack support"],
    cta: "Start 14-day free trial", featured: false,
  },
];

function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" style={{
      background: "var(--bg2)",
      borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 44px", textAlign: "center" }}>
        <Eyebrow>Pricing</Eyebrow>
        <SectionTitle style={{ margin: "0 auto 12px" }}>Simple, transparent pricing</SectionTitle>
        <SubText style={{ margin: "0 auto 32px" }}>Start free. Scale when you're ready. No surprise bills.</SubText>

        <div style={{
          display: "inline-flex", alignItems: "center",
          background: "var(--bg3)", border: "1px solid var(--border)",
          borderRadius: T.pill, padding: 3, marginBottom: 52, gap: 3,
        }}>
          {["Monthly","Annually"].map((label) => {
            const isActive = label === "Monthly" ? !annual : annual;
            return (
              <button key={label} onClick={() => setAnnual(label === "Annually")} style={{
                fontSize: 12.5, fontWeight: 500, padding: "7px 18px",
                borderRadius: T.pill, border: "none", cursor: "pointer",
                background: isActive ? "var(--card)" : "transparent",
                color: isActive ? "var(--text)" : "var(--text2)",
                boxShadow: isActive ? "0 1px 5px rgba(0,0,0,.2)" : "none",
                transition: "background 0.2s, color 0.2s", fontFamily: T.font,
              }}>
                {label}
                {label === "Annually" && (
                  <span style={{
                    fontSize: 10, background: "var(--border2)", color: "var(--text2)",
                    borderRadius: T.pill, padding: "2px 7px", fontWeight: 600, marginLeft: 4,
                    fontFamily: T.font,
                  }}>Save 25%</span>
                )}
              </button>
            );
          })}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, textAlign: "left" }}>
          {PLANS.map((plan) => (
            <div key={plan.name} style={{
              background: "var(--card)",
              border: `1px solid ${plan.featured ? "var(--text3)" : "var(--border)"}`,
              borderRadius: 16, padding: 32, position: "relative", overflow: "hidden",
              transition: "transform 0.2s",
              boxShadow: plan.featured ? "inset 0 0 0 1px var(--border2)" : "none",
            }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.transform = "none")}
            >
              {plan.featured && (
                <span style={{
                  position: "absolute", top: 18, right: 18,
                  background: "var(--text)", color: "var(--bg)",
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase",
                  padding: "3px 9px", borderRadius: T.pill, fontFamily: T.font,
                }}>Most popular</span>
              )}
              <div style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text2)", marginBottom: 18, fontFamily: T.font }}>{plan.name}</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 3, marginBottom: 6 }}>
                <span style={{ fontSize: 19, fontWeight: 400, color: "var(--text2)", paddingBottom: 7, fontFamily: T.font }}>$</span>
                <span style={{ fontSize: 50, fontWeight: 300, letterSpacing: "-2.5px", lineHeight: 1, color: "var(--text)", fontFamily: T.font }}>{annual ? plan.annual : plan.monthly}</span>
                <span style={{ fontSize: 12.5, color: "var(--text3)", paddingBottom: 9, fontFamily: T.font }}>/ mo</span>
              </div>
              <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6, marginBottom: 24, minHeight: 44, fontFamily: T.font }}>{plan.desc}</p>
              <div style={{ height: 1, background: "var(--border)", marginBottom: 22 }} />
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                {plan.features.map((f) => <CheckItem key={f}>{f}</CheckItem>)}
              </ul>
              <a href="/dashboard/billing" style={{
                width: "100%", padding: 12, borderRadius: T.pill,
                fontSize: 13.5, fontWeight: 500, cursor: "pointer", fontFamily: T.font,
                background: plan.featured ? "var(--text)" : "transparent",
                color: plan.featured ? "var(--bg)" : "var(--text)",
                border: plan.featured ? "none" : "1px solid var(--border2)",
                transition: "opacity 0.15s", textDecoration: "none", display: "inline-block", textAlign: "center",
              }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = "0.75")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = "1")}
              >{plan.cta}</a>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 28, fontSize: 12.5, color: "var(--text3)", fontFamily: T.font }}>
          All plans include a 14-day free trial. No credit card required. Cancel anytime.
        </p>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   FAQ
───────────────────────────────────────────── */
const FAQS = [
  { q: "Does Pipeline Labs have access to my source code?", a: "Pipeline Labs reads repository metadata, CI configs, and deployment manifests — never your business logic. All data is encrypted in transit and at rest." },
  { q: "Which cloud providers are supported?", a: "AWS, Google Cloud, and Azure are fully supported on all paid plans. Cloudflare, Vercel, Railway, and Fly.io integrations are currently in beta." },
  { q: "What if the AI makes a bad deployment?", a: "Every deployment is canary-gated. If error rates or latency breach your thresholds, Pipeline Labs halts and rolls back automatically before 100% traffic is promoted." },
  { q: "Can I self-host Pipeline Labs?", a: "A BYOC (Bring Your Own Cloud) option is available on the Enterprise plan. Contact us at enterprise@pipelinelabs.ai for a custom quote." },
  { q: "How does billing work for the Team plan?", a: "The Team plan is $109/month (or $82/month billed annually) for up to 20 seats. You're only charged after your free trial ends." },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="resources" style={{ padding: "96px 44px", maxWidth: 760, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <Eyebrow>FAQ</Eyebrow>
        <SectionTitle style={{ margin: "0 auto" }}>Common questions</SectionTitle>
      </div>
      <div style={{
        display: "flex", flexDirection: "column", gap: 1,
        background: "var(--border)", borderRadius: 14, overflow: "hidden",
      }}>
        {FAQS.map((f, i) => (
          <div key={i} style={{ background: "var(--card)" }}>
            <button onClick={() => setOpen(open === i ? null : i)} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              width: "100%", padding: "20px 26px",
              fontSize: 14.5, fontWeight: 500, letterSpacing: "-0.2px",
              color: "var(--text)", background: "none", border: "none",
              cursor: "pointer", gap: 14, textAlign: "left", fontFamily: T.font,
            }}>
              {f.q}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2"
                style={{ flexShrink: 0, transform: open === i ? "rotate(45deg)" : "none", transition: "transform 0.22s" }}>
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <div className={`faq-answer${open === i ? " open" : ""}`} style={{ padding: open === i ? "0 26px 20px" : "0 26px" }}>
              <p style={{ fontSize: 13.5, color: "var(--text2)", lineHeight: 1.7, fontFamily: T.font }}>{f.a}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   CTA BANNER
───────────────────────────────────────────── */
function CTABanner() {
  return (
    <section style={{
      padding: "80px 44px", textAlign: "center",
      borderTop: "1px solid var(--border)", background: "var(--bg2)",
    }}>
      <Divider style={{ marginBottom: 52 }} />
      <h2 style={{ fontSize: "clamp(28px, 3.8vw, 44px)", fontWeight: 300, letterSpacing: "-0.04em", color: "var(--text)", marginBottom: 14, fontFamily: T.font }}>
        Your next deploy ships itself.
      </h2>
      <p style={{ fontSize: 16, color: "var(--text2)", marginBottom: 36, maxWidth: 480, margin: "0 auto 36px", fontFamily: T.font }}>
        Join thousands of engineers who've handed their pipelines to AI — and never looked back.
      </p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
        <a href="/dashboard" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "var(--text)", color: "var(--bg)",
          fontSize: 14, fontWeight: 500, borderRadius: T.pill, padding: "11px 24px",
          textDecoration: "none", fontFamily: T.font,
        }}>Start free trial — no card needed</a>
        <a href="/contact" style={{
          display: "inline-flex", alignItems: "center",
          background: "transparent", color: "var(--text)",
          fontSize: 14, fontWeight: 500, borderRadius: T.pill, padding: "11px 24px",
          border: "1px solid var(--border2)", textDecoration: "none", fontFamily: T.font,
        }}>Talk to sales</a>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────── */
const FOOTER_LINKS: Record<string, { label: string; href: string }[]> = {
  Product:    [
    { label: "Features", href: "#product" },
    { label: "Pricing", href: "#pricing" },
    { label: "Changelog", href: "#" },
    { label: "Roadmap", href: "#" },
    { label: "Status", href: "#" },
  ],
  Developers: [
    { label: "Documentation", href: "https://pipeline.stldocs.app" },
    { label: "API Reference", href: "https://pipeline.stldocs.app" },
    { label: "CLI", href: "#" },
    { label: "Integrations", href: "#" },
    { label: "Open source", href: "#" },
  ],
  Company:    [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" },
    { label: "Contact", href: "/contact" },
  ],
  Legal:      [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Security", href: "#" },
    { label: "Cookies", href: "#" },
  ],
};

function Footer({ theme }: { theme: Theme }) {
  return (
    <footer style={{ background: "var(--bg)", borderTop: "1px solid var(--border)", padding: "56px 44px 32px", fontFamily: T.font }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 44, paddingBottom: 48, borderBottom: "1px solid var(--border)" }}>
          {/* Brand */}
          <div>
            <Logo theme={theme} height={26} fallbackId="ft-logo-fb" />
            <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.65, maxWidth: 240, marginBottom: 22, marginTop: 14 }}>
              AI-native DevOps that deploys, monitors, scales, and heals your infrastructure — autonomously.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />,
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />,
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />,
              ].map((path, i) => (
                <a key={i} href="#" style={{
                  width: 32, height: 32, borderRadius: 7,
                  background: "var(--bg3)", border: "1px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--text2)", textDecoration: "none",
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">{path}</svg>
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 style={{ fontSize: 11.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.09em", color: "var(--text3)", marginBottom: 14 }}>{heading}</h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                {links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      target={l.href.startsWith("http") ? "_blank" : undefined}
                      rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      style={{ fontSize: 13, color: "var(--text2)", textDecoration: "none", transition: "color 0.15s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text2)")}
                    >{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ paddingTop: 26, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
          <span style={{ fontSize: 12.5, color: "var(--text3)" }}>© 2026 Pipeline Labs, Inc. All rights reserved.</span>
          <div style={{ display: "flex", gap: 22 }}>
            {["Privacy","Terms","Security","Cookies"].map((l) => (
              <a key={l} href="#" style={{ fontSize: 12.5, color: "var(--text3)", textDecoration: "none" }}>{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────
   ROOT
───────────────────────────────────────────── */
export default function PipelineLabs() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const saved = localStorage.getItem("pl-theme") as Theme | null;
    if (saved) { setTheme(saved); return; }
    const preferLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    setTheme(preferLight ? "light" : "dark");
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("pl-theme", theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <>
      <GlobalStyle />
      <div style={{ background: "var(--bg)", minHeight: "100vh", fontFamily: T.font }}>
        <Nav theme={theme} onToggle={toggle} />
        <main>
          <Hero />
          <Marquee />
          <VideoSection />
          <HowItWorks />
          <SDKSection />
          <Features />
          <Stats />
          <Testimonials />
          <Pricing />
          <FAQ />
          <CTABanner />
        </main>
        <Footer theme={theme} />
      </div>
    </>
  );
}
