import { Suspense } from 'react'
import BillingContent from './billing-content'

export default function BillingPage() {
  return (
    <Suspense fallback={
      <div className="p-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <div className="text-[13px]" style={{ fontFamily: "'Helvetica World', Helvetica, Arial, sans-serif", color: "rgba(128,128,128,0.7)" }}>
            Loading...
          </div>
        </div>
      </div>
    }>
      <BillingContent />
    </Suspense>
  )
}
