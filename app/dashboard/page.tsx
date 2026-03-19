'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/app/supabase-client'
import RepoDrawer from '@/app/components/repo-drawer'
import { useTheme } from '@/app/theme-provider'
import Link from 'next/link'

const HF = "'Helvetica World', Helvetica, Arial, sans-serif"

interface Project {
  id: string
  name: string
  repo_url: string
  status: string
  provider: string
  created_at: string
  detected_services_count: number
  is_monorepo: boolean
}

export default function DashboardPage() {
  const supabase = createClient()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [user, setUser] = useState<any>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUser(user)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      setProfile(profileData)

      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', profileData?.id)
        .order('created_at', { ascending: false })

      setProjects(projectsData || [])
      setLoading(false)
    }
    load()
  }, [supabase])

  const statusColor: Record<string, string> = {
    pending:   isDark ? '#71717a' : '#71717a',
    connected: '#3b82f6',
    analyzing: '#f59e0b',
    analyzed:  '#10b981',
    complete:  '#10b981',
    deploying: '#f59e0b',
    error:     '#ef4444',
  }

  const statusBg: Record<string, string> = {
    pending:   isDark ? 'rgba(113,113,122,0.1)' : 'rgba(113,113,122,0.1)',
    connected: 'rgba(59,130,246,0.1)',
    analyzing: 'rgba(245,158,11,0.1)',
    analyzed:  'rgba(16,185,129,0.1)',
    complete:  'rgba(16,185,129,0.1)',
    deploying: 'rgba(245,158,11,0.1)',
    error:     'rgba(239,68,68,0.1)',
  }

  return (
    <div style={{ fontFamily: HF, maxWidth: 900, margin: '0 auto', padding: '2.5rem 2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 4, color: isDark ? '#fff' : '#0a0a0a' }}>Projects</h1>
          <p style={{ fontSize: 14, color: isDark ? 'rgba(255,255,255,0.5)' : '#71717a' }}>
            {projects.length} project{projects.length !== 1 ? 's' : ''} connected
          </p>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          style={{
            padding: '9px 18px',
            background: isDark ? '#fff' : '#18181b',
            color: isDark ? '#000' : 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: HF,
          }}
        >
          + Connect repository
        </button>
      </div>

      {/* Projects grid */}
      {loading ? (
        <div style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#71717a', fontSize: 14 }}>Loading projects...</div>
      ) : projects.length === 0 ? (
        <div style={{
          border: `1px dashed ${isDark ? 'rgba(255,255,255,0.2)' : '#e4e4e7'}`,
          borderRadius: 12,
          padding: '3rem',
          textAlign: 'center',
          background: isDark ? 'rgba(255,255,255,0.02)' : 'transparent',
        }}>
          <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 8, color: isDark ? '#fff' : '#0a0a0a' }}>No projects yet</p>
          <p style={{ fontSize: 13, color: isDark ? 'rgba(255,255,255,0.5)' : '#71717a', marginBottom: 20 }}>
            Connect a GitHub repository to get started.
          </p>
          <button
            onClick={() => setDrawerOpen(true)}
            style={{
              padding: '9px 18px',
              background: isDark ? '#fff' : '#18181b',
              color: isDark ? '#000' : 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: HF,
            }}
          >
            Connect repository
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/dashboard/repos/${p.id}`}
              style={{
                display: 'block',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e4e4e7'}`,
                borderRadius: 12,
                padding: '18px 20px',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'border-color 0.15s',
                background: isDark ? 'rgba(255,255,255,0.02)' : 'transparent',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: isDark ? '#fff' : '#0a0a0a' }}>{p.name}</p>
                <span style={{
                  fontSize: 11,
                  padding: '2px 8px',
                  borderRadius: 20,
                  background: statusBg[p.status] || statusBg.pending,
                  color: statusColor[p.status] || statusColor.pending,
                  fontWeight: 500,
                }}>
                  {p.status}
                </span>
              </div>
              <p style={{ fontSize: 12, color: isDark ? 'rgba(255,255,255,0.5)' : '#71717a', marginBottom: 8 }}>
                {p.repo_url?.replace('https://github.com/', '')}
              </p>
              <div style={{ display: 'flex', gap: 12, fontSize: 11, color: isDark ? 'rgba(255,255,255,0.4)' : '#71717a' }}>
                {p.detected_services_count > 0 && (
                  <span>{p.detected_services_count} service{p.detected_services_count !== 1 ? 's' : ''}</span>
                )}
                {p.is_monorepo && <span>monorepo</span>}
                <span>{new Date(p.created_at).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Repo drawer */}
      {drawerOpen && (
        <RepoDrawer
          userId={user?.id}
          profileId={profile?.id}
          onClose={() => setDrawerOpen(false)}
          onConnected={(projectId) => {
            setDrawerOpen(false)
            window.location.href = `/dashboard/repos/connect?project_id=${projectId}`
          }}
        />
      )}
    </div>
  )
}
