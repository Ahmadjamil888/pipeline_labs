'use client'

import { useState, useCallback } from 'react'
import { pipelineApi } from '../api-client'
import type { 
  Sandbox, 
  SandboxCreateRequest,
  SandboxLogs,
  CommandExecuteResponse,
  TerminalSession
} from '../api-types'

// Hook for managing sandboxes
export function useSandboxes() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const listSandboxes = useCallback(async (status?: string, limit = 20) => {
    setLoading(true)
    setError(null)
    try {
      const result = await pipelineApi.listSandboxes(status, limit)
      return result
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const createSandbox = useCallback(async (data: SandboxCreateRequest) => {
    setLoading(true)
    setError(null)
    try {
      const result = await pipelineApi.createSandbox(
        data.repo_url,
        data.branch,
        data.repo_id
      )
      return result as Sandbox
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    listSandboxes,
    createSandbox,
    loading,
    error
  }
}

// Hook for single sandbox operations
export function useSandbox(sandboxId: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [sandbox, setSandbox] = useState<Sandbox | null>(null)
  const [logs, setLogs] = useState<SandboxLogs | null>(null)

  const fetchSandbox = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await pipelineApi.getSandbox(sandboxId)
      setSandbox(result as Sandbox)
      return result
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [sandboxId])

  const start = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await pipelineApi.startSandbox(sandboxId)
      setSandbox(result as Sandbox)
      return result
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [sandboxId])

  const stop = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await pipelineApi.stopSandbox(sandboxId)
      setSandbox(result as Sandbox)
      return result
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [sandboxId])

  const destroy = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await pipelineApi.destroySandbox(sandboxId)
      setSandbox(null)
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [sandboxId])

  const executeCommand = useCallback(async (command: string, workingDir = '/workspace', timeout = 300) => {
    setLoading(true)
    setError(null)
    try {
      const result = await pipelineApi.executeCommand(sandboxId, command, workingDir, timeout)
      return result as CommandExecuteResponse
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [sandboxId])

  const openTerminal = useCallback(async (shell = '/bin/bash', workingDir = '/workspace') => {
    setLoading(true)
    setError(null)
    try {
      const result = await pipelineApi.openTerminal(sandboxId, shell, workingDir)
      return result as TerminalSession
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [sandboxId])

  const fetchLogs = useCallback(async (tail = 100) => {
    setLoading(true)
    setError(null)
    try {
      const result = await pipelineApi.getSandboxLogs(sandboxId, tail)
      setLogs(result as SandboxLogs)
      return result
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [sandboxId])

  return {
    sandbox,
    logs,
    fetchSandbox,
    start,
    stop,
    destroy,
    executeCommand,
    openTerminal,
    fetchLogs,
    loading,
    error
  }
}
