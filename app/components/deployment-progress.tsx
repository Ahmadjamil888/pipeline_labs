import React from 'react'
import { CheckCircle, Clock, Loader, AlertCircle } from 'lucide-react'

const DEPLOY_STAGES = [
  { id: "analyzing", label: "Analyzing repository", icon: "🔍" },
  { id: "building", label: "Building your model", icon: "⚙️" },
  { id: "packaging", label: "Packaging runtime", icon: "📦" },
  { id: "deploying", label: "Deploying to Pipeline Labs", icon: "🚀" },
  { id: "ready", label: "Your model is live", icon: "✅" },
]

interface DeploymentProgressProps {
  status: string
  error?: string
}

export default function DeploymentProgress({ status, error }: DeploymentProgressProps) {
  const getCurrentStageIndex = () => {
    const statusMap: Record<string, number> = {
      "pending": 0,
      "analyzing": 0,
      "building": 1,
      "packaging": 2,
      "deploying": 3,
      "deployed": 4,
      "ready": 4,
      "failed": -1,
      "error": -1
    }
    return statusMap[status] || 0
  }

  const currentStageIndex = getCurrentStageIndex()
  const hasError = status === "failed" || status === "error" || error

  return (
    <div style={{
      padding: '24px',
      background: '#f8f9fa',
      borderRadius: '12px',
      border: '1px solid #e4e4e7'
    }}>
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          margin: '0 0 8px 0',
          color: '#1a1a1a'
        }}>
          Deploying on Pipeline Labs
        </h3>
        <p style={{ 
          fontSize: '14px', 
          margin: 0,
          color: '#6b7280'
        }}>
          Your model is being deployed to our secure cloud infrastructure
        </p>
      </div>

      {hasError ? (
        <div style={{
          padding: '16px',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <AlertCircle size={20} style={{ color: '#dc2626' }} />
          <div>
            <p style={{ 
              margin: 0, 
              fontSize: '14px',
              fontWeight: '500',
              color: '#dc2626'
            }}>
              Deployment Failed
            </p>
            <p style={{ 
              margin: '4px 0 0 0', 
              fontSize: '13px',
              color: '#7f1d1d'
            }}>
              {error || "Your model deployment encountered an issue. Our team has been notified."}
            </p>
          </div>
        </div>
      ) : (
        <div>
          {DEPLOY_STAGES.map((stage, index) => {
            const isActive = index === currentStageIndex
            const isCompleted = index < currentStageIndex
            const isPending = index > currentStageIndex

            return (
              <div
                key={stage.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '12px 0',
                  opacity: isPending ? 0.5 : 1
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  background: isCompleted 
                    ? '#10b981' 
                    : isActive 
                    ? '#3b82f6' 
                    : '#e5e7eb',
                  color: isCompleted || isActive ? 'white' : '#6b7280',
                  position: 'relative'
                }}>
                  {isCompleted ? (
                    <CheckCircle size={20} />
                  ) : isActive ? (
                    <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
                  ) : (
                    stage.icon
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <p style={{
                    margin: 0,
                    fontSize: '15px',
                    fontWeight: '500',
                    color: isCompleted 
                      ? '#10b981' 
                      : isActive 
                      ? '#1a1a1a' 
                      : '#6b7280'
                  }}>
                    {stage.label}
                  </p>
                  {isActive && (
                    <p style={{
                      margin: '4px 0 0 0',
                      fontSize: '13px',
                      color: '#6b7280'
                    }}>
                      This usually takes 2-3 minutes...
                    </p>
                  )}
                </div>

                {isActive && (
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#3b82f6',
                    animation: 'pulse 2s infinite'
                  }} />
                )}
              </div>
            )
          })}
        </div>
      )}

      <div style={{
        marginTop: '24px',
        padding: '16px',
        background: '#f0f9ff',
        border: '1px solid #bae6fd',
        borderRadius: '8px'
      }}>
        <p style={{
          margin: 0,
          fontSize: '13px',
          color: '#0c4a6e'
        }}>
          <strong>Need help?</strong> Contact us at{' '}
          <a href="mailto:support@pipelinelabs.dev" style={{ color: '#0284c7' }}>
            support@pipelinelabs.dev
          </a>
        </p>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
