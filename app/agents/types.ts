// Agent System Types and Interfaces

export type AIProvider = 'openrouter' | 'deepseek' | 'gemini' | 'groq'

export interface AgentContext {
  userId: string
  datasetId?: string
  message: string
  history: { role: string; content: string }[]
  fileData?: {
    content: string
    fileName: string
    fileType: string
    stats?: {
      rowCount: number
      columnCount: number
      columnNames: string[]
      columnTypes: Record<string, string>
      missingValues: Record<string, number>
    }
  }
  provider?: AIProvider
  model?: string
}

export interface AgentResult {
  content: string
  actions?: AgentAction[]
  data?: any
  downloadUrl?: string
  processingTime?: number
  provider?: AIProvider
}

export interface AgentAction {
  type: 'preprocess' | 'analyze' | 'transform' | 'download'
  description: string
  payload?: any
}

export interface Agent {
  name: string
  description: string
  model: string
  provider: AIProvider
  systemPrompt: string
  handle: (context: AgentContext) => Promise<AgentResult>
}
