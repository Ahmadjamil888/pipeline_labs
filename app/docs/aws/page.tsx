"use client";

import { motion } from "framer-motion";
import { Globe, Server, Cpu } from "lucide-react";

export default function DocsAWS() {
    return (
        <div className="space-y-16 animate-in fade-in duration-700">
            <div className="space-y-4">
                <h1 className="text-5xl font-medium tracking-tight">AWS Integration</h1>
                <p className="text-xl text-zinc-500 leading-relaxed font-normal">
                    Native connectivity for SageMaker, EC2, and S3 resources.
                </p>
            </div>

            <div className="prose prose-invert max-w-none">
                <p>
                    Pipeline integrates directly with your AWS account. By specifying your AWS credentials or using IAM roles,
                    Pipeline can seamlessly provision A100/H100 instances and manage S3-based weights.
                </p>

                <h2 className="text-2xl font-medium text-white mt-12 mb-6">Setup IAM Roles</h2>
                <p className="text-zinc-400">
                    For the most secure integration, create a Cross-Account IAM role that allows Pipeline to launch EC2 instances
                    within a specific subnet.
                </p>
                <div className="bg-[#0e0e0e] border border-[#1a1a1a] rounded-xl p-6 font-mono text-xs text-zinc-500">
                    {`{\n  "Version": "2012-10-17",\n  "Statement": [\n    {\n      "Effect": "Allow",\n      "Action": "ec2:RunInstances",\n      "Resource": "*"\n    }\n  ]\n}`}
                </div>
            </div>
        </div>
    );
}
