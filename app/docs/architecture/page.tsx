"use client";

import { motion } from "framer-motion";
import { Layers, Globe, Cpu, Database, Shield, Zap } from "lucide-react";

export default function DocsArchitecture() {
    const layers = [
        {
            icon: Layers,
            title: "Orchestration Layer",
            desc: "Distributed management of AWS EC2, Sagemaker, and On-Prem clusters. Handles partitioning and failover."
        },
        {
            icon: Database,
            title: "Global Artifact Store",
            desc: "Synchronized weight storage across multiple regions. Native support for S3, GCS, and local NVMe caching."
        },
        {
            icon: Cpu,
            title: "Compute Fabric",
            desc: "Hardware-agnostic runtime optimized for CUDA 12 and ROCm. Automated driver injection and health monitoring."
        },
        {
            icon: Zap,
            title: "Telemetry Stream",
            desc: "Real-time, zero-latency streaming of loss, accuracy, and system metrics via distributed Redis clusters."
        }
    ];

    return (
        <div className="space-y-16 animate-in fade-in duration-700">
            <div className="space-y-4">
                <h1 className="text-5xl font-medium tracking-tight">Technical Architecture</h1>
                <p className="text-xl text-zinc-500 leading-relaxed font-normal">
                    Deep dive into how Pipeline manages the complexity of distributed AI systems.
                </p>
            </div>

            <div className="prose prose-invert max-w-none">
                <p className="text-lg text-zinc-400">
                    Pipeline is architected as a decoupled system where the control plane (our API) and the data plane (your infrastructure)
                    are separated by a high-performance synchronization layer.
                </p>

                <h2 className="text-2xl font-medium text-white mt-16 mb-8">System Layers</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 not-prose">
                    {layers.map((layer) => (
                        <div key={layer.title} className="p-8 border border-[#1a1a1a] bg-[#0e0e0e] rounded-2xl space-y-4 hover:border-zinc-700 transition-all cursor-default group">
                            <div className="w-12 h-12 border border-zinc-800 rounded-lg flex items-center justify-center text-zinc-600 group-hover:text-white group-hover:bg-zinc-900 transition-all">
                                <layer.icon size={24} />
                            </div>
                            <h3 className="text-lg font-medium text-white tracking-tight">{layer.title}</h3>
                            <p className="text-zinc-500 text-sm leading-relaxed">{layer.desc}</p>
                        </div>
                    ))}
                </div>

                <h2 className="text-2xl font-medium text-white mt-20 mb-8">Data Flow</h2>
                <div className="relative p-12 border border-dashed border-zinc-800 rounded-3xl bg-zinc-950/50 flex flex-col items-center justify-center gap-12 not-prose">
                    <div className="flex flex-col items-center gap-2">
                        <div className="px-6 py-2 border border-white text-[10px] font-black uppercase tracking-widest rounded-full">Local Workspace (SDK)</div>
                        <div className="h-12 w-px bg-zinc-800 animate-pulse" />
                    </div>
                    <div className="flex gap-8 items-center">
                        <div className="px-6 py-10 border border-zinc-500 bg-black rounded-xl text-xs font-bold uppercase tracking-widest text-center">Pipeline_API<br />Control Plane</div>
                        <ArrowRight className="text-zinc-800" />
                        <div className="px-6 py-10 border border-zinc-800 bg-zinc-900 rounded-xl text-xs font-bold uppercase tracking-widest text-center text-zinc-500">Infrastructure<br />Provider (AWS)</div>
                    </div>
                    <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">End-to-end encrypted telemetry channel (mTLS)</div>
                </div>
            </div>
        </div>
    );
}

const ArrowRight = ({ className }: { className?: string }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
);
