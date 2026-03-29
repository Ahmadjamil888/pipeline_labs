"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/app/supabase-client"
import { useRouter } from "next/navigation"
import { Building2, Plus, ArrowRight, RefreshCw } from "lucide-react"
import { useTheme } from "@/app/theme-provider"
import Link from "next/link"

const HF = "'Helvetica World', Helvetica, Arial, sans-serif"

interface Organization {
  id: string
  name: string
  slug: string
  plan: string
  created_at: string
}

export default function OrgsPage() {
  const [orgs, setOrgs] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()
  const { theme } = useTheme()
  const isDark = theme === "dark"

  useEffect(() => {
    async function fetchOrgs() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }

      const { data } = await supabase
        .from('organizations')
        .select('*')
        .eq('owner_id', user.id)

      if (data) setOrgs(data)
      setLoading(false)
    }
    fetchOrgs()
  }, [supabase, router])

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl mb-2" style={{ fontFamily: HF, fontWeight: 200, color: isDark ? "#fff" : "#0a0a0a" }}>
            Organizations
          </h1>
          <p className="text-sm" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
            Manage your teams and billing
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px]" style={{ fontFamily: HF, fontWeight: 300, background: isDark ? "#fff" : "#0a0a0a", color: isDark ? "#000" : "#fff" }}>
          <Plus size={16} />
          New Organization
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw size={24} className="animate-spin" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }} />
        </div>
      ) : orgs.length === 0 ? (
        <div className="p-12 rounded-2xl border text-center" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
          <Building2 size={48} className="mx-auto mb-4" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)" }} />
          <h3 className="text-xl mb-2" style={{ fontFamily: HF, fontWeight: 200, color: isDark ? "#fff" : "#0a0a0a" }}>
            No organizations yet
          </h3>
          <p className="mb-6" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
            Create an organization to collaborate with your team
          </p>
          <button className="px-5 py-2.5 rounded-full text-[13px]" style={{ fontFamily: HF, fontWeight: 300, background: isDark ? "#fff" : "#0a0a0a", color: isDark ? "#000" : "#fff" }}>
            Create Organization
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {orgs.map((org) => (
            <Link key={org.id} href={`/dashboard/orgs/${org.id}`}>
              <div className="flex items-center justify-between p-5 rounded-2xl border" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
                    <Building2 size={20} style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }} />
                  </div>
                  <div>
                    <div className="text-[14px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "#fff" : "#0a0a0a" }}>
                      {org.name}
                    </div>
                    <div className="text-[12px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}>
                      {org.slug} • {org.plan} plan
                    </div>
                  </div>
                </div>
                <ArrowRight size={16} style={{ color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)" }} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
