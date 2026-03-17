// FastAPI Backend Client Configuration
// Replace with Stainless-generated SDK when available

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 
  ? process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '')  // Remove trailing slashes only
  : 'https://pipeline-ai-labs-by-ahmad.up.railway.app'

// Helper to normalize HeadersInit → Record<string, string>
function headersToRecord(h?: HeadersInit): Record<string, string> {
  if (!h) return {}
  if (h instanceof Headers) {
    const out: Record<string, string> = {}
    h.forEach((val, key) => { out[key] = val })
    return out
  }
  if (Array.isArray(h)) {
    return Object.fromEntries(h)
  }
  return h as Record<string, string>
}

interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | undefined>
}

class PipelineApiClient {
  private baseUrl: string
  private apiKey?: string

  constructor() {
    this.baseUrl = API_BASE_URL
    this.apiKey = process.env.PIPELINE_API_KEY
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const { params, ...restConfig } = config
    
    // Build URL with query params
    let url = `${this.baseUrl}${endpoint}`
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        url += `?${queryString}`
      }
    }

    // Default headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...headersToRecord(restConfig.headers),
    }

    // Add auth header if API key available
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`
    }

    const response = await fetch(url, {
      ...restConfig,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: 'unknown_error',
        message: `HTTP ${response.status}: ${response.statusText}`
      }))
      throw new Error(error.message || `API Error: ${response.status}`)
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T
    }

    return response.json()
  }

  // ==================== REPOSITORIES ====================
  
  async connectRepo(repo_url: string, provider: 'github' | 'gitlab', branch?: string, name?: string) {
    return this.request<{ id: string; repo_url: string; provider: string; status: string }>('/repos/connect', {
      method: 'POST',
      body: JSON.stringify({ repo_url, provider, branch, name })
    })
  }

  async listRepos(status?: string, limit = 20) {
    return this.request<Array<{ id: string; repo_url: string; status: string }>>('/repos/', {
      params: { status, limit }
    })
  }

  async getRepo(repoId: string) {
    return this.request<{ id: string; repo_url: string; status: string }>(`/repos/${repoId}`)
  }

  async analyzeRepo(repoId: string) {
    return this.request<{
      repo_id: string
      services: Array<{
        name: string
        framework: string
        path: string
        recommended_platform: string
      }>
      is_monorepo: boolean
    }>(`/repos/${repoId}/analyze`, {
      method: 'POST'
    })
  }

  // ==================== DEPLOYMENTS ====================

  async listDeployments(status?: string, repoId?: string, limit = 20, offset = 0) {
    return this.request<{
      deployments: Array<{
        id: string
        status: string
        services: Array<{
          name: string
          status: string
          deployment_url?: string
        }>
      }>
      total: number
    }>('/deployments/', {
      params: { status, repo_id: repoId, limit, offset }
    })
  }

  async createDeployment(repoId: string, services: any[], environment = 'production', branch?: string) {
    return this.request<{
      id: string
      status: string
      services: Array<{
        name: string
        platform: string
        status: string
      }>
    }>('/deployments/', {
      method: 'POST',
      body: JSON.stringify({ repo_id: repoId, services, environment, branch })
    })
  }

  async getDeployment(deploymentId: string) {
    return this.request<{
      id: string
      status: string
      services: Array<{
        name: string
        status: string
        deployment_url?: string
      }>
    }>(`/deployments/${deploymentId}`)
  }

  async runDeployment(deploymentId: string) {
    return this.request<{
      deployment_id: string
      status: string
      message: string
      estimated_duration_seconds?: number
    }>(`/deployments/${deploymentId}/run`, {
      method: 'POST'
    })
  }

  async cancelDeployment(deploymentId: string) {
    return this.request<{ id: string; status: string }>(`/deployments/${deploymentId}/cancel`, {
      method: 'POST'
    })
  }

  async retryDeployment(deploymentId: string) {
    return this.request<{
      deployment_id: string
      status: string
      message: string
    }>(`/deployments/${deploymentId}/retry`, {
      method: 'POST'
    })
  }

  async getDeploymentLogs(deploymentId: string, tail = 100) {
    return this.request<{
      deployment_id: string
      logs: Array<{
        timestamp: string
        level: string
        message: string
      }>
    }>(`/deployments/${deploymentId}/logs`, {
      params: { tail }
    })
  }

  // ==================== SANDBOXES ====================

  async listSandboxes(status?: string, limit = 20) {
    return this.request<{
      sandboxes: Array<{
        id: string
        status: string
        workspace_url?: string
      }>
      total: number
    }>('/sandboxes/', {
      params: { status, limit }
    })
  }

  async createSandbox(repoUrl?: string, branch = 'main', repoId?: string) {
    return this.request<{
      id: string
      status: string
      workspace_url?: string
    }>('/sandboxes/', {
      method: 'POST',
      body: JSON.stringify({ repo_url: repoUrl, branch, repo_id: repoId })
    })
  }

  async getSandbox(sandboxId: string) {
    return this.request<{
      id: string
      status: string
      workspace_url?: string
    }>(`/sandboxes/${sandboxId}`)
  }

  async destroySandbox(sandboxId: string) {
    return this.request<void>(`/sandboxes/${sandboxId}`, {
      method: 'DELETE'
    })
  }

  async startSandbox(sandboxId: string) {
    return this.request<{ id: string; status: string }>(`/sandboxes/${sandboxId}/start`, {
      method: 'POST'
    })
  }

  async stopSandbox(sandboxId: string) {
    return this.request<{ id: string; status: string }>(`/sandboxes/${sandboxId}/stop`, {
      method: 'POST'
    })
  }

  async executeCommand(sandboxId: string, command: string, workingDir = '/workspace', timeout = 300) {
    return this.request<{
      exit_code: number
      stdout: string
      stderr: string
      duration_ms: number
    }>(`/sandboxes/${sandboxId}/execute`, {
      method: 'POST',
      body: JSON.stringify({
        command,
        working_directory: workingDir,
        timeout_seconds: timeout
      })
    })
  }

  async openTerminal(sandboxId: string, shell = '/bin/bash', workingDir = '/workspace') {
    return this.request<{
      session_id: string
      websocket_url: string
      shell: string
    }>(`/sandboxes/${sandboxId}/terminal`, {
      method: 'POST',
      body: JSON.stringify({
        shell,
        working_directory: workingDir
      })
    })
  }

  async getSandboxLogs(sandboxId: string, tail = 100) {
    return this.request<{
      sandbox_id: string
      logs: Array<{
        timestamp: string
        level: string
        message: string
      }>
    }>(`/sandboxes/${sandboxId}/logs`, {
      params: { tail }
    })
  }

  // ==================== HEALTH ====================

  async healthCheck() {
    return this.request<{
      status: string
      timestamp: string
      version: string
    }>('/health')
  }
}

// Export singleton instance
export const pipelineApi = new PipelineApiClient()

// React Hook for using the API client
export function usePipelineApi() {
  return pipelineApi
}
