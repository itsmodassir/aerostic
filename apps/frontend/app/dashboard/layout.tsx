'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, MessageSquare, Users2, Settings, Zap, LogOut, Bell, Megaphone, FileText, Bot } from 'lucide-react';
import { clsx } from 'clsx';
import { useEffect, useState } from 'react';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Inbox', href: '/dashboard/inbox', icon: MessageSquare },
    { name: 'Contacts', href: '/dashboard/contacts', icon: Users2 },
    { name: 'Broadcasts', href: '/dashboard/campaigns', icon: Megaphone },
    { name: 'Templates', href: '/dashboard/templates', icon: FileText },
    { name: 'Automation', href: '/dashboard/automation', icon: Zap },
    { name: 'AI Agent', href: '/dashboard/settings/ai', icon: Bot },
    { name: 'Settings', href: '/dashboard/settings/whatsapp', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [email, setEmail] = useState('Admin');

    useEffect(() => {
        // Hydrate user info
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setEmail(payload.email || 'Admin');
            } catch (e) { }
        }
    }, []);

    return (
        <div className="flex h-screen bg-muted/40">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background sm:flex">
                <div className="flex h-16 items-center px-6 border-b">
                    {/* Logo */}
                    <div className="flex items-center gap-2 font-bold text-xl text-primary">
                        <MessageSquare className="fill-current" />
                        <span>Aerostic</span>
                    </div>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={clsx(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                                    isActive
                                        ? 'bg-primary text-primary-foreground shadow-md'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                )}
                            >
                                <item.icon className={clsx("w-4 h-4", isActive ? "text-white" : "text-muted-foreground")} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t bg-muted/20">
                    <button
                        onClick={() => {
                            localStorage.removeItem('token');
                            window.location.href = '/login';
                        }}
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg w-full transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                    <div className="mt-4 text-[10px] text-center text-muted-foreground uppercase tracking-widest font-semibold">
                        v1.0.0 Alpha
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex flex-col sm:ml-64 w-full min-h-screen">
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur px-8 shadow-sm">
                    {/* Breadcrumb / Title Stub */}
                    <h2 className="text-lg font-semibold text-foreground capitalize">
                        {pathname.split('/')[2] || 'Dashboard'}
                    </h2>

                    <div className="flex items-center gap-4">
                        <button className="text-muted-foreground hover:text-foreground transition-colors relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>
                        <div className="h-8 w-px bg-border mx-2" />
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-medium leading-none">{email}</p>
                                <p className="text-xs text-muted-foreground mt-1">Workspace Admin</p>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold border border-primary/20">
                                {email[0]?.toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>
                <main className="flex-1 p-8 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
