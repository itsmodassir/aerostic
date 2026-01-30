'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard, MessageSquare, Users2, Settings, Zap, LogOut, Bell,
    Megaphone, FileText, Bot, Shield, User, CreditCard, HelpCircle,
    ChevronDown, Crown, Check
} from 'lucide-react';
import { clsx } from 'clsx';
import { useEffect, useState, useRef } from 'react';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Inbox', href: '/dashboard/inbox', icon: MessageSquare },
    { name: 'Contacts', href: '/dashboard/contacts', icon: Users2 },
    { name: 'Broadcasts', href: '/dashboard/campaigns', icon: Megaphone },
    { name: 'Templates', href: '/dashboard/templates', icon: FileText },
    { name: 'Automation', href: '/dashboard/automation', icon: Zap },
    { name: 'AI Agent', href: '/dashboard/agents', icon: Bot },
    { name: 'Settings', href: '/dashboard/settings/whatsapp', icon: Settings },
    { name: 'Admin Panel', href: '/dashboard/admin', icon: Shield, adminOnly: true },
];

const PLAN_COLORS = {
    starter: { bg: 'bg-gray-100', text: 'text-gray-700', name: 'Starter' },
    growth: { bg: 'bg-blue-100', text: 'text-blue-700', name: 'Growth' },
    enterprise: { bg: 'bg-purple-100', text: 'text-purple-700', name: 'Enterprise' },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [email, setEmail] = useState('Admin');
    const [userName, setUserName] = useState('User');
    const [isAdmin, setIsAdmin] = useState(false);
    const [userPlan, setUserPlan] = useState<'starter' | 'growth' | 'enterprise'>('starter');
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);

    // Demo notifications
    const [notifications] = useState([
        { id: 1, title: 'New message received', message: 'From +91 98765 43210', time: '2m ago', unread: true },
        { id: 2, title: 'Campaign completed', message: 'Welcome Series sent to 150 contacts', time: '1h ago', unread: true },
        { id: 3, title: 'AI Agent resolved', message: 'Support bot handled 5 queries', time: '3h ago', unread: false },
    ]);

    useEffect(() => {
        // Hydrate user info
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setEmail(payload.email || 'Admin');
                setUserName(payload.name || payload.email?.split('@')[0] || 'User');
                // Check if user is admin - md@modassir.info is admin
                setIsAdmin(payload.email === 'md@modassir.info' || payload.role === 'admin');
                // Set plan based on email
                if (payload.email === 'md@modassir.info') {
                    setUserPlan('growth');
                } else if (payload.email?.includes('enterprise')) {
                    setUserPlan('enterprise');
                }
            } catch (e) { }
        }
    }, []);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter navigation items based on admin status
    const visibleNavigation = navigation.filter(item =>
        !(item as any).adminOnly || isAdmin
    );

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };

    const planInfo = PLAN_COLORS[userPlan];
    const unreadCount = notifications.filter(n => n.unread).length;

    return (
        <div className="flex h-screen bg-muted/40">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background sm:flex">
                <div className="flex h-16 items-center px-6 border-b">
                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-primary">
                        <MessageSquare className="fill-current" />
                        <span>Aerostic</span>
                    </Link>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {visibleNavigation.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/dashboard' && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={clsx(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                                    isActive
                                        ? 'bg-primary text-primary-foreground shadow-md'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                                    (item as any).adminOnly && !isActive && 'border border-purple-200 bg-purple-50/50'
                                )}
                            >
                                <item.icon className={clsx("w-4 h-4", isActive ? "text-white" : "text-muted-foreground")} />
                                <span>{item.name}</span>
                                {(item as any).adminOnly && !isActive && (
                                    <Shield className="w-3 h-3 text-purple-500 ml-auto" />
                                )}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t bg-muted/20">
                    <button
                        onClick={handleLogout}
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
                        {pathname.split('/')[2]?.replace('-', ' ') || 'Dashboard'}
                    </h2>

                    <div className="flex items-center gap-4">
                        {/* Plan Badge */}
                        <Link
                            href="/dashboard/billing"
                            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${planInfo.bg} ${planInfo.text} hover:opacity-80 transition-opacity`}
                        >
                            <Crown className="w-3 h-3" />
                            {planInfo.name} Plan
                        </Link>

                        {/* Notifications */}
                        <div className="relative" ref={notifRef}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="text-muted-foreground hover:text-foreground transition-colors relative p-2 rounded-lg hover:bg-muted"
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                                        <button className="text-xs text-blue-600 hover:text-blue-700">Mark all read</button>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.map(notif => (
                                            <div key={notif.id} className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${notif.unread ? 'bg-blue-50/50' : ''}`}>
                                                <div className="flex items-start gap-3">
                                                    <div className={`w-2 h-2 rounded-full mt-2 ${notif.unread ? 'bg-blue-500' : 'bg-gray-300'}`} />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                                                        <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                                                        <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-3 border-t border-gray-100">
                                        <Link href="/dashboard/notifications" className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
                                            View all notifications
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="h-8 w-px bg-border" />

                        {/* Profile Dropdown */}
                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="flex items-center gap-3 p-1.5 pr-3 rounded-lg hover:bg-muted transition-colors"
                            >
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center font-bold text-sm">
                                    {userName[0]?.toUpperCase()}
                                </div>
                                <div className="text-left hidden md:block">
                                    <p className="text-sm font-medium leading-none text-gray-900">{userName}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{email}</p>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Profile Menu */}
                            {showProfileMenu && (
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                                    {/* User Info Header */}
                                    <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur text-white flex items-center justify-center font-bold text-lg">
                                                {userName[0]?.toUpperCase()}
                                            </div>
                                            <div className="text-white">
                                                <p className="font-semibold">{userName}</p>
                                                <p className="text-xs text-white/80">{email}</p>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${planInfo.bg} ${planInfo.text}`}>
                                                {planInfo.name}
                                            </span>
                                            {isAdmin && (
                                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                                    Admin
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="py-2">
                                        <Link
                                            href="/dashboard/profile"
                                            onClick={() => setShowProfileMenu(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <User className="w-4 h-4 text-gray-400" />
                                            My Profile
                                        </Link>
                                        <Link
                                            href="/dashboard/billing"
                                            onClick={() => setShowProfileMenu(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <CreditCard className="w-4 h-4 text-gray-400" />
                                            Billing & Plans
                                        </Link>
                                        <Link
                                            href="/dashboard/settings/whatsapp"
                                            onClick={() => setShowProfileMenu(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <Settings className="w-4 h-4 text-gray-400" />
                                            Settings
                                        </Link>
                                        <Link
                                            href="/docs"
                                            onClick={() => setShowProfileMenu(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <HelpCircle className="w-4 h-4 text-gray-400" />
                                            Help & Docs
                                        </Link>
                                    </div>

                                    {/* Logout */}
                                    <div className="border-t border-gray-100 py-2">
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Sign out
                                        </button>
                                    </div>
                                </div>
                            )}
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
