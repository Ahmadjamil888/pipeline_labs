"use client";

import { motion } from "framer-motion";
import { Cpu, Server, Zap, Shield } from "lucide-react";

export default function DocsClusters() {
    const features = [
        { title: "Dynamic Provisioning", desc: "Pipeline intelligently seeds your cluster with the exact CUDA environment required for your weights." },
        { title: "Auto-Migration", desc: "If an instance fails, Pipeline automatically migrates the training checkpoint to a healthy node." },
        { title: "Spot Instance Optimization", desc: "Reduce costs by up to 90% using our managed spot instance failover logic." },
        { title: "VPC Peering", desc: "Connect your existing VPC to Pipeline's compute fabric via high-speed private links." }
    ];

    return (
        <div className="space-y-16 animate-in fade-in duration-700">
            <div className="space-y-4">
                <h1 className="text-5xl font-medium tracking-tight">Clusters</h1>
                <p className="text-xl text-zinc-500 leading-relaxed font-normal">
                    Scalable, managed compute environments for high-performance AI workloads.
                </p>
            </div>

            <div className="prose prose-invert max-w-none">
                <p>
                    Pipeline Clusters are the primary compute unit in the ecosystem. Instead of managing individual Virtual Machines, you define your requirements in Python,
                    and our orchestration engine handles the lifecycle of the underlying hardware.
                </p>

                <h2 className="text-2xl font-medium text-white mt-12 mb-6">Execution Context</h2>
                <div className="bg-[#0e0e0e] border border-[#1a1a1a] rounded-2xl p-8 font-mono text-xs text-zinc-400">
                    {`cluster = pipeline.Cluster(\n  provider="aws",\n  hardware="p4d.24xlarge", # 8x A100\n  nodes=4,\n  region="us-east-1"\n)\n\ncluster.launch()`}
                </div>

                <h2 className="text-2xl font-medium text-white mt-16 mb-8">Hardware Compatibility</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose">
                    {features.map((f) => (
                        <div key={f.title} className="p-6 border border-[#1a1a1a] rounded-xl space-y-2 hover:bg-[#0e0e0e] transition-colors">
                            <h3 className="text-white font-medium">{f.title}</h3>
                            <p className="text-zinc-500 text-sm">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
