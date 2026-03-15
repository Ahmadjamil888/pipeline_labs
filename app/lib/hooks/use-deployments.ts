'use client'

import { useState, useCallback } from 'react'
import { pipelineApi } from '../api-client'
import type { 
  DeploymentPlan, 
  DeploymentCreateRequest,
  DeploymentStatus,
  DeploymentExecutionResponse,
  DeploymentLogs
} from '../api-types'

// Hook for managing deployments
export function useDeployments() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const listDeployments = useCallback(async (status?: string, repoId?: string, limit = 20, offset = 0) => {
    setLoading(true)
    setError(null)
    try {
      const result = await pipelineApi.listDeployments(status, repoId, limit, offset)
      return result as DeploymentList
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const createDeployment = useCallback(async (data: DeploymentCreateRequest) => {
    setLoading(true)
    setError(null)
    try {
      const result = await pipelineApi.createDeployment(
        data.repo_id,
        data.services,
        data.environment,
        data.branch
      )
      return result
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    listDeployments,
    createDeployment,
    loading,
    error
  }
}

// Hook for single deployment operations
export function useDeployment(deploymentId: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [deployment, setDeployment] = useState<DeploymentStatus | null>(null)
  const [logs, setLogs] = useState<DeploymentLogs | null>(null)

  const fetchDeployment = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await pipelineApi.getDeployment(deploymentId)
      setDeployment(result as DeploymentStatus)
      return result
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [deploymentId])

  const runDeployment = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await pipelineApi.runDeployment(deploymentId)
      return result
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [deploymentId])

  const cancelDeployment = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await pipelineApi.cancelDeployment(deploymentId)
      setDeployment(result as DeploymentStatus)
      return result
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [deploymentId])

  const retryDeployment = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await pipelineApi.retryDeployment(deploymentId)
      return result
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [deploymentId])

  const fetchLogs = useCallback(async (tail = 100) => {
    setLoading(true)
    setError(null)
    try {
      const result = await pipelineApi.getDeploymentLogs(deploymentId, tail)
      setLogs(result as DeploymentLogs)
      return result
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [deploymentId])

  return {
    deployment,
    logs,
    fetchDeployment,
    runDeployment,
    cancelDeployment,
    retryDeployment,
    fetchLogs,
    loading,
    error
  }
}
