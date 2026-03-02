"use client";

import { motion } from "framer-motion";
import { ArrowRight, Mail, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useTheme } from "../theme-provider";
import { ThemeToggle } from "../theme-toggle";

const HF = "'Helvetica World', Helvetica, Arial, sans-serif";

const IMG_BG: React.CSSProperties = {
  backgroundImage: `url('/ChatGPT Image Mar 1, 2026, 06_25_33 AM.png')`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "50% 0%",
};

export default function ContactPage() {
  const [scrolled, setScrolled] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ fontFamily: HF, fontWeight: 300 }}>

      {/* ── NAVBAR ── */}
      <nav
        className="fixed top-0 w-full z-50 flex justify-between items-center px-[60px] py-5 transition-all duration-500"
        style={{
          background: scrolled ? "rgba(8, 8, 8, 0.45)" : "transparent",
          backdropFilter: scrolled ? "blur(48px) saturate(220%)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(48px) saturate(220%)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
        }}
      >
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo-dark.png" alt="Pipeline" width={26} height={26} className="object-contain" />
          <span className="text-white text-[15px] tracking-[0.1em]" style={{ fontFamily: HF, fontWeight: 300 }}>
            Pipeline
          </span>
        </Link>

        <div className="hidden md:flex gap-10 text-[15px] text-white" style={{ fontFamily: HF, fontWeight: 300 }}>
          {[["/#product", "Product"], ["/#enterprise", "Enterprise"], ["/#pricing", "Pricing"], ["/docs", "Docs"]].map(
            ([href, label]) => (
              <Link key={label} href={href} className="text-white hover:opacity-50 transition-opacity">
                {label}
              </Link>
            )
          )}
        </div>

        <div className="flex items-center gap-5">
          <ThemeToggle />
          <Link href="/contact">
            <button className="btn light text-[14px] px-5 py-2 font-light" style={{ fontFamily: HF }}>
              Request Early Access
            </button>
          </Link>
        </div>
      </nav>

      {/* ── HERO / CONTACT SECTION ── */}
      <style>{`
        @keyframes waveShift {
          0%   { background-position: 50% 0%; }
          25%  { background-position: 52% 3%; }
          50%  { background-position: 50% 6%; }
          75%  { background-position: 48% 3%; }
          100% { background-position: 50% 0%; }
        }
        @keyframes waveGrad {
          0%   { opacity: 0.38; transform: scale(1)    translateX(0px); }
          33%  { opacity: 0.44; transform: scale(1.04) translateX(-18px); }
          66%  { opacity: 0.34; transform: scale(0.98) translateX(12px); }
          100% { opacity: 0.38; transform: scale(1)    translateX(0px); }
        }
        .hero-bg-wave {
          animation: waveShift 18s ease-in-out infinite;
          background-size: 110% 110%;
        }
        .hero-overlay-wave {
          animation: waveGrad 14s ease-in-out infinite;
        }
      `}</style>

      <section
        className="relative flex flex-col items-center justify-center overflow-hidden hero-bg-wave"
        style={{
          backgroundImage: `url('/ChatGPT Image Mar 1, 2026, 06_25_33 AM.png')`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "50% 0%",
          minHeight: "100vh",
        }}
      >
        {/* static dark base */}
        <div className="absolute inset-0 bg-black/40" />
        {/* animated soft gradient wave */}
        <div
          className="absolute inset-0 hero-overlay-wave"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(80,80,110,0.18) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto px-8 w-full"
          style={{ paddingTop: "80px" }}
        >
          {/* pill badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/20 bg-black/30 backdrop-blur-xl mb-16"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
            <span className="text-[13px] text-white/70" style={{ fontFamily: HF, fontWeight: 300 }}>
              Early Access · Limited Spots
            </span>
          </motion.div>

          {/* headline */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 0.1 }}
            className="leading-[1.08] text-white mb-10 tracking-tight"
            style={{ fontFamily: HF, fontWeight: 200, fontSize: "clamp(40px, 5.5vw, 64px)" }}
          >
            Get Early Access
            <br />
            <span className="text-white/45">to Pipeline.</span>
          </motion.h1>

          {/* subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.28 }}
            className="text-[16px] text-white/45 max-w-md leading-[1.8] mb-2"
            style={{ fontFamily: HF, fontWeight: 300, letterSpacing: "0.01em" }}
          >
            We&apos;re onboarding a select group of teams to build with Pipeline before public launch.
            Reach out directly and we&apos;ll get you set up.
          </motion.p>

          {/* contact cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 flex flex-col sm:flex-row gap-6 w-full max-w-xl"
          >
            {/* WhatsApp */}
            <a
              href="https://wa.me/923338188722"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 group"
            >
              <div
                className="flex flex-col gap-4 p-8 rounded-2xl transition-all duration-300 group-hover:scale-[1.02]"
                style={{
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.05)",
                  backdropFilter: "blur(16px)",
                }}
              >
                <div className="flex items-center gap-3">
                  <MessageCircle size={20} style={{ color: "rgba(255,255,255,0.5)" }} />
                  <span
                    className="text-[10px] uppercase tracking-[0.3em]"
                    style={{ fontFamily: HF, fontWeight: 300, color: "rgba(255,255,255,0.35)" }}
                  >
                    WhatsApp
                  </span>
                </div>
                <div
                  className="text-[18px] tracking-wide"
                  style={{ fontFamily: HF, fontWeight: 200, color: "#fff" }}
                >
                  +92 333 818 8722
                </div>
                <div
                  className="flex items-center gap-1.5 text-[11px] transition-opacity group-hover:opacity-100 opacity-40"
                  style={{ fontFamily: HF, color: "#fff" }}
                >
                  Message us <ArrowRight size={11} />
                </div>
              </div>
            </a>

            {/* Email */}
            <a
              href="mailto:ahmadjamildhami@gmail.com"
              className="flex-1 group"
            >
              <div
                className="flex flex-col gap-4 p-8 rounded-2xl transition-all duration-300 group-hover:scale-[1.02]"
                style={{
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.05)",
                  backdropFilter: "blur(16px)",
                }}
              >
                <div className="flex items-center gap-3">
                  <Mail size={20} style={{ color: "rgba(255,255,255,0.5)" }} />
                  <span
                    className="text-[10px] uppercase tracking-[0.3em]"
                    style={{ fontFamily: HF, fontWeight: 300, color: "rgba(255,255,255,0.35)" }}
                  >
                    Email
                  </span>
                </div>
                <div
                  className="text-[15px] tracking-wide break-all"
                  style={{ fontFamily: HF, fontWeight: 200, color: "#fff" }}
                >
                  ahmadjamildhami@gmail.com
                </div>
                <div
                  className="flex items-center gap-1.5 text-[11px] transition-opacity group-hover:opacity-100 opacity-40"
                  style={{ fontFamily: HF, color: "#fff" }}
                >
                  Send email <ArrowRight size={11} />
                </div>
              </div>
            </a>
          </motion.div>

          {/* back to home */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-12"
          >
            <Link
              href="/"
              className="text-[13px] text-white/30 hover:text-white/70 transition-colors tracking-widest uppercase"
              style={{ fontFamily: HF, fontWeight: 300 }}
            >
              ← Back to home
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <section
        className="relative overflow-hidden flex flex-col items-center justify-center py-20"
        style={{
          backgroundImage: `url('/ChatGPT Image Mar 1, 2026, 06_25_33 AM.png')`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "50% 100%",
          backgroundSize: "110% 110%",
        }}
      >
        <div
          className="absolute inset-0"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(3px)" }}
        />
        <div className="relative z-10 text-center px-[60px]">
          <div
            className="flex justify-center gap-14 text-[12px] uppercase tracking-[0.35em]"
            style={{ fontFamily: HF, fontWeight: 300, color: "rgba(255,255,255,0.4)" }}
          >
            {[["GitHub", "#"], ["Twitter", "#"], ["Discord", "#"], ["Docs", "/docs"]].map(([label, href]) => (
              <Link
                key={label}
                href={href}
                style={{ color: "rgba(255,255,255,0.4)" }}
                className="hover:opacity-100 transition-opacity"
              >
                {label}
              </Link>
            ))}
          </div>
          <div
            className="mt-8 text-[12px]"
            style={{ fontFamily: HF, fontWeight: 300, color: "rgba(255,255,255,0.4)" }}
          >
            © 2026 Pipeline Infrastructure · All modules active.
          </div>
          <div
            className="mt-3 text-[12px] tracking-widest uppercase"
            style={{ fontFamily: HF, fontWeight: 300, color: "rgba(255,255,255,0.4)" }}
          >
            Backed by NICAT
          </div>
        </div>
      </section>

    </div>
  );
}
