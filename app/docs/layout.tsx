"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Book,
  Code,
  Terminal,
  Settings,
  Zap,
  GitBranch,
  Rocket,
  LayoutGrid,
  ChevronRight,
  Menu,
  X,
  Moon,
  Sun,
  Key,
  Package,
  Webhook,
  Cloud,
  CreditCard,
  Users,
  FileText,
  Play,
  Shield,
  Database,
  Boxes,
  Workflow,
  Activity,
  Server,
  Globe,
  Cpu,
  Layers,
  Scan,
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  History,
  BarChart,
  Lock,
  Unlock,
  RefreshCw,
  Trash2,
  Edit,
  Plus,
  Copy,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  items?: SidebarItem[];
}

const sidebarItems: SidebarItem[] = [
  {
    title: "Getting Started",
    href: "/docs",
    icon: <Book className="h-4 w-4" />,
    items: [
      { title: "Introduction", href: "/docs", icon: <FileText className="h-4 w-4" /> },
      { title: "Quick Start", href: "/docs/quickstart", icon: <Zap className="h-4 w-4" /> },
      { title: "Installation", href: "/docs/installation", icon: <Package className="h-4 w-4" /> },
      { title: "API Keys", href: "/docs/api-keys", icon: <Key className="h-4 w-4" /> },
    ],
  },
  {
    title: "SDK Reference",
    href: "/docs/sdk",
    icon: <Code className="h-4 w-4" />,
    items: [
      { title: "Python SDK", href: "/docs/sdk/python", icon: <Terminal className="h-4 w-4" /> },
      { title: "JavaScript SDK", href: "/docs/sdk/javascript", icon: <Globe className="h-4 w-4" /> },
      { title: "Authentication", href: "/docs/sdk/auth", icon: <Shield className="h-4 w-4" /> },
      { title: "Error Handling", href: "/docs/sdk/errors", icon: <AlertCircle className="h-4 w-4" /> },
    ],
  },
  {
    title: "Repositories",
    href: "/docs/repositories",
    icon: <GitBranch className="h-4 w-4" />,
    items: [
      { title: "Connect Repository", href: "/docs/repositories/connect", icon: <Plus className="h-4 w-4" /> },
      { title: "Analyze Repository", href: "/docs/repositories/analyze", icon: <Scan className="h-4 w-4" /> },
      { title: "Repository Details", href: "/docs/repositories/details", icon: <FileText className="h-4 w-4" /> },
      { title: "List Repositories", href: "/docs/repositories/list", icon: <LayoutGrid className="h-4 w-4" /> },
      { title: "Delete Repository", href: "/docs/repositories/delete", icon: <Trash2 className="h-4 w-4" /> },
    ],
  },
  {
    title: "AI Analysis",
    href: "/docs/analysis",
    icon: <Cpu className="h-4 w-4" />,
    items: [
      { title: "Start Analysis", href: "/docs/analysis/start", icon: <Play className="h-4 w-4" /> },
      { title: "Analysis Status", href: "/docs/analysis/status", icon: <Activity className="h-4 w-4" /> },
      { title: "Repo Scanner", href: "/docs/analysis/scanner", icon: <Search className="h-4 w-4" /> },
      { title: "Deep Analyzer", href: "/docs/analysis/analyzer", icon: <Scan className="h-4 w-4" /> },
      { title: "Deployment Planner", href: "/docs/analysis/planner", icon: <Workflow className="h-4 w-4" /> },
      { title: "Progress Streaming", href: "/docs/analysis/streaming", icon: <RefreshCw className="h-4 w-4" /> },
    ],
  },
  {
    title: "Deployments",
    href: "/docs/deployments",
    icon: <Rocket className="h-4 w-4" />,
    items: [
      { title: "Create Deployment", href: "/docs/deployments/create", icon: <Plus className="h-4 w-4" /> },
      { title: "List Deployments", href: "/docs/deployments/list", icon: <LayoutGrid className="h-4 w-4" /> },
      { title: "Deployment Status", href: "/docs/deployments/status", icon: <Activity className="h-4 w-4" /> },
      { title: "Deploy to Vercel", href: "/docs/deployments/vercel", icon: <Cloud className="h-4 w-4" /> },
      { title: "Deploy to Render", href: "/docs/deployments/render", icon: <Server className="h-4 w-4" /> },
      { title: "Cancel Deployment", href: "/docs/deployments/cancel", icon: <X className="h-4 w-4" /> },
    ],
  },
  {
    title: "Organizations",
    href: "/docs/organizations",
    icon: <Users className="h-4 w-4" />,
    items: [
      { title: "Create Organization", href: "/docs/organizations/create", icon: <Plus className="h-4 w-4" /> },
      { title: "List Organizations", href: "/docs/organizations/list", icon: <LayoutGrid className="h-4 w-4" /> },
      { title: "Organization Details", href: "/docs/organizations/details", icon: <FileText className="h-4 w-4" /> },
      { title: "Update Organization", href: "/docs/organizations/update", icon: <Edit className="h-4 w-4" /> },
      { title: "Delete Organization", href: "/docs/organizations/delete", icon: <Trash2 className="h-4 w-4" /> },
      { title: "Members", href: "/docs/organizations/members", icon: <Users className="h-4 w-4" /> },
    ],
  },
  {
    title: "Projects",
    href: "/docs/projects",
    icon: <Boxes className="h-4 w-4" />,
    items: [
      { title: "Create Project", href: "/docs/projects/create", icon: <Plus className="h-4 w-4" /> },
      { title: "List Projects", href: "/docs/projects/list", icon: <LayoutGrid className="h-4 w-4" /> },
      { title: "Project Details", href: "/docs/projects/details", icon: <FileText className="h-4 w-4" /> },
      { title: "Update Project", href: "/docs/projects/update", icon: <Edit className="h-4 w-4" /> },
      { title: "Delete Project", href: "/docs/projects/delete", icon: <Trash2 className="h-4 w-4" /> },
      { title: "Progress Tracking", href: "/docs/projects/progress", icon: <BarChart className="h-4 w-4" /> },
    ],
  },
  {
    title: "Sandboxes",
    href: "/docs/sandboxes",
    icon: <Layers className="h-4 w-4" />,
    items: [
      { title: "Create Sandbox", href: "/docs/sandboxes/create", icon: <Plus className="h-4 w-4" /> },
      { title: "List Sandboxes", href: "/docs/sandboxes/list", icon: <LayoutGrid className="h-4 w-4" /> },
      { title: "Sandbox Details", href: "/docs/sandboxes/details", icon: <FileText className="h-4 w-4" /> },
      { title: "Execute Command", href: "/docs/sandboxes/execute", icon: <Terminal className="h-4 w-4" /> },
      { title: "Delete Sandbox", href: "/docs/sandboxes/delete", icon: <Trash2 className="h-4 w-4" /> },
    ],
  },
  {
    title: "Billing",
    href: "/docs/billing",
    icon: <CreditCard className="h-4 w-4" />,
    items: [
      { title: "Plans", href: "/docs/billing/plans", icon: <LayoutGrid className="h-4 w-4" /> },
      { title: "Checkout", href: "/docs/billing/checkout", icon: <CreditCard className="h-4 w-4" /> },
      { title: "Subscription", href: "/docs/billing/subscription", icon: <RefreshCw className="h-4 w-4" /> },
      { title: "Portal", href: "/docs/billing/portal", icon: <ExternalLink className="h-4 w-4" /> },
      { title: "Webhooks", href: "/docs/billing/webhooks", icon: <Webhook className="h-4 w-4" /> },
      { title: "Usage", href: "/docs/billing/usage", icon: <BarChart className="h-4 w-4" /> },
    ],
  },
  {
    title: "Webhooks",
    href: "/docs/webhooks",
    icon: <Webhook className="h-4 w-4" />,
    items: [
      { title: "GitHub App", href: "/docs/webhooks/github", icon: <GitBranch className="h-4 w-4" /> },
      { title: "Polar Billing", href: "/docs/webhooks/polar", icon: <CreditCard className="h-4 w-4" /> },
      { title: "Deployment Status", href: "/docs/webhooks/deployments", icon: <Rocket className="h-4 w-4" /> },
      { title: "Verification", href: "/docs/webhooks/verification", icon: <Shield className="h-4 w-4" /> },
    ],
  },
  {
    title: "Advanced",
    href: "/docs/advanced",
    icon: <Settings className="h-4 w-4" />,
    items: [
      { title: "Error Fixer Agent", href: "/docs/advanced/error-fixer", icon: <AlertCircle className="h-4 w-4" /> },
      { title: "Pipeline Orchestrator", href: "/docs/advanced/orchestrator", icon: <Workflow className="h-4 w-4" /> },
      { title: "Custom Domains", href: "/docs/advanced/domains", icon: <Globe className="h-4 w-4" /> },
      { title: "Environment Variables", href: "/docs/advanced/env-vars", icon: <Database className="h-4 w-4" /> },
      { title: "Rate Limiting", href: "/docs/advanced/rate-limiting", icon: <Clock className="h-4 w-4" /> },
      { title: "Security", href: "/docs/advanced/security", icon: <Lock className="h-4 w-4" /> },
    ],
  },
];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      setIsSidebarOpen(window.innerWidth >= 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/50 rounded-lg" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">P</span>
            </div>
          </div>
          <span className="font-bold text-lg">Pipeline Labs</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed lg:sticky top-0 left-0 z-40 h-screen w-72 bg-background border-r transition-transform duration-300 ease-in-out",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0 lg:overflow-hidden"
          )}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-4 border-b hidden lg:flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <div className="relative w-8 h-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/50 rounded-lg" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">P</span>
                  </div>
                </div>
                <span className="font-bold text-lg">Pipeline Labs</span>
              </Link>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={toggleTheme}>
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {sidebarItems.map((section) => (
                <Collapsible key={section.href} defaultOpen={pathname?.startsWith(section.href)}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-2 font-medium",
                        pathname?.startsWith(section.href) && "bg-primary/10 text-primary"
                      )}
                    >
                      {section.icon}
                      {section.title}
                      <ChevronDown className="h-4 w-4 ml-auto shrink-0 transition-transform duration-200 [&[data-state=open]>svg]:rotate-180" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-4 space-y-1">
                    {section.items?.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                          pathname === item.href
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                        onClick={() => isMobile && setIsSidebarOpen(false)}
                      >
                        {item.icon}
                        {item.title}
                      </Link>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>© 2026 Pipeline Labs</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          {isSidebarOpen && isMobile && (
            <div
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
          <div className="max-w-5xl mx-auto p-6 lg:p-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
