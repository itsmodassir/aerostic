'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, Users, CreditCard, BarChart3, Settings, Shield,
    FileText, Activity, Bell, Database, Globe, Key, Webhook,
    MessageSquare, AlertTriangle, Server, LogOut
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (!token || !userStr) {
            router.push('/admin/login');
            return;
        }

        try {
            const user = JSON.parse(userStr);
            if (user.role !== 'admin') {
                router.push('/dashboard'); // Not an admin
                return;
            }
            setAuthorized(true);
        } catch (e) {
            router.push('/admin/login');
        }
    }, [router]);

    if (!authorized) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>;
    }

    const navigation = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Tenants', href: '/admin/tenants', icon: Users },
        { name: 'Billing & Revenue', href: '/admin/billing', icon: CreditCard },
        { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
        { name: 'Messages', href: '/admin/messages', icon: MessageSquare },
        { name: 'API Keys', href: '/admin/api-keys', icon: Key },
        { name: 'Webhooks', href: '/admin/webhooks', icon: Webhook },
        { name: 'Audit Logs', href: '/admin/audit-logs', icon: FileText },
        { name: 'System Health', href: '/admin/health', icon: Activity },
        { name: 'Alerts', href: '/admin/alerts', icon: AlertTriangle },
        { name: 'Configuration', href: '/admin/system', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-72 bg-gray-900 text-white fixed h-full overflow-y-auto">
                {/* Logo */}
                <div className="p-6 border-b border-gray-800">
                    <Link href="/admin" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <span className="text-xl font-bold">Aerostic</span>
                            <p className="text-xs text-gray-400">Admin Console</p>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Quick Stats */}
                <div className="p-4 border-t border-gray-800 mt-4">
                    <div className="bg-gray-800 rounded-xl p-4">
                        <h4 className="text-sm font-medium text-gray-400 mb-3">Quick Stats</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Active Tenants</span>
                                <span className="text-green-400 font-bold">2,547</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Messages Today</span>
                                <span className="text-blue-400 font-bold">1.2M</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">MRR</span>
                                <span className="text-purple-400 font-bold">₹48.5L</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Back to Main */}
                <div className="p-4 border-t border-gray-800">
                    <Link
                        href="/"
                        className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Exit Admin</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-72">
                {/* Top Bar */}
                <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Admin Console</h1>
                            <p className="text-sm text-gray-500">Manage your platform</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                    A
                                </div>
                                <span className="text-sm font-medium text-gray-700">Admin</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
