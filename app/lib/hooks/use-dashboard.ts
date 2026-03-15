'use client'

import { useState, useCallback, useEffect } from 'react'
import { dashboardApi, DashboardStats, DeploymentInfo, ProjectInfo, ProjectDetails } from '../dashboard-api'

// Hook for dashboard stats
export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await dashboardApi.getStats()
      setStats(data)
      return data
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [fetchStats])

  return { stats, loading, error, refresh: fetchStats }
}

// Hook for all deployments
export function useDashboardDeployments(status?: string, repoId?: string) {
  const [deployments, setDeployments] = useState<DeploymentInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchDeployments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await dashboardApi.getDeployments(status, repoId)
      setDeployments(data)
      return data
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [status, repoId])

  useEffect(() => {
    fetchDeployments()
  }, [fetchDeployments])

  return { deployments, loading, error, refresh: fetchDeployments }
}

// Hook for deployment environment variables
export function useDeploymentEnv(deploymentId: string) {
  const [envVars, setEnvVars] = useState<{
    deployment_id: string
    environment: string
    services: Record<string, any>
    global_env_vars: Record<string, string>
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchEnvVars = useCallback(async () => {
    if (!deploymentId) return
    setLoading(true)
    setError(null)
    try {
      const data = await dashboardApi.getDeploymentEnv(deploymentId)
      setEnvVars(data)
      return data
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [deploymentId])

  useEffect(() => {
    fetchEnvVars()
  }, [fetchEnvVars])

  return { envVars, loading, error, refresh: fetchEnvVars }
}

// Hook for all projects
export function useDashboardProjects() {
  const [projects, setProjects] = useState<ProjectInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await dashboardApi.getProjects()
      setProjects(data)
      return data
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  return { projects, loading, error, refresh: fetchProjects }
}

// Hook for project details
export function useProjectDetails(repoId: string) {
  const [details, setDetails] = useState<ProjectDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchDetails = useCallback(async () => {
    if (!repoId) return
    setLoading(true)
    setError(null)
    try {
      const data = await dashboardApi.getProjectDetails(repoId)
      setDetails(data)
      return data
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [repoId])

  useEffect(() => {
    fetchDetails()
  }, [fetchDetails])

  return { details, loading, error, refresh: fetchDetails }
}

// Hook for AI env var suggestions
export function useAiEnvSuggestions(repoId: string, serviceName: string) {
  const [suggestions, setSuggestions] = useState<{
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
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchSuggestions = useCallback(async () => {
    if (!repoId || !serviceName) return
    setLoading(true)
    setError(null)
    try {
      const data = await dashboardApi.aiSuggestEnvVars(repoId, serviceName)
      setSuggestions(data)
      return data
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [repoId, serviceName])

  return { suggestions, loading, error, fetch: fetchSuggestions }
}
