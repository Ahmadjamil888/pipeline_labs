"use client"

import { ReactNode } from "react"
import { createClient } from "@/app/supabase-client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useTheme } from "@/app/theme-provider"
import { 
  LayoutDashboard, 
  FolderGit, 
  Building2, 
  Cloud, 
  CreditCard, 
  FileCode, 
  Settings, 
  LogOut,
  Sun,
  Moon,
  Plus,
  ArrowRight,
  PanelLeft
} from "lucide-react"

const HF = "'Helvetica World', Helvetica, Arial, sans-serif"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/dashboard/repos", icon: FolderGit },
  { name: "Organizations", href: "/dashboard/orgs", icon: Building2 },
  { name: "Providers", href: "/dashboard/providers", icon: Cloud },
  { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { name: "API Docs", href: "https://pipeline.stldocs.app/", icon: FileCode, external: true },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const router = useRouter()
  const supabase = createClient()
  const { theme, toggleTheme } = useTheme()
  
  const isDark = theme === "dark"

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
    }
    fetchUser()
  }, [supabase, router])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
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
      <main className={`flex-1 min-h-screen transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {children}
      </main>
    </div>
  )
}
