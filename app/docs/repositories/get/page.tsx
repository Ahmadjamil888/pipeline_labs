"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GetRepoPage() {
  const [copied, setCopied] = React.useState(false);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Badge variant="secondary">Repositories</Badge>
        <h1 className="text-4xl font-bold tracking-tight">Get Repository</h1>
        <p className="text-xl text-muted-foreground">
          Get details of a specific repository
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            GET /repos/{"{"}repo_id{"}"}
          </CardTitle>
          <CardDescription>Get repository details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Python SDK</h3>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`from pipeline_labs import PipelineClient

client = PipelineClient(api_key="your_api_key")

# Get repository details
repo = client.repos.get(repo_id="550e8400-e29b-41d4-a716-446655440000")

print(f"Name: {repo.name}")
print(f"Status: {repo.status}")
print(f"Created: {repo.created_at}")`}</code>
              </pre>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => copyCode(`repo = client.repos.get(repo_id="repo-uuid")`)}
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
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "my-app",
  "repo_url": "https://github.com/username/my-app",
  "provider": "github",
  "branch": "main",
  "status": "connected",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}`}</code>
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
