// TypeScript types matching the OpenAPI specification
// These should be replaced by the Stainless-generated SDK when available

// ==================== ENUMS ====================

export type GitProvider = 'github' | 'gitlab'

export type RepoStatus = 'pending' | 'connected' | 'analyzing' | 'error'

export type Framework = 
  | 'nextjs' | 'react' | 'vue' | 'angular' | 'svelte' | 'nuxtjs' | 'remix'
  | 'fastapi' | 'flask' | 'django' | 'express' | 'nestjs' | 'go' | 'rust' | 'unknown'

export type Language = 
  | 'javascript' | 'typescript' | 'python' | 'go' | 'rust' | 'java' | 'ruby' | 'php' | 'unknown'

export type Platform = 'vercel' | 'render' | 'docker'

export type DeploymentStatus = 'pending' | 'running' | 'succeeded' | 'failed' | 'cancelled' | 'retrying'

export type ServiceDeploymentStatus = 'pending' | 'building' | 'deploying' | 'deployed' | 'failed' | 'skipped'

export type SandboxStatus = 'creating' | 'running' | 'stopped' | 'error' | 'destroyed'

export type Environment = 'development' | 'staging' | 'production'

export type RenderServiceType = 'web_service' | 'static_site' | 'background_worker' | 'cron_job'

export type LogLevel = 'debug' | 'info' | 'warning' | 'error' | 'fatal'

// ==================== REPOSITORY TYPES ====================

export interface RepoConnectionRequest {
  repo_url: string
  provider: GitProvider
  branch?: string
  name?: string
}

export interface RepoConnection {
  id: string
  repo_url: string
  provider: GitProvider
  branch: string
  name?: string
  status: RepoStatus
  created_at: string
  updated_at?: string
}

export interface DetectedService {
  name: string
  framework: Framework
  path: string
  language: Language
  recommended_platform: Platform
  detected_files: string[]
  build_command?: string
  start_command?: string
  env_variables: string[]
}

export interface RepoAnalysis {
  repo_id: string
  services: DetectedService[]
  is_monorepo: boolean
  detected_workspaces: string[]
  root_config?: Record<string, any>
  analyzed_at: string
  sandbox_id: string
}

// ==================== DEPLOYMENT TYPES ====================

export interface VercelDeploymentConfig {
  project_name?: string
  team_id?: string
  framework?: string
}

export interface RenderDeploymentConfig {
  service_name?: string
  service_type: RenderServiceType
  plan: string
}

export interface ServiceDeploymentConfig {
  name: string
  path: string
  platform: Platform
  build_command?: string
  start_command?: string
  output_directory?: string
  env_variables: Record<string, string>
  vercel_config?: VercelDeploymentConfig
  render_config?: RenderDeploymentConfig
}

export interface DeploymentCreateRequest {
  repo_id: string
  services: ServiceDeploymentConfig[]
  environment?: Environment
  branch?: string
  env_variables?: Record<string, string>
}

export interface PlannedService {
  name: string
  path: string
  platform: Platform
  status: ServiceDeploymentStatus
  estimated_duration_seconds?: number
}

export interface DeploymentPlan {
  id: string
  repo_id: string
  status: 'pending' | 'planned' | 'approved'
  services: PlannedService[]
  environment: Environment
  branch?: string
  created_at: string
}

export interface ServiceDeployment {
  name: string
  path: string
  platform: Platform
  status: ServiceDeploymentStatus
  build_logs_url?: string
  deployment_url?: string
  platform_deployment_id?: string
  started_at?: string
  completed_at?: string
  error_message?: string
}

export interface DeploymentStatus {
  id: string
  repo_id: string
  sandbox_id?: string
  status: DeploymentStatus
  services: ServiceDeployment[]
  environment: Environment
  branch?: string
  started_at?: string
  completed_at?: string
  duration_seconds?: number
  error_message?: string
  retry_count: number
}

export interface DeploymentExecutionResponse {
  deployment_id: string
  status: string
  message: string
  estimated_duration_seconds?: number
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  source?: string
}

export interface DeploymentLogs {
  deployment_id: string
  logs: LogEntry[]
  timestamp: string
}

export interface DeploymentList {
  deployments: DeploymentStatus[]
  total: number
  limit: number
  offset: number
}

// ==================== SANDBOX TYPES ====================

export interface SandboxResources {
  cpu_cores: number
  memory_mb: number
  disk_gb: number
}

export interface SandboxCreateRequest {
  repo_id?: string
  repo_url?: string
  branch?: string
  environment_variables?: Record<string, string>
  resources?: SandboxResources
}

export interface Sandbox {
  id: string
  status: SandboxStatus
  repo_id?: string
  repo_url?: string
  branch: string
  workspace_url?: string
  resources: SandboxResources
  environment_variables: Record<string, string>
  created_at: string
  started_at?: string
  stopped_at?: string
  destroyed_at?: string
}

export interface SandboxList {
  sandboxes: Sandbox[]
  total: number
}

export interface CommandExecuteRequest {
  command: string
  working_directory?: string
  timeout_seconds?: number
  env_variables?: Record<string, string>
}

export interface CommandExecuteResponse {
  exit_code: number
  stdout: string
  stderr: string
  duration_ms: number
  executed_at: string
}

export interface TerminalSessionRequest {
  shell?: string
  working_directory?: string
  environment_variables?: Record<string, string>
}

export interface TerminalSession {
  session_id: string
  sandbox_id: string
  websocket_url: string
  shell: string
  working_directory: string
  created_at: string
  expires_at?: string
}

export interface SandboxLogs {
  sandbox_id: string
  logs: LogEntry[]
}

// ==================== ERROR & HEALTH TYPES ====================

export interface ErrorResponse {
  error: string
  message: string
  details?: Record<string, any>
  request_id?: string
}

export interface HealthResponse {
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: string
  version: string
  services?: Record<string, string>
}
