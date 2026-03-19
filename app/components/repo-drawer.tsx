'use client'

import { useEffect, useState, useRef } from 'react'
import { useTheme } from '@/app/theme-provider'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pipeline-ai-labs-by-ahmad.up.railway.app'
const HF = "'Helvetica World', Helvetica, Arial, sans-serif"

interface Repo {
  id: number
  name: string
  full_name: string
  private: boolean
  url: string
  clone_url: string
  default_branch: string
  language: string | null
  updated_at: string
  description: string | null
}

interface RepoDrawerProps {
  userId: string
  profileId: string
  onClose: () => void
  onConnected: (projectId: string) => void
}

type DrawerState = 'loading' | 'not_connected' | 'repos' | 'error' | 'connecting'

export default function RepoDrawer({ userId, profileId, onClose, onConnected }: RepoDrawerProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [state, setState] = useState<DrawerState>('loading')
  const [repos, setRepos] = useState<Repo[]>([])
  const [filtered, setFiltered] = useState<Repo[]>([])
  const [search, setSearch] = useState('')
  const [connecting, setConnecting] = useState<number | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  // ── Step 1: check if GitHub is connected ─────────────────────────────────
  useEffect(() => {
    checkGitHubStatus()
  }, [userId])

  // ── Step 2: when user returns from GitHub OAuth, re-check ─────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('github_connected') === 'true') {
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname)
      fetchRepos()
    }
  }, [])

  // ── Step 3: filter repos on search ───────────────────────────────────────
  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(repos.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.full_name.toLowerCase().includes(q)
    ))
  }, [search, repos])

  const checkGitHubStatus = async () => {
    setState('loading')
    try {
      const res = await fetch(
        `${API_URL}/api/v1/github/status?user_id=${userId}`
      )
      const data = await res.json()

      if (data.connected) {
        await fetchRepos()
      } else {
        setState('not_connected')
      }
    } catch {
      // If status check fails try fetching repos directly
      await fetchRepos()
    }
  }

  const fetchRepos = async () => {
    setState('loading')
    try {
      const res = await fetch(
        `${API_URL}/api/v1/github/repos?user_id=${userId}`
      )

      if (res.status === 401) {
        setState('not_connected')
        return
      }

      if (!res.ok) throw new Error('Failed to fetch repositories')

      const data = await res.json()

      if (!data.repositories || data.repositories.length === 0) {
        setState('not_connected')
        return
      }

      setRepos(data.repositories)
      setFiltered(data.repositories)
      setState('repos')
    } catch {
      setState('not_connected')
    }
  }

  const connectGitHub = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/v1/github/connect?user_id=${userId}`
      )
      const data = await res.json()
      // Redirect to GitHub OAuth
      window.location.href = data.auth_url
    } catch {
      setErrorMsg('Failed to start GitHub connection')
      setState('error')
    }
  }

  const connectRepo = async (repo: Repo) => {
    setConnecting(repo.id)
    setState('connecting')
    try {
      const res = await fetch(`${API_URL}/api/v1/github/repos/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          repo: {
            id: repo.id,
            name: repo.name,
            full_name: repo.full_name,
            url: repo.url,
            clone_url: repo.clone_url,
            default_branch: repo.default_branch,
            private: repo.private,
          },
        }),
      })

      if (!res.ok) throw new Error('Failed to connect repository')
      const data = await res.json()
      onConnected(data.project_id)
    } catch (err: any) {
      setErrorMsg(err.message)
      setState('error')
      setConnecting(null)
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.4)',
          zIndex: 40,
          animation: 'fadein 0.2s ease',
        }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: isDark ? '#0a0a0a' : 'white',
        borderRadius: '16px 16px 0 0',
        zIndex: 50,
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideup 0.25s ease',
        fontFamily: HF,
        border: isDark ? '1px solid rgba(255,255,255,0.1)' : 'none',
        borderBottom: 'none',
      }}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: isDark ? 'rgba(255,255,255,0.2)' : '#e4e4e7' }} />
        </div>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px 12px',
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#f4f4f5'}`,
        }}>
          <div>
            <p style={{
              fontSize: 16, fontWeight: 600,
              color: isDark ? '#fff' : '#0a0a0a'
            }}>
              {state === 'not_connected' ? 'Connect GitHub' : 'Select a repository'}
            </p>
            <p style={{ fontSize: 12, color: isDark ? 'rgba(255,255,255,0.5)' : '#71717a', marginTop: 2 }}>
              {state === 'not_connected'
                ? 'Authorize GitHub to access your repositories'
                : 'Choose a repo to deploy with Pipeline'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none',
              cursor: 'pointer', fontSize: 20,
              color: isDark ? 'rgba(255,255,255,0.5)' : '#71717a', padding: '4px 8px',
            }}
          >×</button>
        </div>

        {/* ── Loading ── */}
        {(state === 'loading' || state === 'connecting') && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 24, height: 24,
                border: `2px solid ${isDark ? 'rgba(255,255,255,0.2)' : '#e4e4e7'}`,
                borderTopColor: isDark ? '#fff' : '#18181b',
                borderRadius: '50%',
                animation: 'spin 0.7s linear infinite',
                margin: '0 auto 12px',
              }} />
              <p style={{ fontSize: 13, color: isDark ? 'rgba(255,255,255,0.5)' : '#71717a' }}>
                {state === 'connecting' ? 'Connecting repository...' : 'Loading...'}
              </p>
            </div>
          </div>
        )}

        {/* ── Not connected ── */}
        {state === 'not_connected' && (
          <div style={{
            flex: 1, display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3rem 2rem',
            textAlign: 'center',
          }}>
            {/* GitHub icon */}
            <svg width="48" height="48" viewBox="0 0 24 24" fill={isDark ? '#fff' : '#18181b'} style={{ marginBottom: 16 }}>
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 8, color: isDark ? '#fff' : '#0a0a0a' }}>
              GitHub not connected
            </p>
            <p style={{ fontSize: 13, color: isDark ? 'rgba(255,255,255,0.5)' : '#71717a', marginBottom: 24, lineHeight: 1.6, maxWidth: 300 }}>
              Connect your GitHub account to browse and deploy your repositories.
            </p>
            <button
              onClick={connectGitHub}
              style={{
                padding: '10px 24px',
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
              Connect GitHub
            </button>
            <a
              href="https://github.com/apps/pipeline-ai-labs/installations/new"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                marginTop: 16,
                fontSize: 12,
                color: isDark ? 'rgba(255,255,255,0.5)' : '#71717a',
                textDecoration: 'none',
              }}
            >
              Install GitHub App instead →
            </a>
          </div>
        )}

        {/* ── Error ── */}
        {state === 'error' && (
          <div style={{
            flex: 1, display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3rem 2rem',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: 15, fontWeight: 500, color: '#ef4444', marginBottom: 8 }}>
              Something went wrong
            </p>
            <p style={{ fontSize: 13, color: isDark ? 'rgba(255,255,255,0.5)' : '#71717a', marginBottom: 20 }}>{errorMsg}</p>
            <button
              onClick={checkGitHubStatus}
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
              Try again
            </button>
          </div>
        )}

        {/* ── Repos list ── */}
        {state === 'repos' && (
          <>
            {/* Search */}
            <div style={{ padding: '12px 20px', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#f4f4f5'}` }}>
              <input
                type="text"
                placeholder="Search repositories..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : '#e4e4e7'}`,
                  borderRadius: 8,
                  fontSize: 13,
                  outline: 'none',
                  fontFamily: HF,
                  boxSizing: 'border-box',
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'white',
                  color: isDark ? '#fff' : '#0a0a0a',
                }}
                autoFocus
              />
            </div>

            {/* List */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
              {filtered.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', color: isDark ? 'rgba(255,255,255,0.5)' : '#71717a', fontSize: 13 }}>
                  No repositories match your search.
                </div>
              )}

              {filtered.map((repo) => (
                <div
                  key={repo.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 20px',
                    borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#f9f9f9'}`,
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <p style={{
                        fontSize: 13, fontWeight: 500,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        color: isDark ? '#fff' : '#0a0a0a',
                      }}>
                        {repo.name}
                      </p>
                      {repo.private && (
                        <span style={{
                          fontSize: 10, padding: '1px 6px',
                          borderRadius: 20, background: isDark ? 'rgba(255,255,255,0.1)' : '#f4f4f5', color: isDark ? 'rgba(255,255,255,0.7)' : '#71717a',
                        }}>
                          private
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 10, fontSize: 11, color: isDark ? 'rgba(255,255,255,0.4)' : '#71717a' }}>
                      {repo.language && <span>{repo.language}</span>}
                      <span>Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
                    </div>
                    {repo.description && (
                      <p style={{
                        fontSize: 11, color: isDark ? 'rgba(255,255,255,0.4)' : '#71717a', marginTop: 3,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {repo.description}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => connectRepo(repo)}
                    disabled={connecting !== null}
                    style={{
                      padding: '7px 16px',
                      background: connecting === repo.id
                        ? (isDark ? 'rgba(255,255,255,0.1)' : '#f4f4f5')
                        : (isDark ? '#fff' : '#18181b'),
                      color: connecting === repo.id
                        ? (isDark ? 'rgba(255,255,255,0.5)' : '#71717a')
                        : (isDark ? '#000' : 'white'),
                      border: 'none',
                      borderRadius: 7,
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: connecting !== null ? 'not-allowed' : 'pointer',
                      flexShrink: 0,
                      fontFamily: HF,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {connecting === repo.id ? 'Connecting...' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes fadein { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideup { from { transform: translateY(100%) } to { transform: translateY(0) } }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </>
  )
}
