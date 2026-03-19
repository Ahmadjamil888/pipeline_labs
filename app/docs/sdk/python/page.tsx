"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Terminal, Copy, Check, Code, GitBranch, Rocket, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function PythonSDKPage() {
  const [copied, setCopied] = React.useState(false);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Badge variant="secondary">SDK Reference</Badge>
        <h1 className="text-4xl font-bold tracking-tight">Python SDK</h1>
        <p className="text-xl text-muted-foreground">
          Complete reference for the pipeline_labs Python SDK
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Installation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
              <code className="text-sm">pip install pipeline_labs</code>
            </pre>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => copyCode("pip install pipeline_labs")}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>PipelineClient</CardTitle>
          <CardDescription>Main client class for interacting with the API</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
              <code>{`from pipeline_labs import PipelineClient

# Initialize client
client = PipelineClient(api_key="your_api_key")

# Or with custom base URL
client = PipelineClient(
    api_key="your_api_key",
    base_url="https://api.pipelinelabs.io/v1"
)`}</code>
            </pre>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => copyCode(`from pipeline_labs import PipelineClient
client = PipelineClient(api_key="your_api_key")`)}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parameter</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Required</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono">api_key</TableCell>
                <TableCell>str</TableCell>
                <TableCell>Yes</TableCell>
                <TableCell>Your Pipeline Labs API key</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono">base_url</TableCell>
                <TableCell>str</TableCell>
                <TableCell>No</TableCell>
                <TableCell>API base URL (default: https://api.pipelinelabs.io/v1)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono">timeout</TableCell>
                <TableCell>int</TableCell>
                <TableCell>No</TableCell>
                <TableCell>Request timeout in seconds (default: 30)</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Repositories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">client.repos.connect()</h3>
            <p className="text-sm text-muted-foreground mb-3">Connect a Git repository to Pipeline Labs</p>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`repo = client.repos.connect(
    repo_url="https://github.com/username/repo",
    provider="github",
    branch="main",
    name="my-app"
)`}</code>
              </pre>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">client.repos.list()</h3>
            <p className="text-sm text-muted-foreground mb-3">List all connected repositories</p>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`repos = client.repos.list()
for repo in repos:
    print(f"{repo.name}: {repo.status}")`}</code>
              </pre>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">client.repos.analyze()</h3>
            <p className="text-sm text-muted-foreground mb-3">Analyze repository structure with AI</p>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`analysis = client.repos.analyze(repo_id="repo-uuid")
print(f"Detected {len(analysis.services)} services")
for service in analysis.services:
    print(f"  - {service.name}: {service.framework}")`}</code>
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">client.analysis.start()</h3>
            <p className="text-sm text-muted-foreground mb-3">Start AI analysis of a repository</p>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`analysis = client.analysis.start(
    repo_id="repo-uuid",
    options={"deep_scan": True}
)`}</code>
              </pre>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">client.analysis.get_progress()</h3>
            <p className="text-sm text-muted-foreground mb-3">Get real-time analysis progress</p>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`# Stream progress updates
for update in client.analysis.get_progress(analysis_id="analysis-uuid"):
    print(f"{update.step}: {update.status} ({update.progress}%)")`}</code>
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Deployments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">client.deployments.create()</h3>
            <p className="text-sm text-muted-foreground mb-3">Create a new deployment</p>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`deployment = client.deployments.create(
    repo_id="repo-uuid",
    service_name="frontend",
    platform="vercel",
    environment="production",
    env_vars={"API_URL": "https://api.example.com"}
)`}</code>
              </pre>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">client.deployments.list()</h3>
            <p className="text-sm text-muted-foreground mb-3">List deployments for a repository</p>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`deployments = client.deployments.list(
    repo_id="repo-uuid",
    status="running"
)`}</code>
              </pre>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">client.deployments.get()</h3>
            <p className="text-sm text-muted-foreground mb-3">Get deployment details and status</p>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`deployment = client.deployments.get(deployment_id="deploy-uuid")
print(f"Status: {deployment.status}")
print(f"URL: {deployment.url}")`}</code>
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
