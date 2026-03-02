"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const codeSnippet = `import pipeline

# Initialize the client
client = pipeline.Client(api_key='pk_live_xxxx')

# Define hardware cluster
cluster = client.clusters.create(
    hardware="8x-a100-sxm4",
    provider="aws",
    region="us-east-1"
)

# Launch distributed training
job = client.models.train(
    model="hf://llama-3-8b",
    dataset="s3://ai-data/finetune",
    cluster=cluster,
    params={
        "lr": 5e-5,
        "epochs": 3,
        "batch_size": 128
    }
)

# Monitor training locally
job.stream_metrics()`;

export function CodeEditor() {
    const [displayText, setDisplayText] = useState("");
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (index < codeSnippet.length) {
            const timeout = setTimeout(() => {
                setDisplayText((prev) => prev + codeSnippet[index]);
                setIndex((prev) => prev + 1);
            }, 30); // Typing speed
            return () => clearTimeout(timeout);
        }
    }, [index]);

    return (
        <div className="w-full bg-brand-bg border border-brand-border rounded-xl overflow-hidden shadow-2xl font-mono text-xs md:text-sm">
            <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-brand-border">
                <div className="flex gap-1.5 font-mono">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                    <span className="ml-2 text-zinc-500 text-[10px] uppercase tracking-widest">train_model.py</span>
                </div>
                <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Python 3.9</div>
            </div>
            <div className="p-6 h-[400px] overflow-y-auto custom-scrollbar leading-relaxed">
                <pre className="text-brand-text whitespace-pre-wrap">
                    {displayText}
                    <motion.span
                        animate={{ opacity: [0, 1] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="inline-block w-1.5 h-4 bg-brand-text align-middle ml-0.5"
                    />
                </pre>
            </div>
        </div>
    );
}
