"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Copy, Check, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BillingPlansPage() {
  const [copied, setCopied] = React.useState(false);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Badge variant="secondary">Billing</Badge>
        <h1 className="text-4xl font-bold tracking-tight">Plans</h1>
        <p className="text-xl text-muted-foreground">
          View available subscription plans and pricing
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5" />
            GET /billing/plans
          </CardTitle>
          <CardDescription>List all available plans</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Python SDK</h3>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`from pipeline_labs import PipelineClient

client = PipelineClient(api_key="your_api_key")

# Get all plans
plans = client.billing.get_plans()

for plan in plans:
    print(f"{plan.name}: ${plan.price}/month")
    print(f"  Features: {', '.join(plan.features)}")`}</code>
              </pre>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => copyCode(`plans = client.billing.get_plans()`)}
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
  "plans": [
    {
      "id": "free",
      "name": "Free",
      "price": 0,
      "features": [
        "3 projects",
        "1 organization",
        "Community support"
      ],
      "projects_limit": 3,
      "orgs_limit": 1
    },
    {
      "id": "pro",
      "name": "Pro",
      "price": 29,
      "price_id": "price_xxx",
      "features": [
        "50 projects",
        "10 organizations",
        "Priority support",
        "Advanced analytics"
      ],
      "projects_limit": 50,
      "orgs_limit": 10
    },
    {
      "id": "team",
      "name": "Team",
      "price": 99,
      "price_id": "price_yyy",
      "features": [
        "Unlimited projects",
        "Unlimited organizations",
        "Dedicated support",
        "SSO",
        "SLA"
      ],
      "projects_limit": -1,
      "orgs_limit": -1
    }
  ]
}`}</code>
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
