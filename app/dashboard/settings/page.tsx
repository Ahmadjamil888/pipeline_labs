"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/app/supabase-client"
import { useRouter } from "next/navigation"
import { Settings, User, Bell, Shield, Key, Save, RefreshCw, Copy, Plus, Trash2, Eye, EyeOff, X, Check } from "lucide-react"
import { useTheme } from "@/app/theme-provider"

const HF = "'Helvetica World', Helvetica, Arial, sans-serif"

interface ApiKey {
  id: string
  name: string
  key_hash: string
  key_preview: string
  created_at: string
  last_used_at: string | null
}

export default function SettingsPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const { theme } = useTheme()
  const isDark = theme === "dark"

  // API Keys state
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [showNewKeyForm, setShowNewKeyForm] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [generatingKey, setGeneratingKey] = useState(false)
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showKeyId, setShowKeyId] = useState<string | null>(null)
  const [profileId, setProfileId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profile) {
        setFullName(profile.full_name || '')
        setEmail(user.email || '')
        setProfileId(profile.id)
        // Fetch API keys using profile.id (owner_id)
        await fetchApiKeys(profile.id)
      }
      
      setLoading(false)
    }
    fetchProfile()
  }, [supabase, router])

  const fetchApiKeys = async (ownerId: string) => {
    console.log('fetchApiKeys called with ownerId:', ownerId)
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false })
      
      console.log('fetchApiKeys response:', { data, error })
      
      if (!error && data) {
        setApiKeys(data)
      } else if (error) {
        console.error('fetchApiKeys error:', error)
      }
    } catch (err) {
      console.error('fetchApiKeys exception:', err)
    }
  }

  // Generate a cryptographically secure API key
  const generateSecureApiKey = () => {
    const prefix = 'pipe_'
    // Use crypto.getRandomValues for strong randomness
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    const randomPart = Array.from(array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    return prefix + randomPart
  }

  // Simple hash function for storing key hash (SHA-256)
  const hashKey = async (key: string): Promise<string> => {
    const encoder = new TextEncoder()
    const data = encoder.encode(key)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  const generateApiKey = async () => {
    if (!newKeyName.trim() || !profileId) return
    
    setGeneratingKey(true)

    // Generate secure API key
    const fullKey = generateSecureApiKey()
    
    // Hash the key for storage
    const keyHash = await hashKey(fullKey)
    
    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        owner_id: profileId,
        name: newKeyName.trim(),
        key_hash: keyHash,
        key_preview: fullKey.slice(0, 8) + '...' + fullKey.slice(-4),
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (!error && data) {
      setNewlyCreatedKey(fullKey)
      setApiKeys([data, ...apiKeys])
      setNewKeyName('')
      setShowNewKeyForm(false)
      setShowKeyModal(true)
      setCopied(false)
    } else {
      setMessage('Failed to create API key. Please try again.')
      setTimeout(() => setMessage(null), 3000)
    }
    
    setGeneratingKey(false)
  }

  const copyToClipboard = async () => {
    if (!newlyCreatedKey) return
    
    try {
      await navigator.clipboard.writeText(newlyCreatedKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      setMessage('Failed to copy to clipboard')
      setTimeout(() => setMessage(null), 2000)
    }
  }

  const closeKeyModal = () => {
    setShowKeyModal(false)
    setNewlyCreatedKey(null)
    setCopied(false)
    setMessage('API key created successfully! Make sure to store it securely.')
    setTimeout(() => setMessage(null), 3000)
  }

  const deleteApiKey = async (keyId: string) => {
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', keyId)
    
    if (!error) {
      setApiKeys(apiKeys.filter(k => k.id !== keyId))
      setMessage('API key deleted successfully')
      setTimeout(() => setMessage(null), 3000)
    } else {
      setMessage('Failed to delete API key')
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .upsert({ user_id: user.id, full_name: fullName, updated_at: new Date().toISOString() })

    if (!error) {
      setMessage('Settings saved successfully')
      setTimeout(() => setMessage(null), 3000)
    }
    setSaving(false)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl mb-2" style={{ fontFamily: HF, fontWeight: 200, color: isDark ? "#fff" : "#0a0a0a" }}>
          Settings
        </h1>
        <p className="text-sm" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
          Manage your account preferences
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw size={24} className="animate-spin" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }} />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Profile Section */}
          <div className="p-6 rounded-2xl border" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
                <User size={20} style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }} />
              </div>
              <div>
                <div className="text-[16px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "#fff" : "#0a0a0a" }}>
                  Profile
                </div>
                <div className="text-[12px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
                  Update your personal information
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[13px] mb-2" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)" }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border bg-transparent text-[14px]"
                  style={{ fontFamily: HF, fontWeight: 300, borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", color: isDark ? "#fff" : "#0a0a0a" }}
                />
              </div>
              <div>
                <label className="block text-[13px] mb-2" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)" }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-4 py-3 rounded-xl border bg-transparent text-[14px] opacity-50"
                  style={{ fontFamily: HF, fontWeight: 300, borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", color: isDark ? "#fff" : "#0a0a0a" }}
                />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="p-6 rounded-2xl border" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
                <Bell size={20} style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }} />
              </div>
              <div>
                <div className="text-[16px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "#fff" : "#0a0a0a" }}>
                  Notifications
                </div>
                <div className="text-[12px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
                  Configure email and push notifications
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {['Deployment status updates', 'Build failures', 'Security alerts', 'Weekly digest'].map((item, idx) => (
                <label key={idx} className="flex items-center justify-between p-3 rounded-xl" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
                  <span className="text-[13px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "#fff" : "#0a0a0a" }}>
                    {item}
                  </span>
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                </label>
              ))}
            </div>
          </div>

          {/* API Keys Section */}
          <div className="p-6 rounded-2xl border" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
                <Key size={20} style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }} />
              </div>
              <div>
                <div className="text-[16px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "#fff" : "#0a0a0a" }}>
                  API Keys
                </div>
                <div className="text-[12px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
                  Manage your API keys for SDK and CLI access
                </div>
              </div>
            </div>

            {/* New Key Form */}
            {!showNewKeyForm ? (
              <button
                onClick={() => setShowNewKeyForm(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] mb-4"
                style={{ fontFamily: HF, fontWeight: 300, background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", color: isDark ? "#fff" : "#0a0a0a" }}
              >
                <Plus size={16} />
                Create New API Key
              </button>
            ) : (
              <div className="p-4 rounded-xl mb-4" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
                <label className="block text-[13px] mb-2" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)" }}>
                  Key Name
                </label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., Production, Development"
                  className="w-full px-4 py-2 rounded-xl border bg-transparent text-[13px] mb-3"
                  style={{ fontFamily: HF, fontWeight: 300, borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", color: isDark ? "#fff" : "#0a0a0a" }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={generateApiKey}
                    disabled={generatingKey || !newKeyName.trim()}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px]"
                    style={{ fontFamily: HF, fontWeight: 300, background: isDark ? "#fff" : "#0a0a0a", color: isDark ? "#000" : "#fff", opacity: generatingKey || !newKeyName.trim() ? 0.5 : 1 }}
                  >
                    {generatingKey ? <RefreshCw size={14} className="animate-spin" /> : <Key size={14} />}
                    {generatingKey ? 'Generating...' : 'Generate Key'}
                  </button>
                  <button
                    onClick={() => {setShowNewKeyForm(false); setNewKeyName('')}}
                    className="px-4 py-2 rounded-full text-[13px]"
                    style={{ fontFamily: HF, fontWeight: 300, background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", color: isDark ? "#fff" : "#0a0a0a" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* API Key Modal */}
            {showKeyModal && newlyCreatedKey && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
                <div className="w-full max-w-md p-6 rounded-2xl border" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", background: isDark ? "#0a0a0a" : "#fff" }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Key size={20} style={{ color: "#22c55e" }} />
                      <span className="text-[16px]" style={{ fontFamily: HF, fontWeight: 400, color: isDark ? "#fff" : "#0a0a0a" }}>
                        API Key Created
                      </span>
                    </div>
                    <button
                      onClick={closeKeyModal}
                      className="p-1 rounded-lg opacity-60 hover:opacity-100"
                      style={{ color: isDark ? "#fff" : "#0a0a0a" }}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="mb-4">
                    <p className="text-[13px] mb-3" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)" }}>
                      Copy this key now. You won&apos;t be able to see it again!
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-4 py-3 rounded-xl text-[12px] break-all" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", fontFamily: "monospace", color: isDark ? "#22c55e" : "#15803d", border: "1px solid", borderColor: isDark ? "rgba(34,197,94,0.3)" : "rgba(34,197,94,0.3)" }}>
                        {newlyCreatedKey}
                      </code>
                      <button
                        onClick={copyToClipboard}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl text-[13px]"
                        style={{ fontFamily: HF, fontWeight: 300, background: copied ? "#22c55e" : (isDark ? "#fff" : "#0a0a0a"), color: copied ? "#fff" : (isDark ? "#000" : "#fff") }}
                      >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={copyToClipboard}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-[14px]"
                      style={{ fontFamily: HF, fontWeight: 300, background: "#22c55e", color: "#fff" }}
                    >
                      {copied ? <Check size={18} /> : <Copy size={18} />}
                      {copied ? 'Copied to Clipboard' : 'Copy Key'}
                    </button>
                    <button
                      onClick={closeKeyModal}
                      className="px-6 py-3 rounded-full text-[14px]"
                      style={{ fontFamily: HF, fontWeight: 300, background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", color: isDark ? "#fff" : "#0a0a0a" }}
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* API Keys List */}
            <div className="space-y-2">
              {apiKeys.length === 0 ? (
                <div className="text-center py-6 text-[13px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
                  No API keys yet. Create one to get started.
                </div>
              ) : (
                apiKeys.map((key) => (
                  <div key={key.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] truncate" style={{ fontFamily: HF, fontWeight: 400, color: isDark ? "#fff" : "#0a0a0a" }}>
                        {key.name}
                      </div>
                      <div className="text-[12px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
                        {key.key_preview} • Created {new Date(key.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() => setShowKeyId(showKeyId === key.id ? null : key.id)}
                        className="p-2 rounded-lg opacity-60 hover:opacity-100"
                        style={{ color: isDark ? "#fff" : "#0a0a0a" }}
                        title={showKeyId === key.id ? "Hide" : "Show"}
                      >
                        {showKeyId === key.id ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        onClick={() => deleteApiKey(key.id)}
                        className="p-2 rounded-lg opacity-60 hover:opacity-100"
                        style={{ color: "#ef4444" }}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Security */}
          <div className="p-6 rounded-2xl border" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
                <Shield size={20} style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }} />
              </div>
              <div>
                <div className="text-[16px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "#fff" : "#0a0a0a" }}>
                  Security
                </div>
                <div className="text-[12px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
                  Manage your security settings
                </div>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px]" style={{ fontFamily: HF, fontWeight: 300, background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", color: isDark ? "#fff" : "#0a0a0a" }}>
              <Key size={16} />
              Change Password
            </button>
          </div>

          {message && (
            <div className="p-4 rounded-xl text-[13px] text-center" style={{ fontFamily: HF, fontWeight: 300, background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>
              {message}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-[14px]"
            style={{ fontFamily: HF, fontWeight: 300, background: isDark ? "#fff" : "#0a0a0a", color: isDark ? "#000" : "#fff" }}
          >
            {saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  )
}
