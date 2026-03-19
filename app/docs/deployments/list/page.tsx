"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LayoutGrid, Copy, Check, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ListDeploymentsPage() {
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
        <h1 className="text-4xl font-bold tracking-tight">List Deployments</h1>
        <p className="text-xl text-muted-foreground">
          Get a list of all your deployments
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5" />
            GET /deployments
          </CardTitle>
          <CardDescription>List all deployments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Python SDK</h3>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`from pipeline_labs import PipelineClient

client = PipelineClient(api_key="your_api_key")

# List all deployments
deployments = client.deployments.list()

# Or filter by repository
deployments = client.deployments.list(
    repo_id="550e8400-e29b-41d4-a716-446655440000",
    status="running"
)

for deployment in deployments:
    print(f"{deployment.service_name}: {deployment.status}")
    if deployment.url:
        print(f"  URL: {deployment.url}")`}</code>
              </pre>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => copyCode(`deployments = client.deployments.list()`)}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Query Parameters</h3>
            <ul className="space-y-2 text-sm">
              <li><code className="bg-muted px-1 rounded">repo_id</code> - Filter by repository ID</li>
              <li><code className="bg-muted px-1 rounded">status</code> - Filter by status: planned, running, completed, failed, cancelled</li>
              <li><code className="bg-muted px-1 rounded">platform</code> - Filter by platform: vercel, render</li>
              <li><code className="bg-muted px-1 rounded">limit</code> - Number of results (default: 20, max: 100)</li>
              <li><code className="bg-muted px-1 rounded">offset</code> - Pagination offset</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Response</h3>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`{
  "deployments": [
    {
      "id": "deploy-550e8400",
      "repo_id": "550e8400-e29b-41d4-a716-446655440000",
      "service_name": "frontend",
      "platform": "vercel",
      "environment": "production",
      "status": "running",
      "url": "https://my-app-abc123.vercel.app",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 5,
  "limit": 20,
  "offset": 0
}`}</code>
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
