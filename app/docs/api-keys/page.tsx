"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, Key, Shield, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function APIKeysPage() {
  const [copied, setCopied] = React.useState(false);
  const [showKey, setShowKey] = React.useState(false);

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Badge variant="secondary">Getting Started</Badge>
        <h1 className="text-4xl font-bold tracking-tight">API Keys</h1>
        <p className="text-xl text-muted-foreground">
          Learn how to create, manage, and use API keys to authenticate your requests.
        </p>
      </div>

      <Alert className="border-yellow-500/50 bg-yellow-500/10">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          Keep your API keys secure. Never share them in public repositories or client-side code.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Creating API Keys
          </CardTitle>
          <CardDescription>
            Generate API keys from your dashboard to authenticate API requests
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="space-y-4 list-decimal list-inside text-muted-foreground">
            <li>Log in to your <a href="/dashboard" className="text-primary underline">Pipeline Labs Dashboard</a></li>
            <li>Navigate to Settings → API Keys</li>
            <li>Click "Generate New Key"</li>
            <li>Give your key a descriptive name (e.g., "Production", "Development")</li>
            <li>Copy the key immediately - it won't be shown again</li>
          </ol>
          
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Example API Key format:</p>
            <code className="text-xs bg-background px-2 py-1 rounded">
              pl_live_51HG8w3K8Q1x9YzA2bCdEfGhIjKlMnOpQrStUvWxYz
            </code>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Using API Keys
          </CardTitle>
          <CardDescription>
            Include your API key in the Authorization header of all requests
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="python" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="python">Python SDK</TabsTrigger>
              <TabsTrigger value="curl">cURL</TabsTrigger>
              <TabsTrigger value="nodejs">Node.js</TabsTrigger>
            </TabsList>
            
            <TabsContent value="python" className="mt-4">
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{`from pipeline_labs import PipelineClient

# Initialize with your API key
client = PipelineClient(api_key="your_api_key")

# Or use environment variable
import os
client = PipelineClient(api_key=os.getenv("PIPELINE_API_KEY"))`}</code>
                </pre>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => copyCommand(`from pipeline_labs import PipelineClient
client = PipelineClient(api_key="your_api_key")`)}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="curl" className="mt-4">
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{`curl -X GET \\
  https://api.pipelinelabs.io/v1/repos \\
  -H "Authorization: Bearer your_api_key" \\
  -H "Content-Type: application/json"`}</code>
                </pre>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => copyCommand(`curl -X GET https://api.pipelinelabs.io/v1/repos -H "Authorization: Bearer your_api_key"`)}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="nodejs" className="mt-4">
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{`const axios = require('axios');

const client = axios.create({
  baseURL: 'https://api.pipelinelabs.io/v1',
  headers: {
    'Authorization': 'Bearer your_api_key',
    'Content-Type': 'application/json'
  }
});`}</code>
                </pre>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => copyCommand(`headers: { 'Authorization': 'Bearer your_api_key' }`)}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Best Practices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-0.5" />
              <span className="text-sm">Store API keys in environment variables, never in code</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-0.5" />
              <span className="text-sm">Use separate keys for development and production</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-0.5" />
              <span className="text-sm">Rotate keys regularly (every 90 days recommended)</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-0.5" />
              <span className="text-sm">Revoke keys immediately if compromised</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-0.5" />
              <span className="text-sm">Monitor API key usage in the dashboard</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Set your API key as an environment variable:
          </p>
          <div className="relative">
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
              <code>{`# .env file
PIPELINE_API_KEY=your_api_key_here

# Or export in terminal
export PIPELINE_API_KEY=your_api_key_here`}</code>
            </pre>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => copyCommand(`export PIPELINE_API_KEY=your_api_key_here`)}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
