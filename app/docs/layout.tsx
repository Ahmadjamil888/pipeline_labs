"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
    ChevronRight,
    Terminal,
    Book,
    Code2,
    Cpu,
    Database,
    Globe,
    Shield,
    Zap,
    Layers,
    Menu,
    X,
    Search
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "../theme-provider";
import { ThemeToggle } from "../theme-toggle";

export default function DocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { theme } = useTheme();

    const sections = [
        {
            title: "Getting Started",
            items: [
                { name: "Introduction", href: "/docs", icon: Book },
                { name: "Quickstart", href: "/docs/quickstart", icon: Zap },
            ]
        },
        {
            title: "Zero-Config Execution",
            items: [
                { name: "Training", href: "/docs/training", icon: Cpu },
                { name: "Fine-Tuning", href: "/docs/fine-tuning", icon: Zap },
                { name: "Model Imports", href: "/docs/model-imports", icon: Database },
            ]
        },
        {
            title: "API Reference",
            items: [
                { name: "Python SDK (pipeline_labs)", href: "/docs/sdk-python", icon: Code2 },
                { name: "Registry & Models", href: "/docs/registry", icon: Layers },
                { name: "Deployments", href: "/docs/deployments", icon: Globe },
            ]
        }
    ];

    return (
        <div className="min-h-screen flex flex-col" style={{ background: '#0b0b0b', color: '#fff', fontFamily: "'Helvetica World', Helvetica, Arial, sans-serif", fontWeight: 300 }}>
            {/* Docs Header */}
            <header className="h-16 border-b flex items-center justify-between px-6 sticky top-0 z-50"
                style={{ background: 'rgba(0,0,0,0.7)', borderColor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src={'/logo-dark.png'} // Force logo inside docs
                            alt="Pipeline Logo"
                            width={24}
                            height={24}
                            className="w-6 h-6 object-contain"
                        />
                        <span className="text-sm font-bold tracking-wider">pipeline_labs <span className="text-zinc-500 ml-1">DOCS</span></span>
                    </Link>
                    <div className="h-4 w-px bg-brand-border" />
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-brand-border rounded-full text-zinc-500 text-xs">
                        <Search size={14} />
                        <span>Search documentation...</span>
                        <span className="ml-4 opacity-50">⌘K</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <Link href="/dashboard" className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-brand-text transition-all">Go to Dashboard</Link>
                    <button className="md:hidden text-brand-text" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <aside className={`${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full'} md:translate-x-0 md:w-64 border-r overflow-y-auto transition-all`}
                    style={{ background: 'rgba(0,0,0,0.6)', borderColor: 'rgba(255,255,255,0.08)' }}>
                    <nav className="p-6 space-y-8">
                        {sections.map((section) => (
                            <div key={section.title} className="space-y-3">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">{section.title}</h3>
                                <div className="space-y-1">
                                    {section.items.map((item) => {
                                        const isActive = pathname === item.href;
                                        return (
                                            <Link key={item.name} href={item.href}>
                                                <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive
                                                    ? "bg-brand-text text-brand-bg font-bold"
                                                    : "text-zinc-500 hover:text-brand-text hover:bg-white/5"
                                                    }`}>
                                                    <item.icon size={16} />
                                                    <span>{item.name}</span>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto scroll-smooth">
                    <div className="max-w-4xl mx-auto py-16 px-8 md:px-12">
                        {children}
                    </div>

                    {/* Footer Navigation */}
                    <footer className="max-w-4xl mx-auto py-12 px-8 md:px-12 border-t border-brand-border flex justify-between text-zinc-500 text-sm">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-800">Previous</span>
                            <span className="hover:text-brand-text cursor-pointer transition-colors">Introduction</span>
                        </div>
                        <div className="flex flex-col gap-1 text-right">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-800">Next</span>
                            <span className="hover:text-brand-text cursor-pointer flex items-center gap-1 justify-end transition-colors">Installation <ChevronRight size={14} /></span>
                        </div>
                    </footer>
                </main>
            </div>
        </div>
    );
}
