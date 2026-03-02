"use client";

import { useEffect, useState } from "react";
import { Activity, Globe, Zap, Shield, BarChart3, Trash2, Settings } from "lucide-react";
import { createClient } from "../supabase-client";
import { motion } from "framer-motion";

export default function EndpointsPage() {
    const supabase = createClient();
    const [endpoints, setEndpoints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEndpoints = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('deployments')
                .select(`
                    *,
                    model_registry (
                        name,
                        version
                    )
                `)
                .eq('owner_id', user.id)
                .order('created_at', { ascending: false });

            setEndpoints(data || []);
            setLoading(false);
        };

        fetchEndpoints();
    }, [supabase]);

    if (loading) {
        return (
            <div className="space-y-12 animate-pulse">
                <div className="h-20 bg-white/5 rounded-2xl w-1/3" />
                {[1, 2].map(i => <div key={i} className="h-32 bg-white/5 rounded-2xl" />)}
            </div>
        );
    }

    return (
        <div className="space-y-16 max-w-7xl animate-in fade-in duration-700 text-brand-text">
            <div className="flex justify-between items-end border-b border-brand-border pb-8">
                <div className="space-y-2">
                    <h1 className="text-5xl font-black tracking-tight uppercase font-mono">Managed_Endpoints</h1>
                    <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em] font-mono italic">High-availability serverless inference clusters.</p>
                </div>
                <button className="px-8 py-4 bg-brand-text text-brand-bg font-black text-[11px] uppercase tracking-widest hover:opacity-90 transition-all rounded-full flex items-center gap-3">
                    <Zap size={14} className="fill-current" /> Initialize_Deploy
                </button>
            </div>

            {endpoints.length === 0 ? (
                <div className="py-40 text-center border-2 border-dashed border-brand-border rounded-[3rem] bg-white/5">
                    <Activity size={40} className="mx-auto text-zinc-800 mb-6" />
                    <h2 className="text-xl font-bold uppercase tracking-widest text-zinc-500">No_Active_Endpoints</h2>
                    <p className="text-zinc-700 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Scale your models to global availability with zero cold starts.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {endpoints.map((ep, i) => (
                        <motion.div
                            key={ep.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="group p-10 bg-white/5 border border-brand-border rounded-[2.5rem] hover:border-brand-text transition-all relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                                <Globe size={120} />
                            </div>

                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                                <div className="space-y-6 flex-1">
                                    <div className="flex items-center gap-5">
                                        <div className="p-4 bg-brand-bg border border-brand-border rounded-2xl text-zinc-500 group-hover:text-brand-text transition-colors">
                                            <Zap size={22} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-brand-text uppercase tracking-tight">{ep.model_registry?.name || 'GENERIC_INFERENCE'}</h3>
                                            <div className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mt-1 opacity-60">Provisioned on AWS Edge • v{ep.model_registry?.version || '1.0'}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 px-6 py-4 bg-brand-bg border border-brand-border rounded-full w-fit max-w-full">
                                        <Globe size={14} className="text-zinc-700" />
                                        <code className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest truncate">{ep.endpoint_url || 'PENDING_DNS_ALLOCATION'}</code>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-12 text-[10px] font-black uppercase tracking-[0.3em] pr-8">
                                    <div className="space-y-3">
                                        <div className="text-zinc-700">Health_Status</div>
                                        <div className="flex items-center text-brand-text">
                                            <div className={`w-2 h-2 rounded-full mr-3 ${ep.status === 'HEALTHY' ? 'bg-green-500 shadow-[0_0_10px_green]' : 'bg-zinc-800'}`} />
                                            {ep.status}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="text-zinc-700">Scaling_Matrix</div>
                                        <div className="text-brand-text">{ep.min_replicas} MIN / {ep.max_replicas} MAX</div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex gap-4">
                                            <button className="p-3 bg-brand-bg border border-brand-border rounded-xl text-zinc-600 hover:text-brand-text transition-colors">
                                                <BarChart3 size={16} />
                                            </button>
                                            <button className="p-3 bg-brand-bg border border-brand-border rounded-xl text-zinc-600 hover:text-brand-text transition-colors">
                                                <Settings size={16} />
                                            </button>
                                            <button className="p-3 bg-brand-bg border border-brand-border rounded-xl text-zinc-600 hover:text-red-500 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            <div className="mt-20 p-12 bg-white/3 border border-brand-border rounded-[3rem] flex flex-col md:flex-row items-center gap-12">
                <div className="p-6 bg-brand-text text-brand-bg rounded-[2rem]">
                    <Shield size={32} />
                </div>
                <div className="flex-1 space-y-2">
                    <h3 className="text-xl font-bold uppercase tracking-tight">Enterprise Security</h3>
                    <p className="text-zinc-500 text-[11px] font-medium uppercase tracking-widest leading-relaxed">All endpoints are isolated within your private VPC with mTLS encryption and request logging enabled by default.</p>
                </div>
            </div>
        </div>
    );
}
