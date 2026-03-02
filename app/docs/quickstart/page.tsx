"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Play, Rocket } from "lucide-react";
import Link from "next/link";

export default function DocsQuickstart() {
    const steps = [
        {
            title: "Initialize the SDK",
            code: "import pipeline\n\nclient = pipeline.Client(api_key='YOUR_API_KEY')",
            desc: "First, import the SDK and initialize the client. You can find your API key in the Dashboard Settings."
        },
        {
            title: "Define your Model",
            code: "model = client.models.import_from('hf://llama-3-8b')",
            desc: "Specify your model source. Pipeline supports HuggingFace, Kaggle, and direct GitHub URIs."
        },
        {
            title: "Launch Training Cluster",
            code: "job = model.train(\n  hardware='8x-a100-sxm4',\n  optimizer='adamw',\n  epochs=5\n)",
            desc: "Define your compute requirements. Pipeline handles all infra provisioning and data synchronization automatically."
        },
        {
            title: "Monitor in Real-time",
            code: "job.stream_logs()\njob.wait_until_complete()",
            desc: "Stream live metrics and logs from the distributed cluster directly to your local terminal."
        }
    ];

    return (
        <div className="space-y-16 animate-in fade-in duration-700 text-brand-text">
            <div className="space-y-4">
                <h1 className="text-5xl font-medium tracking-tight">Quickstart</h1>
                <p className="text-xl text-zinc-500 leading-relaxed font-normal">
                    Go from local code to distributed cluster in under 10 minutes.
                </p>
            </div>

            <div className="space-y-12">
                {steps.map((step, i) => (
                    <div key={i} className="relative pl-12 border-l border-brand-border group">
                        <div className="absolute left-[-16px] top-0 w-8 h-8 bg-brand-bg border border-brand-border rounded-full flex items-center justify-center text-[10px] font-black group-hover:border-brand-text transition-all text-brand-text">
                            {i + 1}
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-xl font-medium text-brand-text">{step.title}</h3>
                                <p className="text-zinc-500 text-sm leading-relaxed max-w-2xl">{step.desc}</p>
                            </div>
                            <div className="bg-white/5 border border-brand-border rounded-xl p-6 font-mono text-xs text-zinc-400 overflow-x-auto">
                                <pre><code className="text-brand-text">{step.code}</code></pre>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-10 bg-brand-text text-brand-bg rounded-3xl flex flex-col md:flex-row items-center gap-10">
                <div className="flex-1 space-y-4">
                    <h2 className="text-3xl font-medium tracking-tight flex items-center gap-3">
                        Ready to scale? <Rocket size={24} />
                    </h2>
                    <p className="opacity-70 font-medium">Head to the dashboard to grab your API keys and start launching production clusters today.</p>
                </div>
                <Link href="/login">
                    <button className="px-10 py-5 bg-brand-bg text-brand-text text-[12px] font-bold uppercase tracking-widest rounded-full hover:opacity-90 transition-all flex items-center gap-2">
                        Access Dashboard <Play size={14} fill="currentColor" />
                    </button>
                </Link>
            </div>
        </div>
    );
}
