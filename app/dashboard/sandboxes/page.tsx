"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/app/supabase-client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Terminal, ArrowRight, Play, Square, Trash2, RefreshCw, Plus } from "lucide-react"
import { useTheme } from "@/app/theme-provider"

const HF = "'Helvetica World', Helvetica, Arial, sans-serif"
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pipeline-ai-labs-by-ahmad.up.railway.app'

interface Sandbox {
  id: string
  status: 'creating' | 'running' | 'stopped' | 'error' | 'destroyed'
  repo_url?: string
  created_at: string
  resources: {
    cpu_cores: number
    memory_mb: number
    disk_gb: number
  }
}

export default function SandboxesPage() {
  const [sandboxes, setSandboxes] = useState<Sandbox[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()
  const { theme } = useTheme()
  const isDark = theme === "dark"

  useEffect(() => {
    async function fetchSandboxes() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/')
        return
      }

      const res = await fetch(`${API_URL}/api/v1/sandboxes`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      }).catch(() => null)

      if (res?.ok) {
        const data = await res.json()
        setSandboxes(data.sandboxes || [])
      }
      setLoading(false)
    }
    fetchSandboxes()
  }, [supabase, router])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return { bg: "rgba(34,197,94,0.1)", color: "#22c55e" }
      case 'stopped': return { bg: "rgba(255,255,255,0.1)", color: isDark ? "#fff" : "#0a0a0a" }
      case 'error': return { bg: "rgba(239,68,68,0.1)", color: "#ef4444" }
      default: return { bg: "rgba(59,130,246,0.1)", color: "#3b82f6" }
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl mb-2" style={{ fontFamily: HF, fontWeight: 200, color: isDark ? "#fff" : "#0a0a0a" }}>
            Sandboxes
          </h1>
          <p className="text-sm" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
            Manage Daytona workspaces
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px]" style={{ fontFamily: HF, fontWeight: 300, background: isDark ? "#fff" : "#0a0a0a", color: isDark ? "#000" : "#fff" }}>
          <Plus size={16} />
          Create Sandbox
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw size={24} className="animate-spin" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }} />
        </div>
      ) : sandboxes.length === 0 ? (
        <div className="p-12 rounded-2xl border text-center" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
          <Terminal size={48} className="mx-auto mb-4" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)" }} />
          <h3 className="text-xl mb-2" style={{ fontFamily: HF, fontWeight: 200, color: isDark ? "#fff" : "#0a0a0a" }}>
            No sandboxes yet
          </h3>
          <p className="mb-6" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
            Create a sandbox to start building and deploying
          </p>
          <button className="px-5 py-2.5 rounded-full text-[13px]" style={{ fontFamily: HF, fontWeight: 300, background: isDark ? "#fff" : "#0a0a0a", color: isDark ? "#000" : "#fff" }}>
            Create Sandbox
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sandboxes.map((sandbox) => {
            const statusStyle = getStatusColor(sandbox.status)
            return (
              <div key={sandbox.id} className="flex items-center justify-between p-5 rounded-2xl border" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
                    <Terminal size={20} style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }} />
                  </div>
                  <div>
                    <div className="text-[14px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "#fff" : "#0a0a0a" }}>
                      Sandbox #{sandbox.id.slice(0, 8)}
                    </div>
                    <div className="text-[12px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}>
                      {sandbox.resources.cpu_cores} CPU • {sandbox.resources.memory_mb}MB RAM • {sandbox.resources.disk_gb}GB
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-full text-[11px]" style={{ fontFamily: HF, fontWeight: 300, background: statusStyle.bg, color: statusStyle.color }}>
                    {sandbox.status}
                  </span>
                  {sandbox.status === 'running' ? (
                    <button className="p-2 rounded-lg" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
                      <Square size={16} style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }} />
                    </button>
                  ) : (
                    <button className="p-2 rounded-lg" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
                      <Play size={16} style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }} />
                    </button>
                  )}
                  <Link href={`/dashboard/sandboxes/${sandbox.id}`} className="p-2 rounded-lg" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
                    <ArrowRight size={16} style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }} />
                  </Link>
                  <button className="p-2 rounded-lg" style={{ background: "rgba(239,68,68,0.1)" }}>
                    <Trash2 size={16} style={{ color: "#ef4444" }} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
