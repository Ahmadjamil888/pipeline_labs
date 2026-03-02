"use client";

import { motion } from "framer-motion";
import { Shield, Lock, FileText } from "lucide-react";

export default function DocsSecurity() {
    return (
        <div className="space-y-16 animate-in fade-in duration-700">
            <div className="space-y-4">
                <h1 className="text-5xl font-medium tracking-tight">Security</h1>
                <p className="text-xl text-zinc-500 leading-relaxed font-normal">
                    Enterprise-grade protection for your models and data.
                </p>
            </div>

            <div className="prose prose-invert max-w-none">
                <p>
                    Pipeline is built with a zero-trust architecture. Your model weights and datasets never leave your private VPC,
                    and all control plane communications are encrypted with mTLS.
                </p>

                <h2 className="text-2xl font-medium text-white mt-12 mb-6">Security Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose">
                    {[
                        { icon: Shield, title: "VPC Isolation", desc: "Training clusters operate within your own private network." },
                        { icon: Lock, title: "mTLS Encryption", desc: "Every API call and telemetry stream is end-to-end encrypted." },
                        { icon: FileText, title: "SOC2 Compliant", desc: "Our infrastructure adheres to the highest industry standards." },
                        { icon: Lock, title: "RBAC Controls", desc: "Granular permissions for teams and individual users." }
                    ].map((item) => (
                        <div key={item.title} className="p-6 border border-[#1a1a1a] bg-[#0e0e0e] rounded-xl space-y-2">
                            <div className="text-white mb-4"><item.icon size={20} /></div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-white">{item.title}</h3>
                            <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
