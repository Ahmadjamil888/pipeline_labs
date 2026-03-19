"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Copy, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SDKAuthPage() {
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
        <h1 className="text-4xl font-bold tracking-tight">Authentication</h1>
        <p className="text-xl text-muted-foreground">
          Learn how to authenticate with the Pipeline Labs API using the SDK
        </p>
      </div>

      <Alert className="border-blue-500/50 bg-blue-500/10">
        <Shield className="h-4 w-4" />
        <AlertTitle>API Key Required</AlertTitle>
        <AlertDescription>
          All API requests require a valid API key. Get yours from the dashboard settings.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Initializing with API Key</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
              <code>{`from pipeline_labs import PipelineClient

# Direct API key
client = PipelineClient(api_key="pl_live_xxxxx")

# From environment variable (recommended)
import os
client = PipelineClient(api_key=os.environ["PIPELINE_API_KEY"])`}</code>
            </pre>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => copyCode(`from pipeline_labs import PipelineClient
import os
client = PipelineClient(api_key=os.environ["PIPELINE_API_KEY"])`)}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">The SDK automatically reads from these environment variables:</p>
          <ul className="space-y-2 list-disc list-inside text-sm">
            <li><code className="bg-muted px-1 py-0.5 rounded">PIPELINE_API_KEY</code> - Your API key</li>
            <li><code className="bg-muted px-1 py-0.5 rounded">PIPELINE_BASE_URL</code> - API base URL (optional)</li>
          </ul>
          
          <div className="relative mt-4">
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
              <code>{`# .env file
PIPELINE_API_KEY=pl_live_xxxxx
PIPELINE_BASE_URL=https://api.pipelinelabs.io/v1`}</code>
            </pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Authentication Errors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">401 Unauthorized</h3>
              <p className="text-sm text-muted-foreground">Invalid or missing API key</p>
            </div>
            <div>
              <h3 className="font-semibold">403 Forbidden</h3>
              <p className="text-sm text-muted-foreground">API key valid but insufficient permissions</p>
            </div>
            <div>
              <h3 className="font-semibold">429 Too Many Requests</h3>
              <p className="text-sm text-muted-foreground">Rate limit exceeded</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
