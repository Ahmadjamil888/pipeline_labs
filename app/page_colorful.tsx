"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, GitBranch, Terminal, Cloud, Quote, Menu, X, Zap, Shield, Globe, Code2 } from "lucide-react";
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

    window.addEventListener("pointerdown", onInteraction, { once: true, passive: true });

    return () => {
      window.removeEventListener("pointerdown", onInteraction);
      window.removeEventListener("scroll", onInteraction);
    };
  }, []);

  return (
    <div className="min-h-screen" style={{ background: isDark ? "#0a0a0a" : "#ffffff" }}>
      {/* Navbar */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4 border-b"
        style={{
          borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
          background: isDark ? "rgba(10,10,10,0.8)" : "rgba(255,255,255,0.8)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-8 h-8">
              <Image
                src={isDark ? "/logo-dark.png" : "/logo-light.png"}
                alt="Pipeline Labs"
                fill
                className="object-contain"
              />
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

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Clean gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)"
              : "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <span
              className="inline-block px-4 py-2 rounded-full text-sm font-medium border"
              style={{
                borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)",
                color: isDark ? "#a1a1aa" : "#64748b",
                background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
              }}
            >
              🚀 AI-Powered DevOps Platform
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <h1
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
              style={{
                fontFamily: HF,
                fontWeight: 300,
                color: isDark ? "#ffffff" : "#0a0a0a",
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
              className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed"
              style={{
                color: isDark ? "#a1a1aa" : "#64748b",
                fontFamily: HF,
                fontWeight: 300,
              }}
            >
              From GitHub to production in seconds. No infrastructure management required.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            {user ? (
              <Link href="/dashboard">
                <button
                  className="px-8 py-4 rounded-full text-lg font-semibold text-white transition-all hover:scale-105 shadow-lg"
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
                  className="px-8 py-4 rounded-full text-lg font-semibold text-white transition-all hover:scale-105 shadow-lg"
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
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            <div className="text-center">
              <div className="text-3xl font-bold mb-2" style={{ color: isDark ? "#fff" : "#000" }}>
                10K+
              </div>
              <div style={{ color: isDark ? "#a1a1aa" : "#64748b" }}>
                Deployments
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2" style={{ color: isDark ? "#fff" : "#000" }}>
                99.9%
              </div>
              <div style={{ color: isDark ? "#a1a1aa" : "#64748b" }}>
                Uptime
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2" style={{ color: isDark ? "#fff" : "#000" }}>
                &lt;2s
              </div>
              <div style={{ color: isDark ? "#a1a1aa" : "#64748b" }}>
                Build Time
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section 1 - AI Analysis */}
      <section className="min-h-screen flex items-center justify-center px-6" style={{ background: isDark ? "#0a0a0a" : "#ffffff" }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-lg" style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold" style={{ color: isDark ? "#fff" : "#000" }}>
                  AI-Powered Analysis
                </h2>
              </div>
              <p className="text-lg mb-6 leading-relaxed" style={{ color: isDark ? "#a1a1aa" : "#64748b" }}>
                Our DeepSeek AI analyzes your repository, detects frameworks, and generates optimal deployment configurations automatically.
              </p>
              <ul className="space-y-4">
                {[
                  "Automatic framework detection",
                  "Smart dependency analysis", 
                  "Optimized build configurations",
                  "Security vulnerability scanning"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span style={{ color: isDark ? "#d1d5db" : "#374151" }}>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="p-8 rounded-2xl border" style={{ 
                borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"
              }}>
                <div className="aspect-video rounded-lg flex items-center justify-center" style={{ background: isDark ? "#1a1a2e" : "#f8fafc" }}>
                  <Terminal className="h-16 w-16" style={{ color: isDark ? "#3b82f6" : "#6366f1" }} />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section 2 - Multi-Cloud */}
      <section className="min-h-screen flex items-center justify-center px-6" style={{ background: isDark ? "#0f0f23" : "#f8fafc" }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <div className="p-8 rounded-2xl border" style={{ 
                borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"
              }}>
                <div className="aspect-video rounded-lg flex items-center justify-center" style={{ background: isDark ? "#1a1a2e" : "#ffffff" }}>
                  <Cloud className="h-16 w-16" style={{ color: isDark ? "#8b5cf6" : "#8b5cf6" }} />
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-lg" style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899)" }}>
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold" style={{ color: isDark ? "#fff" : "#000" }}>
                  Multi-Cloud Deployment
                </h2>
              </div>
              <p className="text-lg mb-6 leading-relaxed" style={{ color: isDark ? "#a1a1aa" : "#64748b" }}>
                Deploy to any cloud platform with a single command. Vercel, Render, AWS, Google Cloud - we support them all.
              </p>
              <ul className="space-y-4">
                {[
                  "One-click deployment",
                  "Automatic scaling",
                  "Global CDN distribution",
                  "Custom domain support"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span style={{ color: isDark ? "#d1d5db" : "#374151" }}>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section 3 - Security */}
      <section className="min-h-screen flex items-center justify-center px-6" style={{ background: isDark ? "#0a0a0a" : "#ffffff" }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-lg" style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold" style={{ color: isDark ? "#fff" : "#000" }}>
                  Enterprise Security
                </h2>
              </div>
              <p className="text-lg mb-6 leading-relaxed" style={{ color: isDark ? "#a1a1aa" : "#64748b" }}>
                Bank-level security with encrypted deployments, isolated sandboxes, and comprehensive audit logs.
              </p>
              <ul className="space-y-4">
                {[
                  "End-to-end encryption",
                  "Isolated build environments",
                  "Role-based access control",
                  "SOC2 compliant infrastructure"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span style={{ color: isDark ? "#d1d5db" : "#374151" }}>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="p-8 rounded-2xl border" style={{ 
                borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"
              }}>
                <div className="aspect-video rounded-lg flex items-center justify-center" style={{ background: isDark ? "#1a1a2e" : "#f0fdf4" }}>
                  <Shield className="h-16 w-16" style={{ color: isDark ? "#10b981" : "#10b981" }} />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section 4 - Developer Experience */}
      <section className="min-h-screen flex items-center justify-center px-6" style={{ background: isDark ? "#0f0f23" : "#f8fafc" }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <div className="p-8 rounded-2xl border" style={{ 
                borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"
              }}>
                <div className="aspect-video rounded-lg flex items-center justify-center" style={{ background: isDark ? "#1a1a2e" : "#ffffff" }}>
                  <Code2 className="h-16 w-16" style={{ color: isDark ? "#f59e0b" : "#f59e0b" }} />
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-lg" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
                  <Code2 className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold" style={{ color: isDark ? "#fff" : "#000" }}>
                  Developer First
                </h2>
              </div>
              <p className="text-lg mb-6 leading-relaxed" style={{ color: isDark ? "#a1a1aa" : "#64748b" }}>
                Built for developers, by developers. Git-based workflows, instant previews, and comprehensive APIs.
              </p>
              <ul className="space-y-4">
                {[
                  "Git-based deployments",
                  "Instant preview environments",
                  "Comprehensive REST APIs",
                  "Real-time logs and monitoring"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span style={{ color: isDark ? "#d1d5db" : "#374151" }}>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section 5 - Integration */}
      <section className="min-h-screen flex items-center justify-center px-6" style={{ background: isDark ? "#0a0a0a" : "#ffffff" }}>
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-3 rounded-lg" style={{ background: "linear-gradient(135deg, #06b6d4, #0891b2)" }}>
                <GitBranch className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold" style={{ color: isDark ? "#fff" : "#000" }}>
              Seamless Integration
            </h2>
            </div>
            <p className="text-xl max-w-3xl mx-auto leading-relaxed" style={{ color: isDark ? "#a1a1aa" : "#64748b" }}>
              Integrate with your existing tools and workflows. GitHub, GitLab, Slack, Discord, and more.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { name: "GitHub", icon: "🐙" },
              { name: "GitLab", icon: "🦊" },
              { name: "Slack", icon: "💬" },
              { name: "Discord", icon: "🎮" },
              { name: "Docker", icon: "🐳" },
              { name: "Kubernetes", icon: "☸️" },
              { name: "AWS", icon: "☁️" },
              { name: "Vercel", icon: "▲" }
            ].map((tool, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl border text-center"
                style={{ 
                  borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                  background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"
                }}
              >
                <div className="text-4xl mb-3">{tool.icon}</div>
                <div className="font-medium" style={{ color: isDark ? "#fff" : "#000" }}>
                  {tool.name}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-20 px-6" style={{ background: isDark ? "#0f0f23" : "#f8fafc" }}>
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

      {/* CTA Section */}
      <section className="py-20 px-6" style={{ background: isDark ? "#0a0a0a" : "#ffffff" }}>
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2
              className="text-4xl font-bold mb-6"
              style={{
                fontFamily: HF,
                fontWeight: 300,
                color: isDark ? "#fff" : "#000",
              }}
            >
              Ready to Transform Your Deployment Workflow?
            </h2>
            <p
              className="text-xl mb-8"
              style={{
                color: isDark ? "#a1a1aa" : "#64748b",
                fontFamily: HF,
                fontWeight: 300,
              }}
            >
              Join thousands of developers deploying with Pipeline Labs
            </p>
            {user ? (
              <Link href="/dashboard">
                <button
                  className="px-8 py-4 rounded-full text-lg font-semibold text-white transition-all hover:scale-105 shadow-lg"
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
                  className="px-8 py-4 rounded-full text-lg font-semibold text-white transition-all hover:scale-105 shadow-lg"
                  style={{
                    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                    boxShadow: "0 4px 14px 0 rgba(59, 130, 246, 0.4)",
                  }}
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </Link>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
