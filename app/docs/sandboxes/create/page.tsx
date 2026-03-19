"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, Copy, Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CreateSandboxPage() {
  const [copied, setCopied] = React.useState(false);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Badge variant="secondary">Sandboxes</Badge>
        <h1 className="text-4xl font-bold tracking-tight">Create Sandbox</h1>
        <p className="text-xl text-muted-foreground">
          Create isolated environments for testing and development
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            POST /sandboxes
          </CardTitle>
          <CardDescription>Create a new sandbox environment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Python SDK</h3>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`from pipeline_labs import PipelineClient

client = PipelineClient(api_key="your_api_key")

# Create sandbox
sandbox = client.sandboxes.create(
    repo_id="550e8400-e29b-41d4-a716-446655440000",
    branch="feature-branch",
    resources={
        "cpu_cores": 2,
        "memory_mb": 4096,
        "disk_gb": 20
    }
)

print(f"Sandbox ID: {sandbox.id}")
print(f"Status: {sandbox.status}")`}</code>
              </pre>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => copyCode(`sandbox = client.sandboxes.create(repo_id="repo-uuid")`)}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Response</h3>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`{
  "id": "sandbox-550e8400",
  "repo_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "creating",
  "workspace_url": "https://workspace.pipelinelabs.io/sandbox-550e8400",
  "resources": {
    "cpu_cores": 2,
    "memory_mb": 4096,
    "disk_gb": 20
  },
  "created_at": "2024-01-15T10:30:00Z"
}`}</code>
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
