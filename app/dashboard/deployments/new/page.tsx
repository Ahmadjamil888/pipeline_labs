import { Suspense } from 'react'
import NewDeploymentContent from './new-deployment-content'

export default function NewDeploymentPage() {
  return (
    <Suspense fallback={
      <div className="p-8 flex items-center justify-center">
        <div className="text-[13px]" style={{ fontFamily: "'Helvetica World', Helvetica, Arial, sans-serif", color: "rgba(128,128,128,0.7)" }}>
          Loading...
        </div>
      </div>
    }>
      <NewDeploymentContent />
    </Suspense>
  )
}
