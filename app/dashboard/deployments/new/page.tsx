"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/app/supabase-client"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Rocket, ArrowLeft, CheckCircle2, RefreshCw } from "lucide-react"
import { useTheme } from "@/app/theme-provider"

const HF = "'Helvetica World', Helvetica, Arial, sans-serif"
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface Project {
  id: string
  name: string
  repo_url: string
  provider: string
  branch: string
}

export default function NewDeploymentPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [environment, setEnvironment] = useState('production')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()
  const { theme } = useTheme()
  const isDark = theme === "dark"

  useEffect(() => {
    async function fetchProjects() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)

      if (data) {
        setProjects(data)
        const repoId = searchParams.get('repo')
        if (repoId) setSelectedProject(repoId)
      }
      setLoading(false)
    }
    fetchProjects()
  }, [supabase, router, searchParams])

  const createDeployment = async () => {
    if (!selectedProject) return
    setCreating(true)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }

    const project = projects.find(p => p.id === selectedProject)
    if (!project) return

    const res = await fetch(`${API_URL}/api/v1/deployments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        repo_id: selectedProject,
        environment,
        services: [{
          name: project.name,
          path: '/',
          platform: 'vercel'
        }]
      })
    }).catch(() => null)

    if (res?.ok) {
      const data = await res.json()
      router.push(`/dashboard/deployments/${data.id}`)
    } else {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <RefreshCw size={24} className="animate-spin" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }} />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link href="/dashboard/deployments" className="flex items-center gap-2 mb-6 text-[13px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }}>
        <ArrowLeft size={16} />
        Back to Deployments
      </Link>

      <h1 className="text-3xl mb-2" style={{ fontFamily: HF, fontWeight: 200, color: isDark ? "#fff" : "#0a0a0a" }}>
        New Deployment
      </h1>
      <p className="text-sm mb-8" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
        Deploy your project to the cloud
      </p>

      {projects.length === 0 ? (
        <div className="p-8 rounded-2xl border text-center" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
          <p className="mb-4" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
            No projects available. Connect a repository first.
          </p>
          <Link href="/dashboard/repos/connect">
            <button className="px-5 py-2.5 rounded-full text-[13px]" style={{ fontFamily: HF, fontWeight: 300, background: isDark ? "#fff" : "#0a0a0a", color: isDark ? "#000" : "#fff" }}>
              Connect Repository
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Project Selection */}
          <div>
            <label className="block text-[13px] mb-3" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)" }}>
              Select Project
            </label>
            <div className="space-y-2">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(project.id)}
                  className="w-full flex items-center justify-between p-4 rounded-xl border transition-all"
                  style={{ 
                    borderColor: selectedProject === project.id ? (isDark ? "#fff" : "#0a0a0a") : (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"),
                    background: selectedProject === project.id ? (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)") : 'transparent'
                  }}
                >
                  <div>
                    <div className="text-[14px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "#fff" : "#0a0a0a" }}>
                      {project.name}
                    </div>
                    <div className="text-[12px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
                      {project.provider} • {project.branch}
                    </div>
                  </div>
                  {selectedProject === project.id && <CheckCircle2 size={20} style={{ color: "#22c55e" }} />}
                </button>
              ))}
            </div>
          </div>

          {/* Environment */}
          <div>
            <label className="block text-[13px] mb-3" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)" }}>
              Environment
            </label>
            <div className="flex gap-3">
              {['development', 'staging', 'production'].map((env) => (
                <button
                  key={env}
                  onClick={() => setEnvironment(env)}
                  className="flex-1 py-3 rounded-xl border text-[13px] capitalize transition-all"
                  style={{ 
                    fontFamily: HF, 
                    fontWeight: 300,
                    borderColor: environment === env ? (isDark ? "#fff" : "#0a0a0a") : (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"),
                    background: environment === env ? (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)") : 'transparent',
                    color: isDark ? "#fff" : "#0a0a0a"
                  }}
                >
                  {env}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={createDeployment}
            disabled={!selectedProject || creating}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full text-[14px] transition-all disabled:opacity-50"
            style={{ fontFamily: HF, fontWeight: 300, background: isDark ? "#fff" : "#0a0a0a", color: isDark ? "#000" : "#fff" }}
          >
            {creating ? <RefreshCw size={18} className="animate-spin" /> : <Rocket size={18} />}
            {creating ? 'Creating...' : 'Create Deployment'}
          </button>
        </div>
      )}
    </div>
  )
}
