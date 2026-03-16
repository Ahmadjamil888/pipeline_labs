"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/app/supabase-client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Rocket, ArrowRight, CheckCircle2, XCircle, Clock, RefreshCw } from "lucide-react"
import { useTheme } from "@/app/theme-provider"

const HF = "'Helvetica World', Helvetica, Arial, sans-serif"
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface Deployment {
  id: string
  project_id: string
  status: 'pending' | 'running' | 'succeeded' | 'failed' | 'cancelled'
  created_at: string
  completed_at?: string
  environment: string
  services: any[]
}

export default function DeploymentsPage() {
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()
  const { theme } = useTheme()
  const isDark = theme === "dark"

  useEffect(() => {
    async function fetchDeployments() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const res = await fetch(`${API_URL}/api/v1/deployments`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      }).catch(() => null)

      if (res?.ok) {
        const data = await res.json()
        setDeployments(data.deployments || [])
      }
      setLoading(false)
    }
    fetchDeployments()
  }, [supabase, router])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded': return <CheckCircle2 size={16} style={{ color: "#22c55e" }} />
      case 'failed': return <XCircle size={16} style={{ color: "#ef4444" }} />
      case 'running': return <RefreshCw size={16} className="animate-spin" style={{ color: "#3b82f6" }} />
      default: return <Clock size={16} style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }} />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded': return { bg: "rgba(34,197,94,0.1)", color: "#22c55e" }
      case 'failed': return { bg: "rgba(239,68,68,0.1)", color: "#ef4444" }
      case 'running': return { bg: "rgba(59,130,246,0.1)", color: "#3b82f6" }
      default: return { bg: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", color: isDark ? "#fff" : "#0a0a0a" }
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl mb-2" style={{ fontFamily: HF, fontWeight: 200, color: isDark ? "#fff" : "#0a0a0a" }}>
            Deployments
          </h1>
          <p className="text-sm" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
            Monitor and manage your deployments
          </p>
        </div>
        <Link href="/dashboard/repos">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px]" style={{ fontFamily: HF, fontWeight: 300, background: isDark ? "#fff" : "#0a0a0a", color: isDark ? "#000" : "#fff" }}>
            <Rocket size={16} />
            New Deployment
          </button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw size={24} className="animate-spin" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }} />
        </div>
      ) : deployments.length === 0 ? (
        <div className="p-12 rounded-2xl border text-center" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
          <Rocket size={48} className="mx-auto mb-4" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)" }} />
          <h3 className="text-xl mb-2" style={{ fontFamily: HF, fontWeight: 200, color: isDark ? "#fff" : "#0a0a0a" }}>
            No deployments yet
          </h3>
          <p className="mb-6" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
            Create a deployment from one of your projects
          </p>
          <Link href="/dashboard/repos">
            <button className="px-5 py-2.5 rounded-full text-[13px]" style={{ fontFamily: HF, fontWeight: 300, background: isDark ? "#fff" : "#0a0a0a", color: isDark ? "#000" : "#fff" }}>
              View Projects
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {deployments.map((deployment) => {
            const statusStyle = getStatusColor(deployment.status)
            return (
              <Link key={deployment.id} href={`/dashboard/deployments/${deployment.id}`}>
                <div className="flex items-center justify-between p-5 rounded-2xl border" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
                      <Rocket size={20} style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }} />
                    </div>
                    <div>
                      <div className="text-[14px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "#fff" : "#0a0a0a" }}>
                        Deployment #{deployment.id.slice(0, 8)}
                      </div>
                      <div className="text-[12px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}>
                        {new Date(deployment.created_at).toLocaleString()} • {deployment.environment}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px]" style={{ fontFamily: HF, fontWeight: 300, background: statusStyle.bg, color: statusStyle.color }}>
                      {getStatusIcon(deployment.status)}
                      {deployment.status}
                    </span>
                    <ArrowRight size={16} style={{ color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)" }} />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
