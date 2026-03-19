"use client";

import React from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  Book, 
  Code, 
  Terminal, 
  Zap,
  Shield,
  CheckCircle,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function DocsPage() {
  const [copied, setCopied] = React.useState(false);

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="space-y-4">
        <Badge variant="secondary" className="text-xs">Documentation v1.0</Badge>
        <h1 className="text-4xl font-bold tracking-tight">Pipeline Labs Documentation</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Build, deploy, and scale your applications with AI-powered DevOps automation. 
          Deploy to Vercel and Render with zero configuration.
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/docs/installation">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader className="pb-3">
              <Terminal className="h-5 w-5 text-primary mb-2" />
              <CardTitle className="text-lg">Installation</CardTitle>
              <CardDescription>Get started with our Python SDK</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-primary">
                <span>pip install pipeline_labs</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/docs/quickstart">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader className="pb-3">
              <Zap className="h-5 w-5 text-primary mb-2" />
              <CardTitle className="text-lg">Quick Start</CardTitle>
              <CardDescription>Deploy your first app in 5 minutes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-primary">
                Start building
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/docs/api-keys">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader className="pb-3">
              <Shield className="h-5 w-5 text-primary mb-2" />
              <CardTitle className="text-lg">API Keys</CardTitle>
              <CardDescription>Authenticate and secure your requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-primary">
                Learn more
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* SDK Installation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            SDK Installation
          </CardTitle>
          <CardDescription>
            Install our official Python SDK to interact with the Pipeline Labs API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="pip" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="pip">pip</TabsTrigger>
              <TabsTrigger value="poetry">Poetry</TabsTrigger>
              <TabsTrigger value="conda">Conda</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pip" className="mt-4">
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm">pip install pipeline_labs</code>
                </pre>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => copyCommand("pip install pipeline_labs")}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="poetry" className="mt-4">
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm">poetry add pipeline_labs</code>
                </pre>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => copyCommand("poetry add pipeline_labs")}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="conda" className="mt-4">
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm">conda install -c conda-forge pipeline_labs</code>
                </pre>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => copyCommand("conda install -c conda-forge pipeline_labs")}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-4">
            <h3 className="font-semibold">Quick Start Example</h3>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`from pipeline_labs import PipelineClient

# Initialize client with your API key
client = PipelineClient(api_key="your_api_key")

# Connect a repository
repo = client.repos.connect(
    repo_url="https://github.com/username/repo",
    provider="github"
)

# Analyze the repository
analysis = client.repos.analyze(repo_id=repo.id)
print(f"Detected {len(analysis.services)} services")

# Deploy all services
for service in analysis.services:
    deployment = client.deployments.create(
        repo_id=repo.id,
        service_name=service.name,
        platform=service.recommended_platform
    )
    print(f"Deploying {service.name} to {deployment.url}")`}</code>
              </pre>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => copyCommand(`from pipeline_labs import PipelineClient

client = PipelineClient(api_key="your_api_key")
repo = client.repos.connect(repo_url="https://github.com/username/repo")
analysis = client.repos.analyze(repo_id=repo.id)
deployment = client.deployments.create(repo_id=repo.id, service_name="app")`)}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Core Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <CardTitle className="text-lg">AI-Powered Analysis</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Automatically detect frameworks, services, and dependencies in your repository.
                Supports Next.js, React, Python, Go, and more.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <CardTitle className="text-lg">Multi-Platform Deploy</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Deploy frontend apps to Vercel and backend services to Render.
                Zero configuration required.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <CardTitle className="text-lg">Auto Error Fixing</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                When deployments fail, our AI agent analyzes logs, suggests fixes,
                and can automatically apply patches to your repository.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <CardTitle className="text-lg">Real-time Progress</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Track deployment progress with live updates via Server-Sent Events.
                See exactly what's happening at each step.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* API Reference Link */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="flex items-center justify-between p-6">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">API Reference</h3>
            <p className="text-sm text-muted-foreground">
              Explore the complete API documentation with interactive examples
            </p>
          </div>
          <Link href="/docs/api">
            <Button>
              View API Docs
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Support Section */}
      <div className="border-t pt-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-semibold">Need Help?</h3>
            <p className="text-sm text-muted-foreground">
              Can't find what you're looking for? Contact our support team.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <a href="mailto:ahmadjamildhami@gmail.com">Contact Support</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="https://github.com/Ahmadjamil888/pipeline_labs" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
