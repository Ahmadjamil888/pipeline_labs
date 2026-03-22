"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, GitBranch, Terminal, Cloud, Quote, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useTheme } from "./theme-provider";
import { ThemeToggle } from "./theme-toggle";
import { createClient } from "./supabase-client";

const HF = "'Helvetica World', Helvetica, Arial, sans-serif";

export default function HomePage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    checkAuth();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Ensure video properties are set
    video.muted = true;
    video.loop = true;
    video.playsInline = true;

    const tryPlay = () => {
      video.play().catch(() => {
        // Autoplay blocked — wait for user gesture
      });
    };

    tryPlay();

    const onInteraction = () => {
      tryPlay();
    };

    window.addEventListener("pointerdown", onInteraction, { once: true });
    window.addEventListener("scroll", onInteraction, { once: true, passive: true });

    return () => {
      window.removeEventListener("pointerdown", onInteraction);
      window.removeEventListener("scroll", onInteraction);
    };
  }, []);

  return (
    <div className="min-h-screen" style={{ background: isDark ? "#050505" : "#fafafa" }}>
      {/* Navbar */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4 border-b"
        style={{
          borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
          background: isDark ? "rgba(5,5,5,0.8)" : "rgba(250,250,250,0.8)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
            >
              <Terminal size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold" style={{ color: isDark ? "#fff" : "#000" }}>
              Pipeline Labs
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-sm font-medium transition-colors"
              style={{ color: isDark ? "#fff" : "#000" }}
            >
              Home
            </Link>
            <Link
              href="#features"
              className="text-sm font-medium transition-colors hover:text-blue-500"
              style={{ color: isDark ? "#fff" : "#000" }}
            >
              Features
            </Link>
            <Link
              href={user ? "/dashboard" : "/login"}
              className="text-sm font-medium transition-colors hover:text-blue-500"
              style={{ color: isDark ? "#fff" : "#000" }}
            >
              Dashboard
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium transition-colors hover:text-blue-500"
              style={{ color: isDark ? "#fff" : "#000" }}
            >
              Pricing
            </Link>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {user ? (
              <Link
                href="/dashboard"
                className="hidden md:block px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden md:block px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
              >
                Sign In
              </Link>
            )}
            
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg transition-colors"
              style={{ 
                color: isDark ? "#fff" : "#000",
                background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"
              }}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}>
            <div className="flex flex-col space-y-3">
              <Link
                href="/"
                className="text-sm font-medium transition-colors"
                style={{ color: isDark ? "#fff" : "#000" }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="#features"
                className="text-sm font-medium transition-colors hover:text-blue-500"
                style={{ color: isDark ? "#fff" : "#000" }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href={user ? "/dashboard" : "/login"}
                className="text-sm font-medium transition-colors hover:text-blue-500"
                style={{ color: isDark ? "#fff" : "#000" }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/pricing"
                className="text-sm font-medium transition-colors hover:text-blue-500"
                style={{ color: isDark ? "#fff" : "#000" }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section - Add margin-top to account for fixed navbar */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Gradient Background */}
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)"
              : "linear-gradient(135deg, #fafafa 0%, #f5f5f5 50%, #e8e8e8 100%)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1
              className="text-5xl md:text-7xl font-bold mb-6"
              style={{
                fontFamily: HF,
                fontWeight: 300,
                color: isDark ? "#fff" : "#000",
              }}
            >
              Deploy AI Models
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                at Scale
              </span>
            </h1>
            <p
              className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto"
              style={{
                color: isDark ? "#a1a1aa" : "#52525b",
                fontFamily: HF,
                fontWeight: 300,
              }}
            >
              From GitHub to production in seconds. No infrastructure management required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {user ? (
                <Link href="/dashboard">
                  <button
                    className="px-8 py-4 rounded-full text-lg font-semibold text-white transition-all hover:scale-105"
                    style={{
                      background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                      boxShadow: "0 4px 14px 0 rgba(59, 130, 246, 0.4)",
                    }}
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </button>
                </Link>
              ) : (
                <Link href="/login">
                  <button
                    className="px-8 py-4 rounded-full text-lg font-semibold text-white transition-all hover:scale-105"
                    style={{
                      background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                      boxShadow: "0 4px 14px 0 rgba(59, 130, 246, 0.4)",
                    }}
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </button>
                </Link>
              )}
              <Link
                href="#features"
                className="px-8 py-4 rounded-full text-lg font-semibold transition-all hover:scale-105 border"
                style={{
                  borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)",
                  color: isDark ? "#fff" : "#000",
                }}
              >
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-20 px-6" style={{ background: isDark ? "#050505" : "#fafafa" }}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{
                fontFamily: HF,
                fontWeight: 300,
                color: isDark ? "#fff" : "#000",
              }}
            >
              See Pipeline Labs in Action
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{
                color: isDark ? "#a1a1aa" : "#52525b",
                fontFamily: HF,
                fontWeight: 300,
              }}
            >
              Watch how easily you can deploy AI models from GitHub to production in seconds
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div
              className="overflow-hidden rounded-2xl shadow-2xl"
              style={{
                boxShadow: isDark 
                  ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)" 
                  : "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
              }}
            >
              <video
                ref={videoRef}
                className="w-full h-auto"
                style={{
                  display: 'block',
                  borderRadius: '1rem',
                }}
                autoPlay
                muted
                loop
                playsInline
                controls={false}
                preload="auto"
              >
                <source src="/hero-bg-video.mp4" type="video/mp4" />
              </video>
            </div>

            {/* Optional: Add a subtle gradient overlay on video edges */}
            <div
              className="absolute inset-0 pointer-events-none rounded-2xl"
              style={{
                background: isDark
                  ? "linear-gradient(to bottom, rgba(5,5,5,0.1) 0%, transparent 20%, transparent 80%, rgba(5,5,5,0.1) 100%)"
                  : "linear-gradient(to bottom, rgba(250,250,250,0.1) 0%, transparent 20%, transparent 80%, rgba(250,250,250,0.1) 100%)",
                borderRadius: '1rem',
              }}
            />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6" style={{ background: isDark ? "#0a0a0a" : "#fff" }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2
              className="text-4xl mb-4"
              style={{ fontFamily: HF, fontWeight: 200, color: isDark ? "#fff" : "#0a0a0a" }}
            >
              Built for Modern Teams
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{
                color: isDark ? "#a1a1aa" : "#52525b",
                fontFamily: HF,
                fontWeight: 300,
              }}
            >
              Everything you need to deploy and manage your applications with confidence
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: GitBranch, title: "Git Integration", desc: "Connect any GitHub repository with one click" },
              { icon: Terminal, title: "AI Analysis", desc: "DeepSeek-powered code review and optimization" },
              { icon: Cloud, title: "Multi-Cloud", desc: "Deploy to Vercel, Render, or AWS automatically" },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-8 rounded-2xl border"
                style={{
                  borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                  background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                }}
              >
                <feature.icon
                  size={28}
                  className="mb-4"
                  style={{ color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)" }}
                />
                <h3
                  className="text-xl mb-2"
                  style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "#fff" : "#0a0a0a" }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-[13px]"
                  style={{
                    fontFamily: HF,
                    fontWeight: 300,
                    color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
                  }}
                >
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section
        className="py-20 px-6 border-t"
        style={{ borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}
      >
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-4xl mb-12 text-center"
            style={{ fontFamily: HF, fontWeight: 200, color: isDark ? "#fff" : "#0a0a0a" }}
          >
            Trusted by Developers
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { quote: "Pipeline AI reduced our deployment time from hours to minutes.", author: "Sarah Chen", role: "CTO at TechStart" },
              { quote: "The AI analysis caught issues we never would have found.", author: "Marcus Johnson", role: "Lead Developer" },
              { quote: "Best DevOps investment we've made this year.", author: "Emily Davis", role: "Engineering Manager" },
            ].map((t, i) => (
              <div
                key={i}
                className="p-8 rounded-2xl border"
                style={{
                  borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                  background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                }}
              >
                <Quote size={24} className="mb-4 opacity-30" />
                <p
                  className="text-[15px] mb-6"
                  style={{
                    fontFamily: HF,
                    fontWeight: 300,
                    color: isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.8)",
                  }}
                >
                  {t.quote}
                </p>
                <div>
                  <div
                    className="text-[14px]"
                    style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "#fff" : "#0a0a0a" }}
                  >
                    {t.author}
                  </div>
                  <div
                    className="text-[12px]"
                    style={{
                      fontFamily: HF,
                      fontWeight: 300,
                      color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
                    }}
                  >
                    {t.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section
        className="py-20 px-6 border-t"
        style={{ borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}
      >
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-4xl mb-12 text-center"
            style={{ fontFamily: HF, fontWeight: 200, color: isDark ? "#fff" : "#0a0a0a" }}
          >
            Simple Pricing
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Starter",
                price: "$0",
                period: "Free",
                features: ["3 repositories", "Basic deployments", "Community support"],
              },
              {
                name: "Pro",
                price: "$29",
                period: "/month",
                features: ["Unlimited repos", "AI analysis", "Priority support", "Analytics"],
                popular: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                period: "",
                features: ["Everything in Pro", "Custom integrations", "SLA guarantee", "Dedicated support"],
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`p-8 rounded-2xl border ${plan.popular ? "border-2" : ""}`}
                style={{
                  borderColor: plan.popular
                    ? isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"
                    : isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                  background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                }}
              >
                {plan.popular && (
                  <div
                    className="text-[10px] uppercase tracking-widest mb-4 px-3 py-1 rounded-full inline-block"
                    style={{
                      fontFamily: HF,
                      background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                      color: isDark ? "#fff" : "#0a0a0a",
                    }}
                  >
                    Most Popular
                  </div>
                )}
                <h3
                  className="text-xl mb-2"
                  style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "#fff" : "#0a0a0a" }}
                >
                  {plan.name}
                </h3>
                <div
                  className="text-4xl mb-1"
                  style={{ fontFamily: HF, fontWeight: 200, color: isDark ? "#fff" : "#0a0a0a" }}
                >
                  {plan.price}
                </div>
                <div
                  className="text-[13px] mb-6"
                  style={{
                    fontFamily: HF,
                    fontWeight: 300,
                    color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
                  }}
                >
                  {plan.period}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li
                      key={j}
                      className="flex items-center gap-2 text-[13px]"
                      style={{
                        fontFamily: HF,
                        fontWeight: 300,
                        color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
                      }}
                    >
                      <CheckCircle2 size={14} /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/dashboard/billing">
                  <button
                    className="w-full py-3 rounded-full text-[13px]"
                    style={{
                      fontFamily: HF,
                      fontWeight: 300,
                      background: plan.popular ? (isDark ? "#fff" : "#0a0a0a") : "transparent",
                      color: plan.popular
                        ? isDark ? "#000" : "#fff"
                        : isDark ? "#fff" : "#0a0a0a",
                      border: plan.popular
                        ? "none"
                        : `1px solid ${isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"}`,
                    }}
                  >
                    Get Started
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-16 px-6 border-t"
        style={{ borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}
      >
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <Link href="/" className="flex items-center gap-3 justify-center">
            <div className="relative w-8 h-8">
              <Image
                src={isDark ? "/logo-dark.png" : "/logo-light.png"}
                alt="Pipeline AI"
                fill
                className="object-contain"
              />
            </div>
            <span style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "#fff" : "#0a0a0a" }}>
              Pipeline AI
            </span>
          </Link>

          <div className="flex items-center justify-center gap-8">
            {[
              { href: "https://pipeline.stldocs.app", label: "Docs" },
              { href: "/dashboard", label: "Dashboard" },
              { href: "/login", label: "Login" },
            ].map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                className="text-[13px]"
                style={{
                  fontFamily: HF,
                  fontWeight: 300,
                  color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
                }}
              >
                {label}
              </Link>
            ))}
          </div>

          <div
            className="text-[12px]"
            style={{
              fontFamily: HF,
              fontWeight: 300,
              color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)",
            }}
          >
            © 2026 Pipeline AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}