"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GitHubWebhookPage() {
  const [copied, setCopied] = React.useState(false);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Badge variant="secondary">Webhooks</Badge>
        <h1 className="text-4xl font-bold tracking-tight">GitHub App Webhook</h1>
        <p className="text-xl text-muted-foreground">
          Handle GitHub App installation and push events
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            POST /webhooks/github
          </CardTitle>
          <CardDescription>GitHub App webhook endpoint</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Overview</h3>
            <p className="text-muted-foreground text-sm">
              This endpoint receives webhook events from the GitHub App. It handles installation events (when a user installs the app) and push events (when code is pushed to a connected repository).
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">HTTP Request</h3>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`POST /api/v1/webhooks/github
Content-Type: application/json
X-GitHub-Event: installation
X-Hub-Signature-256: sha256=xxx

{
  "action": "created",
  "installation": {
    "id": 123456,
    "account": {
      "login": "username",
      "id": 123
    }
  },
  "repositories": [
    {
      "id": 789,
      "name": "repo-name",
      "full_name": "username/repo-name"
    }
  ]
}`}</code>
              </pre>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Events</h3>
            <ul className="space-y-2 text-sm">
              <li><code className="bg-muted px-1 rounded">installation.created</code> - App was installed</li>
              <li><code className="bg-muted px-1 rounded">installation.deleted</code> - App was uninstalled</li>
              <li><code className="bg-muted px-1 rounded">push</code> - Code was pushed to repository</li>
              <li><code className="bg-muted px-1 rounded">pull_request</code> - Pull request opened/updated</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
