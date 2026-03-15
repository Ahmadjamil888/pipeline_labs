// Dashboard API client - hooks for accessing dashboard endpoints

export interface DashboardStats {
  repositories: {
    total: number
    connected: number
    analyzing: number
  }
  deployments: {
    total: number
    by_status: Record<string, number>
    running: number
    succeeded: number
    failed: number
  }
  sandboxes: {
    total: number
    active: number
  }
  ai_insights: {
    total_services_deployed: number
    services_by_platform: Record<string, number>
    monorepos_analyzed: number
  }
  timestamp: string
}

export interface DeploymentInfo {
  id: string
  repo_id: string
  repo_name: string
  repo_url: string | null
  status: string
  environment: string
  branch: string | null
  services: Array<{
    name: string
    path: string
    platform: string
    status: string
    deployment_url: string | null
    build_logs_url: string | null
    env_variables: string[]
  }>
  sandbox_id: string | null
  started_at: string | null
  completed_at: string | null
  duration_seconds: number | null
  retry_count: number
  error_message: string | null
}

export interface ProjectInfo {
  id: string
  name: string
  repo_url: string
  provider: string
  branch: string
  status: string
  created_at: string | null
  deployments_count: number
  latest_deployment: {
    id: string
    status: string
    environment: string
    services_count: number
    deployed_urls: string[]
  } | null
  has_analysis: boolean
}

export interface ProjectDetails {
  project: {
    id: string
    name: string
    repo_url: string
    provider: string
    branch: string
    status: string
    created_at: string | null
  }
  deployments: Array<{
    id: string
    status: string
    environment: string
    branch: string | null
    services: Array<{
      name: string
      platform: string
      status: string
      url: string | null
      env_vars: string[]
    }>
    started_at: string | null
    completed_at: string | null
    sandbox_id: string | null
  }>
  active_sandboxes: Array<{
    id: string
    status: string
    workspace_url: string | null
  }>
  total_deployments: number
  successful_deployments: number
}

// Dashboard API methods
export const dashboardApi = {
  // Get dashboard stats
  async getStats(): Promise<DashboardStats> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/stats`)
    if (!response.ok) throw new Error('Failed to fetch dashboard stats')
    return response.json()
  },

  // Get all deployments
  async getDeployments(status?: string, repoId?: string, limit = 50): Promise<DeploymentInfo[]> {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    if (repoId) params.append('repo_id', repoId)
    params.append('limit', limit.toString())
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/deployments?${params}`)
    if (!response.ok) throw new Error('Failed to fetch deployments')
    return response.json()
  },

  // Get deployment environment variables
  async getDeploymentEnv(deploymentId: string): Promise<{
    deployment_id: string
    environment: string
    services: Record<string, {
      detected: string[]
      deployed: Record<string, string>
      suggested: string[]
    }>
    global_env_vars: Record<string, string>
  }> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/deployments/${deploymentId}/env`)
    if (!response.ok) throw new Error('Failed to fetch deployment env vars')
    return response.json()
  },

  // Get all projects
  async getProjects(): Promise<ProjectInfo[]> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/projects`)
    if (!response.ok) throw new Error('Failed to fetch projects')
    return response.json()
  },

  // Get project details
  async getProjectDetails(repoId: string): Promise<ProjectDetails> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/projects/${repoId}/details`)
    if (!response.ok) throw new Error('Failed to fetch project details')
    return response.json()
  },

  // AI suggest environment variables
  async aiSuggestEnvVars(repoId: string, serviceName: string): Promise<{
    repo_id: string
    service_name: string
    suggested_vars: Array<{
      name: string
      description: string
      required: boolean
      default?: string
    }>
    generated_by: string
    timestamp: string
  }> {
    const params = new URLSearchParams({ repo_id: repoId, service_name: serviceName })
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/ai/suggest-env?${params}`)
    if (!response.ok) throw new Error('Failed to get AI env var suggestions')
    return response.json()
  }
}
