"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/app/supabase-client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Github, Gitlab, Loader2, CheckCircle2, Plus, RefreshCw, Code2 } from "lucide-react"
import { useTheme } from "@/app/theme-provider"

const HF = "'Helvetica World', Helvetica, Arial, sans-serif"
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pipeline-ai-labs-by-ahmad.up.railway.app'

interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  updated_at: string
  private: boolean
  default_branch: string
}

export default function ConnectRepoPage() {
  const [step, setStep] = useState<'auth' | 'loading' | 'select' | 'connecting'>('auth')
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null)
  const [installationId, setInstallationId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()
  const { theme } = useTheme()
  const isDark = theme === "dark"

  // Check for GitHub App callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const instId = params.get('installation_id')
    const connected = params.get('connected')
    
    if (instId && connected === 'true') {
      setInstallationId(parseInt(instId))
      setStep('loading')
      fetchRepos(parseInt(instId))
    }
  }, [])

  const fetchRepos = async (instId: number) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/github/repos?installation_id=${instId}`)
      
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Failed to fetch repositories')
      }

      const data = await res.json()
      setRepos(data.repositories || [])
      setStep('select')
    } catch (err: any) {
      setError(err.message || 'Failed to fetch repositories')
      setStep('auth')
    }
  }

  const startGitHubAppInstall = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/github/connect`)
      if (!res.ok) throw new Error('Failed to get install URL')
      
      const data = await res.json()
      // Redirect to GitHub App installation page
      window.location.href = data.url
    } catch (err: any) {
      setError(err.message || 'Failed to start GitHub App installation')
    }
  }

  const connectRepo = async () => {
    if (!selectedRepo || !installationId) return
    
    setStep('connecting')
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Also save to Supabase for frontend display
      const { error: insertError } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: selectedRepo.name,
          repo_url: selectedRepo.html_url,
          provider: 'github',
          branch: selectedRepo.default_branch || 'main',
          status: 'connected'
        })

      if (insertError) throw insertError

      router.push('/dashboard/repos')
    } catch (err: any) {
      setError(err.message || 'Failed to connect repository')
      setStep('select')
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link href="/dashboard/repos" className="flex items-center gap-2 mb-6 text-[13px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }}>
        <ArrowLeft size={16} />
        Back to Projects
      </Link>

      <h1 className="text-3xl mb-2" style={{ fontFamily: HF, fontWeight: 200, color: isDark ? "#fff" : "#0a0a0a" }}>
        Connect Repository
      </h1>
      <p className="text-sm mb-8" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
        Install the Pipeline GitHub App to access your repositories
      </p>

      {error && (
        <div className="p-4 rounded-xl text-[13px] mb-6" style={{ fontFamily: HF, fontWeight: 300, background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
          {error}
        </div>
      )}

      {/* Step 1: Install GitHub App */}
      {step === 'auth' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
                <Github size={20} />
              </div>
              <div>
                <div className="text-[16px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "#fff" : "#0a0a0a" }}>
                  GitHub App
                </div>
                <div className="text-[12px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
                  Install the Pipeline GitHub App to access your repositories
                </div>
              </div>
            </div>
            <button 
              onClick={startGitHubAppInstall}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full text-[14px]"
              style={{ fontFamily: HF, fontWeight: 300, background: isDark ? "#fff" : "#0a0a0a", color: isDark ? "#000" : "#fff" }}
            >
              <Github size={18} />
              Install GitHub App
            </button>
            <p className="text-[11px] mt-3 text-center" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}>
              You&apos;ll be redirected to GitHub to authorize access
            </p>
          </div>

          <div className="p-6 rounded-2xl border opacity-50" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
                <Gitlab size={20} />
              </div>
              <div>
                <div className="text-[16px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "#fff" : "#0a0a0a" }}>
                  GitLab
                </div>
                <div className="text-[12px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
                  Coming soon
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Loading */}
      {step === 'loading' && (
        <div className="flex flex-col items-center justify-center py-20">
          <RefreshCw size={32} className="animate-spin mb-4" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }} />
          <p className="text-[14px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)" }}>
            Loading your repositories...
          </p>
        </div>
      )}

      {/* Step 3: Select Repository */}
      {step === 'select' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[14px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)" }}>
              Select a repository to connect ({repos.length} found)
            </p>
            <button 
              onClick={() => setStep('auth')}
              className="text-[13px]"
              style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}
            >
              Re-install App
            </button>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {repos.map((repo) => (
              <button
                key={repo.id}
                onClick={() => setSelectedRepo(repo)}
                className="w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all"
                style={{ 
                  borderColor: selectedRepo?.id === repo.id ? (isDark ? "#fff" : "#0a0a0a") : (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"),
                  background: selectedRepo?.id === repo.id ? (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)") : 'transparent'
                }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
                  <Code2 size={20} style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] truncate" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "#fff" : "#0a0a0a" }}>
                      {repo.full_name}
                    </span>
                    {repo.private && (
                      <span className="px-1.5 py-0.5 rounded text-[10px]" style={{ background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)" }}>
                        Private
                      </span>
                    )}
                  </div>
                  {repo.description && (
                    <p className="text-[12px] mt-1 line-clamp-1" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
                      {repo.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-[11px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}>
                    {repo.language && <span>{repo.language}</span>}
                    <span>⭐ {repo.stargazers_count}</span>
                    <span>Updated {formatDate(repo.updated_at)}</span>
                  </div>
                </div>
                {selectedRepo?.id === repo.id && (
                  <CheckCircle2 size={20} style={{ color: "#22c55e" }} className="shrink-0" />
                )}
              </button>
            ))}
          </div>

          <button
            onClick={connectRepo}
            disabled={!selectedRepo}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full text-[14px] mt-6"
            style={{ fontFamily: HF, fontWeight: 300, background: isDark ? "#fff" : "#0a0a0a", color: isDark ? "#000" : "#fff" }}
          >
            <>
              <Plus size={18} />
              Connect {selectedRepo?.name}
            </>
          </button>
        </div>
      )}
    </div>
  )
}
