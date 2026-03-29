'use client'

import React, { useState } from 'react'
import { 
  Database, 
  Table2, 
  Settings, 
  Play, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ArrowRight,
  Download,
  FileJson,
  Columns,
  Rows,
  Activity
} from 'lucide-react'

interface Transformation {
  id: string
  name: string
  description: string
  status: 'pending' | 'running' | 'complete' | 'error'
  appliedAt?: string
}

interface Column {
  name: string
  type: string
  nullCount: number
  uniqueCount: number
  sample: string
}

interface DataWorkspaceProps {
  datasetName: string
  isProcessing: boolean
  progress: number
  columns: Column[]
  transformations: Transformation[]
  previewData: (string | number)[][]
  downloadUrl?: string
  isDark?: boolean
  onApplyTransform?: (transform: string) => void
}

const HF = "'Helvetica World', Helvetica, Arial, sans-serif"

export function DataWorkspace({
  datasetName,
  isProcessing,
  progress,
  columns,
  transformations,
  previewData,
  downloadUrl,
  isDark = true
}: DataWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'columns' | 'transforms'>('preview')
  const [selectedTransform, setSelectedTransform] = useState<string | null>(null)

  const completedTransforms = transformations.filter(t => t.status === 'complete').length
  const totalTransforms = transformations.length

  return (
    <div 
      className="rounded-xl overflow-hidden border"
      style={{ 
        borderColor: isDark ? 'rgba(59,130,246,0.3)' : 'rgba(59,130,246,0.2)',
        background: isDark ? '#0a0a0f' : '#ffffff'
      }}
    >
      {/* Header - Workspace Style */}
      <div 
        className="px-4 py-3 border-b flex items-center justify-between"
        style={{ 
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          background: isDark ? 'rgba(30,30,40,0.8)' : 'rgba(245,245,250,0.8)'
        }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(59,130,246,0.2)' }}
          >
            {isProcessing ? (
              <Activity size={16} className="animate-pulse" style={{ color: '#3b82f6' }} />
            ) : (
              <Database size={16} style={{ color: '#3b82f6' }} />
            )}
          </div>
          <div>
            <p className="text-sm font-medium" style={{ fontFamily: HF, color: isDark ? '#fff' : '#0a0a0a' }}>
              {datasetName}
            </p>
            <p className="text-xs" style={{ fontFamily: HF, color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
              {columns.length} columns • {isProcessing ? 'Processing...' : 'Ready'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isProcessing && (
            <div 
              className="px-3 py-1 rounded-full text-xs flex items-center gap-2"
              style={{ 
                background: 'rgba(59,130,246,0.1)', 
                color: '#3b82f6',
                fontFamily: HF 
              }}
            >
              <Clock size={12} />
              {progress}%
            </div>
          )}
          {!isProcessing && downloadUrl && (
            <a
              href={downloadUrl}
              download
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all hover:opacity-70"
              style={{ 
                background: 'rgba(34,197,94,0.2)', 
                color: '#22c55e',
                fontFamily: HF
              }}
            >
              <Download size={14} />
              Export
            </a>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {isProcessing && (
        <div className="px-4 py-2 border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs" style={{ fontFamily: HF, color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
              Pipeline Progress: {completedTransforms}/{totalTransforms} steps
            </span>
          </div>
          <div 
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
          >
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${(completedTransforms / totalTransforms) * 100}%`,
                background: 'linear-gradient(90deg, #3b82f6, #22c55e)'
              }}
            />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div 
        className="flex border-b"
        style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
      >
        {[
          { id: 'preview', label: 'Data Preview', icon: Table2 },
          { id: 'columns', label: `Columns (${columns.length})`, icon: Columns },
          { id: 'transforms', label: 'Transformations', icon: Settings }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs transition-all"
            style={{ 
              fontFamily: HF,
              color: activeTab === tab.id 
                ? '#3b82f6' 
                : isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
              borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
              background: activeTab === tab.id ? 'rgba(59,130,246,0.05)' : 'transparent'
            }}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'preview' && (
          <div 
            className="rounded-lg overflow-hidden border"
            style={{ 
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              background: isDark ? 'rgba(0,0,0,0.3)' : '#fafafa'
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#f0f0f0' }}>
                    {columns.map((col, i) => (
                      <th 
                        key={i}
                        className="px-3 py-2 text-left font-medium whitespace-nowrap"
                        style={{ 
                          fontFamily: HF,
                          color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)',
                          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                          minWidth: '100px'
                        }}
                      >
                        {col.name}
                        <span 
                          className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded"
                          style={{ 
                            background: isDark ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.1)',
                            color: '#3b82f6'
                          }}
                        >
                          {col.type}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      {row.map((cell, cellIdx) => (
                        <td 
                          key={cellIdx}
                          className="px-3 py-2 whitespace-nowrap"
                          style={{ 
                            color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                            borderBottom: rowIdx < previewData.length - 1 
                              ? `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` 
                              : 'none'
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
            <div 
              className="px-3 py-2 text-xs border-t"
              style={{ 
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
                fontFamily: HF 
              }}
            >
              Showing {previewData.length} of many rows
            </div>
          </div>
        )}

        {activeTab === 'columns' && (
          <div className="space-y-2">
            {columns.map((col, i) => (
              <div 
                key={i}
                className="flex items-center justify-between p-3 rounded-lg border"
                style={{ 
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'
                }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(59,130,246,0.1)' }}
                  >
                    <FileJson size={14} style={{ color: '#3b82f6' }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ fontFamily: HF, color: isDark ? '#fff' : '#0a0a0a' }}>
                      {col.name}
                    </p>
                    <p className="text-xs" style={{ fontFamily: HF, color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                      {col.nullCount} nulls • {col.uniqueCount} unique
                    </p>
                  </div>
                </div>
                <div 
                  className="text-xs px-2 py-1 rounded"
                  style={{ 
                    background: isDark ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.05)',
                    color: '#3b82f6',
                    fontFamily: HF
                  }}
                >
                  {col.type}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'transforms' && (
          <div className="space-y-2">
            {transformations.map((transform, i) => (
              <div 
                key={transform.id}
                className="flex items-start gap-3 p-3 rounded-lg border"
                style={{ 
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'
                }}
              >
                <div className="mt-0.5">
                  {transform.status === 'complete' ? (
                    <CheckCircle2 size={16} style={{ color: '#22c55e' }} />
                  ) : transform.status === 'running' ? (
                    <Play size={16} className="animate-pulse" style={{ color: '#3b82f6' }} />
                  ) : transform.status === 'error' ? (
                    <AlertCircle size={16} style={{ color: '#ef4444' }} />
                  ) : (
                    <Clock size={16} style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ fontFamily: HF, color: isDark ? '#fff' : '#0a0a0a' }}>
                    {transform.name}
                  </p>
                  <p className="text-xs" style={{ fontFamily: HF, color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                    {transform.description}
                  </p>
                  {transform.appliedAt && (
                    <p className="text-[10px] mt-1" style={{ fontFamily: HF, color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }}>
                      Applied at {transform.appliedAt}
                    </p>
                  )}
                </div>
                <div 
                  className="text-[10px] px-2 py-1 rounded uppercase"
                  style={{ 
                    fontFamily: HF,
                    background: transform.status === 'complete' ? 'rgba(34,197,94,0.1)' : 
                               transform.status === 'running' ? 'rgba(59,130,246,0.1)' :
                               transform.status === 'error' ? 'rgba(239,68,68,0.1)' :
                               isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    color: transform.status === 'complete' ? '#22c55e' : 
                           transform.status === 'running' ? '#3b82f6' :
                           transform.status === 'error' ? '#ef4444' :
                           isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
                  }}
                >
                  {transform.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
