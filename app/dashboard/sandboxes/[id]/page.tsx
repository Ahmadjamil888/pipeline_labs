"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/app/supabase-client"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Terminal, ArrowLeft, Play, Square, Trash2, RefreshCw, Copy } from "lucide-react"
import { useTheme } from "@/app/theme-provider"

const HF = "'Helvetica World', Helvetica, Arial, sans-serif"
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface Sandbox {
  id: string
  status: 'creating' | 'running' | 'stopped' | 'error' | 'destroyed'
  repo_url?: string
  branch?: string
  created_at: string
  started_at?: string
  workspace_url?: string
  resources: {
    cpu_cores: number
    memory_mb: number
    disk_gb: number
  }
  environment_variables?: Record<string, string>
}

export default function SandboxDetailPage() {
  const [sandbox, setSandbox] = useState<Sandbox | null>(null)
  const [loading, setLoading] = useState(true)
  const [executing, setExecuting] = useState(false)
  const [commandOutput, setCommandOutput] = useState('')
  const [command, setCommand] = useState('')
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const { theme } = useTheme()
  const isDark = theme === "dark"

  useEffect(() => {
    async function fetchSandbox() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const res = await fetch(`${API_URL}/api/v1/sandboxes/${params.id}`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      }).catch(() => null)

      if (res?.ok) {
        const data = await res.json()
        setSandbox(data)
      }
      setLoading(false)
    }
    fetchSandbox()
  }, [supabase, router, params.id])

  const startSandbox = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session || !sandbox) return

    await fetch(`${API_URL}/api/v1/sandboxes/${sandbox.id}/start`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${session.access_token}` }
    })
  }

  const stopSandbox = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session || !sandbox) return

    await fetch(`${API_URL}/api/v1/sandboxes/${sandbox.id}/stop`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${session.access_token}` }
    })
  }

  const destroySandbox = async () => {
    if (!confirm('Are you sure you want to destroy this sandbox?')) return
    const { data: { session } } = await supabase.auth.getSession()
    if (!session || !sandbox) return

    await fetch(`${API_URL}/api/v1/sandboxes/${sandbox.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${session.access_token}` }
    })
    router.push('/dashboard/sandboxes')
  }

  const executeCommand = async () => {
    if (!command.trim()) return
    const { data: { session } } = await supabase.auth.getSession()
    if (!session || !sandbox) return

    setExecuting(true)
    const res = await fetch(`${API_URL}/api/v1/sandboxes/${sandbox.id}/execute`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ command, working_directory: '/workspace' })
    }).catch(() => null)

    if (res?.ok) {
      const data = await res.json()
      setCommandOutput(`${data.stdout}\n${data.stderr}`)
    }
    setExecuting(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return { bg: "rgba(34,197,94,0.1)", color: "#22c55e" }
      case 'stopped': return { bg: "rgba(255,255,255,0.1)", color: isDark ? "#fff" : "#0a0a0a" }
      case 'error': return { bg: "rgba(239,68,68,0.1)", color: "#ef4444" }
      default: return { bg: "rgba(59,130,246,0.1)", color: "#3b82f6" }
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <RefreshCw size={24} className="animate-spin" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }} />
      </div>
    )
  }

  if (!sandbox) {
    return (
      <div className="p-8">
        <Link href="/dashboard/sandboxes" className="flex items-center gap-2 mb-6 text-[13px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }}>
          <ArrowLeft size={16} />
          Back to Sandboxes
        </Link>
        <div className="p-8 rounded-2xl border text-center" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
          <p style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
            Sandbox not found
          </p>
        </div>
      </div>
    )
  }

  const statusStyle = getStatusColor(sandbox.status)

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link href="/dashboard/sandboxes" className="flex items-center gap-2 mb-6 text-[13px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }}>
        <ArrowLeft size={16} />
        Back to Sandboxes
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
            <Terminal size={24} style={{ color: isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.8)" }} />
          </div>
          <div>
            <h1 className="text-2xl" style={{ fontFamily: HF, fontWeight: 200, color: isDark ? "#fff" : "#0a0a0a" }}>
              Sandbox #{sandbox.id.slice(0, 8)}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-3 py-1 rounded-full text-[12px]" style={{ fontFamily: HF, fontWeight: 300, background: statusStyle.bg, color: statusStyle.color }}>
                {sandbox.status}
              </span>
              {sandbox.repo_url && (
                <span className="text-[13px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
                  {sandbox.repo_url.split('/').pop()?.replace('.git', '')}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {sandbox.status === 'running' ? (
            <button onClick={stopSandbox} className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px]" style={{ fontFamily: HF, fontWeight: 300, background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", color: isDark ? "#fff" : "#0a0a0a" }}>
              <Square size={14} />
              Stop
            </button>
          ) : sandbox.status === 'stopped' ? (
            <button onClick={startSandbox} className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px]" style={{ fontFamily: HF, fontWeight: 300, background: isDark ? "#fff" : "#0a0a0a", color: isDark ? "#000" : "#fff" }}>
              <Play size={14} />
              Start
            </button>
          ) : null}
          <button onClick={destroySandbox} className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px]" style={{ fontFamily: HF, fontWeight: 300, background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
            <Trash2 size={14} />
            Destroy
          </button>
        </div>
      </div>

      {/* Resources */}
      <div className="p-6 rounded-2xl border mb-6" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
        <h3 className="text-[16px] mb-4" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "#fff" : "#0a0a0a" }}>
          Resources
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-xl" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
            <div className="text-[12px] mb-1" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>CPU</div>
            <div className="text-xl" style={{ fontFamily: HF, fontWeight: 200, color: isDark ? "#fff" : "#0a0a0a" }}>{sandbox.resources.cpu_cores} cores</div>
          </div>
          <div className="p-4 rounded-xl" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
            <div className="text-[12px] mb-1" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>Memory</div>
            <div className="text-xl" style={{ fontFamily: HF, fontWeight: 200, color: isDark ? "#fff" : "#0a0a0a" }}>{sandbox.resources.memory_mb} MB</div>
          </div>
          <div className="p-4 rounded-xl" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
            <div className="text-[12px] mb-1" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>Disk</div>
            <div className="text-xl" style={{ fontFamily: HF, fontWeight: 200, color: isDark ? "#fff" : "#0a0a0a" }}>{sandbox.resources.disk_gb} GB</div>
          </div>
        </div>
      </div>

      {/* Command Execution */}
      {sandbox.status === 'running' && (
        <div className="p-6 rounded-2xl border" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", background: isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.02)" }}>
          <h3 className="text-[16px] mb-4" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "#fff" : "#0a0a0a" }}>
            Execute Command
          </h3>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Enter command (e.g., ls -la)"
              className="flex-1 px-4 py-3 rounded-xl border bg-transparent text-[14px]"
              style={{ fontFamily: HF, fontWeight: 300, borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", color: isDark ? "#fff" : "#0a0a0a" }}
              onKeyDown={(e) => e.key === 'Enter' && executeCommand()}
            />
            <button 
              onClick={executeCommand}
              disabled={executing}
              className="px-5 py-3 rounded-full text-[13px]"
              style={{ fontFamily: HF, fontWeight: 300, background: isDark ? "#fff" : "#0a0a0a", color: isDark ? "#000" : "#fff" }}
            >
              {executing ? <RefreshCw size={16} className="animate-spin" /> : 'Run'}
            </button>
          </div>
          {commandOutput && (
            <div className="font-mono text-[12px] p-4 rounded-xl overflow-auto max-h-64 whitespace-pre-wrap" style={{ background: isDark ? "#000" : "#f5f5f5", color: isDark ? "#22c55e" : "#166534" }}>
              {commandOutput}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
