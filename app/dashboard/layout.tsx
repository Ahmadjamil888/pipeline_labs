"use client"

import { ReactNode, useState } from "react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useTheme } from "@/app/theme-provider"
import { useUser, useClerk } from "@clerk/nextjs"
import { useClerkSupabaseClient } from "@/lib/clerk-supabase-client"
import { SidebarProvider } from "./sidebar-context"
import { 
  LayoutDashboard, 
  FolderGit, 
  CreditCard, 
  FileCode, 
  Settings, 
  LogOut,
  Sun,
  Moon,
  Plus,
  ArrowRight,
  PanelLeft,
  RefreshCw,
  AlertCircle
} from "lucide-react"

const HF = "'Helvetica World', Helvetica, Arial, sans-serif"

const navigation = [
  { name: "Chats", href: "/dashboard", icon: LayoutDashboard },
  { name: "Datasets", href: "/dashboard/datasets", icon: FolderGit },
  { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { name: "API Keys", href: "/dashboard/api-keys", icon: FileCode },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(true)
  const [needsSetup, setNeedsSetup] = useState(false)
  const router = useRouter()
  const { user: clerkUser, isLoaded } = useUser()
  const { signOut } = useClerk()
  const supabase = useClerkSupabaseClient()
  const { theme, toggleTheme } = useTheme()
  
  const isDark = theme === "dark"

  useEffect(() => {
    async function fetchUserAndCheckOrg() {
      // Wait for Clerk to load
      if (!isLoaded) return
      
      // Check if user is signed in with Clerk
      if (!clerkUser) {
        router.push('/')
        return
      }
      
      setUser({ id: clerkUser.id, email: clerkUser.primaryEmailAddress?.emailAddress })

      try {
        console.log('Dashboard: Checking profile for Clerk user:', clerkUser.id)
        
        // First, get or create profile for this Clerk user
        let { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, organization_id')
          .eq('clerk_user_id', clerkUser.id)
          .single()
        
        // If table doesn't exist or other error, treat as no profile
        if (profileError) {
          if (profileError.code === 'PGRST116') {
            // No rows returned - profile doesn't exist
            console.log('Dashboard: No profile found')
          } else if (profileError.message?.includes('400') || profileError.message?.includes('relation') || profileError.code === '42P01') {
            // Table doesn't exist or schema issue - silently skip
            console.log('Dashboard: Schema not set up yet, skipping org check')
            setLoading(false)
            return
          } else {
            // Log other errors but don't block dashboard
            console.log('Dashboard: Profile query issue (non-blocking):', profileError.code || profileError.message)
          }
        }

        console.log('Dashboard: Profile result:', profile)

        // Check if user has an organization through their profile
        if (profile?.organization_id) {
          console.log('Dashboard: User has organization_id:', profile.organization_id)
          
          const { data: org, error: orgError } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', profile.organization_id)
            .single()
          
          if (orgError && orgError.code !== 'PGRST116') {
            console.error('Dashboard: Error fetching org by ID:', orgError)
          }
          
          if (org) {
            console.log('Dashboard: Org found by ID:', org)
            setLoading(false)
            return
          }
        }

        // Fallback: check if user owns any organization directly
        if (profile?.id) {
          console.log('Dashboard: Checking owned orgs for profile:', profile.id)
          
          const { data: ownedOrgs, error: ownedError } = await supabase
            .from('organizations')
            .select('*')
            .eq('owner_id', profile.id)
            .limit(1)
          
          if (ownedError) {
            console.error('Dashboard: Error fetching owned org:', ownedError)
          }
          
          if (ownedOrgs && ownedOrgs.length > 0) {
            console.log('Dashboard: Found owned org:', ownedOrgs[0])
            // Update profile with this org
            await supabase
              .from('profiles')
              .update({ organization_id: ownedOrgs[0].id })
              .eq('id', profile.id)
            
            setLoading(false)
            return
          }
        }

        // No org found - show setup banner instead of immediate redirect
        console.log('Dashboard: No org found, showing setup banner')
        setNeedsSetup(true)
        setLoading(false)
        return

      } catch (err: any) {
        console.error('Dashboard: Exception in fetchUserAndCheckOrg:', err?.message || err)
        // On error, show dashboard anyway
        setLoading(false)
      }
    }
    fetchUserAndCheckOrg()
  }, [clerkUser, isLoaded, supabase, router])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: isDark ? "#050505" : "#fafafa" }}>
        <RefreshCw size={32} className="animate-spin" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex" style={{ background: isDark ? "#050505" : "#fafafa" }}>
      {/* Sidebar */}
      <aside 
        className={`h-screen flex flex-col border-r fixed left-0 top-0 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}`}
        style={{ 
          borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
          background: isDark ? "#050505" : "#fafafa"
        }}
      >
        {/* Logo */}
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="relative w-8 h-8">
              <Image 
                src={isDark ? "/logo-dark.png" : "/logo-light.png"} 
                alt="Pipeline AI" 
                fill 
                className="object-contain" 
              />
            </div>
            <span 
              className="text-lg"
              style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "#fff" : "#0a0a0a" }}
            >
              Pipeline
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4">
          <div 
            className="text-xs uppercase tracking-wider mb-3 px-3"
            style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}
          >
            Navigation
          </div>
          <div className="space-y-1">
            {navigation.map((item) => (
              item.external ? (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-full transition-all"
                  style={{
                    fontFamily: HF,
                    fontWeight: 300,
                    fontSize: "13px",
                    color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)",
                  }}
                >
                  <item.icon size={18} />
                  <span>{item.name}</span>
                </a>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-full transition-all"
                  style={{
                    fontFamily: HF,
                    fontWeight: 300,
                    fontSize: "13px",
                    color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)",
                  }}
                >
                  <item.icon size={18} />
                  <span>{item.name}</span>
                </Link>
              )
            ))}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-full transition-all mb-1"
            style={{
              fontFamily: HF,
              fontWeight: 300,
              fontSize: "13px",
              color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)",
            }}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            <span>Theme</span>
          </button>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-full transition-all"
            style={{
              fontFamily: HF,
              fontWeight: 300,
              fontSize: "13px",
              color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)",
            }}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Toggle Sidebar Button (visible when sidebar is open) */}
      {sidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed left-64 top-4 z-50 p-2 rounded-full border transition-all"
          style={{ 
            borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
            background: isDark ? "#050505" : "#fafafa",
            transform: 'translateX(-50%)'
          }}
        >
          <PanelLeft size={18} style={{ color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)" }} />
        </button>
      )}

      {/* Open Sidebar Button (visible when sidebar is closed) */}
      {!sidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed left-4 top-4 z-50 p-2 rounded-full border transition-all"
          style={{ 
            borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
            background: isDark ? "#050505" : "#fafafa"
          }}
        >
          <PanelLeft size={18} style={{ color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)" }} />
        </button>
      )}

      {/* Main Content */}
      <SidebarProvider sidebarOpen={sidebarOpen}>
        <main className={`flex-1 min-h-screen transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
          {/* Setup Banner - Updated for AI Data Preprocessing */}
          {needsSetup && (
            <div 
              className="m-6 p-4 rounded-2xl border flex items-center gap-4"
              style={{ 
                borderColor: isDark ? "rgba(59,130,246,0.3)" : "rgba(59,130,246,0.3)",
                background: isDark ? "rgba(59,130,246,0.1)" : "rgba(59,130,246,0.05)"
              }}
            >
              <AlertCircle size={24} style={{ color: '#3b82f6' }} />
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: isDark ? '#fff' : '#0a0a0a', fontFamily: HF }}>
                  Welcome to Pipeline Labs!
                </p>
                <p className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', fontFamily: HF }}>
                  Upload a dataset and start chatting with AI to preprocess your data.
                </p>
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 rounded-full text-xs"
                style={{ 
                  background: isDark ? '#fff' : '#3b82f6', 
                  color: isDark ? '#000' : '#fff',
                  fontFamily: HF,
                  fontWeight: 300
                }}
              >
                Start Chatting
              </button>
            </div>
          )}
          {children}
        </main>
      </SidebarProvider>
    </div>
  )
}
