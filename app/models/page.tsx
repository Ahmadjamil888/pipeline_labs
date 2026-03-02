"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Filter, Box, Trash2, ExternalLink } from "lucide-react";
import { createClient } from "../supabase-client";
import { motion } from "framer-motion";

export default function ModelsPage() {
    const supabase = createClient();
    const [models, setModels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchModels = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('model_registry')
                .select('*')
                .eq('owner_id', user.id)
                .order('created_at', { ascending: false });

            setModels(data || []);
            setLoading(false);
        };

        fetchModels();
    }, [supabase]);

    const filteredModels = models.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.version.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="space-y-12 animate-pulse">
                <div className="h-20 bg-white/5 rounded-2xl w-1/3" />
                <div className="grid grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-64 bg-white/5 rounded-[2rem]" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 max-w-7xl animate-in fade-in duration-700 text-brand-text">
            <div className="flex justify-between items-end border-b border-brand-border pb-8">
                <div className="space-y-2">
                    <h1 className="text-5xl font-black tracking-tight uppercase font-mono">Model_Registry</h1>
                    <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em] font-mono italic">Global version control for neural weights.</p>
                </div>
                <button className="px-8 py-4 bg-brand-text text-brand-bg font-black text-[11px] uppercase tracking-widest hover:opacity-90 transition-all rounded-full flex items-center gap-2">
                    <Plus size={14} /> Import_Model
                </button>
            </div>

            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="FILTER_REGISTRY..."
                        className="w-full bg-white/5 border border-brand-border rounded-full py-5 pl-14 pr-6 text-[11px] font-bold placeholder:text-zinc-700 focus:outline-none focus:border-brand-text transition-all tracking-[0.2em] uppercase"
                    />
                </div>
                <button className="px-8 border border-brand-border rounded-full text-[11px] font-black uppercase tracking-widest text-zinc-500 hover:text-brand-text hover:border-brand-text transition-all flex items-center gap-2">
                    <Filter size={14} /> Filter
                </button>
            </div>

            {filteredModels.length === 0 ? (
                <div className="py-40 text-center border-2 border-dashed border-brand-border rounded-[3rem] bg-white/5">
                    <Box size={40} className="mx-auto text-zinc-800 mb-6" />
                    <h2 className="text-xl font-bold uppercase tracking-widest text-zinc-500">Registry_Empty</h2>
                    <p className="text-zinc-700 text-[10px] font-black uppercase tracking-[0.2em] mt-2">No models detected in your local or cloud repositories.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredModels.map((model, i) => (
                        <motion.div
                            key={model.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="p-8 bg-white/5 border border-brand-border rounded-[2.5rem] hover:border-brand-text transition-all group relative overflow-hidden"
                        >
                            <div className="flex justify-between items-start mb-10">
                                <div className="p-4 bg-brand-bg border border-brand-border rounded-2xl text-zinc-500 group-hover:text-brand-text transition-colors">
                                    <Box size={24} />
                                </div>
                                <div className="flex gap-2">
                                    {model.is_production && (
                                        <span className="text-[9px] px-3 py-1 bg-green-500 text-white font-black rounded-full uppercase tracking-widest shadow-[0_0_15px_rgba(34,197,94,0.4)]">Production</span>
                                    )}
                                    <span className="text-[9px] px-3 py-1 border border-brand-border text-zinc-500 font-black rounded-full uppercase tracking-widest">v{model.version}</span>
                                </div>
                            </div>
                            <h3 className="text-2xl font-black text-brand-text mb-2 uppercase tracking-tight">{model.name}</h3>
                            <div className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mb-10 font-mono truncate max-w-full opacity-60">S3://{model.s3_path}</div>

                            <div className="flex items-center justify-between border-t border-brand-border pt-6">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{new Date(model.created_at).toLocaleDateString()}</span>
                                <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="text-zinc-500 hover:text-brand-text transition-colors"><ExternalLink size={14} /></button>
                                    <button className="text-zinc-500 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
