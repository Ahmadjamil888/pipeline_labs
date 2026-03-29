"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { useClerkSupabaseClient } from "@/lib/clerk-supabase-client"
import { Building2, ArrowRight, RefreshCw } from "lucide-react"
import { useTheme } from "@/app/theme-provider"

const HF = "'Helvetica World', Helvetica, Arial, sans-serif"

export default function OnboardingPage() {
  const [orgName, setOrgName] = useState('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = useClerkSupabaseClient()
  const { user: clerkUser, isLoaded } = useUser()
  const { theme } = useTheme()
  const isDark = theme === "dark"

  useEffect(() => {
    async function checkUser() {
      // Wait for Clerk to load
      if (!isLoaded) return
      
      // Check if user is signed in
      if (!clerkUser) {
        router.push('/')
        return
      }

      try {
        // First, get or create profile for this Clerk user
        let { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, organization_id')
          .eq('clerk_user_id', clerkUser.id)
          .single()
        
        // If no profile exists, create one
        if (!profile && !profileError) {
          console.log('Creating new profile for Clerk user in onboarding')
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              clerk_user_id: clerkUser.id,
              email: clerkUser.primaryEmailAddress?.emailAddress || '',
              full_name: clerkUser.fullName || '',
            })
            .select('id, organization_id')
            .single()
          
          if (createError) {
            console.error('Error creating profile:', createError)
          } else {
            profile = newProfile
          }
        }

        // If profile has organization_id, user already has an org
        if (profile?.organization_id) {
          const { data: org } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', profile.organization_id)
            .single()
          
          if (org) {
            // User already has an org, redirect to dashboard
            router.push('/dashboard')
            return
          }
        }

        // Also check if user owns any org directly
        if (profile?.id) {
          const { data: ownedOrg } = await supabase
            .from('organizations')
            .select('*')
            .eq('owner_id', profile.id)
            .limit(1)
            .single()
          
          if (ownedOrg) {
            // Update profile with org and redirect
            await supabase
              .from('profiles')
              .update({ organization_id: ownedOrg.id })
              .eq('id', profile.id)
            
            router.push('/dashboard')
            return
          }
        }

        setLoading(false)
      } catch (err: any) {
        console.error('Error in checkUser:', err?.message || err)
        setLoading(false)
      }
    }
    checkUser()
  }, [clerkUser, isLoaded, supabase, router])

  const createOrganization = async () => {
    if (!orgName.trim()) {
      setError('Please enter an organization name')
      return
    }

    setCreating(true)
    setError(null)

    if (!clerkUser) {
      router.push('/')
      return
    }

    try {
      // Get or create profile
      let { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('clerk_user_id', clerkUser.id)
        .single()
      
      if (!profile) {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            clerk_user_id: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress || '',
            full_name: clerkUser.fullName || '',
          })
          .select('id')
          .single()
        
        if (createError) {
          setError('Failed to create user profile: ' + createError.message)
          setCreating(false)
          return
        }
        profile = newProfile
      }

      // Create organization
      const slug = orgName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: orgName.trim(),
          slug: slug + '-' + Date.now().toString(36),
          owner_id: profile.id,
          plan: 'free',
          limits: { maxProjects: 3, maxServices: 10, maxDeployments: 50 }
        })
        .select()
        .single()

      if (orgError) {
        setError(orgError.message)
        setCreating(false)
        return
      }

      // Update profile with organization_id and role
      await supabase
        .from('profiles')
        .update({ 
          organization_id: org.id,
          role: 'owner'
        })
        .eq('id', profile.id)

      // Redirect to dashboard after creating org
      router.push('/dashboard')
    } catch (err: any) {
      console.error('Error creating organization:', err)
      setError(err?.message || 'Failed to create organization')
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw size={32} className="animate-spin" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" }}>
            <Building2 size={32} style={{ color: isDark ? "#fff" : "#0a0a0a" }} />
          </div>
          <h1 className="text-2xl mb-2" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "#fff" : "#0a0a0a" }}>
            Create Your Organization
          </h1>
          <p className="text-sm" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
            You need to create an organization before continuing
          </p>
        </div>

        <div className="p-6 rounded-2xl border" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] mb-2" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)" }}>
                Organization Name
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g., Acme Corp"
                className="w-full px-4 py-3 rounded-xl border bg-transparent text-[14px]"
                style={{ fontFamily: HF, fontWeight: 300, borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", color: isDark ? "#fff" : "#0a0a0a" }}
                onKeyDown={(e) => e.key === 'Enter' && createOrganization()}
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl text-[13px]" style={{ fontFamily: HF, fontWeight: 300, background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                {error}
              </div>
            )}

            <button
              onClick={createOrganization}
              disabled={creating || !orgName.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-[14px]"
              style={{ fontFamily: HF, fontWeight: 300, background: isDark ? "#fff" : "#0a0a0a", color: isDark ? "#000" : "#fff", opacity: creating || !orgName.trim() ? 0.5 : 1 }}
            >
              {creating ? <RefreshCw size={18} className="animate-spin" /> : <ArrowRight size={18} />}
              {creating ? 'Creating...' : 'Continue to Dashboard'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
