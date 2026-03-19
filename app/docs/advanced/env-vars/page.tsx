"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EnvVarsPage() {
  const [copied, setCopied] = React.useState(false);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Badge variant="secondary">Advanced</Badge>
        <h1 className="text-4xl font-bold tracking-tight">Environment Variables</h1>
        <p className="text-xl text-muted-foreground">
          Manage environment variables for your deployments
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Managing Environment Variables
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Python SDK</h3>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`from pipeline_labs import PipelineClient

client = PipelineClient(api_key="your_api_key")

# Set environment variables for a deployment
deployment = client.deployments.create(
    repo_id="repo-uuid",
    service_name="backend",
    platform="render",
    env_vars={
        "DATABASE_URL": "postgresql://user:pass@host/db",
        "API_SECRET_KEY": "secret-value",
        "DEBUG": "false"
    }
)`}</code>
              </pre>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => copyCode(`env_vars={"KEY": "value"}`)}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Best Practices</h3>
            <ul className="space-y-2 text-sm">
              <li>Never commit secrets to your repository</li>
              <li>Use different values for production and development</li>
              <li>Rotate secrets regularly</li>
              <li>Use strong, unique values for API keys and passwords</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
