"use client";

import { useEffect, useState } from "react";
import { Plus, Database, Cloud, ExternalLink, Search, Trash2, HardDrive } from "lucide-react";
import { createClient } from "../supabase-client";
import { motion, AnimatePresence } from "framer-motion";

export default function DatasetsPage() {
    const supabase = createClient();
    const [datasets, setDatasets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchDatasets = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('datasets')
                .select('*')
                .eq('owner_id', user.id)
                .order('created_at', { ascending: false });

            setDatasets(data || []);
            setLoading(false);
        };

        fetchDatasets();
    }, [supabase]);

    const filteredDatasets = datasets.filter(ds =>
        ds.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ds.s3_path.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="space-y-12 animate-pulse">
                <div className="h-20 bg-white/5 rounded-2xl w-1/3" />
                <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-white/5 rounded-2xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 max-w-7xl animate-in fade-in duration-700 text-brand-text">
            <div className="flex justify-between items-end border-b border-brand-border pb-8">
                <div className="space-y-2">
                    <h1 className="text-5xl font-black tracking-tight uppercase font-mono">Cloud_Datasets</h1>
                    <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em] font-mono italic">Distributed storage volumes for training clusters.</p>
                </div>
                <button className="px-8 py-4 bg-brand-text text-brand-bg font-black text-[11px] uppercase tracking-widest hover:opacity-90 transition-all rounded-full flex items-center gap-2">
                    <Plus size={14} /> New_Dataset
                </button>
            </div>

            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="SEARCH_VOLUMES..."
                        className="w-full bg-white/5 border border-brand-border rounded-full py-5 pl-14 pr-6 text-[11px] font-bold placeholder:text-zinc-700 focus:outline-none focus:border-brand-text transition-all tracking-[0.2em] uppercase"
                    />
                </div>
            </div>

            <div className="bg-white/5 border border-brand-border rounded-[2.5rem] overflow-hidden shadow-2xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-brand-border text-[9px] uppercase tracking-[0.4em] text-zinc-500 font-black bg-white/2">
                            <th className="px-10 py-7">Identifier</th>
                            <th className="px-10 py-7">Storage Path</th>
                            <th className="px-10 py-7 text-right">Date Created</th>
                            <th className="px-10 py-7 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-[11px] font-bold uppercase tracking-widest">
                        <AnimatePresence>
                            {filteredDatasets.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-32 text-center">
                                        <Database size={32} className="mx-auto text-zinc-800 mb-6" />
                                        <div className="text-zinc-600 text-[10px] uppercase tracking-[0.2em]">No datasets detected in compute layer.</div>
                                    </td>
                                </tr>
                            ) : (
                                filteredDatasets.map((ds, i) => (
                                    <motion.tr
                                        key={ds.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="group hover:bg-white/5 transition-colors border-b border-brand-border last:border-0"
                                    >
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-5">
                                                <div className="p-3 bg-brand-bg border border-brand-border rounded-xl text-zinc-500 group-hover:text-brand-text transition-colors">
                                                    <HardDrive size={18} />
                                                </div>
                                                <div>
                                                    <div className="text-brand-text text-[13px] font-black">{ds.name}</div>
                                                    <div className="text-zinc-600 text-[9px] font-black tracking-widest mt-1">Status: Active</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 font-mono text-zinc-500 group-hover:text-brand-text transition-colors text-[10px] break-all">
                                            {ds.s3_path}
                                        </td>
                                        <td className="px-10 py-8 text-right text-zinc-600 font-mono text-[10px]">
                                            {new Date(ds.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="text-zinc-500 hover:text-brand-text transition-colors">
                                                    <ExternalLink size={16} />
                                                </button>
                                                <button className="text-zinc-500 hover:text-red-500 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
