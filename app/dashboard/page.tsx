"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/app/supabase-client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  FolderGit, 
  Rocket, 
  Activity,
  Plus,
  Github,
  CheckCircle2,
  User,
  ArrowRight
} from "lucide-react"
import { useTheme } from "@/app/theme-provider"

const HF = "'Helvetica World', Helvetica, Arial, sans-serif"
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface Project {
  id: string
  name: string
  repo_url: string
  status: string
  created_at: string
}

interface Deployment {
  id: string
  project_id: string
  status: string
  created_at: string
}

interface UserProfile {
  id: string
  email: string
  full_name: string
  avatar_url?: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    projects: 0,
    deployments: 0,
    active: 0
  })
  const [projects, setProjects] = useState<Project[]>([])
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()
  const { theme } = useTheme()
  
  const isDark = theme === "dark"

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!user || !session) {
          router.push('/login')
          return
        }
        setUser(user)

        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (profileData) setProfile(profileData)

        const { data: projectsData } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (projectsData) {
          setProjects(projectsData)
          const activeCount = projectsData.filter(p => p.status === 'active').length
          setStats(prev => ({ ...prev, projects: projectsData.length, active: activeCount }))
        }

        const deploymentsRes = await fetch(`${API_URL}/api/v1/deployments`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }).catch(() => null)

        if (deploymentsRes?.ok) {
          const deploymentsData = await deploymentsRes.json()
          setDeployments(deploymentsData.deployments || [])
          setStats(prev => ({ ...prev, deployments: deploymentsData.total || 0 }))
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [supabase, router])

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl mb-2" style={{ fontFamily: HF, fontWeight: 200, color: isDark ? "#fff" : "#0a0a0a" }}>
            {profile?.full_name ? `Welcome, ${profile.full_name}` : 'Dashboard'}
          </h1>
          <p className="text-sm" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
            {profile?.email || user?.email || 'Overview of your DevOps projects'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 px-4 py-2 rounded-full border" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}>
              <User size={16} style={{ color: isDark ? "#fff" : "#0a0a0a" }} />
            </div>
            <span className="text-[13px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "#fff" : "#0a0a0a" }}>
              {profile?.full_name || user?.email?.split('@')[0] || 'User'}
            </span>
          </div>

          <Link href="/dashboard/repos/connect">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] transition-all" style={{ fontFamily: HF, fontWeight: 300, background: isDark ? "#fff" : "#0a0a0a", color: isDark ? "#000" : "#fff" }}>
              <Plus size={16} />
              New Project
            </button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <Link href="/dashboard/repos">
          <div className="p-6 rounded-2xl border transition-all hover:scale-[1.02]" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[13px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }}>Projects</span>
              <FolderGit size={18} style={{ color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)" }} />
            </div>
            <div className="text-3xl" style={{ fontFamily: HF, fontWeight: 200, color: isDark ? "#fff" : "#0a0a0a" }}>{loading ? '...' : stats.projects}</div>
          </div>
        </Link>

        <Link href="/dashboard/deployments">
          <div className="p-6 rounded-2xl border transition-all hover:scale-[1.02]" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[13px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }}>Deployments</span>
              <Rocket size={18} style={{ color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)" }} />
            </div>
            <div className="text-3xl" style={{ fontFamily: HF, fontWeight: 200, color: isDark ? "#fff" : "#0a0a0a" }}>{loading ? '...' : stats.deployments}</div>
          </div>
        </Link>

        <div className="p-6 rounded-2xl border" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[13px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }}>Active</span>
            <Activity size={18} style={{ color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)" }} />
          </div>
          <div className="text-3xl" style={{ fontFamily: HF, fontWeight: 200, color: isDark ? "#fff" : "#0a0a0a" }}>{loading ? '...' : stats.active}</div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl" style={{ fontFamily: HF, fontWeight: 200, color: isDark ? "#fff" : "#0a0a0a" }}>Recent Projects</h2>
          <Link href="/dashboard/repos">
            <span className="text-[13px] flex items-center gap-1" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>View all <ArrowRight size={14} /></span>
          </Link>
        </div>
        
        {projects.length === 0 ? (
          <div className="p-8 rounded-2xl border text-center" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
            <p style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
              No projects yet. <Link href="/dashboard/repos/connect" style={{ color: isDark ? "#fff" : "#0a0a0a" }}>Create your first project</Link>
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.slice(0, 5).map((project) => (
              <Link key={project.id} href={`/dashboard/repos/${project.id}`}>
                <div className="flex items-center justify-between p-5 rounded-2xl border transition-all hover:scale-[1.01]" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
                      <Github size={20} style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }} />
                    </div>
                    <div>
                      <div className="text-[14px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "#fff" : "#0a0a0a" }}>{project.name}</div>
                      <div className="text-[12px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}>{project.repo_url}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px]" style={{ fontFamily: HF, fontWeight: 300, background: project.status === 'active' ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.1)", color: project.status === 'active' ? "#22c55e" : isDark ? "#fff" : "#0a0a0a" }}>
                      <CheckCircle2 size={12} /> {project.status}
                    </span>
                    <ArrowRight size={16} style={{ color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)" }} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
