"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/app/supabase-client"
import { useRouter } from "next/navigation"
import { Cloud, Plus, ArrowRight, CheckCircle2, RefreshCw } from "lucide-react"
import { useTheme } from "@/app/theme-provider"
import Link from "next/link"

const HF = "'Helvetica World', Helvetica, Arial, sans-serif"

interface Provider {
  id: string
  name: string
  type: 'vercel' | 'render' | 'aws' | 'gcp' | 'azure'
  status: 'connected' | 'disconnected' | 'error'
  created_at: string
}

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()
  const { theme } = useTheme()
  const isDark = theme === "dark"

  useEffect(() => {
    async function fetchProviders() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('providers')
        .select('*')
        .eq('user_id', user.id)

      if (data) setProviders(data)
      setLoading(false)
    }
    fetchProviders()
  }, [supabase, router])

  const availableProviders = [
    { name: 'Vercel', type: 'vercel', description: 'Deploy frontend applications' },
    { name: 'Render', type: 'render', description: 'Deploy web services and APIs' },
    { name: 'AWS', type: 'aws', description: 'Amazon Web Services' },
    { name: 'Google Cloud', type: 'gcp', description: 'Google Cloud Platform' },
  ]

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl mb-2" style={{ fontFamily: HF, fontWeight: 200, color: isDark ? "#fff" : "#0a0a0a" }}>
            Cloud Providers
          </h1>
          <p className="text-sm" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
            Connect deployment platforms
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw size={24} className="animate-spin" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }} />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {availableProviders.map((provider) => {
            const connected = providers.some(p => p.type === provider.type && p.status === 'connected')
            return (
              <div key={provider.type} className="p-6 rounded-2xl border" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
                      <Cloud size={20} style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }} />
                    </div>
                    <div>
                      <div className="text-[14px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "#fff" : "#0a0a0a" }}>
                        {provider.name}
                      </div>
                      <div className="text-[12px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}>
                        {provider.description}
                      </div>
                    </div>
                  </div>
                  {connected ? (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px]" style={{ fontFamily: HF, fontWeight: 300, background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>
                      <CheckCircle2 size={10} />
                      Connected
                    </span>
                  ) : null}
                </div>
                <button className="w-full py-2.5 rounded-full text-[13px]" style={{ fontFamily: HF, fontWeight: 300, background: connected ? (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)") : (isDark ? "#fff" : "#0a0a0a"), color: connected ? (isDark ? "#fff" : "#0a0a0a") : (isDark ? "#000" : "#fff") }}>
                  {connected ? 'Manage' : 'Connect'}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
