"use client";

import { useEffect, useState } from "react";
import { Shield, Key, Lock, Copy, RefreshCw, Check, Cloud, User, Building2, Plus } from "lucide-react";
import { createClient } from "../supabase-client";
import { motion } from "framer-motion";

export default function SettingsPage() {
    const supabase = createClient();
    const [profile, setProfile] = useState<any>(null);
    const [apiKey, setApiKey] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch Profile
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            // Fetch API Key
            const { data: keyData } = await supabase
                .from('api_keys')
                .select('*')
                .eq('owner_id', user.id)
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            setProfile(profileData);
            setApiKey(keyData);
            setLoading(false);
        };

        fetchSettings();
    }, [supabase]);

    const copyToClipboard = () => {
        if (!apiKey) return;
        navigator.clipboard.writeText(apiKey.key_value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="max-w-4xl space-y-12 animate-pulse">
                <div className="h-20 bg-white/5 rounded-2xl w-1/3" />
                <div className="space-y-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-40 bg-white/5 rounded-3xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl space-y-16 animate-in fade-in duration-700 text-brand-text">
            <div className="border-b border-brand-border pb-8">
                <h1 className="text-5xl font-black tracking-tight uppercase font-mono">Control_Settings</h1>
                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em] font-mono mt-2 italic">Configure your AI workstation and orchestration limits.</p>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Profile Section */}
                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-10 bg-white/5 border border-brand-border rounded-[2.5rem] relative overflow-hidden"
                >
                    <div className="flex items-center mb-10">
                        <div className="p-4 bg-brand-bg border border-brand-border rounded-2xl text-zinc-500 mr-6">
                            <User size={20} />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h3 className="text-sm font-black text-brand-text uppercase tracking-widest">Identity_Profile</h3>
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${profile?.plan_type === 'PRO' ? 'bg-brand-text text-brand-bg' :
                                        profile?.plan_type === 'ENTERPRISE' ? 'bg-zinc-800 text-white' :
                                            'border border-brand-border text-zinc-500'
                                    }`}>
                                    {profile?.plan_type || 'BASIC'}_PLAN
                                </span>
                            </div>
                            <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-1">Personalized workspace metadata.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-zinc-700 uppercase tracking-widest ml-4">Full_Name</label>
                            <div className="p-5 bg-brand-bg border border-brand-border rounded-full text-[12px] font-bold text-brand-text uppercase">{profile?.full_name || 'Not Set'}</div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-zinc-700 uppercase tracking-widest ml-4">Email_Endpoint</label>
                            <div className="p-5 bg-brand-bg border border-brand-border rounded-full text-[12px] font-bold text-zinc-500 uppercase">{profile?.email}</div>
                        </div>
                    </div>
                </motion.section>

                {/* API Key Section */}
                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-10 bg-brand-text text-brand-bg rounded-[3rem] shadow-2xl relative overflow-hidden"
                >
                    <div className="flex items-center mb-10 text-brand-bg">
                        <div className="p-4 bg-brand-bg text-brand-text rounded-2xl mr-6">
                            <Key size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest">SDK_Master_Secrets</h3>
                            <p className="text-[9px] opacity-60 font-black uppercase tracking-widest mt-1">Sensitive credentials for CLI and API interaction.</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-1 bg-brand-bg border border-brand-bg/10 rounded-full px-8 py-5 font-mono text-[11px] text-brand-text uppercase tracking-widest flex items-center shadow-inner">
                                {apiKey ? `PK_LIVE_${apiKey.key_value.substring(0, 8)}****************` : 'NO_KEY_GENERATED'}
                            </div>
                            <button
                                onClick={copyToClipboard}
                                className="px-8 py-5 bg-brand-bg text-brand-text font-black text-[11px] uppercase tracking-widest rounded-full hover:opacity-90 transition-all flex items-center gap-2"
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                {copied ? 'Copied' : 'Reveal_Secret'}
                            </button>
                        </div>
                        <div className="flex justify-between items-center ml-8 text-[9px] font-black uppercase tracking-widest opacity-40">
                            <span>Last rotated: {apiKey ? new Date(apiKey.created_at).toLocaleDateString() : 'Never'}</span>
                            <button className="flex items-center gap-2 hover:opacity-100 transition-opacity">
                                <RefreshCw size={10} /> RotateKey_V1
                            </button>
                        </div>
                    </div>
                </motion.section>

                {/* Infrastructure */}
                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-10 bg-white/5 border border-brand-border rounded-[2.5rem]"
                >
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center text-brand-text">
                            <div className="p-4 bg-brand-bg border border-brand-border rounded-2xl text-zinc-500 mr-6">
                                <Cloud size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest">Compute_Peering</h3>
                                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-1">Cloud provider integration for cluster provisioning.</p>
                            </div>
                        </div>
                        <button className="text-[10px] font-black text-brand-text hover:underline uppercase tracking-widest">
                            Update_Provisioner
                        </button>
                    </div>
                    <div className="p-6 bg-brand-bg border border-brand-border rounded-3xl flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-white/5 border border-brand-border rounded-xl flex items-center justify-center text-[10px] font-black">AWS</div>
                            <div>
                                <div className="text-[11px] font-black text-brand-text uppercase tracking-widest">Default_IAM_Context</div>
                                <div className="text-[9px] text-zinc-600 font-bold uppercase mt-1">Partition: US-EAST-1</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 px-5 py-2 border border-green-500/20 rounded-full">
                            <div className="w-1.5 h-1.5 bg-green-500 shadow-[0_0_8px_green]" />
                            <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Verified</span>
                        </div>
                    </div>
                </motion.section>

                {/* Team / RBAC */}
                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-10 bg-white/5 border border-brand-border rounded-[2.5rem]"
                >
                    <div className="flex items-center mb-10">
                        <div className="p-4 bg-brand-bg border border-brand-border rounded-2xl text-zinc-500 mr-6">
                            <Building2 size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-brand-text uppercase tracking-widest">Workspace_Access</h3>
                            <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-1">Manage team members and RBAC policies.</p>
                        </div>
                    </div>
                    <button className="w-full py-5 border border-brand-border text-zinc-600 hover:text-brand-text hover:border-brand-text font-black text-[11px] uppercase tracking-widest transition-all rounded-full flex justify-center items-center gap-3">
                        <Plus size={16} /> Invite_Collaborator
                    </button>
                </motion.section>
            </div>
        </div>
    );
}
