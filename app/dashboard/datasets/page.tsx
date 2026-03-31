'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useClerkSupabaseClient } from '@/lib/clerk-supabase-client'
import { useTheme } from '@/app/theme-provider'
import { useSidebar } from '../sidebar-context'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  FileSpreadsheet, 
  Trash2, 
  RefreshCw, 
  Download,
  Plus,
  Sparkles,
  X,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

const HF = "'Helvetica World', Helvetica, Arial, sans-serif"

interface Dataset {
  id: string
  name: string
  original_filename: string
  file_type: string
  file_size_bytes: number
  row_count: number
  column_count: number
  status: string
  created_at: string
  storage_url: string
  processing_results?: {
    operations_applied: string[]
    llm_instructions: string
  }
}

interface ProcessModal {
  datasetId: string
  datasetName: string
}

export default function DatasetsPage() {
  const supabase = useClerkSupabaseClient()
  const { user } = useUser()
  const { theme } = useTheme()
  const { sidebarOpen } = useSidebar()
  const router = useRouter()
  const isDark = theme === 'dark'
  
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [processModal, setProcessModal] = useState<ProcessModal | null>(null)
  const [processPrompt, setProcessPrompt] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processError, setProcessError] = useState<string | null>(null)
  const [processSuccess, setProcessSuccess] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!user) return
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('clerk_user_id', user.id)
        .single()
      
      if (profileData) {
        setProfile(profileData)
        
        const { data: datasetsData } = await supabase
          .from('datasets')
          .select('*')
          .eq('user_id', profileData.id)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false })
        
        setDatasets(datasetsData || [])
      }
      
      setLoading(false)
    }
    load()
  }, [supabase, user])

  const deleteDataset = async (id: string) => {
    if (!confirm('Are you sure you want to delete this dataset?')) return
    
    const { error } = await supabase
      .from('datasets')
      .update({ is_deleted: true, deleted_at: new Date().toISOString() })
      .eq('id', id)
    
    if (!error) {
      setDatasets(prev => prev.filter(d => d.id !== id))
    }
  }

  const handleProcess = async () => {
    if (!processModal || !processPrompt.trim()) return
    setIsProcessing(true)
    setProcessError(null)
    setProcessSuccess(null)

    try {
      const res = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          datasetId: processModal.datasetId,
          prompt: processPrompt.trim(),
          options: { outputFormat: 'csv' }
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error?.message || 'Processing failed')
      }

      // Update dataset status in local state
      setDatasets(prev => prev.map(d => 
        d.id === processModal.datasetId 
          ? { ...d, status: 'processed', processing_results: data.summary ? {
              operations_applied: data.summary.operationsApplied || [],
              llm_instructions: data.summary.llmInstructions || ''
            } : d.processing_results }
          : d
      ))

      setProcessSuccess(`Processed successfully. ${data.summary?.operationsApplied?.length || 0} operations applied.`)
      setProcessPrompt('')
      setTimeout(() => {
        setProcessModal(null)
        setProcessSuccess(null)
      }, 2500)
    } catch (err: any) {
      setProcessError(err.message || 'Processing failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const statusColor = (status: string) => {
    if (status === 'processed' || status === 'completed') return { bg: 'rgba(34,197,94,0.1)', text: '#22c55e' }
    if (status === 'processing') return { bg: 'rgba(59,130,246,0.1)', text: '#3b82f6' }
    if (status === 'failed') return { bg: 'rgba(239,68,68,0.1)', text: '#ef4444' }
    return { bg: 'rgba(255,255,255,0.08)', text: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: isDark ? '#050505' : '#fafafa' }}>
        <RefreshCw size={24} className="animate-spin" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }} />
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen p-8"
      style={{ fontFamily: HF, background: isDark ? '#050505' : '#fafafa' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl mb-2" style={{ fontFamily: HF, fontWeight: 200, color: isDark ? '#fff' : '#0a0a0a' }}>
            Datasets
          </h1>
          <p className="text-sm" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
            {datasets.length} dataset{datasets.length !== 1 ? 's' : ''} — upload, process, and download
          </p>
        </div>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] transition-all hover:opacity-70"
          style={{ fontFamily: HF, fontWeight: 300, background: isDark ? '#fff' : '#0a0a0a', color: isDark ? '#000' : '#fff' }}
        >
          <Plus size={16} />
          Upload New
        </Link>
      </div>

      {/* Datasets Grid */}
      {datasets.length === 0 ? (
        <div className="p-12 rounded-2xl border text-center" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
          <FileSpreadsheet size={48} className="mx-auto mb-4" style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }} />
          <h3 className="text-xl mb-2" style={{ fontFamily: HF, fontWeight: 200, color: isDark ? '#fff' : '#0a0a0a' }}>
            No datasets yet
          </h3>
          <p className="mb-6" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
            Upload your first dataset from the chat interface
          </p>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-full text-[13px] inline-block transition-all hover:opacity-70"
            style={{ fontFamily: HF, fontWeight: 300, background: isDark ? '#fff' : '#0a0a0a', color: isDark ? '#000' : '#fff' }}
          >
            Go to Chat
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {datasets.map((dataset) => {
            const sc = statusColor(dataset.status)
            return (
              <div 
                key={dataset.id} 
                className="p-6 rounded-2xl border flex flex-col gap-4"
                style={{ 
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', 
                  background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'
                }}
              >
                {/* Top row */}
                <div className="flex items-start justify-between">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                  >
                    <FileSpreadsheet size={24} style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }} />
                  </div>
                  <span 
                    className="px-2 py-1 rounded-full text-[10px]"
                    style={{ fontFamily: HF, fontWeight: 300, background: sc.bg, color: sc.text }}
                  >
                    {dataset.status}
                  </span>
                </div>

                {/* Name */}
                <div>
                  <h3 className="text-base mb-0.5 truncate" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? '#fff' : '#0a0a0a' }}>
                    {dataset.name}
                  </h3>
                  <p className="text-xs truncate" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>
                    {dataset.original_filename}
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Rows', value: (dataset.row_count || 0).toLocaleString() },
                    { label: 'Columns', value: dataset.column_count || 0 },
                    { label: 'Size', value: formatFileSize(dataset.file_size_bytes) },
                    { label: 'Type', value: dataset.file_type?.toUpperCase() },
                  ].map(({ label, value }) => (
                    <div key={label} className="p-2 rounded-lg" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}>
                      <p className="text-[10px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>{label}</p>
                      <p className="text-sm" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? '#fff' : '#0a0a0a' }}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* Operations applied (if processed) */}
                {(dataset.processing_results?.operations_applied?.length ?? 0) > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {dataset.processing_results!.operations_applied.slice(0, 3).map((op, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full text-[10px]" style={{ background: 'rgba(34,197,94,0.08)', color: '#22c55e', fontFamily: HF }}>
                        {op.length > 30 ? op.slice(0, 30) + '…' : op}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 mt-auto">
                  <button
                    onClick={() => { setProcessModal({ datasetId: dataset.id, datasetName: dataset.name }); setProcessError(null); setProcessSuccess(null) }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs transition-all hover:opacity-70"
                    style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)', fontFamily: HF }}
                  >
                    <Sparkles size={13} />
                    Process with AI
                  </button>
                  {dataset.storage_url && (
                    <a
                      href={dataset.storage_url}
                      download
                      className="p-2 rounded-lg transition-all hover:opacity-70"
                      style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}
                    >
                      <Download size={15} />
                    </a>
                  )}
                  <button
                    onClick={() => deleteDataset(dataset.id)}
                    className="p-2 rounded-lg transition-all hover:opacity-70"
                    style={{ background: 'rgba(239,68,68,0.08)' }}
                  >
                    <Trash2 size={15} style={{ color: '#ef4444' }} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Process Modal */}
      {processModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
          <div 
            className="w-full max-w-lg rounded-2xl border p-6"
            style={{ 
              background: isDark ? '#0e0e0e' : '#fff',
              borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg" style={{ fontFamily: HF, fontWeight: 200, color: isDark ? '#fff' : '#0a0a0a' }}>
                  Process with AI
                </h2>
                <p className="text-xs mt-0.5" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>
                  {processModal.datasetName}
                </p>
              </div>
              <button onClick={() => setProcessModal(null)} className="hover:opacity-70">
                <X size={18} style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }} />
              </button>
            </div>

            {/* Example prompts */}
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                'Normalize numeric features and encode categoricals',
                'Remove outliers and fill missing values with median',
                'Prepare for logistic regression with standard scaling',
              ].map((p, i) => (
                <button
                  key={i}
                  onClick={() => setProcessPrompt(p)}
                  className="px-3 py-1.5 rounded-full text-[11px] transition-all hover:opacity-70"
                  style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', fontFamily: HF }}
                >
                  {p}
                </button>
              ))}
            </div>

            <textarea
              value={processPrompt}
              onChange={e => setProcessPrompt(e.target.value)}
              placeholder="Describe how you want to preprocess this dataset..."
              rows={4}
              disabled={isProcessing}
              className="w-full rounded-xl border p-3 text-sm resize-none outline-none"
              style={{ 
                fontFamily: HF, fontWeight: 300,
                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                color: isDark ? '#fff' : '#0a0a0a'
              }}
            />

            {processError && (
              <div className="flex items-center gap-2 mt-3 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <AlertCircle size={14} style={{ color: '#ef4444' }} />
                <span className="text-xs" style={{ fontFamily: HF, color: '#ef4444' }}>{processError}</span>
              </div>
            )}

            {processSuccess && (
              <div className="flex items-center gap-2 mt-3 p-3 rounded-xl" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <CheckCircle size={14} style={{ color: '#22c55e' }} />
                <span className="text-xs" style={{ fontFamily: HF, color: '#22c55e' }}>{processSuccess}</span>
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setProcessModal(null)}
                disabled={isProcessing}
                className="flex-1 py-2.5 rounded-full text-sm transition-all hover:opacity-70"
                style={{ fontFamily: HF, fontWeight: 300, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleProcess}
                disabled={!processPrompt.trim() || isProcessing}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm transition-all hover:opacity-80 disabled:opacity-40"
                style={{ fontFamily: HF, fontWeight: 300, background: isDark ? '#fff' : '#0a0a0a', color: isDark ? '#000' : '#fff' }}
              >
                {isProcessing ? (
                  <><Loader2 size={14} className="animate-spin" /> Processing...</>
                ) : (
                  <><Send size={14} /> Clean Dataset</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
