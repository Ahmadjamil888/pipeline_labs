"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/app/supabase-client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Github, Plus, ArrowRight, ExternalLink, Trash2, RefreshCw } from "lucide-react"
import { canCreateProject, getProjectLimitMessage, PlanType } from '@/app/lib/plan-limits'
import { useTheme } from "@/app/theme-provider"
import RepoDrawer from "@/app/components/repo-drawer"

const HF = "'Helvetica World', Helvetica, Arial, sans-serif"

interface Project {
  id: string
  name: string
  repo_url: string
  provider: string
  branch: string
  status: string
  created_at: string
}

export default function ReposPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [plan, setPlan] = useState<PlanType>('free')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { theme } = useTheme()
  const isDark = theme === "dark"

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      // Get profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (profileData) setProfile(profileData)

      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', profileData?.id || user.id)
        .order('created_at', { ascending: false })

      if (data) setProjects(data)
      setLoading(false)
    }
    fetchData()
  }, [supabase, router])

  const deleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return
    await supabase.from('projects').delete().eq('id', id)
    setProjects(projects.filter(p => p.id !== id))
  }

  const handleConnectClick = () => {
    if (!canCreateProject(plan, projects.length)) {
      setShowUpgradeModal(true)
      return
    }
    setDrawerOpen(true)
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl mb-2" style={{ fontFamily: HF, fontWeight: 200, color: isDark ? "#fff" : "#0a0a0a" }}>
            Projects
          </h1>
          <p className="text-sm" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
            Manage your connected repositories
          </p>
        </div>
        <button 
          onClick={handleConnectClick}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px]" 
          style={{ fontFamily: HF, fontWeight: 300, background: isDark ? "#fff" : "#0a0a0a", color: isDark ? "#000" : "#fff" }}
        >
          <Plus size={16} />
          Connect Repository
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw size={24} className="animate-spin" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }} />
        </div>
      ) : projects.length === 0 ? (
        <div className="p-12 rounded-2xl border text-center" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
          <Github size={48} className="mx-auto mb-4" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)" }} />
          <h3 className="text-xl mb-2" style={{ fontFamily: HF, fontWeight: 200, color: isDark ? "#fff" : "#0a0a0a" }}>
            No repositories connected
          </h3>
          <p className="mb-6" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
            Connect your first repository to start deploying
          </p>
          <button 
            onClick={handleConnectClick}
            className="px-5 py-2.5 rounded-full text-[13px]" 
            style={{ fontFamily: HF, fontWeight: 300, background: isDark ? "#fff" : "#0a0a0a", color: isDark ? "#000" : "#fff" }}
          >
            Connect Repository
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <div key={project.id} className="flex items-center justify-between p-5 rounded-2xl border" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
                  <Github size={20} style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }} />
                </div>
                <div>
                  <div className="text-[14px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "#fff" : "#0a0a0a" }}>
                    {project.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}>
                      {project.provider} • {project.branch}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px]" style={{ fontFamily: HF, fontWeight: 300, background: project.status === 'active' ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.1)", color: project.status === 'active' ? "#22c55e" : isDark ? "#fff" : "#0a0a0a" }}>
                      {project.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a href={project.repo_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
                  <ExternalLink size={16} style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }} />
                </a>
                <Link href={`/dashboard/repos/${project.id}`} className="p-2 rounded-lg" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
                  <ArrowRight size={16} style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }} />
                </Link>
                <button onClick={() => deleteProject(project.id)} className="p-2 rounded-lg" style={{ background: isDark ? "rgba(239,68,68,0.1)" : "rgba(239,68,68,0.1)" }}>
                  <Trash2 size={16} style={{ color: "#ef4444" }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {drawerOpen && (
        <RepoDrawer
          userId={user?.id}
          profileId={profile?.id}
          onClose={() => setDrawerOpen(false)}
          onConnected={(projectId) => {
            setDrawerOpen(false)
            router.push(`/dashboard/repos/connect?project_id=${projectId}`)
          }}
        />
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}>
          <div style={{
            background: isDark ? '#0a0a0a' : 'white',
            borderRadius: 16,
            padding: '2rem',
            maxWidth: 400,
            width: '100%',
            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e4e4e7',
          }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12, color: isDark ? '#fff' : '#0a0a0a', fontFamily: HF }}>
              Project Limit Reached
            </h3>
            <p style={{ fontSize: 14, color: isDark ? 'rgba(255,255,255,0.6)' : '#71717a', marginBottom: 24, fontFamily: HF }}>
              {getProjectLimitMessage(plan)}
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowUpgradeModal(false)}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: isDark ? 'rgba(255,255,255,0.1)' : '#f4f4f5',
                  color: isDark ? '#fff' : '#0a0a0a',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: HF,
                }}
              >
                Cancel
              </button>
              <Link href="/dashboard/billing">
                <button
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    background: isDark ? '#fff' : '#18181b',
                    color: isDark ? '#000' : 'white',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 13,
                    cursor: 'pointer',
                    fontFamily: HF,
                  }}
                >
                  Upgrade Plan
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
