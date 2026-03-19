"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SDKErrorsPage() {
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
        <h1 className="text-4xl font-bold tracking-tight">Error Handling</h1>
        <p className="text-xl text-muted-foreground">
          Handle errors and exceptions in the Pipeline Labs SDK
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Exception Types
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Python SDK</h3>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`from pipeline_labs import PipelineClient
from pipeline_labs.exceptions import (
    AuthenticationError,
    NotFoundError,
    RateLimitError,
    ValidationError,
    ServerError
)

client = PipelineClient(api_key="your_api_key")

try:
    repo = client.repos.get(repo_id="invalid-id")
except AuthenticationError as e:
    print(f"Auth failed: {e.message}")
except NotFoundError as e:
    print(f"Not found: {e.message}")
except RateLimitError as e:
    print(f"Rate limited. Retry after: {e.retry_after} seconds")
except ValidationError as e:
    print(f"Validation error: {e.message}")
    print(f"Errors: {e.errors}")
except ServerError as e:
    print(f"Server error: {e.message}")`}</code>
              </pre>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => copyCode(`try: client.repos.get(repo_id="id") except NotFoundError: pass`)}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Error Types</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <code className="bg-muted px-1 rounded">AuthenticationError</code>
                <p className="text-muted-foreground mt-1">Invalid or missing API key (HTTP 401)</p>
              </li>
              <li>
                <code className="bg-muted px-1 rounded">NotFoundError</code>
                <p className="text-muted-foreground mt-1">Resource not found (HTTP 404)</p>
              </li>
              <li>
                <code className="bg-muted px-1 rounded">RateLimitError</code>
                <p className="text-muted-foreground mt-1">Too many requests (HTTP 429)</p>
              </li>
              <li>
                <code className="bg-muted px-1 rounded">ValidationError</code>
                <p className="text-muted-foreground mt-1">Invalid request data (HTTP 422)</p>
              </li>
              <li>
                <code className="bg-muted px-1 rounded">ServerError</code>
                <p className="text-muted-foreground mt-1">Internal server error (HTTP 500)</p>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
