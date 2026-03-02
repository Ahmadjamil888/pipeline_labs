"use client";

import { useEffect, useState } from "react";
import { Play, Activity, Clock, Server, Terminal, Box, ChevronRight, Zap } from "lucide-react";
import { createClient } from "../supabase-client";
import { motion, AnimatePresence } from "framer-motion";

export default function TrainingPage() {
    const supabase = createClient();
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('jobs')
                .select('*')
                .eq('owner_id', user.id)
                .order('created_at', { ascending: false });

            setJobs(data || []);
            setLoading(false);
        };

        fetchJobs();
    }, [supabase]);

    if (loading) {
        return (
            <div className="space-y-12 animate-pulse">
                <div className="h-20 bg-white/5 rounded-2xl w-1/3" />
                {[1, 2].map(i => <div key={i} className="h-96 bg-white/5 rounded-[3rem]" />)}
            </div>
        );
    }

    return (
        <div className="space-y-16 max-w-7xl animate-in fade-in duration-700 text-brand-text">
            <div className="flex justify-between items-end border-b border-brand-border pb-8">
                <div className="space-y-2">
                    <h1 className="text-5xl font-black tracking-tight uppercase font-mono">Pipeline_Registry</h1>
                    <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em] font-mono italic">Distributed execution history and cluster metrics.</p>
                </div>
                <button className="px-8 py-4 bg-brand-text text-brand-bg font-black text-[11px] uppercase tracking-widest hover:opacity-90 transition-all rounded-full flex items-center gap-3">
                    <Play size={14} className="fill-current" /> Initialize_Cluster
                </button>
            </div>

            {jobs.length === 0 ? (
                <div className="py-40 text-center border-2 border-dashed border-brand-border rounded-[3rem] bg-white/5">
                    <Zap size={40} className="mx-auto text-zinc-800 mb-6" />
                    <h2 className="text-xl font-bold uppercase tracking-widest text-zinc-500">No_Active_Pipelines</h2>
                    <p className="text-zinc-700 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Scale your training from local to distributed in one command.</p>
                </div>
            ) : (
                <div className="space-y-12">
                    {jobs.map((job, i) => (
                        <motion.div
                            key={job.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="group border border-brand-border rounded-[3rem] overflow-hidden bg-white/3 hover:border-brand-text transition-all"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-4">
                                <div className="lg:col-span-3 p-12 border-r border-brand-border space-y-10">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full ${job.status === 'COMPLETED' ? 'bg-green-500 shadow-[0_0_15px_green]' : job.status === 'FAILED' ? 'bg-red-500' : 'bg-blue-500 animate-pulse outline outline-offset-4 outline-blue-500/20'}`} />
                                                <h3 className="text-3xl font-black tracking-tight uppercase">{job.name}</h3>
                                            </div>
                                            <div className="flex items-center gap-4 text-[10px] text-zinc-600 font-bold font-mono tracking-widest uppercase">
                                                <span>UUID: {job.id}</span>
                                                <span className="w-px h-3 bg-brand-border" />
                                                <span>TYPE: {job.job_type}</span>
                                            </div>
                                        </div>
                                        <div className="px-6 py-2 border border-brand-border rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-brand-text group-hover:border-brand-text transition-all">
                                            Status: {job.status}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="p-8 bg-brand-bg border border-brand-border rounded-3xl">
                                            <div className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <Server size={12} /> Compute_Config
                                            </div>
                                            <div className="text-[14px] font-bold text-brand-text tracking-wide uppercase">{job.hardware_type}</div>
                                            <div className="text-[9px] text-zinc-700 font-bold mt-2 uppercase tracking-widest">Distributed: {job.distributed ? 'Active' : 'False'}</div>
                                        </div>
                                        <div className="p-8 bg-brand-bg border border-brand-border rounded-3xl">
                                            <div className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <Clock size={12} /> Initialized
                                            </div>
                                            <div className="text-[14px] font-bold text-brand-text tracking-wide uppercase">{new Date(job.created_at).toLocaleTimeString()}</div>
                                            <div className="text-[9px] text-zinc-700 font-bold mt-2 uppercase tracking-widest">{new Date(job.created_at).toLocaleDateString()}</div>
                                        </div>
                                        <div className="p-8 bg-brand-text text-brand-bg rounded-3xl flex flex-col justify-center">
                                            <div className="text-[9px] font-black uppercase tracking-widest mb-2 opacity-60">Result_State</div>
                                            <div className="text-xl font-black uppercase tracking-tighter">
                                                {job.status === 'COMPLETED' ? 'SUCCESS' : job.status === 'FAILED' ? 'FATAL_ERR' : 'IN_STREAM'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-brand-bg border border-brand-border rounded-3xl p-10 font-mono text-[11px] min-h-[150px] relative overflow-hidden">
                                        <div className="flex items-center justify-between mb-8 text-zinc-700 uppercase font-black tracking-widest">
                                            <div className="flex items-center gap-3">
                                                <Terminal size={14} /> System_Out
                                            </div>
                                            <span className="text-[9px]">Node_001_A</span>
                                        </div>
                                        <div className="space-y-3 text-zinc-500 leading-relaxed uppercase">
                                            <p><span className="text-zinc-700">[LOG]</span> Initializing training partition...</p>
                                            <p><span className="text-zinc-700">[LOG]</span> Syncing artifacts from S3...</p>
                                            {job.status === 'COMPLETED' ? (
                                                <p className="text-green-500/80"><span className="text-zinc-700">[SYS]</span> Process exited with code 0. Finalizing metrics.</p>
                                            ) : (
                                                <p className="animate-pulse text-brand-text">Streaming telemetry from compute cluster...</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-1 p-12 bg-white/2 flex flex-col justify-between">
                                    <div className="space-y-6">
                                        <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Environment</h3>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest border-b border-brand-border pb-3">
                                                <span className="text-zinc-600">Model</span>
                                                <span className="text-brand-text max-w-[100px] truncate">{job.base_model_name || 'Generic'}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest border-b border-brand-border pb-3">
                                                <span className="text-zinc-600">Workers</span>
                                                <span className="text-brand-text">{job.worker_count}x</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-10">
                                        <button className="w-full group flex items-center justify-between p-6 bg-brand-bg border border-brand-border rounded-[2rem] hover:border-brand-text transition-all">
                                            <span className="text-[11px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-brand-text transition-colors">Launch_Monitor</span>
                                            <ChevronRight size={16} className="text-zinc-700 group-hover:text-brand-text" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
