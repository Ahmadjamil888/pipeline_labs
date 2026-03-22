import React, { useState } from 'react'
import { CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'

interface CustomDomainSectionProps {
  projectId: string
  userId: string
  plan: string
  service_name?: string
}

export default function CustomDomainSection({ 
  projectId, 
  userId, 
  plan, 
  service_name = `pipeline-${projectId.slice(0, 8)}` 
}: CustomDomainSectionProps) {
  const [domain, setDomain] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [domains, setDomains] = useState<any[]>([])
  const [showAddForm, setShowAddForm] = useState(false)

  const isPro = plan === 'pro' || plan === 'team'
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pipeline-ai-labs-by-ahmad.up.railway.app'

  const fetchDomains = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/domains/project/${projectId}?user_id=${userId}`)
      const data = await res.json()
      setDomains(data.domains || [])
    } catch (error) {
      console.error('Failed to fetch domains:', error)
    }
  }

  const addDomain = async () => {
    if (!domain.trim()) return
    
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/v1/domains/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: userId, 
          project_id: projectId, 
          domain: domain.trim(),
          service_name
        }),
      })
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to add domain')
      }
      
      setResult(data)
      setDomain('')
      setShowAddForm(false)
      fetchDomains() // Refresh domains list
    } catch (error: any) {
      setResult({ error: error.message })
    }
    setLoading(false)
  }

  const removeDomain = async (domainName: string) => {
    if (!confirm(`Remove domain ${domainName}?`)) return
    
    try {
      const res = await fetch(
        `${API_URL}/api/v1/domains/project/${projectId}/domain/${domainName}?user_id=${userId}`,
        { method: 'DELETE' }
      )
      
      if (res.ok) {
        fetchDomains() // Refresh domains list
      }
    } catch (error) {
      console.error('Failed to remove domain:', error)
    }
  }

  // Fetch domains on mount
  React.useEffect(() => {
    if (isPro) {
      fetchDomains()
    }
  }, [projectId, userId, isPro])

  if (!isPro) {
    return (
      <div style={{ padding: '20px', border: '1px solid #e4e4e7', borderRadius: 8 }}>
        <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Custom Domain</p>
        <p style={{ fontSize: 13, color: '#71717a', marginBottom: 12 }}>
          Custom domains are available on the Pro plan.
        </p>
        <a 
          href="/dashboard/billing" 
          style={{ fontSize: 13, color: '#3b82f6', textDecoration: 'none' }}
        >
          Upgrade to Pro →
        </a>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #e4e4e7', borderRadius: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <p style={{ fontSize: 14, fontWeight: 500 }}>Custom Domain</p>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            style={{
              padding: '6px 12px',
              background: '#18181b',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Add Domain
          </button>
        )}
      </div>

      {/* Add Domain Form */}
      {showAddForm && (
        <div style={{ marginBottom: 16, padding: 12, background: '#f9f9f9', borderRadius: 6 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input
              value={domain}
              onChange={e => setDomain(e.target.value)}
              placeholder="yourdomain.com"
              style={{ 
                flex: 1, 
                padding: '8px 12px', 
                border: '1px solid #e4e4e7', 
                borderRadius: 6, 
                fontSize: 13 
              }}
              onKeyPress={e => e.key === 'Enter' && addDomain()}
            />
            <button
              onClick={addDomain}
              disabled={loading || !domain}
              style={{
                padding: '8px 16px', 
                background: '#18181b', 
                color: 'white',
                border: 'none', 
                borderRadius: 6, 
                fontSize: 13, 
                cursor: loading || !domain ? 'not-allowed' : 'pointer',
                opacity: loading || !domain ? 0.6 : 1,
              }}
            >
              {loading ? 'Adding...' : 'Add'}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false)
                setDomain('')
                setResult(null)
              }}
              style={{
                padding: '8px 16px',
                background: '#f4f4f5',
                color: '#18181b',
                border: 'none',
                borderRadius: 6,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Result Message */}
      {result && (
        <div style={{ 
          marginBottom: 16, 
          padding: 12, 
          background: result.error ? '#fef2f2' : '#f0fdf4', 
          borderRadius: 6,
          border: `1px solid ${result.error ? '#fecaca' : '#bbf7d0'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            {result.error ? (
              <AlertCircle size={16} style={{ color: '#dc2626', marginTop: 2 }} />
            ) : (
              <CheckCircle size={16} style={{ color: '#16a34a', marginTop: 2 }} />
            )}
            <div style={{ flex: 1 }}>
              <p style={{ 
                fontSize: 13, 
                fontWeight: 500, 
                marginBottom: 4,
                color: result.error ? '#dc2626' : '#16a34a'
              }}>
                {result.error || (result.verified ? '✓ Domain verified' : 'Domain added')}
              </p>
              {!result.error && !result.verified && result.verification && (
                <p style={{ fontSize: 12, fontFamily: 'monospace', color: '#71717a' }}>
                  CNAME {result.domain} → {result.verification[0]?.value || 'cname.vercel-dns.com'}
                </p>
              )}
              {result.error && (
                <p style={{ fontSize: 12, color: '#dc2626' }}>{result.error}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Existing Domains */}
      {domains.length > 0 && (
        <div>
          <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: '#71717a' }}>
            Existing Domains
          </p>
          {domains.map((d: any) => (
            <div 
              key={d.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 12px',
                background: '#f9f9f9',
                borderRadius: 6,
                marginBottom: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: d.verified ? '#22c55e' : '#f59e0b',
                }} />
                <span style={{ fontSize: 13 }}>{d.domain}</span>
                {d.verified && (
                  <CheckCircle size={14} style={{ color: '#22c55e' }} />
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <a
                  href={`https://${d.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ 
                    padding: '4px 8px',
                    background: '#f4f4f5',
                    borderRadius: 4,
                    fontSize: 11,
                    textDecoration: 'none',
                    color: '#18181b',
                  }}
                >
                  <ExternalLink size={12} />
                </a>
                <button
                  onClick={() => removeDomain(d.domain)}
                  style={{
                    padding: '4px 8px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: 4,
                    fontSize: 11,
                    color: '#dc2626',
                    cursor: 'pointer',
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
