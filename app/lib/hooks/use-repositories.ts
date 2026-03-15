'use client'

import { useState, useCallback } from 'react'
import { pipelineApi } from '../api-client'
import type { 
  RepoConnection, 
  RepoConnectionRequest, 
  RepoAnalysis 
} from '../api-types'

// Hook for managing repositories
export function useRepositories() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const connectRepo = useCallback(async (data: RepoConnectionRequest) => {
    setLoading(true)
    setError(null)
    try {
      const result = await pipelineApi.connectRepo(
        data.repo_url,
        data.provider,
        data.branch,
        data.name
      )
      return result
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const listRepos = useCallback(async (status?: string) => {
    setLoading(true)
    setError(null)
    try {
      const result = await pipelineApi.listRepos(status)
      return result
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getRepo = useCallback(async (repoId: string) => {
    setLoading(true)
    setError(null)
    try {
      const result = await pipelineApi.getRepo(repoId)
      return result
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const analyzeRepo = useCallback(async (repoId: string) => {
    setLoading(true)
    setError(null)
    try {
      const result = await pipelineApi.analyzeRepo(repoId)
      return result
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    connectRepo,
    listRepos,
    getRepo,
    analyzeRepo,
    loading,
    error
  }
}

// Hook for single repository operations
export function useRepository(repoId: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [analysis, setAnalysis] = useState<RepoAnalysis | null>(null)

  const analyze = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await pipelineApi.analyzeRepo(repoId)
      setAnalysis(result as RepoAnalysis)
      return result
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [repoId])

  return {
    analyze,
    analysis,
    loading,
    error
  }
}
