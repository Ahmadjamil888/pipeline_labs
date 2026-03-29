'use client'

import { useEffect, useState, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { useClerkSupabaseClient } from '@/lib/clerk-supabase-client'
import { useTheme } from '@/app/theme-provider'
import { Typewriter } from '@/app/components/Typewriter'
import { LiveDatasetEditor } from '@/components/LiveDatasetEditor'
import { DataWorkspace } from '@/components/DataWorkspace'
import { useSidebar } from './sidebar-context'
import { 
  Send, 
  Plus, 
  FileSpreadsheet, 
  RefreshCw, 
  Download,
  Loader2,
  Sparkles,
  Database,
  CheckCircle,
  X,
  AlertCircle,
  Bot,
  Brain,
  Zap
} from 'lucide-react'

const HF = "'Helvetica World', Helvetica, Arial, sans-serif"

type AIProvider = 'groq' | 'openrouter' | 'deepseek' | 'gemini'

interface ProviderConfig {
  id: AIProvider
  name: string
  icon: React.ReactNode
  model: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  datasetId?: string
  jobId?: string
  status?: 'thinking' | 'analyzing' | 'planning' | 'processing' | 'complete' | 'error'
  steps?: { step: number; message: string; status: 'pending' | 'running' | 'complete' | 'error' }[]
  downloadUrl?: string
  showLiveEditor?: boolean
  showDataWorkspace?: boolean
  workspaceData?: {
    columns: { name: string; type: string; nullCount: number; uniqueCount: number; sample: string }[]
    transformations: { id: string; name: string; description: string; status: 'pending' | 'running' | 'complete' | 'error' }[]
    previewData: (string | number)[][]
    progress: number
  }
  editorSteps?: { id: string; title: string; description: string; status: 'pending' | 'running' | 'complete' | 'error'; details?: string[] }[]
  preview?: { columns: string[]; rows: (string | number)[][]; totalRows: number; totalCols: number }
}

interface Dataset {
  id: string
  name: string
  original_filename: string
  file_type: string
  row_count: number
  column_count: number
  status: string
}

export default function ChatDashboard() {
  const supabase = useClerkSupabaseClient()
  const { user, isLoaded: userLoaded } = useUser()
  const { theme } = useTheme()
  const { sidebarOpen } = useSidebar()
  const isDark = theme === 'dark'
  
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null)
  const [showDatasetSelector, setShowDatasetSelector] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [apiKey, setApiKey] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('openrouter')
  const [showProviderSelector, setShowProviderSelector] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const providers: ProviderConfig[] = [
    { id: 'openrouter', name: 'OpenRouter (Free)', icon: <Brain size={14} />, model: 'meta-llama/llama-3.1-8b-instruct:free' },
    { id: 'groq', name: 'Groq (Fast)', icon: <Zap size={14} />, model: 'llama-3.1-8b-instant' },
    { id: 'deepseek', name: 'DeepSeek', icon: <Brain size={14} />, model: 'deepseek-chat' },
    { id: 'gemini', name: 'Gemini', icon: <Sparkles size={14} />, model: 'gemini-1.5-flash' },
  ]

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load user profile, datasets, and API key
  useEffect(() => {
    const load = async () => {
      if (!user) return
      
      const clerkUserId = user.id

      try {
        // Get or create profile
        let { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('clerk_user_id', clerkUserId)
          .single()
        
        if (!profileData) {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              clerk_user_id: clerkUserId,
              email: user.primaryEmailAddress?.emailAddress || '',
              full_name: user.fullName || '',
            })
            .select('*')
            .single()
          
          if (createError) {
            console.log('Profile may already exist or table not ready')
          }
          profileData = newProfile
        }

        if (profileData) {
          setProfile(profileData)
          
          // Load datasets
          const { data: datasetsData } = await supabase
            .from('datasets')
            .select('*')
            .eq('user_id', profileData.id)
            .eq('is_deleted', false)
            .order('created_at', { ascending: false })
          
          setDatasets(datasetsData || [])

          // Load API key
          const { data: keysData } = await supabase
            .from('api_keys')
            .select('*')
            .eq('user_id', profileData.id)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
          
          if (keysData && keysData.length > 0 && keysData[0].key_full) {
            setApiKey(keysData[0].key_full)
          }
        }
      } catch (err) {
        console.error('Error loading profile:', err)
        // Continue without profile - schema might not be set up
      }
    }
    load()
  }, [supabase, user])

  // Handle file selection - just queue the file, show inline indicator
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) {
      setError('Please sign in and wait for profile to load')
      return
    }

    // Store file for upload when user presses Enter
    setPendingFile(file)
    setHasStarted(true)
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Handle file upload - uploads file and returns dataset info
  const uploadFile = async (file: File): Promise<Dataset | null> => {
    const MAX_CHUNK_SIZE = 5 * 1024 * 1024
    const fileSize = file.size
    const CHUNK_THRESHOLD = 50 * 1024 * 1024

    setIsUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      let result: any

      // Use chunked upload for files > 50MB
      if (fileSize > CHUNK_THRESHOLD) {
        const totalChunks = Math.ceil(fileSize / MAX_CHUNK_SIZE)
        const fileType = getFileType(file.name)
        
        const initRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'init',
            filename: file.name,
            fileSize,
            fileType,
            totalChunks
          })
        })

        if (!initRes.ok) {
          const err = await initRes.json()
          throw new Error(err.error?.message || 'Failed to initialize upload')
        }

        const { sessionId } = await initRes.json()

        for (let i = 0; i < totalChunks; i++) {
          const start = i * MAX_CHUNK_SIZE
          const end = Math.min(start + MAX_CHUNK_SIZE, fileSize)
          const chunk = file.slice(start, end)

          const formData = new FormData()
          formData.append('sessionId', sessionId)
          formData.append('chunkIndex', i.toString())
          formData.append('totalChunks', totalChunks.toString())
          formData.append('chunk', chunk)
          formData.append('filename', file.name)
          formData.append('fileType', fileType)

          const chunkRes = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          })

          if (!chunkRes.ok) {
            const err = await chunkRes.json()
            throw new Error(err.error?.message || `Failed to upload chunk ${i + 1}/${totalChunks}`)
          }

          const progress = Math.round(((i + 1) / totalChunks) * 100)
          setUploadProgress(progress)
        }

        const finalizeRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'finalize', sessionId })
        })

        if (!finalizeRes.ok) {
          const err = await finalizeRes.json()
          throw new Error(err.error?.message || 'Failed to finalize upload')
        }

        result = await finalizeRes.json()
      } else {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('userId', user!.id)

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error?.message || data.error || 'Upload failed')
        }

        result = await res.json()
      }

      // Upload API already creates the DB record - just use the returned data
      const newDataset: Dataset = {
        id: result.id,
        name: result.name || file.name.replace(/\.[^/.]+$/, ''),
        original_filename: file.name,
        file_type: result.type || file.name.split('.').pop()?.toLowerCase() || 'csv',
        row_count: result.rowCount || 0,
        column_count: result.columnCount || 0,
        status: 'uploaded'
      }

      setDatasets(prev => [newDataset, ...prev])
      return newDataset
      
    } catch (error: any) {
      console.error('Upload error:', error)
      setError(error.message || 'Failed to upload file')
      return null
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  // Helper to get file type
  function getFileType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase() || ''
    if (['csv', 'xlsx', 'xls', 'json'].includes(ext)) return ext
    return 'csv'
  }

  // Handle sending a message - uploads pending file + sends chat together
  const handleSend = async () => {
    if ((!input.trim() && !pendingFile) || isLoading) {
      return
    }

    let dataset: Dataset | null = null
    let file = pendingFile
    
    // Upload file first if pending
    if (pendingFile) {
      setPendingFile(null)
      dataset = await uploadFile(pendingFile)
      if (!dataset) return // Upload failed
    }

    // Create combined user message (file + text)
    let messageContent = input.trim()
    if (file) {
      const fileInfo = `📎 **${file.name}** (${(file.size / 1024).toFixed(1)} KB)`
      messageContent = messageContent 
        ? `${fileInfo}\n${messageContent}`
        : `${fileInfo}\nProcess this dataset`
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
      datasetId: dataset?.id || selectedDataset?.id
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setHasStarted(true)
    setError(null)

    // Create AI response with thinking state and live editor
    const aiMessageId = (Date.now() + 1).toString()
    const hasDataset = dataset?.id || selectedDataset?.id
    
    const aiMessage: Message = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      datasetId: dataset?.id || selectedDataset?.id,
      status: 'thinking',
      steps: [
        { step: 1, message: 'Analyzing your request...', status: 'running' },
        { step: 2, message: 'Planning preprocessing steps...', status: 'pending' },
        { step: 3, message: 'Processing data...', status: 'pending' },
        { step: 4, message: 'Generating results...', status: 'pending' }
      ],
      // Show data workspace when processing a dataset
      showDataWorkspace: !!hasDataset,
      workspaceData: hasDataset ? {
        columns: [
          { name: 'Loading...', type: 'pending', nullCount: 0, uniqueCount: 0, sample: '' }
        ],
        transformations: [
          { id: '1', name: 'Load Dataset', description: 'Reading file structure and validating format', status: 'running' },
          { id: '2', name: 'Profile Columns', description: 'Analyzing data types and distributions', status: 'pending' },
          { id: '3', name: 'Detect Issues', description: 'Finding missing values and outliers', status: 'pending' },
          { id: '4', name: 'Apply Preprocessing', description: 'Scaling, encoding, and cleaning', status: 'pending' },
          { id: '5', name: 'Validate Output', description: 'Final quality checks', status: 'pending' }
        ],
        previewData: [['Loading...']],
        progress: 0
      } : undefined
    }
    setMessages(prev => [...prev, aiMessage])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          datasetId: dataset?.id || selectedDataset?.id,
          history: messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
          provider: selectedProvider,
          model: providers.find(p => p.id === selectedProvider)?.model
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `API error: ${response.status}`)
      }

      const data = await response.json()

      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId 
          ? { 
              ...msg, 
              status: 'complete', 
              content: data.content || 'I processed your request.',
              steps: msg.steps?.map(s => ({ ...s, status: 'complete' }))
            }
          : msg
      ))

    } catch (error: any) {
      console.error('Chat API error:', error)
      
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId 
          ? { 
              ...msg, 
              status: 'complete', 
              content: `I apologize, but I'm having trouble connecting to the AI service. Here's what I can help you with:\n\n**Data Preprocessing Steps:**\n1. Clean missing values and duplicates\n2. Scale/normalize numeric features\n3. Encode categorical variables\n4. Remove outliers\n5. Feature engineering\n\nPlease try again in a moment, or describe your dataset and I'll guide you through the preprocessing manually.`,
              steps: msg.steps?.map(s => ({ ...s, status: 'complete' }))
            }
          : msg
      ))
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!userLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: isDark ? '#050505' : '#fafafa' }}>
        <RefreshCw size={24} className="animate-spin" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }} />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen" style={{ fontFamily: HF, background: isDark ? '#050505' : '#fafafa' }}>
      {/* Error Banner */}
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-3 rounded-xl border flex items-center gap-3" style={{ background: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.3)' }}>
          <AlertCircle size={18} style={{ color: '#ef4444' }} />
          <span className="text-sm" style={{ color: '#ef4444' }}>{error}</span>
          <button onClick={() => setError(null)} className="ml-2">
            <X size={14} style={{ color: '#ef4444' }} />
          </button>
        </div>
      )}

      {/* Chat Messages Area */}
      <div className={`flex-1 overflow-y-auto ${hasStarted ? 'pb-32' : ''}`}>
        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Empty State */}
          {messages.length === 0 && (
            <div className="text-center pt-20">
              <h1 className="text-4xl mb-4" style={{ fontFamily: HF, fontWeight: 200, color: isDark ? '#fff' : '#0a0a0a' }}>
                Pipeline Labs
              </h1>
              <p className="text-lg mb-12" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                Turn raw data into ML-ready datasets with AI
              </p>
              
              {/* Example Prompts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {[
                  'Clean this dataset and handle missing values',
                  'Normalize features for logistic regression',
                  'Encode categorical variables and remove outliers',
                  'Prepare data for time series forecasting'
                ].map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => { setInput(prompt); setHasStarted(true); }}
                    className="p-4 rounded-2xl border text-left transition-all hover:opacity-70"
                    style={{ 
                      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                      background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                      color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'
                    }}
                  >
                    <Sparkles size={16} className="mb-2" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }} />
                    <span className="text-sm" style={{ fontFamily: HF, fontWeight: 300 }}>{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`mb-6 ${message.role === 'user' ? 'ml-auto max-w-[80%]' : 'mr-auto max-w-[90%]'}`}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                    <Sparkles size={14} style={{ color: isDark ? '#fff' : '#0a0a0a' }} />
                  </div>
                  <span className="text-xs" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                    Pipeline AI
                  </span>
                </div>
              )}
              
              <div 
                className={`p-4 rounded-2xl ${message.role === 'user' ? 'rounded-br-md' : 'rounded-bl-md'}`}
                style={{ 
                  background: message.role === 'user' 
                    ? (isDark ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.1)') 
                    : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                  border: message.role === 'user' 
                    ? `1px solid ${isDark ? 'rgba(59,130,246,0.3)' : 'rgba(59,130,246,0.2)'}` 
                    : `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  color: isDark ? '#fff' : '#0a0a0a'
                }}
              >
                {/* Message Content with Typewriter Effect for AI */}
                {message.content && (
                  <div className="text-sm" style={{ fontFamily: HF, fontWeight: 300, lineHeight: 1.7 }}>
                    {message.role === 'assistant' && !message.status ? (
                      <Typewriter 
                        text={message.content} 
                        speed={12} 
                        isDark={isDark}
                      />
                    ) : (
                      <div 
                        className="whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ 
                          __html: message.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                        }}
                      />
                    )}
                  </div>
                )}

                {/* Thinking / Processing Steps */}
                {message.status && message.status !== 'complete' && message.status !== 'error' && message.steps && (
                  <div className="mt-4 space-y-2">
                    {message.steps.map((step) => (
                      <div key={step.step} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center">
                          {step.status === 'complete' ? (
                            <CheckCircle size={14} style={{ color: '#22c55e' }} />
                          ) : step.status === 'running' ? (
                            <Loader2 size={14} className="animate-spin" style={{ color: '#3b82f6' }} />
                          ) : (
                            <div className="w-3 h-3 rounded-full" style={{ background: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }} />
                          )}
                        </div>
                        <span 
                          className="text-xs" 
                          style={{ 
                            fontFamily: HF, 
                            fontWeight: 300, 
                            color: step.status === 'complete' ? '#22c55e' : step.status === 'running' ? '#3b82f6' : isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'
                          }}
                        >
                          {step.message}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Live Dataset Editor */}
                {message.showLiveEditor && message.editorSteps && (
                  <div className="mt-4">
                    <LiveDatasetEditor
                      datasetName={datasets.find(d => d.id === message.datasetId)?.original_filename || 'Dataset'}
                      isActive={message.status !== 'complete'}
                      steps={message.editorSteps}
                      preview={message.preview}
                      downloadUrl={message.downloadUrl}
                      isDark={isDark}
                    />
                  </div>
                )}

                {/* Data Workspace - Professional Data Editor */}
                {message.showDataWorkspace && message.workspaceData && (
                  <div className="mt-4">
                    <DataWorkspace
                      datasetName={datasets.find(d => d.id === message.datasetId)?.original_filename || 'Dataset'}
                      isProcessing={message.status !== 'complete'}
                      progress={message.workspaceData.progress}
                      columns={message.workspaceData.columns}
                      transformations={message.workspaceData.transformations}
                      previewData={message.workspaceData.previewData}
                      downloadUrl={message.downloadUrl}
                      isDark={isDark}
                    />
                  </div>
                )}

                {/* Download Button (legacy, kept for compatibility) */}
                {message.downloadUrl && !message.showLiveEditor && (
                  <div className="mt-4 p-4 rounded-xl border" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Database size={20} style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }} />
                        <div>
                          <p className="text-sm" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? '#fff' : '#0a0a0a' }}>
                            Processed Dataset
                          </p>
                          <p className="text-xs" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                            CSV format - Ready for ML
                          </p>
                        </div>
                      </div>
                      <button
                        className="flex items-center gap-2 px-4 py-2 rounded-full text-xs"
                        style={{ 
                          background: isDark ? '#fff' : '#0a0a0a', 
                          color: isDark ? '#000' : '#fff',
                          fontFamily: HF,
                          fontWeight: 300
                        }}
                      >
                        <Download size={14} />
                        Download
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Floating & Responsive to Sidebar */}
      <div 
        className={`fixed bottom-6 z-40 transition-all duration-500 ease-in-out ${
          sidebarOpen ? 'left-64 right-0' : 'left-0 right-0'
        }`}
      >
        <div className="mx-auto px-4 max-w-4xl">
          <div className="backdrop-blur-xl rounded-3xl border shadow-2xl p-2"
            style={{ 
              borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
              background: isDark ? 'rgba(20,20,20,0.85)' : 'rgba(255,255,255,0.9)'
            }}
          >
          {/* Selected Dataset Indicator */}
          {selectedDataset && (
            <div className="flex items-center gap-2 mb-3 px-4 py-2 rounded-full w-fit" style={{ background: isDark ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.05)', border: `1px solid ${isDark ? 'rgba(59,130,246,0.3)' : 'rgba(59,130,246,0.2)'}` }}>
              <FileSpreadsheet size={14} style={{ color: '#3b82f6' }} />
              <span className="text-xs" style={{ fontFamily: HF, fontWeight: 300, color: '#3b82f6' }}>
                {selectedDataset.original_filename}
              </span>
              <button 
                onClick={() => setSelectedDataset(null)}
                className="ml-2 hover:opacity-70"
              >
                <X size={12} style={{ color: '#3b82f6' }} />
              </button>
            </div>
          )}

          {/* Pending File Indicator */}
          {pendingFile && (
            <div className="flex items-center gap-2 mb-3 px-4 py-2 rounded-full w-fit" style={{ background: isDark ? 'rgba(34,197,94,0.1)' : 'rgba(34,197,94,0.05)', border: `1px solid ${isDark ? 'rgba(34,197,94,0.3)' : 'rgba(34,197,94,0.2)'}` }}>
              <FileSpreadsheet size={14} style={{ color: '#22c55e' }} />
              <span className="text-xs" style={{ fontFamily: HF, fontWeight: 300, color: '#22c55e' }}>
                {pendingFile.name} ({(pendingFile.size / 1024).toFixed(1)} KB)
              </span>
              <button 
                onClick={() => setPendingFile(null)}
                className="ml-2 hover:opacity-70"
              >
                <X size={12} style={{ color: '#22c55e' }} />
              </button>
            </div>
          )}

          <div 
            className="flex items-end gap-2 p-3 rounded-2xl border"
            style={{ 
              borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
              background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'
            }}
          >
            {/* File Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="p-2 rounded-xl transition-all hover:opacity-70 disabled:opacity-50 relative"
              style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}
            >
              {isUploading ? (
                <div className="flex items-center gap-1.5">
                  <Loader2 size={18} className="animate-spin" />
                  {uploadProgress > 0 && (
                    <span className="text-xs font-medium" style={{ fontFamily: HF }}>
                      {uploadProgress}%
                    </span>
                  )}
                </div>
              ) : (
                <Plus size={20} />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,.json,.parquet"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Dataset Selector */}
            {datasets.length > 0 && (
              <button
                onClick={() => setShowDatasetSelector(!showDatasetSelector)}
                className="p-2 rounded-xl transition-all hover:opacity-70"
                style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}
              >
                <Database size={20} />
              </button>
            )}

            {/* AI Provider Selector */}
            <button
              onClick={() => setShowProviderSelector(!showProviderSelector)}
              className="p-2 rounded-xl transition-all hover:opacity-70 flex items-center gap-1"
              style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}
            >
              {providers.find(p => p.id === selectedProvider)?.icon}
              <span className="text-xs hidden sm:inline" style={{ fontFamily: HF, fontWeight: 300 }}>
                {providers.find(p => p.id === selectedProvider)?.name}
              </span>
            </button>

            {/* Text Input */}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe how you want your data prepared..."
              rows={1}
              disabled={isLoading}
              className="flex-1 bg-transparent border-none resize-none outline-none text-sm py-2 px-2 disabled:opacity-50"
              style={{ 
                fontFamily: HF, 
                fontWeight: 300, 
                color: isDark ? '#fff' : '#0a0a0a',
                minHeight: '24px',
                maxHeight: '200px'
              }}
            />

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={(!input.trim() && !pendingFile) || isLoading}
              className="p-2 rounded-xl transition-all disabled:opacity-50"
              style={{ 
                background: (input.trim() || pendingFile) && !isLoading ? (isDark ? '#fff' : '#0a0a0a') : 'transparent',
                color: (input.trim() || pendingFile) && !isLoading ? (isDark ? '#000' : '#fff') : (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)')
              }}
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>

          <p className="text-center text-xs mt-3" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }}>
            AI can make mistakes. Always verify your processed data.
          </p>
        </div>
      </div>
    </div>

      {/* Provider Selector Dropdown */}
      {showProviderSelector && (
        <div 
          className="fixed bottom-24 left-1/2 transform -translate-x-1/2 w-64 rounded-2xl border shadow-2xl z-50"
          style={{ 
            background: isDark ? '#0a0a0a' : '#fff',
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            marginLeft: '8rem'
          }}
        >
          <div className="p-3 border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
            <p className="text-xs" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
              Select AI Provider
            </p>
          </div>
          <div>
            {providers.map((provider) => (
              <button
                key={provider.id}
                onClick={() => { setSelectedProvider(provider.id); setShowProviderSelector(false); }}
                className="w-full flex items-center gap-3 p-3 hover:opacity-70 transition-all text-left"
                style={{ 
                  borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                  background: selectedProvider === provider.id ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)') : 'transparent'
                }}
              >
                <span style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>{provider.icon}</span>
                <div className="flex-1">
                  <p className="text-sm" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? '#fff' : '#0a0a0a' }}>
                    {provider.name}
                  </p>
                  <p className="text-xs" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>
                    {provider.model}
                  </p>
                </div>
                {selectedProvider === provider.id && (
                  <CheckCircle size={14} style={{ color: '#22c55e' }} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dataset Selector Dropdown */}
      {showDatasetSelector && (
        <div 
          className="fixed bottom-24 left-1/2 transform -translate-x-1/2 w-80 rounded-2xl border shadow-2xl z-50"
          style={{ 
            background: isDark ? '#0a0a0a' : '#fff',
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            marginLeft: '8rem'
          }}
        >
          <div className="p-3 border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
            <p className="text-xs" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
              Select a dataset
            </p>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {datasets.map((dataset) => (
              <button
                key={dataset.id}
                onClick={() => { setSelectedDataset(dataset); setShowDatasetSelector(false); }}
                className="w-full flex items-center gap-3 p-3 hover:opacity-70 transition-all text-left"
                style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}
              >
                <FileSpreadsheet size={16} style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? '#fff' : '#0a0a0a' }}>
                    {dataset.name}
                  </p>
                  <p className="text-xs" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>
                    {(dataset.row_count || 0).toLocaleString()} rows
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
