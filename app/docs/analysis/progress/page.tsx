"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AnalysisProgressPage() {
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
        <h1 className="text-4xl font-bold tracking-tight">Analysis Progress</h1>
        <p className="text-xl text-muted-foreground">
          Track real-time AI analysis progress with Server-Sent Events
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            GET /analysis/{"{"}analysis_id{"}"}/progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Streaming Progress (Python)</h3>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`from pipeline_labs import PipelineClient

client = PipelineClient(api_key="your_api_key")

# Stream progress updates in real-time
for update in client.analysis.get_progress("analysis-uuid"):
    print(f"Step: {update.step}")
    print(f"Status: {update.status}")
    print(f"Progress: {update.progress}%")
    if update.message:
        print(f"Message: {update.message}")
    
    if update.status == "completed":
        print("Analysis complete!")
        break`}</code>
              </pre>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => copyCode(`for update in client.analysis.get_progress("id"): print(update.progress)`)}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Response Format</h3>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`{
  "analysis_id": "analysis-550e8400",
  "step": "deep_analyzer",
  "status": "running",
  "progress": 65,
  "message": "Analyzing backend service dependencies...",
  "timestamp": "2024-01-15T10:30:00Z"
}`}</code>
              </pre>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Analysis Steps</h3>
            <ul className="space-y-2 text-sm">
              <li><code className="bg-muted px-1 rounded">repo_scanner</code> - Scanning repository structure</li>
              <li><code className="bg-muted px-1 rounded">deep_analyzer</code> - Analyzing code and dependencies</li>
              <li><code className="bg-muted px-1 rounded">deployment_planner</code> - Creating deployment plan</li>
              <li><code className="bg-muted px-1 rounded">validation</code> - Validating results</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
