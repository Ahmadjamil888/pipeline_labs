'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useClerkSupabaseClient } from '@/lib/clerk-supabase-client'
import { useTheme } from '@/app/theme-provider'
import { 
  Key, 
  Copy, 
  RefreshCw, 
  Trash2, 
  Plus,
  Check,
  Eye,
  EyeOff,
  AlertTriangle
} from 'lucide-react'

const HF = "'Helvetica World', Helvetica, Arial, sans-serif"

interface ApiKey {
  id: string
  name: string
  key_prefix: string
  key_full: string | null
  created_at: string
  last_used_at: string | null
  total_requests: number
  is_active: boolean
}

export default function ApiKeysPage() {
  const supabase = useClerkSupabaseClient()
  const { user } = useUser()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showFullKey, setShowFullKey] = useState<string | null>(null)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      if (!user) return
      
      // Get profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('clerk_user_id', user.id)
        .single()
      
      if (profileData) {
        setProfile(profileData)
        
        // Load API keys
        const { data: keys } = await supabase
          .from('api_keys')
          .select('*')
          .eq('user_id', profileData.id)
          .order('created_at', { ascending: false })
        
        setApiKeys(keys || [])
      }
      
      setLoading(false)
    }
    load()
  }, [supabase, user])

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const revokeKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) return
    
    const { error } = await supabase
      .from('api_keys')
      .update({ 
        is_active: false, 
        revoked_at: new Date().toISOString(),
        revoked_reason: 'User revoked'
      })
      .eq('id', keyId)
    
    if (!error) {
      setApiKeys(prev => prev.map(k => k.id === keyId ? { ...k, is_active: false } : k))
    }
  }

  const createNewKey = async () => {
    if (!profile) return
    
    // In real implementation, this would call an API to generate a new key
    // For now, we'll just show a message
    alert('New API key creation will be implemented with the backend API')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw size={24} className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto" style={{ fontFamily: HF }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl mb-2" style={{ fontFamily: HF, fontWeight: 200, color: isDark ? '#fff' : '#0a0a0a' }}>
            API Keys
          </h1>
          <p className="text-sm" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
            Manage your API keys for programmatic access
          </p>
        </div>
        <button
          onClick={createNewKey}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px]"
          style={{ fontFamily: HF, fontWeight: 300, background: isDark ? '#fff' : '#0a0a0a', color: isDark ? '#000' : '#fff' }}
        >
          <Plus size={16} />
          Create New Key
        </button>
      </div>

      {/* Warning Banner */}
      <div 
        className="mb-6 p-4 rounded-2xl border flex items-center gap-4"
        style={{ 
          borderColor: isDark ? "rgba(234,179,8,0.3)" : "rgba(234,179,8,0.3)",
          background: isDark ? "rgba(234,179,8,0.1)" : "rgba(234,179,8,0.05)"
        }}
      >
        <AlertTriangle size={20} style={{ color: '#eab308' }} />
        <p className="text-sm" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)' }}>
          Keep your API keys secure. Do not share them or expose them in client-side code.
        </p>
      </div>

      {/* API Keys List */}
      <div className="space-y-4">
        {apiKeys.length === 0 ? (
          <div className="p-12 rounded-2xl border text-center" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
            <Key size={48} className="mx-auto mb-4" style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }} />
            <h3 className="text-xl mb-2" style={{ fontFamily: HF, fontWeight: 200, color: isDark ? '#fff' : '#0a0a0a' }}>
              No API keys yet
            </h3>
            <p className="mb-6" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
              A default API key will be generated when you run the schema migration
            </p>
          </div>
        ) : (
          apiKeys.map((key) => (
            <div 
              key={key.id} 
              className="p-6 rounded-2xl border"
              style={{ 
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', 
                background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                opacity: key.is_active ? 1 : 0.5
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Key size={18} style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }} />
                    <span className="text-sm font-medium" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? '#fff' : '#0a0a0a' }}>
                      {key.name}
                    </span>
                    {!key.is_active && (
                      <span 
                        className="px-2 py-0.5 rounded-full text-[10px]"
                        style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
                      >
                        Revoked
                      </span>
                    )}
                  </div>
                  
                  {/* API Key Display */}
                  <div className="flex items-center gap-3 mb-4">
                    <code 
                      className="px-3 py-2 rounded-lg text-sm font-mono"
                      style={{ 
                        background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
                        color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'
                      }}
                    >
                      {showFullKey === key.id && key.key_full 
                        ? key.key_full 
                        : `${key.key_prefix}****************`}
                    </code>
                    
                    {key.key_full && key.is_active && (
                      <button
                        onClick={() => setShowFullKey(showFullKey === key.id ? null : key.id)}
                        className="p-2 rounded-lg transition-all hover:opacity-70"
                        style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                      >
                        {showFullKey === key.id ? (
                          <EyeOff size={14} style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }} />
                        ) : (
                          <Eye size={14} style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }} />
                        )}
                      </button>
                    )}
                    
                    {key.is_active && (
                      <button
                        onClick={() => copyToClipboard(key.key_full || key.key_prefix, key.id)}
                        className="p-2 rounded-lg transition-all hover:opacity-70"
                        style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                      >
                        {copiedId === key.id ? (
                          <Check size={14} style={{ color: '#22c55e' }} />
                        ) : (
                          <Copy size={14} style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }} />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Key Metadata */}
                  <div className="flex items-center gap-6 text-xs" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>
                    <span>Created {new Date(key.created_at).toLocaleDateString()}</span>
                    {key.last_used_at && (
                      <span>Last used {new Date(key.last_used_at).toLocaleDateString()}</span>
                    )}
                    <span>{key.total_requests.toLocaleString()} requests</span>
                  </div>
                </div>

                {/* Actions */}
                {key.is_active && (
                  <button
                    onClick={() => revokeKey(key.id)}
                    className="p-2 rounded-lg transition-all hover:opacity-70 ml-4"
                    style={{ background: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.1)' }}
                    title="Revoke key"
                  >
                    <Trash2 size={16} style={{ color: '#ef4444' }} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* API Documentation */}
      <div className="mt-8 p-6 rounded-2xl border" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
        <h3 className="text-lg mb-4" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? '#fff' : '#0a0a0a' }}>
          API Usage
        </h3>
        <p className="text-sm mb-4" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
          Include your API key in the Authorization header:
        </p>
        <code 
          className="block p-4 rounded-lg text-sm font-mono overflow-x-auto"
          style={{ 
            background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
            color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'
          }}
        >
          Authorization: Bearer {'<'}your_api_key{'>'}
        </code>
      </div>
    </div>
  )
}
