"use client";

import { motion } from "framer-motion";
import { Terminal, Copy, Check } from "lucide-react";
import { useState } from "react";

export default function DocsInstallation() {
    const [copied, setCopied] = useState("");

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(text);
        setTimeout(() => setCopied(""), 2000);
    };

    const InstallBox = ({ command }: { command: string }) => (
        <div className="group relative bg-white/5 border border-brand-border rounded-xl p-6 font-mono text-sm flex items-center justify-between overflow-hidden">
            <div className="flex items-center gap-4 text-zinc-400">
                <span className="text-zinc-500 select-none">$</span>
                <span className="text-brand-text">{command}</span>
            </div>
            <button
                onClick={() => copyToClipboard(command)}
                className="p-2 hover:bg-white/10 rounded-lg transition-all text-zinc-500 hover:text-brand-text"
            >
                {copied === command ? <Check size={16} /> : <Copy size={16} />}
            </button>
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-text/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 text-brand-text">
            <div className="space-y-4">
                <h1 className="text-5xl font-medium tracking-tight">Installation</h1>
                <p className="text-xl text-zinc-500 leading-relaxed font-normal">
                    Get the Pipeline SDK and CLI tools running on your local machine.
                </p>
            </div>

            <div className="space-y-10">
                <section className="space-y-6">
                    <h2 className="text-2xl font-medium text-brand-text">Prerequisites</h2>
                    <p className="text-zinc-500">Before installing the SDK, ensure you have the following requirements met:</p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {['Python 3.9+', 'Node.js 18+', 'Active AWS Account', 'Git installed'].map(p => (
                            <li key={p} className="flex items-center gap-3 p-4 bg-white/5 border border-brand-border rounded-lg">
                                <div className="w-1.5 h-1.5 rounded-full bg-brand-text" />
                                <span className="text-sm font-medium text-zinc-400">{p}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="space-y-6">
                    <h2 className="text-2xl font-medium text-brand-text">Python SDK</h2>
                    <p className="text-zinc-500">The most common way to use Pipeline is through our Python SDK, optimized for AI researchers.</p>
                    <InstallBox command="pip install pipeline-ai" />
                </section>

                <section className="space-y-6">
                    <h2 className="text-2xl font-medium text-brand-text">Node.js / React</h2>
                    <p className="text-zinc-500">For building AI-powered frontends or edge applications.</p>
                    <InstallBox command="npm install @pipeline-ai/sdk" />
                </section>

                <section className="space-y-6">
                    <h2 className="text-2xl font-medium text-brand-text">Command Line Tool</h2>
                    <p className="text-zinc-500">Global CLI for managing clusters and streaming logs locally.</p>
                    <InstallBox command="curl -fsSL https://pipeline.ai/install.sh | sh" />
                </section>

                <div className="p-8 bg-white/5 border border-brand-border rounded-2xl flex items-start gap-6">
                    <div className="p-3 bg-brand-text text-brand-bg rounded-lg">
                        <Terminal size={24} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-medium text-brand-text">Verification</h3>
                        <p className="text-sm text-zinc-500 leading-relaxed">After installation, run <code className="text-brand-text font-mono">pipeline --version</code> to verify the installation. You should see the current stable version (v1.2.4).</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
