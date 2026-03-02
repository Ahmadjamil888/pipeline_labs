"use client";

import { motion } from "framer-motion";
import { Database, Download, Share2, ShieldCheck } from "lucide-react";

export default function DocsDatasets() {
    return (
        <div className="space-y-16 animate-in fade-in duration-700">
            <div className="space-y-4">
                <h1 className="text-5xl font-medium tracking-tight">Datasets</h1>
                <p className="text-xl text-zinc-500 leading-relaxed font-normal">
                    High-speed data ingestion and versioning for distributed training.
                </p>
            </div>

            <div className="prose prose-invert max-w-none">
                <p>
                    Pipeline treats datasets as first-class citizens. Whether your data lives in S3, GCS, or is streamed from HuggingFace,
                    Pipeline ensures it is correctly partitioned across nodes and cached for maximum throughput.
                </p>

                <h2 className="text-2xl font-medium text-white mt-12 mb-6">Importing Data</h2>
                <div className="bg-[#0e0e0e] border border-[#1a1a1a] rounded-2xl p-8 font-mono text-xs text-zinc-400">
                    {`dataset = pipeline.Dataset.from_s3("s3://my-bucket/images")\ndataset.version("v1.2")\n\n# Or from HuggingFace\ndataset = pipeline.Dataset.from_hf("wikitext-103")`}
                </div>

                <h2 className="text-2xl font-medium text-white mt-16 mb-8">Performance Features</h2>
                <div className="space-y-4 not-prose">
                    {[
                        { icon: Download, title: "Distributed Caching", desc: "Data is cached on local NVMe drives across cluster nodes to minimize network bottleneck." },
                        { icon: Share2, title: "Smart Partitioning", desc: "Automatic sharding for distributed data-parallel training (DDP)." },
                        { icon: ShieldCheck, title: "Checksum Verification", desc: "Atomic integrity checks during ingestion to prevent corrupted training runs." }
                    ].map((item) => (
                        <div key={item.title} className="flex gap-6 p-8 border border-[#1a1a1a] rounded-2xl bg-[#0e0e0e]/30">
                            <div className="text-zinc-600"><item.icon size={24} /></div>
                            <div className="space-y-1">
                                <h3 className="text-white font-medium">{item.title}</h3>
                                <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
