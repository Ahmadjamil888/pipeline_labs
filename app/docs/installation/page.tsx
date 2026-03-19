"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Terminal, Package, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InstallationPage() {
  const [copied, setCopied] = React.useState(false);

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Badge variant="secondary">Getting Started</Badge>
        <h1 className="text-4xl font-bold tracking-tight">Installation</h1>
        <p className="text-xl text-muted-foreground">
          Install the Pipeline Labs Python SDK to start deploying applications.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Python SDK
          </CardTitle>
          <CardDescription>
            The official Python SDK for Pipeline Labs provides a simple interface to all API endpoints.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="pip" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="pip">pip</TabsTrigger>
              <TabsTrigger value="poetry">Poetry</TabsTrigger>
              <TabsTrigger value="conda">Conda</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pip" className="mt-4 space-y-4">
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm">pip install pipeline_labs</code>
                </pre>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => copyCommand("pip install pipeline_labs")}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Requires Python 3.8 or higher. The SDK will be installed along with all dependencies.
              </p>
            </TabsContent>
            
            <TabsContent value="poetry" className="mt-4 space-y-4">
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm">poetry add pipeline_labs</code>
                </pre>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => copyCommand("poetry add pipeline_labs")}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                If you use Poetry for dependency management, add the SDK to your pyproject.toml.
              </p>
            </TabsContent>
            
            <TabsContent value="conda" className="mt-4 space-y-4">
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm">conda install -c conda-forge pipeline_labs</code>
                </pre>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => copyCommand("conda install -c conda-forge pipeline_labs")}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Available on conda-forge for Conda users.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Requirements</CardTitle>
          <CardDescription>System requirements for using the SDK</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              Python 3.8 or higher
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              pip, poetry, or conda package manager
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              Internet connection for API access
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              Valid API key from Pipeline Labs
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Verify Installation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
              <code>{`# Verify the SDK is installed correctly
python -c "import pipeline_labs; print(pipeline_labs.__version__)"`}</code>
            </pre>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => copyCommand(`python -c "import pipeline_labs; print(pipeline_labs.__version__)"`)}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
