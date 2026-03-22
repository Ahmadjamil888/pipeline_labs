"use client";

import { motion } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen" style={{ background: isDark ? "#000000" : "#ffffff" }}>
      {/* Navbar - Same as dashboard */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4 border-b"
        style={{
          borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
          background: isDark ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.8)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo - Same as dashboard */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-8 h-8">
              <Image
                src={isDark ? "/logo-dark.png" : "/logo-light.png"}
                alt="Pipeline Labs"
                fill
                className="object-contain"
              />
            </div>
            <span 
              className="text-xl font-bold" 
              style={{ 
                fontFamily: HF, 
                fontWeight: 300, 
                color: isDark ? "#ffffff" : "#000000" 
              }}
            >
              Pipeline Labs
            </span>
          </Link>

          {/* Desktop Navigation - Same as dashboard */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-sm font-medium transition-colors"
              style={{ 
                fontFamily: HF,
                fontWeight: 300,
                color: isDark ? "#ffffff" : "#000000" 
              }}
            >
              Home
            </Link>
            <Link
              href="#features"
              className="text-sm font-medium transition-colors hover:text-blue-500"
              style={{ 
                fontFamily: HF,
                fontWeight: 300,
                color: isDark ? "#ffffff" : "#000000" 
              }}
            >
              Features
            </Link>
            <Link
              href={user ? "/dashboard" : "/login"}
              className="text-sm font-medium transition-colors hover:text-blue-500"
              style={{ 
                fontFamily: HF,
                fontWeight: 300,
                color: isDark ? "#ffffff" : "#000000" 
              }}
            >
              Dashboard
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium transition-colors hover:text-blue-500"
              style={{ 
                fontFamily: HF,
                fontWeight: 300,
                color: isDark ? "#ffffff" : "#000000" 
              }}
            >
              Pricing
            </Link>
          </div>

          {/* Right side buttons - Same as dashboard */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {user ? (
              <Link
                href="/dashboard"
                className="hidden md:block px-5 py-2 rounded-full text-[13px] font-medium text-white transition-all hover:scale-105"
                style={{
                  fontFamily: HF,
                  fontWeight: 300,
                  background: isDark ? "#ffffff" : "#000000",
                  color: isDark ? "#000000" : "#ffffff",
                }}
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden md:block px-5 py-2 rounded-full text-[13px] font-medium text-white transition-all hover:scale-105"
                style={{
                  fontFamily: HF,
                  fontWeight: 300,
                  background: isDark ? "#ffffff" : "#000000",
                  color: isDark ? "#000000" : "#ffffff",
                }}
              >
                Sign In
              </Link>
            )}
            
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg transition-colors"
              style={{ 
                color: isDark ? "#ffffff" : "#000000",
                background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"
              }}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu - Same as dashboard */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}>
            <div className="flex flex-col space-y-3">
              <Link
                href="/"
                className="text-sm font-medium transition-colors"
                style={{ 
                  fontFamily: HF,
                  fontWeight: 300,
                  color: isDark ? "#ffffff" : "#000000" 
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="#features"
                className="text-sm font-medium transition-colors hover:text-blue-500"
                style={{ 
                  fontFamily: HF,
                  fontWeight: 300,
                  color: isDark ? "#ffffff" : "#000000" 
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href={user ? "/dashboard" : "/login"}
                className="text-sm font-medium transition-colors hover:text-blue-500"
                style={{ 
                  fontFamily: HF,
                  fontWeight: 300,
                  color: isDark ? "#ffffff" : "#000000" 
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/pricing"
                className="text-sm font-medium transition-colors hover:text-blue-500"
                style={{ 
                  fontFamily: HF,
                  fontWeight: 300,
                  color: isDark ? "#ffffff" : "#000000" 
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section with Spline 3D */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Absolute black/white background */}
        <div
          className="absolute inset-0"
          style={{
            background: isDark ? "#000000" : "#ffffff",
          }}
        />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-screen">
            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-8"
              >
                <span
                  className="inline-block px-4 py-2 rounded-full text-[12px] font-medium border"
                  style={{
                    fontFamily: HF,
                    fontWeight: 300,
                    borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
                    color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
                  }}
                >
                  AI-Powered DevOps Platform
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
                style={{
                  fontFamily: HF,
                  fontWeight: 300,
                  color: isDark ? "#ffffff" : "#000000",
                }}
              >
                Deploy AI Models
                <br />
                <span style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
                  at Scale
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-lg md:text-xl mb-10 max-w-2xl leading-relaxed"
                style={{
                  fontFamily: HF,
                  fontWeight: 300,
                  color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
                }}
              >
                From GitHub to production in seconds. No infrastructure management required.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                {user ? (
                  <Link href="/dashboard">
                    <button
                      className="px-8 py-4 rounded-full text-[14px] font-medium flex items-center gap-2 transition-all hover:scale-105"
                      style={{
                        fontFamily: HF,
                        fontWeight: 300,
                        background: isDark ? "#ffffff" : "#000000",
                        color: isDark ? "#000000" : "#ffffff",
                      }}
                    >
                      Dashboard
                      <ArrowRight size={16} />
                    </button>
                  </Link>
                ) : (
                  <Link href="/login">
                    <button
                      className="px-8 py-4 rounded-full text-[14px] font-medium flex items-center gap-2 transition-all hover:scale-105"
                      style={{
                        fontFamily: HF,
                        fontWeight: 300,
                        background: isDark ? "#ffffff" : "#000000",
                        color: isDark ? "#000000" : "#ffffff",
                      }}
                    >
                      Get Started
                      <ArrowRight size={16} />
                    </button>
                  </Link>
                )}
                <Link
                  href="#features"
                  className="px-8 py-4 rounded-full text-[14px] font-medium border transition-all hover:scale-105"
                  style={{
                    fontFamily: HF,
                    fontWeight: 300,
                    borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
                    color: isDark ? "#ffffff" : "#000000",
                  }}
                >
                  Documentation
                </Link>
              </motion.div>
            </motion.div>

            {/* Spline 3D Component */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative w-full h-[600px]"
            >
              <div className="w-full h-full rounded-2xl overflow-hidden border" style={{ 
                borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                background: isDark ? "#000000" : "#ffffff",
              }}>
                <iframe 
                  src="https://app.spline.design/file/5da0db4a-0182-4528-9712-19ce61af10da" 
                  frameBorder="0"
                  width="100%"
                  height="100%"
                  style={{
                    border: 'none',
                    borderRadius: '1rem',
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section - Black and White */}
      <section id="features" className="py-20 px-6" style={{ background: isDark ? "#000000" : "#ffffff" }}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 
              className="text-4xl font-bold mb-4"
              style={{
                fontFamily: HF,
                fontWeight: 300,
                color: isDark ? "#ffffff" : "#000000",
              }}
            >
              Built for Modern Teams
            </h2>
            <p 
              className="text-lg max-w-2xl mx-auto"
              style={{
                fontFamily: HF,
                fontWeight: 300,
                color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
              }}
            >
              Everything you need to deploy and manage your applications with confidence
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Git Integration",
                description: "Connect any GitHub repository with one click",
                icon: "🔗"
              },
              {
                title: "AI Analysis", 
                description: "DeepSeek-powered code review and optimization",
                icon: "🤖"
              },
              {
                title: "Multi-Cloud",
                description: "Deploy to Vercel, Render, or AWS automatically",
                icon: "☁️"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-8 rounded-2xl border text-center"
                style={{
                  borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                  background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 
                  className="text-xl font-bold mb-3"
                  style={{
                    fontFamily: HF,
                    fontWeight: 300,
                    color: isDark ? "#ffffff" : "#000000",
                  }}
                >
                  {feature.title}
                </h3>
                <p 
                  className="text-sm"
                  style={{
                    fontFamily: HF,
                    fontWeight: 300,
                    color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
                  }}
                >
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6" style={{ background: isDark ? "#000000" : "#ffffff" }}>
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
                color: isDark ? "#ffffff" : "#000000",
              }}
            >
              Ready to Transform Your Deployment Workflow?
            </h2>
            <p
              className="text-xl mb-8"
              style={{
                fontFamily: HF,
                fontWeight: 300,
                color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
              }}
            >
              Join thousands of developers deploying with Pipeline Labs
            </p>
            {user ? (
              <Link href="/dashboard">
                <button
                  className="px-8 py-4 rounded-full text-[14px] font-medium transition-all hover:scale-105"
                  style={{
                    fontFamily: HF,
                    fontWeight: 300,
                    background: isDark ? "#ffffff" : "#000000",
                    color: isDark ? "#000000" : "#ffffff",
                  }}
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </Link>
            ) : (
              <Link href="/login">
                <button
                  className="px-8 py-4 rounded-full text-[14px] font-medium transition-all hover:scale-105"
                  style={{
                    fontFamily: HF,
                    fontWeight: 300,
                    background: isDark ? "#ffffff" : "#000000",
                    color: isDark ? "#000000" : "#ffffff",
                  }}
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer - Same as dashboard style */}
      <footer className="py-12 px-6 border-t" style={{ 
        background: isDark ? "#000000" : "#ffffff",
        borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
      }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="relative w-6 h-6">
                  <Image
                    src={isDark ? "/logo-dark.png" : "/logo-light.png"}
                    alt="Pipeline Labs"
                    fill
                    className="object-contain"
                  />
                </div>
                <span 
                  className="text-lg font-bold"
                  style={{ 
                    fontFamily: HF,
                    fontWeight: 300,
                    color: isDark ? "#ffffff" : "#000000",
                  }}
                >
                  Pipeline Labs
                </span>
              </div>
              <p 
                className="text-sm"
                style={{
                  fontFamily: HF,
                  fontWeight: 300,
                  color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
                }}
              >
                AI-powered DevOps platform for modern development teams.
              </p>
            </div>
            
            <div>
              <h4 
                className="font-medium mb-4"
                style={{
                  fontFamily: HF,
                  fontWeight: 300,
                  color: isDark ? "#ffffff" : "#000000",
                }}
              >
                Product
              </h4>
              <ul className="space-y-2">
                {['Features', 'Pricing', 'Documentation'].map((item) => (
                  <li key={item}>
                    <Link 
                      href="#"
                      className="text-sm transition-colors hover:opacity-80"
                      style={{
                        fontFamily: HF,
                        fontWeight: 300,
                        color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
                      }}
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 
                className="font-medium mb-4"
                style={{
                  fontFamily: HF,
                  fontWeight: 300,
                  color: isDark ? "#ffffff" : "#000000",
                }}
              >
                Company
              </h4>
              <ul className="space-y-2">
                {['About', 'Blog', 'Contact'].map((item) => (
                  <li key={item}>
                    <Link 
                      href="#"
                      className="text-sm transition-colors hover:opacity-80"
                      style={{
                        fontFamily: HF,
                        fontWeight: 300,
                        color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
                      }}
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 
                className="font-medium mb-4"
                style={{
                  fontFamily: HF,
                  fontWeight: 300,
                  color: isDark ? "#ffffff" : "#000000",
                }}
              >
                Legal
              </h4>
              <ul className="space-y-2">
                {['Privacy', 'Terms'].map((item) => (
                  <li key={item}>
                    <Link 
                      href="#"
                      className="text-sm transition-colors hover:opacity-80"
                      style={{
                        fontFamily: HF,
                        fontWeight: 300,
                        color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
                      }}
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}>
            <p 
              className="text-center text-sm"
              style={{
                fontFamily: HF,
                fontWeight: 300,
                color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
              }}
            >
              © 2024 Pipeline Labs. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
