"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/app/supabase-client"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Rocket, ArrowLeft, CheckCircle2, XCircle, Clock, RefreshCw, Terminal, Play, Square } from "lucide-react"
import { useTheme } from "@/app/theme-provider"

const HF = "'Helvetica World', Helvetica, Arial, sans-serif"
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pipeline-ai-labs-by-ahmad.up.railway.app'

interface Deployment {
  id: string
  project_id: string
  status: 'pending' | 'running' | 'succeeded' | 'failed' | 'cancelled'
  created_at: string
  completed_at?: string
  environment: string
  services: any[]
  error_message?: string
  logs?: LogEntry[]
}

interface LogEntry {
  timestamp: string
  level: string
  message: string
}

export default function DeploymentDetailPage() {
  const [deployment, setDeployment] = useState<Deployment | null>(null)
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const { theme } = useTheme()
  const isDark = theme === "dark"

  useEffect(() => {
    async function fetchDeployment() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/')
        return
      }

      const res = await fetch(`${API_URL}/api/v1/deployments/${params.id}`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      }).catch(() => null)

      if (res?.ok) {
        const data = await res.json()
        setDeployment(data)
      }
      setLoading(false)
    }
    fetchDeployment()
  }, [supabase, router, params.id])

  const cancelDeployment = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session || !deployment) return

    await fetch(`${API_URL}/api/v1/deployments/${deployment.id}/cancel`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${session.access_token}` }
    })
  }

  const retryDeployment = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session || !deployment) return

    await fetch(`${API_URL}/api/v1/deployments/${deployment.id}/retry`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${session.access_token}` }
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded': return <CheckCircle2 size={20} style={{ color: "#22c55e" }} />
      case 'failed': return <XCircle size={20} style={{ color: "#ef4444" }} />
      case 'running': return <RefreshCw size={20} className="animate-spin" style={{ color: "#3b82f6" }} />
      default: return <Clock size={20} style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }} />
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

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <RefreshCw size={24} className="animate-spin" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }} />
      </div>
    )
  }

  if (!deployment) {
    return (
      <div className="p-8">
        <Link href="/dashboard/deployments" className="flex items-center gap-2 mb-6 text-[13px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }}>
          <ArrowLeft size={16} />
          Back to Deployments
        </Link>
        <div className="p-8 rounded-2xl border text-center" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
          <p style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
            Deployment not found
          </p>
        </div>
      </div>
    )
  }

  const statusStyle = getStatusColor(deployment.status)

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link href="/dashboard/deployments" className="flex items-center gap-2 mb-6 text-[13px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }}>
        <ArrowLeft size={16} />
        Back to Deployments
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
            <Rocket size={24} style={{ color: isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.8)" }} />
          </div>
          <div>
            <h1 className="text-2xl" style={{ fontFamily: HF, fontWeight: 200, color: isDark ? "#fff" : "#0a0a0a" }}>
              Deployment #{deployment.id.slice(0, 8)}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px]" style={{ fontFamily: HF, fontWeight: 300, background: statusStyle.bg, color: statusStyle.color }}>
                {getStatusIcon(deployment.status)}
                {deployment.status}
              </span>
              <span className="text-[13px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
                {deployment.environment}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {deployment.status === 'running' && (
            <button onClick={cancelDeployment} className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px]" style={{ fontFamily: HF, fontWeight: 300, background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
              <Square size={14} />
              Cancel
            </button>
          )}
          {deployment.status === 'failed' && (
            <button onClick={retryDeployment} className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px]" style={{ fontFamily: HF, fontWeight: 300, background: isDark ? "#fff" : "#0a0a0a", color: isDark ? "#000" : "#fff" }}>
              <RefreshCw size={14} />
              Retry
            </button>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-6 rounded-2xl border mb-6" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
        <h3 className="text-[16px] mb-4" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "#fff" : "#0a0a0a" }}>
          Deployment Information
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b" style={{ borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
            <span className="text-[13px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>Created</span>
            <span className="text-[13px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "#fff" : "#0a0a0a" }}>{new Date(deployment.created_at).toLocaleString()}</span>
          </div>
          {deployment.completed_at && (
            <div className="flex justify-between py-2 border-b" style={{ borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
              <span className="text-[13px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>Completed</span>
              <span className="text-[13px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "#fff" : "#0a0a0a" }}>{new Date(deployment.completed_at).toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between py-2 border-b" style={{ borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
            <span className="text-[13px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>Environment</span>
            <span className="text-[13px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "#fff" : "#0a0a0a" }}>{deployment.environment}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-[13px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>Services</span>
            <span className="text-[13px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "#fff" : "#0a0a0a" }}>{deployment.services?.length || 0}</span>
          </div>
        </div>
      </div>

      {/* Logs */}
      <div className="p-6 rounded-2xl border" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", background: isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.02)" }}>
        <div className="flex items-center gap-2 mb-4">
          <Terminal size={18} style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }} />
          <h3 className="text-[16px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "#fff" : "#0a0a0a" }}>
            Deployment Logs
          </h3>
        </div>
        <div className="font-mono text-[12px] space-y-1 p-4 rounded-xl overflow-auto max-h-96" style={{ background: isDark ? "#000" : "#f5f5f5", color: isDark ? "#22c55e" : "#166534" }}>
          {deployment.logs?.length ? (
            deployment.logs.map((log, idx) => (
              <div key={idx} className="flex gap-2">
                <span className="opacity-50">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                <span className="uppercase text-[10px] px-1 rounded" style={{ background: log.level === 'error' ? 'rgba(239,68,68,0.2)' : 'transparent', color: log.level === 'error' ? '#ef4444' : 'inherit' }}>{log.level}</span>
                <span>{log.message}</span>
              </div>
            ))
          ) : (
            <div className="opacity-50">No logs available...</div>
          )}
        </div>
      </div>
    </div>
  )
}
