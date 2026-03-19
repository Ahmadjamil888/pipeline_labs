"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, GitBranch, Terminal, Cloud, Quote } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useTheme } from "./theme-provider";
import { ThemeToggle } from "./theme-toggle";
import { createClient } from "./supabase-client";

const HF = "'Helvetica World', Helvetica, Arial, sans-serif";

export default function HomePage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen" style={{ background: isDark ? "#050505" : "#fafafa" }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 border-b" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", background: isDark ? "rgba(5,5,5,0.8)" : "rgba(250,250,250,0.8)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-8 h-8">
              <Image src={isDark ? "/logo-dark.png" : "/logo-light.png"} alt="Pipeline AI" fill className="object-contain" />
            </div>
            <span style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "#fff" : "#0a0a0a" }}>Pipeline AI</span>
          </Link>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user ? (
              <Link href="/dashboard">
                <button className="px-5 py-2 rounded-full text-[13px]" style={{ fontFamily: HF, fontWeight: 300, background: isDark ? "#fff" : "#0a0a0a", color: isDark ? "#000" : "#fff" }}>Dashboard</button>
              </Link>
            ) : (
              <Link href="/login">
                <button className="px-5 py-2 rounded-full text-[13px]" style={{ fontFamily: HF, fontWeight: 300, background: isDark ? "#fff" : "#0a0a0a", color: isDark ? "#000" : "#fff" }}>Sign In</button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <span className="px-4 py-2 rounded-full text-[12px] border" style={{ fontFamily: HF, fontWeight: 300, borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)", color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }}>
              AI-Powered DevOps Platform
            </span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-7xl mb-6" style={{ fontFamily: HF, fontWeight: 200, color: isDark ? "#fff" : "#0a0a0a" }}>
            Deploy Smarter.<br />
            <span style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>Not Harder.</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-lg mb-10 max-w-2xl mx-auto" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
            One-click deployment infrastructure with AI analysis, Daytona sandboxes, and automated CI/CD pipelines.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex gap-4 justify-center">
            <Link href={user ? "/dashboard" : "/login"}>
              <button className="px-8 py-4 rounded-full text-[14px] flex items-center gap-2" style={{ fontFamily: HF, fontWeight: 300, background: isDark ? "#fff" : "#0a0a0a", color: isDark ? "#000" : "#fff" }}>
                Get Started <ArrowRight size={16} />
              </button>
            </Link>
            <Link href="https://pipeline.stldocs.app">
              <button className="px-8 py-4 rounded-full text-[14px] border" style={{ fontFamily: HF, fontWeight: 300, borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)", color: isDark ? "#fff" : "#0a0a0a" }}>
                Documentation
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 border-t" style={{ borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl mb-12 text-center" style={{ fontFamily: HF, fontWeight: 200, color: isDark ? "#fff" : "#0a0a0a" }}>Built for Modern Teams</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: GitBranch, title: "Git Integration", desc: "Connect any GitHub repository with one click" },
              { icon: Terminal, title: "AI Analysis", desc: "DeepSeek-powered code review and optimization" },
              { icon: Cloud, title: "Multi-Cloud", desc: "Deploy to Vercel, Render, or AWS automatically" },
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-2xl border" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
                <feature.icon size={28} className="mb-4" style={{ color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)" }} />
                <h3 className="text-xl mb-2" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "#fff" : "#0a0a0a" }}>{feature.title}</h3>
                <p className="text-[13px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 border-t" style={{ borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl mb-12 text-center" style={{ fontFamily: HF, fontWeight: 200, color: isDark ? "#fff" : "#0a0a0a" }}>Trusted by Developers</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { quote: "Pipeline AI reduced our deployment time from hours to minutes.", author: "Sarah Chen", role: "CTO at TechStart" },
              { quote: "The AI analysis caught issues we never would have found.", author: "Marcus Johnson", role: "Lead Developer" },
              { quote: "Best DevOps investment we've made this year.", author: "Emily Davis", role: "Engineering Manager" },
            ].map((t, i) => (
              <div key={i} className="p-8 rounded-2xl border" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
                <Quote size={24} className="mb-4 opacity-30" />
                <p className="text-[15px] mb-6" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.8)" }}>{t.quote}</p>
                <div>
                  <div className="text-[14px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "#fff" : "#0a0a0a" }}>{t.author}</div>
                  <div className="text-[12px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}>{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6 border-t" style={{ borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl mb-12 text-center" style={{ fontFamily: HF, fontWeight: 200, color: isDark ? "#fff" : "#0a0a0a" }}>Simple Pricing</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Starter", price: "$0", period: "Free", features: ["3 repositories", "Basic deployments", "Community support"] },
              { name: "Pro", price: "$29", period: "/month", features: ["Unlimited repos", "AI analysis", "Priority support", "Analytics"], popular: true },
              { name: "Enterprise", price: "Custom", period: "", features: ["Everything in Pro", "Custom integrations", "SLA guarantee", "Dedicated support"] },
            ].map((plan, i) => (
              <div key={i} className={`p-8 rounded-2xl border ${plan.popular ? "border-2" : ""}`} style={{ borderColor: plan.popular ? (isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)") : (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"), background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
                {plan.popular && (
                  <div className="text-[10px] uppercase tracking-widest mb-4 px-3 py-1 rounded-full inline-block" style={{ fontFamily: HF, background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", color: isDark ? "#fff" : "#0a0a0a" }}>Most Popular</div>
                )}
                <h3 className="text-xl mb-2" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "#fff" : "#0a0a0a" }}>{plan.name}</h3>
                <div className="text-4xl mb-1" style={{ fontFamily: HF, fontWeight: 200, color: isDark ? "#fff" : "#0a0a0a" }}>{plan.price}</div>
                <div className="text-[13px] mb-6" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}>{plan.period}</div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-[13px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }}>
                      <CheckCircle2 size={14} /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/dashboard/billing">
                  <button className="w-full py-3 rounded-full text-[13px]" style={{ fontFamily: HF, fontWeight: 300, background: plan.popular ? (isDark ? "#fff" : "#0a0a0a") : "transparent", color: plan.popular ? (isDark ? "#000" : "#fff") : (isDark ? "#fff" : "#0a0a0a"), border: plan.popular ? "none" : `1px solid ${isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"}` }}>
                    Get Started
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t" style={{ borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <Link href="/" className="flex items-center gap-3 justify-center">
            <div className="relative w-8 h-8">
              <Image src={isDark ? "/logo-dark.png" : "/logo-light.png"} alt="Pipeline AI" fill className="object-contain" />
            </div>
            <span style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "#fff" : "#0a0a0a" }}>Pipeline AI</span>
          </Link>

          <div className="flex items-center justify-center gap-8">
            <Link href="https://pipeline.stldocs.app" className="text-[13px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }}>Docs</Link>
            <Link href="/dashboard" className="text-[13px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }}>Dashboard</Link>
            <Link href="/login" className="text-[13px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }}>Login</Link>
          </div>

          <div className="text-[12px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)" }}>
            © 2026 Pipeline AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
