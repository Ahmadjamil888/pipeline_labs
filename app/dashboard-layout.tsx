"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
    Home,
    Database,
    Cpu,
    Layers,
    Activity,
    Settings,
    LogOut,
    Menu,
    X
} from "lucide-react";
import { createClient } from "./supabase-client";
import { useTheme } from "./theme-provider";
import { ThemeToggle } from "./theme-toggle";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();
    const supabase = createClient();
    const { theme } = useTheme();

    const navItems = [
        { name: "Overview", icon: Home, href: "/dashboard" },
        { name: "Models", icon: Layers, href: "/models" },
        { name: "Datasets", icon: Database, href: "/datasets" },
        { name: "Training", icon: Cpu, href: "/training" },
        { name: "Endpoints", icon: Activity, href: "/endpoints" },
        { name: "Settings", icon: Settings, href: "/settings" },
    ];

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const publicPaths = ['/login', '/', '/contact', '/docs'];
            const isPublic = publicPaths.some(path => pathname === path || pathname?.startsWith('/docs'));
            if (!session && !isPublic) {
                window.location.href = '/contact';
            } else {
                setLoading(false);
            }
        };
        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            const publicPaths = ['/login', '/', '/contact', '/docs'];
            const isPublic = publicPaths.some(path => pathname === path || pathname?.startsWith('/docs'));
            if (!session && !isPublic) {
                window.location.href = '/contact';
            }
        });

        return () => subscription.unsubscribe();
    }, [supabase, pathname]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/contact';
    };

    if (pathname === '/login' || pathname === '/' || pathname === '/contact' || pathname?.startsWith('/docs')) {
        return <>{children}</>;
    }

    if (loading) {
        return (
            <div className="h-screen w-screen bg-brand-bg flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-brand-text border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-brand-bg text-brand-text overflow-hidden font-sans transition-colors duration-300">
            {/* Sidebar */}
            <aside
                className={`${isSidebarOpen ? 'w-64' : 'w-20'} relative z-20 bg-brand-bg border-r border-brand-border flex flex-col transition-all duration-150 ease-in-out`}
            >
                <div className="p-6 flex items-center justify-between">
                    {isSidebarOpen && (
                        <div className="flex items-center gap-2">
                            <Image
                                src={theme === 'dark' ? '/logo-dark.png' : '/logo-light.png'}
                                alt="Pipeline Logo"
                                width={24}
                                height={24}
                                className="w-6 h-6 object-contain"
                            />
                            <span className="text-sm font-bold tracking-wider text-brand-text uppercase">
                                PIPELINE
                            </span>
                        </div>
                    )}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-1 hover:bg-white/5 text-zinc-500 rounded-full transition-colors"
                    >
                        {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>

                <nav className="flex-1 px-3 py-6 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.name} href={item.href}>
                                <div className={`flex items-center px-4 py-2.5 rounded-full transition-all group ${isActive
                                    ? "bg-brand-text text-brand-bg font-bold shadow-lg"
                                    : "text-zinc-500 hover:text-brand-text hover:bg-white/5"
                                    }`}>
                                    <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                    {isSidebarOpen && (
                                        <span className="ml-4 text-sm font-medium">
                                            {item.name}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-brand-border space-y-4">
                    <div className="flex justify-center">
                        <ThemeToggle />
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2.5 text-zinc-500 hover:text-brand-text hover:bg-white/5 rounded-full transition-all"
                    >
                        <LogOut size={18} />
                        {isSidebarOpen && <span className="ml-4 text-sm font-medium">Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-brand-bg relative overflow-hidden">
                <div className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth">
                    <div className="p-12 mb-20 max-w-7xl mx-auto animate-in fade-in duration-500">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
