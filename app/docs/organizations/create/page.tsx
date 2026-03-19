"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Copy, Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CreateOrgPage() {
  const [copied, setCopied] = React.useState(false);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Badge variant="secondary">Organizations</Badge>
        <h1 className="text-4xl font-bold tracking-tight">Create Organization</h1>
        <p className="text-xl text-muted-foreground">
          Create a new organization to manage teams and projects
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            POST /organizations
          </CardTitle>
          <CardDescription>Create a new organization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Python SDK</h3>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`from pipeline_labs import PipelineClient

client = PipelineClient(api_key="your_api_key")

# Create organization
org = client.organizations.create(
    name="Acme Corp",
    slug="acme-corp",
    description="Building the future"
)

print(f"Organization ID: {org.id}")
print(f"Slug: {org.slug}")`}</code>
              </pre>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => copyCode(`org = client.organizations.create(name="Acme Corp", slug="acme-corp")`)}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">HTTP Request</h3>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`POST /api/v1/organizations
Content-Type: application/json
Authorization: Bearer your_api_key

{
  "name": "Acme Corp",
  "slug": "acme-corp",
  "description": "Building the future"
}`}</code>
              </pre>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Response</h3>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`{
  "id": "org-550e8400",
  "name": "Acme Corp",
  "slug": "acme-corp",
  "description": "Building the future",
  "owner_id": "user-uuid",
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
