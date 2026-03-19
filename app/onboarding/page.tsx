"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/app/supabase-client"
import { useRouter } from "next/navigation"
import { Building2, ArrowRight, RefreshCw } from "lucide-react"
import { useTheme } from "@/app/theme-provider"

const HF = "'Helvetica World', Helvetica, Arial, sans-serif"

export default function OnboardingPage() {
  const [orgName, setOrgName] = useState('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const { theme } = useTheme()
  const isDark = theme === "dark"

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Check if user already has an organization
      const { data: orgs } = await supabase
        .from('organizations')
        .select('*')
        .eq('user_id', user.id)
        .limit(1)

      if (orgs && orgs.length > 0) {
        // User already has an org, redirect to dashboard
        router.push('/dashboard')
        return
      }

      setLoading(false)
    }
    checkUser()
  }, [supabase, router])

  const createOrganization = async () => {
    if (!orgName.trim()) {
      setError('Please enter an organization name')
      return
    }

    setCreating(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { error: insertError } = await supabase
      .from('organizations')
      .insert({
        user_id: user.id,
        name: orgName.trim(),
        created_at: new Date().toISOString()
      })

    if (insertError) {
      setError(insertError.message)
      setCreating(false)
      return
    }

    // Redirect to dashboard after creating org
    router.push('/dashboard')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw size={32} className="animate-spin" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" }}>
            <Building2 size={32} style={{ color: isDark ? "#fff" : "#0a0a0a" }} />
          </div>
          <h1 className="text-2xl mb-2" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "#fff" : "#0a0a0a" }}>
            Create Your Organization
          </h1>
          <p className="text-sm" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
            You need to create an organization before continuing
          </p>
        </div>

        <div className="p-6 rounded-2xl border" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] mb-2" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)" }}>
                Organization Name
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g., Acme Corp"
                className="w-full px-4 py-3 rounded-xl border bg-transparent text-[14px]"
                style={{ fontFamily: HF, fontWeight: 300, borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", color: isDark ? "#fff" : "#0a0a0a" }}
                onKeyDown={(e) => e.key === 'Enter' && createOrganization()}
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl text-[13px]" style={{ fontFamily: HF, fontWeight: 300, background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                {error}
              </div>
            )}

            <button
              onClick={createOrganization}
              disabled={creating || !orgName.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-[14px]"
              style={{ fontFamily: HF, fontWeight: 300, background: isDark ? "#fff" : "#0a0a0a", color: isDark ? "#000" : "#fff", opacity: creating || !orgName.trim() ? 0.5 : 1 }}
            >
              {creating ? <RefreshCw size={18} className="animate-spin" /> : <ArrowRight size={18} />}
              {creating ? 'Creating...' : 'Continue to Dashboard'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
