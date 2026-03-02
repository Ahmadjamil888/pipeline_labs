"use client";

import { motion } from "framer-motion";
import { ChevronRight, Play, Terminal, Zap } from "lucide-react";
import Link from "next/link";

export default function DocsIntroduction() {
    return (
        <div className="space-y-12 animate-in fade-in duration-700 text-brand-text">
            <div className="space-y-4">
                <h1 className="text-5xl font-medium tracking-tight">Introduction to pipeline_labs</h1>
                <p className="text-xl text-zinc-500 leading-relaxed font-normal">
                    The zero-config AI SDK engine for extraordinarily productive engineering teams.
                </p>
            </div>

            <div className="space-y-6 max-w-none">
                <p className="text-zinc-500 leading-relaxed shadow-sm">
                    pipeline_labs is an opinionated SDK designed to handle the complexity of distributed model training and deployments directly from your code. With it, you no longer manage YAML syntax, infrastructure, and heavy pipelines.
                </p>

                <h2 className="text-2xl font-medium text-brand-text mt-12 mb-6">Core Philosophy</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                        { title: "Zero Config", desc: "No boilerplate. Pass a base model string and your dataset mapping. We do the rest." },
                        { title: "Layered Defaults", desc: "Layer 1 sets smart configurations. Layer 2 allows absolute overrides when needed." },
                        { title: "REST Abstraction", desc: "Backend handles asynchronous polling using a robust Jobs architecture." },
                        { title: "Enterprise Ready", desc: "Local-first deployments bridging universal architectures out of the box." },
                    ].map((item) => (
                        <div key={item.title} className="p-6 border border-brand-border bg-white/5 rounded-xl space-y-2">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-brand-text">{item.title}</h3>
                            <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>

                <h2 className="text-2xl font-medium text-brand-text mt-12 mb-6">Execution Lifecycle</h2>
                <ol className="list-decimal list-inside space-y-4 text-zinc-500 marker:text-brand-border marker:font-bold">
                    <li className="pl-4">
                        <strong className="text-brand-text">Initialize SDK:</strong> Call <code className="bg-white/5 px-2 py-0.5 rounded text-brand-text">Pipeline()</code> which reads your API Key.
                    </li>
                    <li className="pl-4">
                        <strong className="text-brand-text">Submit Request:</strong> Post your command via <code className="bg-white/5 px-2 py-0.5 rounded text-brand-text">client.training.train(...)</code>.
                    </li>
                    <li className="pl-4">
                        <strong className="text-brand-text">Smart Merge:</strong> Backend merges your configuration over our global task-optimized Defaults.
                    </li>
                    <li className="pl-4">
                        <strong className="text-brand-text">Run Loop:</strong> The backend queues resources and returns a pollable unified Job.
                    </li>
                </ol>
            </div>

            <div className="pt-8 flex gap-4">
                <Link href="/docs/sdk-python">
                    <button className="px-6 py-3 bg-brand-text text-brand-bg text-sm font-bold uppercase tracking-widest rounded-full hover:opacity-90 transition-all flex items-center gap-2">
                        Python SDK <ChevronRight size={16} />
                    </button>
                </Link>
                <Link href="/docs/training">
                    <button className="px-6 py-3 border border-brand-border text-sm font-bold uppercase tracking-widest rounded-full hover:bg-white/5 transition-all text-brand-text flex items-center gap-2">
                        Training API
                    </button>
                </Link>
            </div>
        </div>
    );
}
