'use client'

import React, { useState, useEffect } from 'react'
import { Loader2, CheckCircle, Circle, Sparkles, Table, ArrowRight, Download, Eye } from 'lucide-react'

interface EditingStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'running' | 'complete' | 'error'
  timestamp?: Date
  details?: string[]
}

interface DataPreview {
  columns: string[]
  rows: (string | number)[][]
  totalRows: number
  totalCols: number
}

interface LiveDatasetEditorProps {
  datasetName: string
  isActive: boolean
  steps: EditingStep[]
  preview?: DataPreview
  downloadUrl?: string
  onViewFull?: () => void
  isDark?: boolean
}

const HF = 'var(--font-heading)'

export function LiveDatasetEditor({ 
  datasetName, 
  isActive, 
  steps, 
  preview,
  downloadUrl,
  onViewFull,
  isDark = true 
}: LiveDatasetEditorProps) {
  const [expandedStep, setExpandedStep] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => setCurrentTime(new Date()), 1000)
      return () => clearInterval(interval)
    }
  }, [isActive])

  const activeSteps = steps.filter(s => s.status !== 'pending')
  const completedSteps = steps.filter(s => s.status === 'complete')
  const progress = Math.round((completedSteps.length / steps.length) * 100)

  return (
    <div 
      className="rounded-2xl border overflow-hidden"
      style={{ 
        borderColor: isDark ? 'rgba(59,130,246,0.3)' : 'rgba(59,130,246,0.2)',
        background: isDark ? 'rgba(20,20,30,0.95)' : 'rgba(255,255,255,0.95)'
      }}
    >
      {/* Header */}
      <div 
        className="px-4 py-3 border-b flex items-center justify-between"
        style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: isDark ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.1)' }}
          >
            {isActive ? (
              <Loader2 size={16} className="animate-spin" style={{ color: '#3b82f6' }} />
            ) : (
              <Sparkles size={16} style={{ color: '#3b82f6' }} />
            )}
          </div>
          <div>
            <p className="text-sm font-medium" style={{ fontFamily: HF, color: isDark ? '#fff' : '#0a0a0a' }}>
              {isActive ? 'AI Editing Dataset' : 'Dataset Ready'}
            </p>
            <p className="text-xs" style={{ fontFamily: HF, color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
              {datasetName} • {progress}% complete
            </p>
          </div>
        </div>
        
        {downloadUrl && !isActive && (
          <a
            href={downloadUrl}
            download
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all hover:opacity-70"
            style={{ 
              background: isDark ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.1)',
              color: '#22c55e',
              fontFamily: HF
            }}
          >
            <Download size={14} />
            Download
          </a>
        )}
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-2">
        <div 
          className="h-1 rounded-full overflow-hidden"
          style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
        >
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #3b82f6, #22c55e)'
            }}
          />
        </div>
      </div>

      {/* Steps Timeline */}
      <div className="px-4 py-2 max-h-48 overflow-y-auto">
        {steps.map((step, index) => (
          <div 
            key={step.id}
            className="relative pl-6 pb-3 last:pb-0 cursor-pointer"
            onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
          >
            {/* Timeline Line */}
            {index < steps.length - 1 && (
              <div 
                className="absolute left-2 top-6 w-0.5 h-full"
                style={{ 
                  background: step.status === 'complete' 
                    ? '#22c55e' 
                    : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                }}
              />
            )}
            
            {/* Status Icon */}
            <div className="absolute left-0 top-1">
              {step.status === 'complete' ? (
                <CheckCircle size={16} style={{ color: '#22c55e' }} />
              ) : step.status === 'running' ? (
                <Loader2 size={16} className="animate-spin" style={{ color: '#3b82f6' }} />
              ) : step.status === 'error' ? (
                <Circle size={16} style={{ color: '#ef4444' }} />
              ) : (
                <Circle size={16} style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }} />
              )}
            </div>

            {/* Step Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span 
                  className="text-sm"
                  style={{ 
                    fontFamily: HF, 
                    color: step.status === 'complete' ? '#22c55e' : 
                           step.status === 'running' ? '#3b82f6' :
                           isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'
                  }}
                >
                  {step.title}
                </span>
                {step.status === 'running' && (
                  <span className="text-xs" style={{ color: '#3b82f6' }}>• processing...</span>
                )}
              </div>
              
              <p 
                className="text-xs mt-0.5"
                style={{ fontFamily: HF, color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}
              >
                {step.description}
              </p>

              {/* Expanded Details */}
              {expandedStep === step.id && step.details && step.details.length > 0 && (
                <div 
                  className="mt-2 p-2 rounded-lg text-xs space-y-1"
                  style={{ 
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    fontFamily: 'monospace'
                  }}
                >
                  {step.details.map((detail, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <ArrowRight size={10} className="mt-1 flex-shrink-0" style={{ color: '#3b82f6' }} />
                      <span style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                        {detail}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Data Preview */}
      {preview && preview.rows.length > 0 && (
        <div 
          className="border-t px-4 py-3"
          style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Table size={14} style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }} />
              <span 
                className="text-xs"
                style={{ fontFamily: HF, color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}
              >
                Preview ({preview.totalRows.toLocaleString()} rows × {preview.totalCols} cols)
              </span>
            </div>
            {onViewFull && (
              <button
                onClick={onViewFull}
                className="flex items-center gap-1 text-xs hover:opacity-70"
                style={{ color: '#3b82f6', fontFamily: HF }}
              >
                <Eye size={12} />
                View Full
              </button>
            )}
          </div>
          
          <div 
            className="rounded-lg overflow-hidden overflow-x-auto"
            style={{ 
              background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.02)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
            }}
          >
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                  {preview.columns.map((col, i) => (
                    <th 
                      key={i}
                      className="px-3 py-2 text-left font-medium"
                      style={{ 
                        fontFamily: HF,
                        color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.rows.slice(0, 5).map((row, rowIdx) => (
                  <tr key={rowIdx}>
                    {row.map((cell, cellIdx) => (
                      <td 
                        key={cellIdx}
                        className="px-3 py-1.5"
                        style={{ 
                          color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                          borderBottom: rowIdx < 4 ? `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` : 'none'
                        }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
