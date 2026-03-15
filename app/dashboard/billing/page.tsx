"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/app/supabase-client"
import { useRouter, useSearchParams } from "next/navigation"
import { CreditCard, CheckCircle2, RefreshCw, AlertCircle } from "lucide-react"
import { useTheme } from "@/app/theme-provider"

const HF = "'Helvetica World', Helvetica, Arial, sans-serif"
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface Subscription {
  id: string
  plan: string
  status: string
  current_period_end: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
  usage: {
    deployments: number
    sandboxes: number
    bandwidth: number
  }
}

export default function BillingPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const { theme } = useTheme()
  const isDark = theme === "dark"

  // Handle Stripe redirect
  useEffect(() => {
    const success = searchParams.get('success')
    const canceled = searchParams.get('canceled')
    
    if (success) {
      setMessage({ type: 'success', text: 'Payment successful! Your subscription has been updated.' })
      window.history.replaceState({}, '', '/dashboard/billing')
    } else if (canceled) {
      setMessage({ type: 'error', text: 'Payment was canceled. Your subscription was not changed.' })
      window.history.replaceState({}, '', '/dashboard/billing')
    }
  }, [searchParams])

  useEffect(() => {
    async function fetchBilling() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setSubscription(data)
      } else {
        // Create default free subscription
        const defaultSub: Subscription = {
          id: crypto.randomUUID(),
          user_id: user.id,
          plan: 'free',
          status: 'active',
          current_period_end: new Date().toISOString(),
          usage: {
            deployments: 0,
            sandboxes: 0,
            bandwidth: 0
          }
        }
        setSubscription(defaultSub)
        await supabase.from('subscriptions').upsert(defaultSub)
      }
      
      setLoading(false)
    }
    fetchBilling()
  }, [supabase, router])

  const plans = [
    { id: 'free', name: 'Free', price: '$0', features: ['3 projects', '5 deployments/month', 'Community support'], current: subscription?.plan === 'free' },
    { id: 'pro', name: 'Pro', price: '$29', features: ['Unlimited projects', '100 deployments/month', 'Priority support', 'Custom domains'], current: subscription?.plan === 'pro' },
    { id: 'team', name: 'Team', price: '$99', features: ['Everything in Pro', 'Unlimited deployments', 'Team collaboration', 'SSO', 'SLA'], current: subscription?.plan === 'team' },
  ]

  const getPlanId = (planName: string) => planName.toLowerCase()

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl mb-2" style={{ fontFamily: HF, fontWeight: 200, color: isDark ? "#fff" : "#0a0a0a" }}>
          Billing
        </h1>
        <p className="text-sm" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
          Manage your subscription and usage
        </p>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`flex items-center gap-3 p-4 rounded-xl mb-6 ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span className="text-[13px]" style={{ fontFamily: HF }}>{message.text}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw size={24} className="animate-spin" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }} />
        </div>
      ) : (
        <>
          {/* Current Plan */}
          <div className="p-6 rounded-2xl border mb-8" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[12px] uppercase tracking-wider mb-1" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
                  Current Plan
                </div>
                <div className="text-2xl" style={{ fontFamily: HF, fontWeight: 200, color: isDark ? "#fff" : "#0a0a0a" }}>
                  {subscription?.plan || 'Free'}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: "rgba(34,197,94,0.1)" }}>
                  <CheckCircle2 size={16} style={{ color: "#22c55e" }} />
                  <span className="text-[13px]" style={{ fontFamily: HF, fontWeight: 300, color: "#22c55e" }}>
                    {subscription?.status || 'Active'}
                  </span>
                </div>
                {subscription?.stripe_subscription_id && (
                  <button
                    onClick={handleManageSubscription}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border text-[13px]"
                    style={{ 
                      borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
                      color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)"
                    }}
                  >
                    <CreditCard size={16} />
                    Manage
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Plans */}
          <div className="grid grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div key={plan.name} className={`p-6 rounded-2xl border ${plan.current ? 'ring-2 ring-white' : ''}`} style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
                <div className="text-xl mb-1" style={{ fontFamily: HF, fontWeight: 200, color: isDark ? "#fff" : "#0a0a0a" }}>
                  {plan.name}
                </div>
                <div className="text-3xl mb-4" style={{ fontFamily: HF, fontWeight: 200, color: isDark ? "#fff" : "#0a0a0a" }}>
                  {plan.price}<span className="text-[14px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>/mo</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-[13px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)" }}>
                      <CheckCircle2 size={14} style={{ color: "#22c55e" }} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => handleUpgrade(getPlanId(plan.name))}
                  disabled={plan.current || upgrading}
                  className="w-full py-2.5 rounded-full text-[13px] transition-all"
                  style={{ 
                    fontFamily: HF, 
                    fontWeight: 300,
                    background: plan.current ? (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)") : (isDark ? "#fff" : "#0a0a0a"),
                    color: plan.current ? (isDark ? "#fff" : "#0a0a0a") : (isDark ? "#000" : "#fff"),
                    opacity: plan.current || upgrading ? 0.5 : 1,
                    cursor: plan.current || upgrading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {upgrading ? (
                    <span className="flex items-center justify-center gap-2">
                      <RefreshCw size={14} className="animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    plan.current ? 'Current Plan' : 'Upgrade'
                  )}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
