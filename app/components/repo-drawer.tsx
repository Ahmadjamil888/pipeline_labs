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

export default function RepoDrawer({ userId, profileId, onClose, onConnected }: RepoDrawerProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [repos, setRepos] = useState<Repo[]>([])
  const [filtered, setFiltered] = useState<Repo[]>([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/github/repos?user_id=${userId}`)
        if (!res.ok) throw new Error('Failed to fetch repositories')
        const data = await res.json()
        setRepos(data.repositories || [])
        setFiltered(data.repositories || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchRepos()
  }, [userId])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(
      repos.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.full_name.toLowerCase().includes(q)
      )
    )
  }, [search, repos])

  const connectRepo = async (repo: Repo) => {
    setConnecting(repo.id)
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
      setError(err.message)
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
          position: 'fixed',
          inset: 0,
          background: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.4)',
          zIndex: 40,
          animation: 'fadein 0.2s ease',
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
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
        }}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
          <div style={{ 
            width: 40, 
            height: 4, 
            borderRadius: 2, 
            background: isDark ? 'rgba(255,255,255,0.2)' : '#e4e4e7' 
          }} />
        </div>

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px 12px',
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#f4f4f5'}`,
        }}>
          <div>
            <p style={{ 
              fontSize: 16, 
              fontWeight: 600, 
              color: isDark ? '#fff' : '#0a0a0a' 
            }}>Select a repository</p>
            <p style={{ 
              fontSize: 12, 
              color: isDark ? 'rgba(255,255,255,0.5)' : '#71717a', 
              marginTop: 2 
            }}>
              Choose a repo to connect and deploy with Pipeline
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 20,
              color: isDark ? 'rgba(255,255,255,0.5)' : '#71717a',
              padding: '4px 8px',
            }}
          >
            ×
          </button>
        </div>

        {/* Search */}
        <div style={{ 
          padding: '12px 20px', 
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#f4f4f5'}` 
        }}>
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

        {/* Repo list */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
          {loading && (
            <div style={{ 
              padding: '2rem', 
              textAlign: 'center', 
              color: isDark ? 'rgba(255,255,255,0.5)' : '#71717a', 
              fontSize: 13 
            }}>
              Loading repositories...
            </div>
          )}

          {error && (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 8 }}>{error}</p>
              <p style={{ 
                color: isDark ? 'rgba(255,255,255,0.5)' : '#71717a', 
                fontSize: 12 
              }}>
                Make sure you have connected your GitHub account.
              </p>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div style={{ 
              padding: '2rem', 
              textAlign: 'center', 
              color: isDark ? 'rgba(255,255,255,0.5)' : '#71717a', 
              fontSize: 13 
            }}>
              No repositories found.
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
                    fontSize: 13, 
                    fontWeight: 500, 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap',
                    color: isDark ? '#fff' : '#0a0a0a',
                  }}>
                    {repo.name}
                  </p>
                  {repo.private && (
                    <span style={{
                      fontSize: 10,
                      padding: '1px 6px',
                      borderRadius: 20,
                      background: isDark ? 'rgba(255,255,255,0.1)' : '#f4f4f5',
                      color: isDark ? 'rgba(255,255,255,0.7)' : '#71717a',
                    }}>
                      private
                    </span>
                  )}
                </div>
                <div style={{ 
                  display: 'flex', 
                  gap: 10, 
                  fontSize: 11, 
                  color: isDark ? 'rgba(255,255,255,0.4)' : '#71717a' 
                }}>
                  {repo.language && <span>{repo.language}</span>}
                  <span>Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
                </div>
                {repo.description && (
                  <p style={{
                    fontSize: 11,
                    color: isDark ? 'rgba(255,255,255,0.4)' : '#71717a',
                    marginTop: 3,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
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

        {/* Footer — install app if no repos */}
        {!loading && !error && repos.length === 0 && (
          <div style={{
            padding: '16px 20px',
            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#f4f4f5'}`,
            textAlign: 'center',
          }}>
            <p style={{ 
              fontSize: 13, 
              color: isDark ? 'rgba(255,255,255,0.5)' : '#71717a', 
              marginBottom: 12 
            }}>
              No repositories found. Install the GitHub App first.
            </p>
            <a
              href="https://github.com/apps/pipeline-ai-labs/installations/new"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                padding: '9px 18px',
                background: isDark ? '#fff' : '#18181b',
                color: isDark ? '#000' : 'white',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Install GitHub App
            </a>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadein { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideup { from { transform: translateY(100%) } to { transform: translateY(0) } }
      `}</style>
    </>
  )
}
