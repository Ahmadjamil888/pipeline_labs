"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Copy, Check, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SecurityPage() {
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
        <h1 className="text-4xl font-bold tracking-tight">Security</h1>
        <p className="text-xl text-muted-foreground">
          Security best practices and features
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold flex items-center gap-2">
                <Lock className="h-4 w-4" />
                API Key Security
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                API keys are encrypted at rest and never exposed in logs or error messages.
                Rotate keys regularly and use environment variables.
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold">HTTPS Only</h3>
              <p className="text-sm text-muted-foreground mt-1">
                All API communications use TLS 1.3 encryption. Plain HTTP requests are rejected.
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold">Webhook Verification</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Webhooks include HMAC signatures for verification. Always validate signatures.
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Verifying Webhook Signatures</h3>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`import hmac
import hashlib

def verify_webhook(payload, signature, secret):
    expected = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(f"sha256={expected}", signature)`}</code>
              </pre>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => copyCode(`hmac.compare_digest(expected, signature)`)}
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
