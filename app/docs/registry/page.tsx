"use client";

import { motion } from "framer-motion";
import { Box, Layers, PlayCircle, Search } from "lucide-react";

export default function DocsRegistry() {
    return (
        <div className="space-y-16 animate-in fade-in duration-700">
            <div className="space-y-4">
                <h1 className="text-5xl font-medium tracking-tight">Model Registry</h1>
                <p className="text-xl text-zinc-500 leading-relaxed font-normal">
                    The central repository for weights, configurations, and versioned artifacts.
                </p>
            </div>

            <div className="prose prose-invert max-w-none">
                <p>
                    The Pipeline Model Registry provides a unified interface for managing model lifecycle from experimentation to production.
                    Every training run automatically generates a versioned entry in the registry.
                </p>

                <h2 className="text-2xl font-medium text-white mt-12 mb-6">Registering Models</h2>
                <div className="bg-[#0e0e0e] border border-[#1a1a1a] rounded-2xl p-8 font-mono text-xs text-zinc-400">
                    {`# Saving weights after training\nmodel.save(name="llama-3-chat-v1")\n\n# Loading for inference\nlive_model = pipeline.Registry.get("llama-3-chat-v1")`}
                </div>

                <h2 className="text-2xl font-medium text-white mt-16 mb-8">Registry Workflows</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 not-prose">
                    {[
                        { icon: Search, title: "Weight Search", desc: "Find weights by performance metrics or metadata." },
                        { icon: Layers, title: "Lineage", desc: "Track full history from dataset and hyperparams to weights." },
                        { icon: PlayCircle, title: "Promotions", desc: "Move models from dev to staging with a single click." }
                    ].map((item) => (
                        <div key={item.title} className="p-8 border border-[#1a1a1a] rounded-2xl bg-black text-center space-y-4">
                            <div className="flex justify-center text-zinc-700"><item.icon size={32} /></div>
                            <h3 className="text-white font-medium text-sm uppercase tracking-widest">{item.title}</h3>
                            <p className="text-zinc-600 text-xs leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
