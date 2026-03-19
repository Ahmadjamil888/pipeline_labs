"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Boxes, Copy, Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CreateProjectPage() {
  const [copied, setCopied] = React.useState(false);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Badge variant="secondary">Projects</Badge>
        <h1 className="text-4xl font-bold tracking-tight">Create Project</h1>
        <p className="text-xl text-muted-foreground">
          Create a new project within an organization
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            POST /projects
          </CardTitle>
          <CardDescription>Create a new project</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Python SDK</h3>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`from pipeline_labs import PipelineClient

client = PipelineClient(api_key="your_api_key")

# Create project
project = client.projects.create(
    name="Web Application",
    description="Customer-facing web app",
    org_id="org-550e8400",
    repo_url="https://github.com/username/web-app"
)

print(f"Project ID: {project.id}")
print(f"Created: {project.created_at}")`}</code>
              </pre>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => copyCode(`project = client.projects.create(name="Web App", org_id="org-uuid")`)}
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
  "id": "proj-550e8400",
  "name": "Web Application",
  "description": "Customer-facing web app",
  "org_id": "org-550e8400",
  "repo_url": "https://github.com/username/web-app",
  "status": "active",
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
