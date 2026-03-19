"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight, Terminal, Zap, Shield, Rocket } from "lucide-react";
import Link from "next/link";

export default function QuickStartPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Badge variant="secondary">Getting Started</Badge>
        <h1 className="text-4xl font-bold tracking-tight">Quick Start</h1>
        <p className="text-xl text-muted-foreground">
          Deploy your first application in 5 minutes with Pipeline Labs.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold">1</span>
              </div>
              <div>
                <CardTitle>Install the SDK</CardTitle>
                <CardDescription>Install our Python SDK to interact with the API</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
              <code className="text-sm">pip install pipeline_labs</code>
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold">2</span>
              </div>
              <div>
                <CardTitle>Get Your API Key</CardTitle>
                <CardDescription>Create an API key from your dashboard</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Go to your dashboard settings and generate a new API key. Store it securely - you'll need it for all API requests.
            </p>
            <Link href="/dashboard/settings">
              <Button variant="outline">
                Go to Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold">3</span>
              </div>
              <div>
                <CardTitle>Connect Your Repository</CardTitle>
                <CardDescription>Link your GitHub repository to Pipeline Labs</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
              <code>{`from pipeline_labs import PipelineClient

client = PipelineClient(api_key="your_api_key")

# Connect a GitHub repository
repo = client.repos.connect(
    repo_url="https://github.com/username/my-app",
    provider="github",
    branch="main"
)

print(f"Connected: {repo.name}")`}</code>
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold">4</span>
              </div>
              <div>
                <CardTitle>Analyze & Deploy</CardTitle>
                <CardDescription>Let AI analyze your repo and deploy automatically</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
              <code>{`# Analyze the repository with AI
analysis = client.repos.analyze(repo_id=repo.id)

# Deploy all detected services
for service in analysis.services:
    deployment = client.deployments.create(
        repo_id=repo.id,
        service_name=service.name,
        platform=service.recommended_platform
    )
    print(f"Deployed {service.name} to {deployment.url}")`}</code>
            </pre>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5" />
              That's it!
            </CardTitle>
            <CardDescription>
              Your application is now deployed. Visit the dashboard to monitor progress and view deployment details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Link href="/docs/installation">
                <Button variant="outline">View Installation Guide</Button>
              </Link>
              <Link href="/docs/api-keys">
                <Button variant="outline">Learn About API Keys</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
