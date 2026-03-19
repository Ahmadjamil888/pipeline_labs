"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RateLimitsPage() {
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
        <h1 className="text-4xl font-bold tracking-tight">Rate Limiting</h1>
        <p className="text-xl text-muted-foreground">
          Understand API rate limits and how to handle them
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Rate Limits by Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold">Free Plan</h3>
              <p className="text-sm text-muted-foreground">100 requests per minute</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold">Pro Plan</h3>
              <p className="text-sm text-muted-foreground">1,000 requests per minute</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold">Team Plan</h3>
              <p className="text-sm text-muted-foreground">10,000 requests per minute</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Handling Rate Limits</h3>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`from pipeline_labs import PipelineClient
from pipeline_labs.exceptions import RateLimitError
import time

client = PipelineClient(api_key="your_api_key")

def make_request_with_retry():
    max_retries = 3
    for attempt in range(max_retries):
        try:
            return client.repos.list()
        except RateLimitError as e:
            if attempt < max_retries - 1:
                print(f"Rate limited. Waiting {e.retry_after} seconds...")
                time.sleep(e.retry_after)
            else:
                raise`}</code>
              </pre>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => copyCode(`except RateLimitError as e: time.sleep(e.retry_after)`)}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
