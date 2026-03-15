"use client"

import { useState } from "react"
import { createClient } from "@/app/supabase-client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Loader2, ShieldCheck, Cpu, Fingerprint, Chrome, Github, Sun, Moon } from "lucide-react"
import Image from "next/image"
import { useTheme } from "@/app/theme-provider"

const HF = "'Helvetica World', Helvetica, Arial, sans-serif"

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const { theme, toggleTheme } = useTheme()

  const isDark = theme === "dark"

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/dashboard` }
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/dashboard`
          },
        })
        if (signUpError) throw signUpError
        setError("Verification link sent. Please check your email.")
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) throw signInError
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: isDark ? "#050505" : "#fafafa" }}>
      {/* Header with Logo and Theme Toggle */}
      <header className="flex items-center justify-between px-8 py-6">
        <Link href="/" className="flex items-center gap-3">
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
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full transition-all"
          style={{ 
            background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
            color: isDark ? "#fff" : "#0a0a0a"
          }}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo and Title */}
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <div className="relative w-16 h-16">
                <Image 
                  src={isDark ? "/logo-dark.png" : "/logo-light.png"} 
                  alt="Pipeline AI" 
                  fill 
                  className="object-contain" 
                />
              </div>
            </div>
            <h1 
              className="text-3xl mb-2"
              style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "#fff" : "#0a0a0a" }}
            >
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h1>
            <p 
              className="text-sm"
              style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}
            >
              {isSignUp ? "Sign up for Pipeline AI" : "Sign in to your account"}
            </p>
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => handleOAuthLogin('github')}
              disabled={loading}
              className="flex items-center justify-center gap-3 px-4 py-3 rounded-full transition-all"
              style={{
                fontFamily: HF,
                fontWeight: 300,
                fontSize: "13px",
                background: "transparent",
                color: isDark ? "#fff" : "#0a0a0a",
                border: isDark ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(0,0,0,0.15)",
              }}
            >
              <Github size={18} />
              GitHub
            </button>
            <button
              onClick={() => handleOAuthLogin('google')}
              disabled={loading}
              className="flex items-center justify-center gap-3 px-4 py-3 rounded-full transition-all"
              style={{
                fontFamily: HF,
                fontWeight: 300,
                fontSize: "13px",
                background: "transparent",
                color: isDark ? "#fff" : "#0a0a0a",
                border: isDark ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(0,0,0,0.15)",
              }}
            >
              <Chrome size={18} />
              Google
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-8">
            <div 
              className="absolute inset-0 flex items-center"
              style={{ color: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}
            >
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center">
              <span 
                className="px-4 text-[11px] uppercase tracking-[0.2em]"
                style={{ 
                  fontFamily: HF, 
                  fontWeight: 300,
                  background: isDark ? "#050505" : "#fafafa",
                  color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"
                }}
              >
                Or email
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-5">
            {isSignUp && (
              <div className="space-y-2">
                <label 
                  className="text-[11px] uppercase tracking-[0.15em]"
                  style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required={isSignUp}
                  className="w-full px-4 py-3 rounded-lg transition-all outline-none"
                  style={{
                    fontFamily: HF,
                    fontWeight: 300,
                    background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
                    color: isDark ? "#fff" : "#0a0a0a",
                    border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
                  }}
                />
              </div>
            )}

            <div className="space-y-2">
              <label 
                className="text-[11px] uppercase tracking-[0.15em]"
                style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                className="w-full px-4 py-3 rounded-lg transition-all outline-none"
                style={{
                  fontFamily: HF,
                  fontWeight: 300,
                  background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
                  color: isDark ? "#fff" : "#0a0a0a",
                  border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
                }}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label 
                  className="text-[11px] uppercase tracking-[0.15em]"
                  style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}
                >
                  Password
                </label>
                {!isSignUp && (
                  <Link 
                    href="/forgot-password"
                    className="text-[11px] hover:opacity-70 transition-opacity"
                    style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}
                  >
                    Forgot?
                  </Link>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                required
                className="w-full px-4 py-3 rounded-lg transition-all outline-none"
                style={{
                  fontFamily: HF,
                  fontWeight: 300,
                  background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
                  color: isDark ? "#fff" : "#0a0a0a",
                  border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
                }}
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-center p-3 rounded-lg"
                style={{
                  fontFamily: HF,
                  fontWeight: 300,
                  background: error.includes('sent') ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                  color: error.includes('sent') ? "#22c55e" : "#ef4444",
                  border: error.includes('sent') ? "1px solid rgba(34,197,94,0.2)" : "1px solid rgba(239,68,68,0.2)",
                }}
              >
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full flex items-center justify-center gap-2 transition-all"
              style={{
                fontFamily: HF,
                fontWeight: 300,
                fontSize: "13px",
                background: isDark ? "#fff" : "#0a0a0a",
                color: isDark ? "#000" : "#fff",
                border: "none",
              }}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {isSignUp ? "Create Account" : "Sign In"}
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[13px] hover:opacity-70 transition-opacity"
              style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}
            >
              {isSignUp ? "Already have an account? " : "Don't have an account? "}
              <span style={{ color: isDark ? "#fff" : "#0a0a0a" }}>
                {isSignUp ? "Sign in" : "Sign up"}
              </span>
            </button>
          </div>

          {/* Footer Security Badges */}
          <div className="mt-12 flex justify-center items-center gap-6">
            <div className="flex items-center gap-1.5" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)" }}>
              <ShieldCheck size={12} />
              <span className="text-[10px] uppercase tracking-wider" style={{ fontFamily: HF, fontWeight: 300 }}>TLS 1.3</span>
            </div>
            <div className="flex items-center gap-1.5" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)" }}>
              <Cpu size={12} />
              <span className="text-[10px] uppercase tracking-wider" style={{ fontFamily: HF, fontWeight: 300 }}>AES-256</span>
            </div>
            <div className="flex items-center gap-1.5" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)" }}>
              <Fingerprint size={12} />
              <span className="text-[10px] uppercase tracking-wider" style={{ fontFamily: HF, fontWeight: 300 }}>v1.0.0</span>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
