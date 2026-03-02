"use client";

import { motion } from "framer-motion";
import { Terminal, Copy } from "lucide-react";

export default function TrainingDocs() {
    return (
        <div className="space-y-12 animate-in fade-in duration-700 text-brand-text">
            <div className="space-y-4">
                <h1 className="text-5xl font-medium tracking-tight">Zero-Config Training</h1>
                <p className="text-xl text-zinc-500 leading-relaxed font-normal">
                    The \`pipeline_labs\` SDK features a deeply integrated zero-config engine. Provide a model and dataset, and let the backend construct optimal execution layers automatically.
                </p>
            </div>

            <div className="space-y-6 max-w-none">
                <h2 className="text-2xl font-medium text-brand-text mt-12 mb-6">POST /training</h2>
                <div className="bg-white/5 border border-brand-border rounded-xl p-6 font-mono text-sm leading-relaxed text-zinc-300">
                    <div className="text-zinc-500 mb-2"># Request Example (cURL)</div>
                    <span className="text-brand-text">curl</span> -X POST https://api.pipeline.ai/v1/training \\
                    <br />  -H <span className="text-green-400">"Authorization: Bearer $PIPELINE_API_KEY"</span> \\
                    <br />  -H <span className="text-green-400">"Content-Type: application/json"</span> \\
                    <br />  -d <span className="text-yellow-400">'{'{ "model": "meta-llama/Llama-2-7b", "dataset": "amazon-reviews", "task": "text-classification" }'}'</span>
                </div>

                <div className="bg-white/5 border border-brand-border rounded-xl p-6 font-mono text-sm leading-relaxed text-zinc-300 mt-4">
                    <div className="text-zinc-500 mb-2"># Standard JSON Response (202 Accepted)</div>
                    {`{`}
                    <br />  <span className="text-brand-text">"id"</span>: <span className="text-green-400">"job_8f7b2319"</span>,
                    <br />  <span className="text-brand-text">"status"</span>: <span className="text-green-400">"queued"</span>,
                    <br />  <span className="text-brand-text">"progress"</span>: <span className="text-yellow-400">0</span>,
                    <br />  <span className="text-brand-text">"logs_url"</span>: <span className="text-green-400">"/api/v1/jobs/job_8f7b2319/logs"</span>
                    <br />{`}`}
                </div>

                <h2 className="text-2xl font-medium text-brand-text mt-12 mb-6">Task & Template Mapping (Layer 1)</h2>
                <p className="text-zinc-500 mb-4">
                    If you omit advanced configuration keys, the engine falls back to pre-defined Task Templates. These automatically set values like:
                </p>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="border-b border-white/10 text-left">
                                <th className="py-4 font-bold text-zinc-300 uppercase tracking-widest text-xs">Task Type</th>
                                <th className="py-4 font-bold text-zinc-300 uppercase tracking-widest text-xs">Default Model</th>
                                <th className="py-4 font-bold text-zinc-300 uppercase tracking-widest text-xs">Optimizer</th>
                                <th className="py-4 font-bold text-zinc-300 uppercase tracking-widest text-xs">Learn Rate</th>
                            </tr>
                        </thead>
                        <tbody className="text-zinc-500">
                            <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="py-4"><code className="bg-white/5 px-2 py-1 rounded">causal-lm</code></td>
                                <td className="py-4">gpt-2</td>
                                <td className="py-4">adamw</td>
                                <td className="py-4">5e-5</td>
                            </tr>
                            <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="py-4"><code className="bg-white/5 px-2 py-1 rounded">text-classification</code></td>
                                <td className="py-4">distilbert-base-uncased</td>
                                <td className="py-4">adamw</td>
                                <td className="py-4">2e-5</td>
                            </tr>
                            <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="py-4"><code className="bg-white/5 px-2 py-1 rounded">object-detection</code></td>
                                <td className="py-4">facebook/detr-resnet-50</td>
                                <td className="py-4">adamw</td>
                                <td className="py-4">1e-4</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}
