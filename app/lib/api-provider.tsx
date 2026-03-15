'use client'

import { createContext, useContext, ReactNode } from 'react'
import { pipelineApi } from './api-client'

// Create API context
type PipelineApiContextType = typeof pipelineApi

const PipelineApiContext = createContext<PipelineApiContextType | null>(null)

// API Provider component
export function PipelineApiProvider({ children }: { children: ReactNode }) {
  return (
    <PipelineApiContext.Provider value={pipelineApi}>
      {children}
    </PipelineApiContext.Provider>
  )
}

// Hook to use API context
export function usePipelineApiContext() {
  const context = useContext(PipelineApiContext)
  if (!context) {
    throw new Error('usePipelineApiContext must be used within PipelineApiProvider')
  }
  return context
}

// Re-export hooks for convenience
export * from './hooks'
export { pipelineApi } from './api-client'
export type * from './api-types'
