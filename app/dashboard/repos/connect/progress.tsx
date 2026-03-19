'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTheme } from '@/app/theme-provider'

const HF = "'Helvetica World', Helvetica, Arial, sans-serif"
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pipeline-ai-labs-by-ahmad.up.railway.app'

const STAGES: Record<string, { label: string; status: 'active' | 'success' | 'error' | 'warning' }> = {
  scanning:  { label: 'Scanning repository',   status: 'active'  },
  scanned:   { label: 'Structure detected',    status: 'success' },
  analyzing: { label: 'Analyzing services',    status: 'active'  },
  analyzed:  { label: 'Analysis complete',     status: 'success' },
  planning:  { label: 'Creating deploy plan',  status: 'active'  },
  planned:   { label: 'Plan ready',            status: 'success' },
  deploying: { label: 'Deploying services',    status: 'active'  },
  fixing:    { label: 'Fixing errors',         status: 'warning' },
  retrying:  { label: 'Retrying deployment',   status: 'warning' },
  deployed:  { label: 'Service deployed',      status: 'success' },
  complete:  { label: 'All services deployed', status: 'success' },
  error:     { label: 'Error occurred',        status: 'error'   },
  failed:    { label: 'Deployment failed',     status: 'error'   },
}

interface ProgressStep {
  id: string
  project_id: string
  analysis_type: string
  input_data: { stage: string }
  result_data: { message: string; stage: string }
  created_at: string
}

interface Service {
  name: string
  framework: string
  path: string
  recommended_platform: string
}

interface Project {
  id: string
  name: string
  status: string
  analysis_result?: {
    scan: {
      services: Service[]
      is_monorepo: boolean
      summary?: string
    }
  }
}

// ── Keyframes injected once ───────────────────────────────────────────────────
const GLOBAL_STYLES = `
  @keyframes pulse-dot {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.25; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`

// ── Stage indicator dot / icon ────────────────────────────────────────────────
function StageIndicator({
  status,
  isLast,
  done,
}: {
  status: 'active' | 'success' | 'error' | 'warning'
  isLast: boolean
  done: boolean
}) {
  const pulse = isLast && !done && status === 'active'

  if (status === 'success') {
    return (
      <svg
        width="14" height="14" viewBox="0 0 14 14" fill="none"
        style={{ flexShrink: 0, marginTop: 3 }}
      >
        <circle cx="7" cy="7" r="7" fill="#10b981" />
        <path d="M4 7l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (status === 'error') {
    return (
      <svg
        width="14" height="14" viewBox="0 0 14 14" fill="none"
        style={{ flexShrink: 0, marginTop: 3 }}
      >
        <circle cx="7" cy="7" r="7" fill="#ef4444" />
        <path d="M5 5l4 4M9 5l-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }
  if (status === 'warning') {
    return (
      <svg
        width="14" height="14" viewBox="0 0 14 14" fill="none"
        style={{ flexShrink: 0, marginTop: 3 }}
      >
        <circle cx="7" cy="7" r="7" fill="#f59e0b" />
        <path d="M7 4v3M7 9.5v.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }
  return (
    <span
      style={{
        display: 'inline-block',
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: '#3b82f6',
        flexShrink: 0,
        marginTop: 5,
        animation: pulse ? 'pulse-dot 1.5s ease-in-out infinite' : 'none',
      }}
    />
  )
}

// ── Loader shown while Suspense resolves ──────────────────────────────────────
function PageLoader() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: HF,
      }}
    >
      <style>{GLOBAL_STYLES}</style>
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: 28,
            height: 28,
            border: '2px solid #3b82f6',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 12px',
          }}
        />
        <p style={{ color: '#71717a', fontSize: 14 }}>Loading...</p>
      </div>
    </div>
  )
}

// ── Main content ──────────────────────────────────────────────────────────────
function ConnectContent() {
  const { theme } = useTheme()
  const searchParams = useSearchParams()
  const projectId = searchParams.get('project_id')

  const [steps, setSteps] = useState<ProgressStep[]>([])
  const [project, setProject] = useState<Project | null>(null)
  const [done, setDone] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const isDark = theme === 'dark'
  const border = isDark ? '1px solid #27272a' : '1px solid #e4e4e7'
  const cardBg = isDark ? '#18181b' : '#ffffff'
  const surfaceBg = isDark ? '#09090b' : '#fafafa'
  const mutedText = '#71717a'
  const text = isDark ? '#fafafa' : '#09090b'

  useEffect(() => {
    if (!projectId) return

    const fetchProgress = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/projects/${projectId}/progress`)
        if (!res.ok) throw new Error('Failed to fetch progress')
        const data = await res.json()
        setSteps(data.progress_steps || [])
        setProject(data.project)
        const last = (data.progress_steps as ProgressStep[])?.at(-1)
        const lastStage = last?.result_data?.stage
        if (lastStage === 'complete' || lastStage === 'error' || lastStage === 'failed') {
          setDone(true)
        }
      } catch (err: unknown) {
        if (err instanceof Error) setFetchError(err.message)
      }
    }

    fetchProgress()
    const interval = setInterval(fetchProgress, 2000)
    return () => clearInterval(interval)
  }, [projectId])

  const services = project?.analysis_result?.scan?.services ?? []

  // ── No project_id ─────────────────────────────────────────────────────────
  if (!projectId) {
    return (
      <div style={{ fontFamily: HF, maxWidth: 640, margin: '0 auto', padding: '3rem 2rem' }}>
        <style>{GLOBAL_STYLES}</style>
        <p style={{ fontSize: 22, fontWeight: 500, color: text, marginBottom: 8 }}>
          Connect your repository
        </p>
        <p style={{ color: mutedText, fontSize: 15 }}>
          Please install the GitHub App to get started.
        </p>
      </div>
    )
  }

  // ── Fetch error ───────────────────────────────────────────────────────────
  if (fetchError) {
    return (
      <div style={{ fontFamily: HF, maxWidth: 640, margin: '0 auto', padding: '3rem 2rem' }}>
        <style>{GLOBAL_STYLES}</style>
        <p style={{ fontSize: 22, fontWeight: 500, color: '#ef4444', marginBottom: 8 }}>
          Something went wrong
        </p>
        <p style={{ color: mutedText, fontSize: 15 }}>{fetchError}</p>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: HF, maxWidth: 720, margin: '0 auto', padding: '3rem 2rem' }}>
      <style>{GLOBAL_STYLES}</style>

      {/* ── Header ── */}
      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{ fontSize: 26, fontWeight: 600, color: text, marginBottom: 6 }}>
          {done ? 'Deployment complete' : 'Analyzing your repository'}
        </p>
        <p style={{ color: mutedText, fontSize: 15, lineHeight: 1.6 }}>
          {done
            ? 'All services have been deployed successfully.'
            : 'AI agents are scanning, analyzing, and deploying your services.'}
        </p>
      </div>

      {/* ── Detected services ── */}
      {services.length > 0 && (
        <div
          style={{
            marginBottom: '1.5rem',
            border,
            borderRadius: 12,
            overflow: 'hidden',
            background: cardBg,
          }}
        >
          <div style={{ padding: '12px 20px', borderBottom: border, background: surfaceBg }}>
            <p style={{
              fontSize: 11,
              fontWeight: 500,
              color: mutedText,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}>
              Detected services
            </p>
          </div>
          <div style={{
            padding: 16,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
            gap: 10,
          }}>
            {services.map((s) => (
              <div
                key={s.name}
                style={{ padding: '12px 14px', border, borderRadius: 8, background: surfaceBg }}
              >
                <p style={{ fontSize: 13, fontWeight: 500, color: text, marginBottom: 5 }}>
                  {s.name}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: 11,
                    padding: '2px 8px',
                    borderRadius: 20,
                    background: isDark ? '#1e3a5f' : '#eff6ff',
                    color: isDark ? '#93c5fd' : '#1d4ed8',
                    fontWeight: 500,
                  }}>
                    {s.framework}
                  </span>
                  <span style={{ fontSize: 11, color: mutedText }}>
                    → {s.recommended_platform}
                  </span>
                </div>
                {s.path && (
                  <p style={{ fontSize: 11, color: mutedText, marginTop: 4 }}>{s.path}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Progress log ── */}
      <div style={{ border, borderRadius: 12, overflow: 'hidden', background: cardBg }}>
        <div style={{ padding: '12px 20px', borderBottom: border, background: surfaceBg }}>
          <p style={{
            fontSize: 11,
            fontWeight: 500,
            color: mutedText,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}>
            Pipeline progress
          </p>
        </div>

        <div style={{ padding: '12px 16px' }}>
          {/* Empty state */}
          {steps.length === 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px' }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#3b82f6', display: 'inline-block',
                animation: 'pulse-dot 1.5s ease-in-out infinite',
              }} />
              <span style={{ fontSize: 13, color: mutedText }}>Initializing pipeline...</span>
            </div>
          )}

          {/* Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {steps.map((step, i) => {
              const stage = step.result_data?.stage
              const info = STAGES[stage] ?? { label: stage, status: 'active' as const }
              const isLast = i === steps.length - 1

              return (
                <div
                  key={step.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: '9px 10px',
                    borderRadius: 8,
                    background: isLast && !done
                      ? isDark ? 'rgba(59,130,246,0.08)' : '#eff6ff'
                      : 'transparent',
                    transition: 'background 0.2s',
                  }}
                >
                  <StageIndicator status={info.status} isLast={isLast} done={done} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: text, marginBottom: 2 }}>
                      {info.label}
                    </p>
                    <p style={{ fontSize: 12, color: mutedText, lineHeight: 1.5 }}>
                      {step.result_data?.message}
                    </p>
                  </div>
                  <p style={{ fontSize: 11, color: mutedText, flexShrink: 0, marginTop: 2 }}>
                    {new Date(step.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Working indicator */}
          {!done && steps.length > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 10px',
              marginTop: 2,
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#3b82f6', display: 'inline-block',
                animation: 'pulse-dot 1.5s ease-in-out infinite',
              }} />
              <span style={{ fontSize: 12, color: mutedText }}>AI agents working...</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Done banner ── */}
      {done && (
        <div style={{
          marginTop: '1.5rem',
          border: isDark ? '1px solid #14532d' : '1px solid #bbf7d0',
          borderRadius: 12,
          padding: '20px 24px',
          background: isDark ? '#052e16' : '#f0fdf4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}>
          <div>
            <p style={{
              fontSize: 15,
              fontWeight: 500,
              color: isDark ? '#4ade80' : '#15803d',
              marginBottom: 4,
            }}>
              All services deployed
            </p>
            <p style={{ fontSize: 13, color: isDark ? '#86efac' : '#166534' }}>
              Your pipeline completed successfully.
            </p>
          </div>
          <a
            href="/dashboard"
            style={{
              display: 'inline-block',
              padding: '9px 20px',
              borderRadius: 8,
              background: '#16a34a',
              color: 'white',
              fontSize: 13,
              fontWeight: 500,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            Go to dashboard
          </a>
        </div>
      )}
    </div>
  )
}

// ── Page export ───────────────────────────────────────────────────────────────
export default function ConnectPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ConnectContent />
    </Suspense>
  )
}