"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Copy, Check, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StartAnalysisPage() {
  const [copied, setCopied] = React.useState(false);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Badge variant="secondary">AI Analysis</Badge>
        <h1 className="text-4xl font-bold tracking-tight">Start Analysis</h1>
        <p className="text-xl text-muted-foreground">
          Trigger AI analysis of your repository structure
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            POST /analysis/start
          </CardTitle>
          <CardDescription>Start AI analysis on a repository</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Python SDK</h3>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`from pipeline_labs import PipelineClient

client = PipelineClient(api_key="your_api_key")

# Start analysis
analysis = client.analysis.start(
    repo_id="550e8400-e29b-41d4-a716-446655440000",
    options={
        "deep_scan": True,
        "include_dependencies": True
    }
)

print(f"Analysis ID: {analysis.id}")
print(f"Status: {analysis.status}")`}</code>
              </pre>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => copyCode(`analysis = client.analysis.start(repo_id="repo-uuid")`)}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">HTTP Request</h3>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`POST /api/v1/analysis/start
Content-Type: application/json
Authorization: Bearer your_api_key

{
  "repo_id": "550e8400-e29b-41d4-a716-446655440000",
  "options": {
    "deep_scan": true
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
  "id": "analysis-550e8400",
  "repo_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "running",
  "progress": 0,
  "started_at": "2024-01-15T10:30:00Z"
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
            Analysis Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            The AI analysis runs through multiple stages:
          </p>
          <ol className="space-y-2 list-decimal list-inside text-sm">
            <li><strong>Repo Scanner</strong> - Detects file structure and frameworks</li>
            <li><strong>Deep Analyzer</strong> - Reads code to find dependencies and configs</li>
            <li><strong>Deployment Planner</strong> - Creates deployment strategy</li>
            <li><strong>Validation</strong> - Validates the analysis results</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
