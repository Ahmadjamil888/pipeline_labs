"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight, Lock, Play, CheckCircle2, Shield, Zap, Activity,
  GitBranch, Terminal, Cloud, BarChart2, Users, Star, Quote,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useTheme } from "./theme-provider";
import { ThemeToggle } from "./theme-toggle";

/* ── Shared constants ──────────────────────────────────────────────────────── */
const HF = "'Helvetica World', Helvetica, Arial, sans-serif";

const IMG_BG: React.CSSProperties = {
  backgroundImage: `url('/ChatGPT Image Mar 1, 2026, 06_25_33 AM.png')`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "50% 0%",
  backgroundSize: "110% 110%",
};

/* Each dark section overlays the image at a slightly different Y offset
   so successive sections feel like windows into the same continuous photo. */
const SECTION_OVERLAY = [
  "rgba(0,0,0,0.60)", "rgba(0,0,0,0.63)", "rgba(0,0,0,0.60)",
  "rgba(0,0,0,0.58)", "rgba(0,0,0,0.62)", "rgba(0,0,0,0.65)",
  "rgba(0,0,0,0.60)", "rgba(0,0,0,0.68)",
];

const lightSectionBg = (i: number): React.CSSProperties => {
  const g = [
    "linear-gradient(160deg,#ffffff 0%,#e8e8e8 50%,#1a1a1a 100%)",
    "linear-gradient(200deg,#f5f5f5 0%,#d0d0d0 40%,#111111 100%)",
    "linear-gradient(140deg,#ececec 0%,#c8c8c8 50%,#222222 100%)",
    "linear-gradient(180deg,#f9f9f9 0%,#e0e0e0 45%,#0f0f0f 100%)",
    "linear-gradient(170deg,#f2f2f2 0%,#d8d8d8 55%,#1c1c1c 100%)",
  ];
  return { background: g[i % g.length] };
};

/* ── Glass card ────────────────────────────────────────────────────────────── */
const Card = ({ children, className = "", hover = false, onClick, light = false }: {
  children: React.ReactNode; className?: string; hover?: boolean;
  onClick?: () => void; light?: boolean;
}) => (
  <div
    onClick={onClick}
    className={`rounded-2xl p-8 transition-all duration-300 ${hover ? "cursor-pointer hover:scale-[1.02]" : ""} ${className}`}
    style={{
      border: light ? "1px solid rgba(0,0,0,0.1)" : "1px solid rgba(255,255,255,0.1)",
      background: light ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.05)",
      backdropFilter: "blur(16px)",
    }}
  >{children}</div>
);

/* ── Section shell ─────────────────────────────────────────────────────────── */
const Section = ({ id, children, center = false, theme, sectionIdx }: {
  id?: string; children: React.ReactNode; center?: boolean;
  theme: "dark" | "light"; sectionIdx: number;
}) => {
  const isDark = theme === "dark";
  return (
    <section
      id={id}
      className="relative overflow-hidden"
      style={{
        ...(isDark ? IMG_BG : lightSectionBg(sectionIdx)),
        minHeight: "100vh",
      }}
    >
      {isDark && (
        <div className="absolute inset-0"
          style={{ background: SECTION_OVERLAY[sectionIdx % SECTION_OVERLAY.length] }} />
      )}
      <div
        className={`relative z-10 h-full flex flex-col ${center ? "items-center justify-center" : "justify-center"} px-[60px] py-[100px] max-w-7xl mx-auto`}
        style={{ minHeight: "100vh" }}
      >{children}</div>
    </section>
  );
};

/* ── Feature pair ──────────────────────────────────────────────────────────── */
const Feature = ({ badge, title, desc, flip = false, children, isDark = true }: {
  badge: string; title: string; desc: string; flip?: boolean;
  children: React.ReactNode; isDark?: boolean;
}) => (
  <div className={`flex flex-col ${flip ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-20`}>
    <div className="flex-1 space-y-6">
      <span
        className="inline-flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase rounded-full px-4 py-1.5"
        style={{
          fontFamily: HF, fontWeight: 300,
          color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
          border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.12)",
        }}
      >{badge}</span>
      <h2 className="text-5xl leading-[1.08] tracking-tight"
        style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "#fff" : "#0a0a0a" }}>
        {title}
      </h2>
      <p className="text-lg leading-relaxed max-w-md"
        style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.5)" }}>
        {desc}
      </p>
    </div>
    <div className="flex-1 w-full">{children}</div>
  </div>
);

/* ── Stacking card ─────────────────────────────────────────────────────────── */
const CARD_COUNT = 5;
const StickyCard = ({ index, containerRef, children, theme, sectionIdx, id }: {
  index: number; containerRef: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode; theme: "dark" | "light"; sectionIdx: number; id?: string;
}) => {
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const cardStart = index / CARD_COUNT;
  const cardEnd   = (index + 1) / CARD_COUNT;
  const scale   = useTransform(scrollYProgress, [cardStart, cardEnd], [1, 0.92]);
  const opacity = useTransform(scrollYProgress, [cardStart, cardEnd], [1, 0.65]);
  const isDark  = theme === "dark";
  const TOP     = 80 + index * 20;

  return (
    <motion.div
      id={id}
      style={{
        position: "sticky", top: TOP, scale, opacity,
        transformOrigin: "top center",
        zIndex: 10 + index,
        ...(isDark ? IMG_BG : lightSectionBg(sectionIdx)),
        minHeight: "100vh", overflow: "hidden", borderRadius: "20px",
      }}
    >
      {isDark && (
        <div className="absolute inset-0 rounded-[20px]"
          style={{ background: SECTION_OVERLAY[sectionIdx % SECTION_OVERLAY.length] }} />
      )}
      <div className="relative z-10 h-full flex flex-col justify-center px-[60px] py-[100px] max-w-7xl mx-auto"
        style={{ minHeight: "100vh" }}>
        {children}
      </div>
    </motion.div>
  );
};

/* ── SDK terminal ──────────────────────────────────────────────────────────── */
const SDKDemo = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const run = () => {
    if (running) return;
    setRunning(true); setDone(false);
    setLogs(["$ client.training.train(model='llama-3', dataset='imdb')"]);
    const msgs = [
      "Resolving task type → causal-lm",
      "Applying Layer 1 smart defaults...",
      "Config: epochs=3, lr=5e-5, optimizer=adamw",
      "Provisioning GPU: A10G · us-east-1",
      "Epoch 1/3 ── loss: 0.42 · acc: 88.1%",
      "Epoch 2/3 ── loss: 0.21 · acc: 94.3%",
      "Epoch 3/3 ── loss: 0.11 · acc: 97.6%",
      "Auto-registering → ModelVersion v1",
      "✓ Endpoint live: pipeline.ai/v1/llama-3",
    ];
    msgs.forEach((m, i) => setTimeout(() => {
      setLogs(p => [...p, m]);
      if (i === msgs.length - 1) { setRunning(false); setDone(true); }
    }, (i + 1) * 650));
  };

  return (
    <Card className="!p-0 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-white/5">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/50" />
          <div className="w-3 h-3 rounded-full bg-yellow-400/50" />
          <div className="w-3 h-3 rounded-full bg-green-400/50" />
        </div>
        <span className="text-[10px] text-white/25 tracking-widest font-light">pipeline_labs · terminal</span>
        <button onClick={run}
          className="text-[10px] tracking-widest uppercase font-light px-3 py-1 rounded-full border border-white/10 hover:border-white/30 hover:text-white text-white/40 transition-all"
          style={{ fontFamily: HF }}>
          {running ? "running…" : done ? "run again" : "▶  run"}
        </button>
      </div>
      <div className="h-72 p-6 font-mono text-[12px] overflow-y-auto space-y-1.5"
        style={{ fontFamily: "'Consolas','Menlo',monospace" }}>
        {logs.length === 0 && <span className="text-white/20 italic">Click ▶ run to simulate a training job…</span>}
        {logs.map((l, i) => (
          <div key={i} className={
            l.startsWith("$") ? "text-white"
            : l.startsWith("✓") ? "text-green-400"
            : l.includes("acc:") ? "text-emerald-400/80"
            : "text-white/45"
          }>{l}</div>
        ))}
        {running && <motion.span animate={{ opacity: [0, 1] }} transition={{ repeat: Infinity, duration: 0.55 }}
          className="inline-block w-[7px] h-3.5 bg-white align-middle" />}
      </div>
    </Card>
  );
};

/* ── Stat ──────────────────────────────────────────────────────────────────── */
const Stat = ({ value, label, isDark = true }: { value: string; label: string; isDark?: boolean }) => (
  <div className="flex flex-col items-center gap-1.5">
    <span className="text-4xl" style={{ fontFamily: HF, fontWeight: 200, color: isDark ? "#fff" : "#0a0a0a" }}>{value}</span>
    <span className="text-[10px] uppercase tracking-[0.25em]"
      style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.35)" }}>
      {label}
    </span>
  </div>
);


/* ─────────────────────────────────────────────────────────────────────────── */
/*  Main page                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const stackRef = useRef<HTMLDivElement>(null);
  const hScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.85);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const useCases = [
    { icon: Terminal, title: "Fine-tune LLMs", desc: "PEFT / LoRA fine-tuning on any HuggingFace model in a single SDK call with zero infra setup." },
    { icon: BarChart2, title: "Distributed Training", desc: "Auto-shard across N GPUs. Pipeline picks the optimal parallelism strategy for your model size." },
    { icon: Cloud, title: "Serverless Inference", desc: "Deploy endpoints that scale to zero and cold-start in under 200 ms on A10G or A100 hardware." },
    { icon: GitBranch, title: "Model Versioning", desc: "Every run auto-registers a ModelVersion. Roll back or A/B test endpoints with one flag." },
    { icon: Shield, title: "Private Clusters", desc: "VPC-isolated training clusters with HMAC-signed API keys and full audit log export." },
    { icon: Activity, title: "Live Telemetry", desc: "Stream live loss curves, GPU utilisation, and throughput metrics to your dashboard or CLI." },
  ];

  const testimonials = [
    { name: "Sana M.", role: "ML Lead · HealthTech startup", quote: "Pipeline cut our fine-tuning setup from two weeks of DevOps to a single afternoon. We shipped to prod the same day." },
    { name: "Tariq R.", role: "CTO · AI SaaS", quote: "The SDK just works. No YAML, no cluster config, no hidden billing surprises. Finally infra that gets out of the way." },
    { name: "Priya K.", role: "Research Engineer · University Lab", quote: "Running distributed experiments used to require a dedicated ops engineer. With Pipeline, a PhD student can do it solo." },
  ];

  return (
    <>
      {/* ── SEO: invisible keyword-rich intro for crawlers ── */}
      <div className="sr-only" aria-hidden="false">
        <h1>Pipeline AI — Zero-Config Distributed AI Infrastructure SDK</h1>
        <p>
          Pipeline is a cloud AI infrastructure platform that lets engineers train, fine-tune, and deploy
          machine learning models with a single Python SDK call. No YAML, no DevOps, no idle charges.
          Built for LLM fine-tuning, distributed GPU training, serverless inference endpoints,
          model registry, and real-time observability.
        </p>
      </div>

      <div style={{ fontFamily: HF, fontWeight: 300 }}>

        {/* ── NAVBAR ──────────────────────────────────────────────────────── */}
        <nav
          className="fixed top-0 w-full z-50 flex justify-between items-center px-[60px] py-5 transition-all duration-500"
          aria-label="Primary navigation"
          style={{
            background: scrolled ? "rgba(8,8,8,0.5)" : "transparent",
            backdropFilter: scrolled ? "blur(48px) saturate(220%)" : "none",
            WebkitBackdropFilter: scrolled ? "blur(48px) saturate(220%)" : "none",
            borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
          }}
        >
          <Link href="/" aria-label="Pipeline home" className="flex items-center gap-3">
            <Image src="/logo-dark.png" alt="Pipeline logo" width={26} height={26} className="object-contain" />
            <span className="text-white text-[15px] tracking-[0.1em]" style={{ fontFamily: HF, fontWeight: 300 }}>Pipeline</span>
          </Link>

          <nav className="hidden md:flex gap-10 text-[15px] text-white" aria-label="Site sections" style={{ fontFamily: HF, fontWeight: 300 }}>
            {[["#product", "Product"], ["#use-cases", "Use Cases"], ["#enterprise", "Enterprise"], ["#pricing", "Pricing"], ["/docs", "Docs"]].map(([href, label]) => (
              <Link key={label} href={href} className="text-white hover:opacity-50 transition-opacity">{label}</Link>
            ))}
          </nav>

          <div className="flex items-center gap-5">
            <ThemeToggle />
            <Link href="/contact">
              <button className="btn light text-[14px] px-5 py-2 font-light" style={{ fontFamily: HF }}>
                Request Early Access
              </button>
            </Link>
          </div>
        </nav>

        {/* ── HERO ────────────────────────────────────────────────────────── */}
        <style>{`
          @keyframes waveShift {
            0%   { background-position: 50% 0%; }
            25%  { background-position: 52% 3%; }
            50%  { background-position: 50% 6%; }
            75%  { background-position: 48% 3%; }
            100% { background-position: 50% 0%; }
          }
          @keyframes waveGrad {
            0%   { opacity:.38; transform:scale(1) translateX(0px); }
            33%  { opacity:.44; transform:scale(1.04) translateX(-18px); }
            66%  { opacity:.34; transform:scale(.98) translateX(12px); }
            100% { opacity:.38; transform:scale(1) translateX(0px); }
          }
          .hero-bg-wave { animation: waveShift 18s ease-in-out infinite; background-size: 110% 110%; }
          .hero-overlay-wave { animation: waveGrad 14s ease-in-out infinite; }
        `}</style>

        <section
          aria-label="Hero"
          className="relative flex flex-col items-center justify-center overflow-hidden hero-bg-wave"
          style={{
            backgroundImage: `url('/ChatGPT Image Mar 1, 2026, 06_25_33 AM.png')`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "50% 0%",
            height: "150vh",
          }}
        >
          <div className="absolute inset-0 bg-black/42" />
          <div className="absolute inset-0 hero-overlay-wave" style={{
            background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(80,80,110,0.18) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto px-8 w-full" style={{ paddingTop: "64px" }}>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/20 bg-black/30 backdrop-blur-xl mb-16 cursor-pointer hover:bg-black/50 transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
              <span className="text-[13px] text-white/70" style={{ fontFamily: HF, fontWeight: 300 }}>Explore pipeline_labs SDK</span>
              <ArrowRight size={13} className="text-white/50" />
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, delay: 0.1 }}
              className="leading-[1.08] text-white mb-10 tracking-tight"
              style={{ fontFamily: HF, fontWeight: 200, fontSize: "clamp(40px,5.5vw,64px)" }}>
              One-click for
              <br />
              <span className="text-white/45">Zero-Config AI</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.28 }}
              className="text-[16px] text-white/45 max-w-md leading-[1.8] mb-2"
              style={{ fontFamily: HF, fontWeight: 300, letterSpacing: "0.01em" }}>
              Train, fine-tune and deploy models seamlessly with the pipeline_labs SDK. Built for ultimate speed, zero boilerplate.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }} className="buttons">
              <Link href="/contact">
                <button className="btn light flex items-center gap-2" style={{ fontFamily: HF, fontWeight: 300 }}>
                  Request Early Access <ArrowRight size={15} />
                </button>
              </Link>
              <Link href="/docs">
                <button className="btn" style={{ fontFamily: HF, fontWeight: 300 }}>Discover More</button>
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.95 }}
              className="mt-20 flex items-center gap-12 border-t pt-10"
              style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}>
              <Stat value="<200ms" label="Cold start" isDark={isDark} />
              <div className="h-7 w-px bg-white/10" />
              <Stat value="10k+" label="Models served" isDark={isDark} />
              <div className="h-7 w-px bg-white/10" />
              <Stat value="99.9%" label="Uptime SLA" isDark={isDark} />
              <div className="h-7 w-px bg-white/10" />
              <Stat value="3" label="GPU tiers" isDark={isDark} />
            </motion.div>
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
            <motion.div animate={{ y: [0, 9, 0] }} transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
              className="w-px h-14 bg-white/20" />
            <span className="text-[9px] text-white/25 tracking-[0.3em] uppercase" style={{ fontFamily: HF }}>Scroll</span>
          </div>
        </section>

        {/* ── SECTION 2: SDK Demo ──────────────────────────────────────────── */}
        <Section id="product" theme={theme} sectionIdx={0}>
          <Feature
            badge="Core SDK"
            title="Zero-Config Distributed AI"
            desc="Stop wrestling with YAML and infrastructure. Pipeline handles the distribution layer automatically through a simple, high-performance SDK."
            isDark={isDark}
          >
            <SDKDemo />
          </Feature>
        </Section>

        {/* ── SECTIONS 3–7: Stacking cards ────────────────────────────────── */}
        <div ref={stackRef} style={{ height: `${CARD_COUNT * 100}vh`, position: "relative" }}>

          {/* CARD 1 — Model Hub */}
          <StickyCard index={0} containerRef={stackRef} theme={theme} sectionIdx={1}>
            <Feature badge="Model Registry" title="Global Model Hub"
              desc="Import models from HuggingFace, Kaggle, or S3. We automatically cache weights and register versions for one-click deployment."
              flip isDark={isDark}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: "meta-llama/Llama-3-8B", tag: "LLM", active: true },
                  { name: "openai/whisper-large-v3", tag: "Audio", active: false },
                  { name: "stabilityai/stable-diffusion-xl", tag: "Vision", active: false },
                  { name: "mistralai/Mistral-7B-v0.1", tag: "LLM", active: true },
                ].map(m => (
                  <motion.div key={m.name} whileHover={{ scale: 1.03 }}
                    className="p-5 rounded-2xl flex flex-col gap-3 cursor-pointer"
                    style={{
                      border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
                      background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                      backdropFilter: "blur(12px)",
                    }}>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] uppercase tracking-[0.3em]"
                        style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.35)" }}>
                        {m.tag}
                      </span>
                      <div className={`w-1.5 h-1.5 rounded-full ${m.active ? "bg-green-400 animate-pulse" : "bg-white/15"}`} />
                    </div>
                    <span className="text-[13px] font-mono leading-tight"
                      style={{ color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)" }}>{m.name}</span>
                    <div className="text-[10px]" style={{ fontFamily: HF, color: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.3)" }}>
                      Click to import →
                    </div>
                  </motion.div>
                ))}
              </div>
            </Feature>
          </StickyCard>

          {/* CARD 2 — Telemetry */}
          <StickyCard index={1} containerRef={stackRef} theme={theme} sectionIdx={2}>
            <Feature badge="Observability" title="Real-time Training Stats"
              desc="Live loss curves, accuracy metrics, and GPU utilisation streamed directly from the cloud to your dashboard or CLI."
              isDark={isDark}>
              <Card className="relative !p-6 overflow-hidden" light={!isDark}>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] tracking-widest uppercase font-light"
                    style={{ fontFamily: HF, color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.4)" }}>Live Loss Stream</span>
                  <span className="text-[10px] text-green-500/80 flex items-center gap-1.5 font-light" style={{ fontFamily: HF }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" /> Epoch 3/3
                  </span>
                </div>
                <div className="flex items-end gap-1.5 h-36">
                  {[14, 22, 18, 30, 25, 38, 34, 46, 52, 48, 62, 70, 66, 80, 88, 92, 96].map((h, i) => (
                    <motion.div key={i} className="flex-1 rounded-t-sm"
                      style={{ background: isDark ? "linear-gradient(to top,rgba(255,255,255,0.2),rgba(255,255,255,0.6))" : "linear-gradient(to top,rgba(0,0,0,0.15),rgba(0,0,0,0.7))" }}
                      initial={{ height: 0 }} whileInView={{ height: `${h}%` }} viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: i * 0.04, ease: "easeOut" }} />
                  ))}
                </div>
                <div className="mt-3 flex justify-between text-[9px] font-light"
                  style={{ fontFamily: HF, color: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.3)" }}>
                  <span>Epoch 1</span><span>Epoch 2</span><span>Epoch 3</span>
                </div>
              </Card>
            </Feature>
          </StickyCard>

          {/* CARD 3 — Typed SDK */}
          <StickyCard index={2} containerRef={stackRef} theme={theme} sectionIdx={3} id="enterprise">
            <Feature badge="Developer Experience" title="Perfectly Typed Interface"
              desc="Complete autocomplete, type safety, and error handling. The SDK mirrors the OpenAPI spec exactly — no surprises."
              flip isDark={isDark}>
              <Card className="relative overflow-hidden !p-0" light={!isDark}>
                <div className="flex items-center gap-1.5 px-5 py-3"
                  style={{ borderBottom: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)" }}>
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400/50" />
                  <span className="ml-3 text-[10px] tracking-widest"
                    style={{ fontFamily: HF, color: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.3)" }}>example.py</span>
                </div>
                <pre className="p-6 text-[13px] leading-relaxed overflow-x-auto"
                  style={{ fontFamily: "'Consolas','Menlo',monospace", whiteSpace: "pre", color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.65)" }}
                >{`from pipeline_labs import Pipeline

client = Pipeline()

job = client.training.train(
    model="meta-llama/Llama-3-8B",
    dataset="imdb",
    task="text-classification",
    config={
        epochs: 10,
        gpu_type: "A10G",
    },
)

print(job.id)      # "job_8f7b2319"
print(job.status)  # "queued"`}</pre>
                <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
                  className="absolute bottom-5 right-5 bg-white/10 border border-white/15 text-white/70 text-[10px] px-3 py-1.5 rounded-full font-light backdrop-blur-md"
                  style={{ fontFamily: HF }}>
                  ⌘ Autocomplete active
                </motion.div>
              </Card>
            </Feature>
          </StickyCard>

          {/* CARD 4 — Inference */}
          <StickyCard index={3} containerRef={stackRef} theme={theme} sectionIdx={4}>
            <Feature badge="Inference" title="Serverless Edge Endpoints"
              desc="Deploy to serverless endpoints with auto-scaling. Cold-start times under 200ms for even the largest model weights."
              isDark={isDark}>
              <div className="space-y-4">
                {[
                  { name: "llama-3-8b-prod", latency: "142ms", replicas: 3, status: "healthy" },
                  { name: "whisper-v3-api", latency: "89ms", replicas: 2, status: "healthy" },
                  { name: "stable-diff-xl", latency: "320ms", replicas: 1, status: "scaling" },
                ].map(ep => (
                  <motion.div key={ep.name} whileHover={{ x: 4 }}
                    className="flex items-center justify-between p-5 rounded-xl cursor-pointer"
                    style={{
                      border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
                      background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                      backdropFilter: "blur(12px)",
                    }}>
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${ep.status === "healthy" ? "bg-green-400 animate-pulse" : "bg-yellow-400 animate-pulse"}`} />
                      <div>
                        <div className="text-[13px] font-mono" style={{ color: isDark ? "#fff" : "#0a0a0a" }}>{ep.name}</div>
                        <div className="text-[10px] mt-0.5 font-light"
                          style={{ fontFamily: HF, color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.4)" }}>
                          {ep.replicas} replica{ep.replicas > 1 ? "s" : ""} · {ep.status}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[11px] text-green-500/80 font-mono">{ep.latency}</span>
                      <Play size={14} style={{ color: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.25)" }} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </Feature>
          </StickyCard>

          {/* CARD 5 — Security */}
          <StickyCard index={4} containerRef={stackRef} theme={theme} sectionIdx={5}>
            <Feature badge="Security" title="Zero-Trust Infrastructure"
              desc="SOC2 compliant, VPC-isolated training, API key auth with rotation. Use the same tools as the world's most secure AI labs."
              flip isDark={isDark}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Shield, label: "SOC2 Compliant", desc: "Annual audits" },
                  { icon: Lock, label: "VPC Isolation", desc: "Private networking" },
                  { icon: Zap, label: "API Key Auth", desc: "HMAC signed requests" },
                  { icon: Activity, label: "Audit Trails", desc: "Full event log" },
                ].map(({ icon: Icon, label, desc }) => (
                  <motion.div key={label} whileHover={{ scale: 1.03 }}
                    className="p-6 rounded-2xl cursor-default"
                    style={{
                      border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
                      background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                      backdropFilter: "blur(12px)",
                    }}>
                    <Icon size={22} className="mb-4" style={{ color: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.3)" }} />
                    <div className="text-[14px] font-light mb-1"
                      style={{ fontFamily: HF, color: isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.8)" }}>{label}</div>
                    <div className="text-[11px] font-light"
                      style={{ fontFamily: HF, color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.4)" }}>{desc}</div>
                  </motion.div>
                ))}
              </div>
            </Feature>
          </StickyCard>
        </div>

        {/* ── USE CASES — horizontal scroll ───────────────────────────────── */}
        <section
          id="use-cases"
          aria-label="Use cases"
          className="py-32 overflow-hidden relative"
          style={{ ...(isDark ? IMG_BG : lightSectionBg(3)), minHeight: "auto" }}
        >
          {isDark && <div className="absolute inset-0" style={{ background: SECTION_OVERLAY[0] }} />}
          <div className="relative z-10 px-[60px] max-w-7xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase rounded-full px-4 py-1.5 mb-6"
              style={{
                fontFamily: HF, fontWeight: 300,
                color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
                border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.12)",
              }}>
              Use Cases
            </span>
            <h2 className="text-5xl tracking-tight"
              style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "#fff" : "#0a0a0a" }}>
              Built for every<br />
              <span style={{ color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)" }}>AI workload.</span>
            </h2>
          </div>

          {/* horizontal scroll rail */}
          <div
            ref={hScrollRef}
            className="relative z-10 flex gap-6 overflow-x-auto pb-6 px-[60px] snap-x snap-mandatory"
            style={{
              scrollbarWidth: "none",
              WebkitOverflowScrolling: "touch",
              msOverflowStyle: "none",
            }}
          >
            {useCases.map(({ icon: Icon, title, desc }, i) => (
              <motion.article
                key={title}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className="snap-start flex-shrink-0 flex flex-col gap-6 p-8 rounded-2xl"
                style={{
                  width: "clamp(280px, 26vw, 340px)",
                  border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
                  background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}>
                  <Icon size={18} style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }} />
                </div>
                <div>
                  <h3 className="text-[16px] font-light mb-2"
                    style={{ fontFamily: HF, color: isDark ? "#fff" : "#0a0a0a" }}>{title}</h3>
                  <p className="text-[13px] leading-relaxed"
                    style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.5)" }}>
                    {desc}
                  </p>
                </div>
                <Link href="/contact"
                  className="mt-auto text-[11px] uppercase tracking-[0.25em] flex items-center gap-1.5 transition-opacity hover:opacity-60"
                  style={{ fontFamily: HF, color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.4)" }}>
                  Learn more <ArrowRight size={11} />
                </Link>
              </motion.article>
            ))}
          </div>

          {/* scroll hint */}
          <div className="relative z-10 px-[60px] mt-6 flex items-center gap-2">
            <div className="h-px flex-1 max-w-[120px]"
              style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }} />
            <span className="text-[10px] uppercase tracking-[0.3em]"
              style={{ fontFamily: HF, color: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.25)" }}>
              scroll →
            </span>
          </div>
        </section>

        {/* ── TESTIMONIALS — horizontal scroll ────────────────────────────── */}
        <section
          aria-label="Testimonials"
          className="py-32 overflow-hidden relative"
          style={{ ...(isDark ? IMG_BG : lightSectionBg(4)), minHeight: "auto" }}
        >
          {isDark && <div className="absolute inset-0" style={{ background: SECTION_OVERLAY[1] }} />}
          <div className="relative z-10 px-[60px] max-w-7xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase rounded-full px-4 py-1.5 mb-6"
              style={{
                fontFamily: HF, fontWeight: 300,
                color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
                border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.12)",
              }}>
              Testimonials
            </span>
            <h2 className="text-5xl tracking-tight"
              style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "#fff" : "#0a0a0a" }}>
              Teams shipping faster<br />
              <span style={{ color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)" }}>with Pipeline.</span>
            </h2>
          </div>

          <div className="relative z-10 flex gap-6 overflow-x-auto pb-6 px-[60px] snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch", msOverflowStyle: "none" }}>
            {testimonials.map(({ name, role, quote }, i) => (
              <motion.blockquote
                key={name}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="snap-start flex-shrink-0 flex flex-col gap-8 p-10 rounded-2xl"
                style={{
                  width: "clamp(300px, 30vw, 420px)",
                  border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
                  background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <Quote size={20} style={{ color: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)" }} />
                <p className="text-[16px] leading-[1.7] font-light flex-1"
                  style={{ fontFamily: HF, color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)" }}>
                  &ldquo;{quote}&rdquo;
                </p>
                <footer className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }}>
                    <Users size={13} style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }} />
                  </div>
                  <div>
                    <div className="text-[13px] font-light" style={{ fontFamily: HF, color: isDark ? "#fff" : "#0a0a0a" }}>{name}</div>
                    <div className="text-[11px]" style={{ fontFamily: HF, color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.4)" }}>{role}</div>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {[...Array(5)].map((_, si) => (
                      <Star key={si} size={10} fill="currentColor" style={{ color: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.3)" }} />
                    ))}
                  </div>
                </footer>
              </motion.blockquote>
            ))}
          </div>
        </section>

        {/* ── PRICING ─────────────────────────────────────────────────────── */}
        <Section id="pricing" theme={theme} sectionIdx={6} center>
          <div className="w-full">
            <div className="text-center mb-20">
              <h2 className="text-[54px] tracking-tight mb-5"
                style={{ fontFamily: HF, fontWeight: 200, color: isDark ? "#fff" : "#0a0a0a" }}>
                Flexible Infrastructure Pricing
              </h2>
              <p className="text-[17px] max-w-xl mx-auto"
                style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.45)" }}>
                Per-second billing. No idle charges. Scale from zero to cluster in one call.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { tier: "Researcher", price: "0", period: "Free forever", features: ["1 Node max", "CPU only", "Community support", "pipeline_labs SDK access"] },
                { tier: "Startup", price: "49", period: "/mo · billed monthly", features: ["Unlimited nodes", "T4 & A10G GPUs", "Priority support", "Slack channel access"] },
                { tier: "Enterprise", price: "999", period: "/mo · custom billing", features: ["Dedicated cluster", "A100 access", "99.9% SLA", "24/7 on-call support"] },
              ].map((plan, i) => (
                <motion.div key={plan.tier} whileHover={{ y: -6 }}
                  className="rounded-2xl p-10 space-y-7 transition-all"
                  style={{
                    backdropFilter: "blur(12px)",
                    border: i === 1
                      ? (isDark ? "1px solid rgba(255,255,255,0.4)" : "1px solid rgba(0,0,0,0.35)")
                      : (isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)"),
                    background: i === 1
                      ? (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)")
                      : (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"),
                  }}>
                  {i === 1 && (
                    <div className="text-[9px] uppercase tracking-[0.3em] font-light rounded-full px-3 py-1 inline-block"
                      style={{ fontFamily: HF, color: isDark ? "#fff" : "#0a0a0a", border: isDark ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(0,0,0,0.2)" }}>
                      Most Popular
                    </div>
                  )}
                  <div className="text-[11px] uppercase tracking-[0.25em] font-light"
                    style={{ fontFamily: HF, color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}>{plan.tier}</div>
                  <div style={{ fontFamily: HF, fontWeight: 200 }}>
                    <span className="text-5xl" style={{ color: isDark ? "#fff" : "#0a0a0a" }}>${plan.price}</span>
                    <span className="text-[13px] ml-2 font-light" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.35)" }}>{plan.period}</span>
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-2.5 text-[13px] font-light"
                        style={{ fontFamily: HF, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.55)" }}>
                        <CheckCircle2 size={13} style={{ color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)" }} className="shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/contact">
                    <button className="w-full py-3.5 rounded-full text-[13px] uppercase tracking-widest transition-all font-light"
                      style={{
                        fontFamily: HF,
                        background: i === 1 ? (isDark ? "#fff" : "#0a0a0a") : "transparent",
                        color: i === 1 ? (isDark ? "#000" : "#fff") : (isDark ? "#fff" : "#0a0a0a"),
                        border: i === 1 ? "none" : (isDark ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(0,0,0,0.2)"),
                      }}>
                      Request Access
                    </button>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── FOOTER / CTA ─────────────────────────────────────────────────── */}
        <section
          aria-label="Call to action"
          className="relative overflow-hidden flex flex-col items-center justify-center"
          style={{
            ...(isDark ? IMG_BG : lightSectionBg(4)),
            minHeight: "100vh",
          }}
        >
          {isDark && <div className="absolute inset-0" style={{ background: SECTION_OVERLAY[7] }} />}
          <div className="relative z-10 text-center px-[60px] max-w-5xl mx-auto">
            <motion.h2 initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              className="text-[64px] tracking-tight mb-10 leading-[1.05]"
              style={{ fontFamily: HF, fontWeight: 200, color: isDark ? "#fff" : "#0a0a0a" }}>
              The future of AI
              <br />
              <span style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)" }}>is Pipeline.</span>
            </motion.h2>

            <div className="buttons">
              <Link href="/contact">
                <button className="btn flex items-center gap-2"
                  style={{ fontFamily: HF, fontWeight: 300, background: isDark ? "#fff" : "#0a0a0a", color: isDark ? "#000" : "#fff", border: "none" }}>
                  Request Early Access <ArrowRight size={15} />
                </button>
              </Link>
              <Link href="/docs">
                <button className="btn" style={{ fontFamily: HF, fontWeight: 300 }}>Read the Docs</button>
              </Link>
            </div>

            <div className="mt-28 flex justify-center gap-14 text-[12px] uppercase tracking-[0.35em] pt-14"
              style={{
                fontFamily: HF, fontWeight: 300,
                color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
                borderTop: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
              }}>
              {[["GitHub", "#"], ["Twitter", "#"], ["Discord", "#"], ["Docs", "/docs"]].map(([label, href]) => (
                <Link key={label} href={href}
                  style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}
                  className="hover:opacity-100 transition-opacity">{label}</Link>
              ))}
            </div>

            <div className="mt-8 text-[12px]"
              style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}>
              © 2026 Pipeline Infrastructure · All modules active.
            </div>
            <div className="mt-3 text-[12px] tracking-widest uppercase"
              style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}>
              Backed by NICAT
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
