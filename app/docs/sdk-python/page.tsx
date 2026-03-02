"use client";

import { motion } from "framer-motion";
import { Copy, Terminal } from "lucide-react";

export default function PythonSDKDocs() {
    return (
        <div className="space-y-12 animate-in fade-in duration-700 text-brand-text">
            <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-text/10 text-brand-text text-xs font-bold uppercase tracking-widest">
                    v1.0.0
                </div>
                <h1 className="text-5xl font-medium tracking-tight">pipeline_labs Python SDK</h1>
                <p className="text-xl text-zinc-500 leading-relaxed font-normal">
                    The official Python library for the pipeline_labs API. Built with Stainless for robust type-safety, automatic retries, and clean abstractions.
                </p>
            </div>

            <div className="space-y-6 max-w-none">
                <h2 className="text-2xl font-medium text-brand-text mt-12 mb-6">Installation</h2>
                <div className="bg-white/5 border border-brand-border rounded-xl p-4 overflow-hidden relative group font-mono text-sm">
                    <div className="text-zinc-400"># Install via pip</div>
                    <div className="text-brand-text mt-2">$ pip install pipeline_labs</div>
                    <button className="absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 transition-opacity bg-brand-bg rounded-md border border-brand-border hover:bg-white/10">
                        <Copy size={14} />
                    </button>
                </div>

                <h2 className="text-2xl font-medium text-brand-text mt-12 mb-6">Authentication</h2>
                <p className="text-zinc-500">
                    The SDK will automatically pick up your <code className="bg-white/5 px-2 py-0.5 rounded text-brand-text">PIPELINE_API_KEY</code> environment variable.
                </p>
                <div className="bg-[#1e1e1e] rounded-xl p-6 overflow-hidden relative group font-mono text-sm text-[#d4d4d4] shadow-2xl border border-white/5">
                    <pre className="whitespace-pre-wrap">
                        {`from pipeline_labs import Pipeline

# The client will automatically use os.environ.get("PIPELINE_API_KEY")
client = Pipeline()

# Or you can pass it explicitly
client = Pipeline(
    api_key="your_api_key_here",
)`}
                    </pre>
                </div>

                <h2 className="text-2xl font-medium text-brand-text mt-12 mb-6">Zero-Config Training</h2>
                <p className="text-zinc-500">
                    Train a model by passing just the base model and dataset. The SDK auto-fills optimal configurations using Layer 1 logic.
                </p>
                <div className="bg-[#1e1e1e] rounded-xl p-6 overflow-hidden relative group font-mono text-sm text-[#d4d4d4] shadow-2xl border border-white/5">
                    <pre className="whitespace-pre-wrap">
                        {`# Starts a fine-tuning job instantly
job = client.training.train(
    model="meta-llama/Llama-3-8B",
    dataset="imdb",
    task="text-classification" # Optional text-generation, causal-lm
)

print(job.id)        # "job_12345"
print(job.status)    # "queued"
print(job.logs_url)  # "/api/v1/jobs/job_12345/logs"`}
                    </pre>
                </div>

                <h2 className="text-2xl font-medium text-brand-text mt-12 mb-6">Layer 2: Advanced Overrides</h2>
                <p className="text-zinc-500">
                    If you need full control, you can pass nested configurations into the SDK.
                </p>
                <div className="bg-[#1e1e1e] rounded-xl p-6 overflow-hidden relative group font-mono text-sm text-[#cecece] shadow-2xl border border-white/5">
                    <pre className="whitespace-pre-wrap">
                        {`job = client.training.train(
    model="meta-llama/Llama-3-8B",
    dataset="imdb",
    task="causal-lm",
    config={
        "epochs": 50,
        "optimizer": "adamw",
        "learning_rate": 3e-5,
        "batch_size": 16,
        "gpu_type": "A10G",
        "scheduler": "cosine"
    }
)
`}
                    </pre>
                </div>
            </div>
        </div>
    );
}
