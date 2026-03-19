"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket, Copy, Check, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CreateDeploymentPage() {
  const [copied, setCopied] = React.useState(false);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Badge variant="secondary">Deployments</Badge>
        <h1 className="text-4xl font-bold tracking-tight">Create Deployment</h1>
        <p className="text-xl text-muted-foreground">
          Deploy your application to Vercel or Render
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            POST /deployments
          </CardTitle>
          <CardDescription>Create a new deployment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Python SDK</h3>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`from pipeline_labs import PipelineClient

client = PipelineClient(api_key="your_api_key")

# Create deployment
deployment = client.deployments.create(
    repo_id="550e8400-e29b-41d4-a716-446655440000",
    service_name="frontend",
    platform="vercel",
    environment="production",
    branch="main",
    env_vars={
        "API_URL": "https://api.example.com",
        "NEXT_PUBLIC_APP_NAME": "My App"
    }
)

print(f"Deployment ID: {deployment.id}")
print(f"Status: {deployment.status}")
print(f"URL: {deployment.url}")`}</code>
              </pre>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => copyCode(`deployment = client.deployments.create(repo_id="repo-uuid", service_name="app")`)}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">HTTP Request</h3>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`POST /api/v1/deployments
Content-Type: application/json
Authorization: Bearer your_api_key

{
  "repo_id": "550e8400-e29b-41d4-a716-446655440000",
  "service_name": "frontend",
  "platform": "vercel",
  "environment": "production",
  "branch": "main",
  "env_vars": {
    "API_URL": "https://api.example.com"
  }
}`}</code>
              </pre>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Response</h3>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`{
  "id": "deploy-550e8400",
  "repo_id": "550e8400-e29b-41d4-a716-446655440000",
  "service_name": "frontend",
  "platform": "vercel",
  "environment": "production",
  "status": "planned",
  "url": null,
  "created_at": "2024-01-15T10:30:00Z"
}`}</code>
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Supported Platforms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li><code className="bg-muted px-1 rounded">vercel</code> - Frontend frameworks (Next.js, React, Vue, etc.)</li>
            <li><code className="bg-muted px-1 rounded">render</code> - Backend services (Node.js, Python, Go, etc.)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
