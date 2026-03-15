"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/app/theme-provider";
import { ThemeToggle } from "@/app/theme-toggle";
import { 
  ChevronRight, 
  Copy, 
  Check, 
  Server, 
  GitBranch, 
  Rocket, 
  Activity,
  Terminal,
  ArrowLeft
} from "lucide-react";

const HF = "'Helvetica World', Helvetica, Arial, sans-serif";

const apiSections = [
  {
    title: "Repositories",
    icon: GitBranch,
    description: "Connect and analyze Git repositories",
    endpoints: [
      {
        method: "POST",
        path: "/repos/connect",
        summary: "Connect a Git repository",
        description: "Connect a Git repository from GitHub or GitLab to the platform",
        requestBody: {
          repo_url: "https://github.com/user/my-monorepo",
          provider: "github",
          branch: "main",
          name: "my-monorepo"
        },
        response: {
          id: "uuid",
          repo_url: "https://github.com/user/my-monorepo",
          provider: "github",
          branch: "main",
          name: "my-monorepo",
          status: "connected",
          created_at: "2024-01-01T00:00:00Z"
        }
      },
      {
        method: "POST",
        path: "/repos/{repo_id}/analyze",
        summary: "Analyze repository structure",
        description: "Creates a Daytona workspace, clones the repository, and runs AI analysis to detect frameworks, services, and recommend deployment platforms.",
        response: {
          repo_id: "uuid",
          services: [
            {
              name: "frontend",
              framework: "nextjs",
              path: "frontend/",
              language: "typescript",
              recommended_platform: "vercel",
              build_command: "npm run build",
              start_command: "npm start"
            }
          ],
          is_monorepo: true,
          analyzed_at: "2024-01-01T00:00:00Z",
          sandbox_id: "uuid"
        }
      },
      {
        method: "GET",
        path: "/repos/{repo_id}",
        summary: "Get repository details",
        response: "Returns RepoConnection object"
      }
    ]
  },
  {
    title: "Deployments",
    icon: Rocket,
    description: "Manage application deployments",
    endpoints: [
      {
        method: "GET",
        path: "/deployments",
        summary: "List all deployments",
        parameters: ["status", "repo_id", "limit", "offset"],
        response: {
          deployments: [],
          total: 0,
          limit: 20,
          offset: 0
        }
      },
      {
        method: "POST",
        path: "/deployments",
        summary: "Create deployment plan",
        requestBody: {
          repo_id: "uuid",
          services: [
            {
              name: "frontend",
              path: "frontend/",
              platform: "vercel"
            }
          ],
          environment: "production",
          branch: "main"
        },
        response: {
          id: "uuid",
          repo_id: "uuid",
          status: "planned",
          services: [],
          created_at: "2024-01-01T00:00:00Z"
        }
      },
      {
        method: "GET",
        path: "/deployments/{deployment_id}",
        summary: "Get deployment status",
        response: {
          id: "uuid",
          repo_id: "uuid",
          status: "running",
          services: [],
          started_at: "2024-01-01T00:00:00Z"
        }
      },
      {
        method: "POST",
        path: "/deployments/{deployment_id}/run",
        summary: "Execute deployment",
        description: "Execute the deployment in a Daytona sandbox. This will: 1) Start the sandbox, 2) Run build commands, 3) Deploy services to Vercel/Render, 4) Track deployment status",
        response: {
          deployment_id: "uuid",
          status: "running",
          message: "Deployment execution started",
          estimated_duration_seconds: 180
        }
      },
      {
        method: "POST",
        path: "/deployments/{deployment_id}/cancel",
        summary: "Cancel deployment",
        response: { message: "Deployment cancelled" }
      },
      {
        method: "GET",
        path: "/deployments/{deployment_id}/logs",
        summary: "Get deployment logs",
        parameters: ["tail", "since"],
        response: {
          deployment_id: "uuid",
          logs: [],
          timestamp: "2024-01-01T00:00:00Z"
        }
      }
    ]
  },
  {
    title: "Sandboxes",
    icon: Terminal,
    description: "Manage Daytona workspaces",
    endpoints: [
      {
        method: "GET",
        path: "/sandboxes",
        summary: "List all sandboxes",
        parameters: ["status", "limit"],
        response: {
          sandboxes: [],
          total: 0
        }
      },
      {
        method: "POST",
        path: "/sandboxes",
        summary: "Create sandbox",
        description: "Create a new Daytona workspace for isolated execution",
        requestBody: {
          repo_id: "uuid",
          repo_url: "https://github.com/user/repo",
          branch: "main",
          resources: {
            cpu_cores: 2,
            memory_mb: 4096,
            disk_gb: 20
          }
        },
        response: {
          id: "uuid",
          status: "creating",
          workspace_url: "https://workspace.daytona.io",
          created_at: "2024-01-01T00:00:00Z"
        }
      },
      {
        method: "GET",
        path: "/sandboxes/{sandbox_id}",
        summary: "Get sandbox details",
        response: "Returns Sandbox object"
      },
      {
        method: "DELETE",
        path: "/sandboxes/{sandbox_id}",
        summary: "Destroy sandbox",
        description: "Destroy the Daytona workspace and free resources"
      },
      {
        method: "POST",
        path: "/sandboxes/{sandbox_id}/start",
        summary: "Start sandbox",
        response: { status: "running" }
      },
      {
        method: "POST",
        path: "/sandboxes/{sandbox_id}/stop",
        summary: "Stop sandbox",
        response: { status: "stopped" }
      },
      {
        method: "POST",
        path: "/sandboxes/{sandbox_id}/execute",
        summary: "Execute command in sandbox",
        requestBody: {
          command: "npm install",
          working_directory: "/workspace",
          timeout_seconds: 300
        },
        response: {
          exit_code: 0,
          stdout: "...",
          stderr: "",
          duration_ms: 5000
        }
      }
    ]
  },
  {
    title: "System",
    icon: Activity,
    description: "Health and system status",
    endpoints: [
      {
        method: "GET",
        path: "/health",
        summary: "Health check",
        response: {
          status: "healthy",
          timestamp: "2024-01-01T00:00:00Z",
          version: "1.0.0",
          services: {
            database: "healthy",
            sandbox_service: "healthy"
          }
        }
      }
    ]
  }
];

const methodColors: Record<string, string> = {
  GET: "#22c55e",
  POST: "#3b82f6",
  PUT: "#f59e0b",
  DELETE: "#ef4444",
  PATCH: "#8b5cf6"
};

export default function DocsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [expandedSection, setExpandedSection] = useState<string | null>("Repositories");
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  return (
    <div className="min-h-screen" style={{ background: isDark ? "#050505" : "#fafafa" }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 border-b" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", background: isDark ? "rgba(5,5,5,0.9)" : "rgba(250,250,250,0.9)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-8 h-8">
                <Image src={isDark ? "/logo-dark.png" : "/logo-light.png"} alt="Pipeline AI" fill className="object-contain" />
              </div>
              <span style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "#fff" : "#0a0a0a" }}>Pipeline AI</span>
            </Link>
            <span style={{ color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)" }}>/</span>
            <span style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }}>API Documentation</span>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/dashboard">
              <button className="px-5 py-2 rounded-full text-[13px]" style={{ fontFamily: HF, fontWeight: 300, background: isDark ? "#fff" : "#0a0a0a", color: isDark ? "#000" : "#fff" }}>
                Dashboard
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="pt-24 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Hero */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl mb-4" style={{ fontFamily: HF, fontWeight: 200, color: isDark ? "#fff" : "#0a0a0a" }}>
              API Reference
            </h1>
            <p className="text-lg max-w-2xl" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
              Complete reference for the Pipeline AI DevOps Platform API. 
              Base URL: <code className="px-2 py-1 rounded" style={{ background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", fontFamily: "monospace" }}>http://localhost:8000/api/v1</code>
            </p>
          </div>

          {/* Authentication */}
          <div className="mb-8 p-6 rounded-2xl border" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
            <h2 className="text-xl mb-3" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "#fff" : "#0a0a0a" }}>
              Authentication
            </h2>
            <p className="text-[13px] mb-3" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }}>
              All API endpoints require Bearer authentication using a JWT token.
            </p>
            <div className="p-3 rounded-xl" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
              <code className="text-[12px]" style={{ fontFamily: "monospace", color: isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.8)" }}>
                Authorization: Bearer {'<your_jwt_token>'}
              </code>
            </div>
          </div>

          {/* API Sections */}
          <div className="space-y-4">
            {apiSections.map((section) => {
              const isExpanded = expandedSection === section.title;
              const Icon = section.icon;
              
              return (
                <div 
                  key={section.title}
                  className="rounded-2xl border overflow-hidden"
                  style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}
                >
                  {/* Section Header */}
                  <button
                    onClick={() => setExpandedSection(isExpanded ? null : section.title)}
                    className="w-full flex items-center justify-between p-5 text-left"
                    style={{ background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}
                  >
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}
                      >
                        <Icon size={20} style={{ color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)" }} />
                      </div>
                      <div>
                        <h3 className="text-lg" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "#fff" : "#0a0a0a" }}>
                          {section.title}
                        </h3>
                        <p className="text-[12px]" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
                          {section.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight 
                      size={20} 
                      className={`transition-transform ${isExpanded ? "rotate-90" : ""}`}
                      style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}
                    />
                  </button>

                  {/* Endpoints */}
                  {isExpanded && (
                    <div className="border-t" style={{ borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
                      {section.endpoints.map((endpoint, idx) => (
                        <div 
                          key={idx}
                          className="p-5 border-b last:border-b-0"
                          style={{ borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span 
                                className="px-2 py-1 rounded text-[11px] font-mono"
                                style={{ 
                                  background: `${methodColors[endpoint.method]}20`,
                                  color: methodColors[endpoint.method],
                                  fontWeight: 600
                                }}
                              >
                                {endpoint.method}
                              </span>
                              <code 
                                className="text-[13px] font-mono"
                                style={{ color: isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.8)" }}
                              >
                                {endpoint.path}
                              </code>
                            </div>
                            <button
                              onClick={() => copyToClipboard(`${endpoint.method} ${endpoint.path}`, `${endpoint.method}-${endpoint.path}`)}
                              className="p-2 rounded-lg transition-all"
                              style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}
                            >
                              {copiedEndpoint === `${endpoint.method}-${endpoint.path}` ? (
                                <Check size={14} style={{ color: "#22c55e" }} />
                              ) : (
                                <Copy size={14} style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }} />
                              )}
                            </button>
                          </div>
                          
                          <h4 className="text-[14px] mb-1" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "#fff" : "#0a0a0a" }}>
                            {endpoint.summary}
                          </h4>
                          {endpoint.description && (
                            <p className="text-[12px] mb-3" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
                              {endpoint.description}
                            </p>
                          )}

                          {/* Request Body */}
                          {endpoint.requestBody && (
                            <div className="mt-3">
                              <div className="text-[11px] uppercase tracking-wider mb-2" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}>
                                Request Body
                              </div>
                              <pre 
                                className="p-3 rounded-xl overflow-x-auto text-[12px]"
                                style={{ 
                                  background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                                  fontFamily: "monospace",
                                  color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)"
                                }}
                              >
                                {JSON.stringify(endpoint.requestBody, null, 2)}
                              </pre>
                            </div>
                          )}

                          {/* Response */}
                          {endpoint.response && (
                            <div className="mt-3">
                              <div className="text-[11px] uppercase tracking-wider mb-2" style={{ fontFamily: HF, fontWeight: 300, color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}>
                                Response
                              </div>
                              <pre 
                                className="p-3 rounded-xl overflow-x-auto text-[12px]"
                                style={{ 
                                  background: isDark ? "rgba(34,197,94,0.1)" : "rgba(34,197,94,0.1)",
                                  fontFamily: "monospace",
                                  color: isDark ? "#22c55e" : "#22c55e"
                                }}
                              >
                                {typeof endpoint.response === 'string' 
                                  ? endpoint.response 
                                  : JSON.stringify(endpoint.response, null, 2)
                                }
                              </pre>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
