"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scan, Copy, Check, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AnalyzeRepoPage() {
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
        <h1 className="text-4xl font-bold tracking-tight">Analyze Repository</h1>
        <p className="text-xl text-muted-foreground">
          Use AI to analyze your repository structure and detect services
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            POST /repos/{"{"}repo_id{"}"}/analyze
          </CardTitle>
          <CardDescription>Start AI analysis of a connected repository</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Python SDK</h3>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`from pipeline_labs import PipelineClient

client = PipelineClient(api_key="your_api_key")

# Start analysis
analysis = client.repos.analyze(repo_id="550e8400-e29b-41d4-a716-446655440000")

print(f"Analysis ID: {analysis.id}")
print(f"Status: {analysis.status}")
print(f"Services found: {len(analysis.services)}")`}</code>
              </pre>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => copyCode(`analysis = client.repos.analyze(repo_id="repo-uuid")`)}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">HTTP Request</h3>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`POST /api/v1/repos/{repo_id}/analyze
Content-Type: application/json
Authorization: Bearer your_api_key`}</code>
              </pre>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Response</h3>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`{
  "id": "analysis-uuid",
  "repo_id": "repo-uuid",
  "status": "completed",
  "services": [
    {
      "name": "frontend",
      "framework": "nextjs",
      "path": "frontend/",
      "language": "typescript",
      "recommended_platform": "vercel",
      "build_command": "npm run build",
      "start_command": "npm start"
    },
    {
      "name": "backend",
      "framework": "fastapi",
      "path": "backend/",
      "language": "python",
      "recommended_platform": "render",
      "build_command": null,
      "start_command": "uvicorn main:app"
    }
  ],
  "is_monorepo": true,
  "analyzed_at": "2024-01-15T10:30:00Z"
}`}</code>
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-time Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Track analysis progress in real-time using Server-Sent Events (SSE)
          </p>
          <div className="relative">
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
              <code>{`# Stream progress updates
for update in client.repos.get_analysis_progress(analysis_id="analysis-uuid"):
    print(f"Step: {update.step}")
    print(f"Status: {update.status}")
    print(f"Progress: {update.progress}%")
    if update.message:
        print(f"Message: {update.message}")`}</code>
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
