"use client";

import { motion } from "framer-motion";
import { Terminal, Copy } from "lucide-react";

export default function ModelImportsDocs() {
    return (
        <div className="space-y-12 animate-in fade-in duration-700 text-brand-text">
            <div className="space-y-4">
                <h1 className="text-5xl font-medium tracking-tight">Model Registry & Imports</h1>
                <p className="text-xl text-zinc-500 leading-relaxed font-normal">
                    The pipeline_labs SDK natively supports universal background importing. Target any HuggingFace or S3 bucket, and Pipeline downloads, caches, and registers the model artifacts automatically.
                </p>
            </div>

            <div className="space-y-6 max-w-none">
                <h2 className="text-2xl font-medium text-brand-text mt-12 mb-6">POST /models/import</h2>
                <div className="bg-white/5 border border-brand-border rounded-xl p-6 font-mono text-sm leading-relaxed text-zinc-300">
                    <div className="text-zinc-500 mb-2"># Request Example (Python SDK layer)</div>
                    <span className="text-purple-400">client.models.import_resource</span>(
                    <br />  <span className="text-blue-400">source=</span><span className="text-green-400">"huggingface"</span>,
                    <br />  <span className="text-blue-400">reference=</span><span className="text-green-400">"mistralai/Mistral-7B-v0.1"</span>
                    <br />)
                </div>

                <div className="bg-white/5 border border-brand-border rounded-xl p-6 font-mono text-sm leading-relaxed text-zinc-300 mt-4">
                    <div className="text-zinc-500 mb-2"># Automatic Metadata Linking </div>
                    {`{`}
                    <br />  <span className="text-brand-text">"id"</span>: <span className="text-green-400">"mi-123456"</span>,
                    <br />  <span className="text-brand-text">"status"</span>: <span className="text-green-400">"queued"</span>,
                    <br />  <span className="text-brand-text">"source"</span>: <span className="text-green-400">"huggingface"</span>,
                    <br />  <span className="text-brand-text">"reference"</span>: <span className="text-green-400">"mistralai/Mistral-7B-v0.1"</span>
                    <br />{`}`}
                </div>

                <h2 className="text-2xl font-medium text-brand-text mt-12 mb-6">Background Importers</h2>
                <p className="text-zinc-500 mb-4">
                    When you call <code className="bg-white/5 px-2 py-0.5 rounded text-brand-text">/models/import</code>, a secure worker thread spins up asynchronously. It pulls the weights directly into our internal S3-compatible backend without bottlenecking your API requests.
                </p>
            </div>
        </div>
    );
}
