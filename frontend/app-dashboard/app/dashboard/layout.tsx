'use client';

import Link from 'next/link';
import { usePathname, useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { WorkspaceSwitcher } from '@/components/WorkspaceSwitcher';
import {
    LayoutDashboard, MessageSquare, Users2, Settings, Zap, LogOut, Bell,
    Megaphone, FileText, Bot, Shield, User, CreditCard, HelpCircle,
    ChevronDown, Crown, Check, Menu, BarChart2, Calendar, Gift, Target, Globe
} from 'lucide-react';
import { clsx } from 'clsx';
import { useEffect, useState, useRef } from 'react';


import { useSocket } from '@/context/SocketContext';
import { SocketProvider } from '@/context/SocketContext';

const PLAN_COLORS = {
    starter: { bg: 'bg-gray-100', text: 'text-gray-700', name: 'Starter' },
    growth: { bg: 'bg-blue-100', text: 'text-blue-700', name: 'Growth' },
    enterprise: { bg: 'bg-purple-100', text: 'text-purple-700', name: 'Enterprise' },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <SocketProvider>
            <DashboardContent>{children}</DashboardContent>
        </SocketProvider>
    );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const params = useParams();
    const workspaceId = params?.workspaceId as string || 'default';
    const { user, loading, logout, isAdmin } = useAuth();

    const [userPlan, setUserPlan] = useState<'starter' | 'growth' | 'enterprise'>('starter');
    const [membership, setMembership] = useState<any>(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const isReseller = membership?.tenantType === 'reseller';

    const navigation = [
        { name: 'Dashboard', href: `/dashboard/${workspaceId}`, icon: LayoutDashboard },
        { name: 'Contacts', href: `/dashboard/${workspaceId}/contacts`, icon: Users2, permission: 'contacts:read' },
        { name: 'Messages', href: `/dashboard/${workspaceId}/inbox`, icon: MessageSquare, permission: 'inbox:read' },
        { name: 'Campaigns', href: `/dashboard/${workspaceId}/campaigns`, icon: Megaphone, permission: 'campaigns:read' },
        { name: 'Templates', href: `/dashboard/${workspaceId}/templates`, icon: FileText, permission: 'campaigns:read' },
        { name: 'Wallet', href: `/dashboard/${workspaceId}/wallet`, icon: CreditCard },
        { name: 'Leads', href: `/dashboard/${workspaceId}/leads`, icon: Target },
        { name: 'Analytics', href: `/dashboard/${workspaceId}/analytics`, icon: BarChart2 },
        { name: 'Automation', href: `/dashboard/${workspaceId}/automation`, icon: Zap, permission: 'automation:create' },
        { name: 'AI Agent', href: `/dashboard/${workspaceId}/agents`, icon: Bot, permission: 'automation:create' },
        { name: 'Knowledge Base', href: `/dashboard/${workspaceId}/knowledge`, icon: Globe, permission: 'automation:create' },
        { name: 'Scheduler', href: `/dashboard/${workspaceId}/scheduler`, icon: Calendar },
        { name: 'Settings', href: `/dashboard/${workspaceId}/settings/whatsapp`, icon: Settings, permission: 'billing:manage' },
        { name: 'Referrals', href: `/dashboard/${workspaceId}/referrals`, icon: Gift },
        // Platform Admin - only for super_admin or specific platform admins
        { name: 'Platform Admin', href: `/dashboard/${workspaceId}/admin`, icon: Shield, adminOnly: true },
        { name: 'Resellers', href: `/dashboard/${workspaceId}/admin/resellers`, icon: Users2, adminOnly: true },

        // Reseller Specific
        { name: 'My Clients', href: `/dashboard/${workspaceId}/reseller/clients`, icon: Users2, resellerOnly: true },
        { name: 'Branding', href: `/dashboard/${workspaceId}/reseller/branding`, icon: Globe, resellerOnly: true },
    ];

    const { socket, isConnected } = useSocket();

    // 1. Initial State from LocalStorage
    useEffect(() => {
        const savedSound = localStorage.getItem('sound_enabled');
        if (savedSound === null) {
            localStorage.setItem('sound_enabled', 'true'); // Default ON
        }

        const savedCollapsed = localStorage.getItem('sidebar_collapsed');
        if (savedCollapsed === 'true') {
            setIsSidebarCollapsed(true);
        }
    }, []);

    const toggleSidebarCollapse = () => {
        const newState = !isSidebarCollapsed;
        setIsSidebarCollapsed(newState);
        localStorage.setItem('sidebar_collapsed', newState.toString());
    };

    // 2. Real-time Notifications & Sound
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (payload: any) => {
            console.log('[Dashboard] New Notification:', payload);

            // Don't duplicate if already in inbox for this conversation
            // (The inbox page handles its own state, but we want a global alert)

            // Add to notification list
            setNotifications(prev => [
                {
                    id: Date.now(),
                    title: 'New message received',
                    message: `From ${payload.phone}`,
                    time: 'Just now',
                    unread: true
                },
                ...prev.slice(0, 9) // Keep last 10
            ]);

            // Play sound if enabled
            const soundEnabled = localStorage.getItem('sound_enabled') !== 'false';
            if (soundEnabled) {
                if (!audioRef.current) {
                    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                }
                audioRef.current.play().catch(e => console.log('Sound blocked by browser policy'));
            }
        };

        socket.on('newMessage', handleNewMessage);
        return () => { socket.off('newMessage', handleNewMessage); };
    }, [socket]);

    // Set plan based on user info
    useEffect(() => {
        if (user) {
            if (user.email === 'md@modassir.info') {
                setUserPlan('growth');
            } else if (user.email?.includes('enterprise')) {
                setUserPlan('enterprise');
            }
        }
    }, [user]);

    // Fetch workspace membership and subscription
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Membership
                const memResponse = await fetch('/api/v1/auth/membership', {
                    credentials: 'include'
                });
                if (memResponse.ok) {
                    const data = await memResponse.json();
                    setMembership(data);
                }

                // 2. Fetch Subscription (Guard)
                if (!isAdmin) {
                    const subResponse = await fetch('/api/v1/billing/subscription', {
                        credentials: 'include'
                    });
                    if (subResponse.ok) {
                        const subData = await subResponse.json();
                        // If no subscription or trial/active status, redirect to onboarding
                        const validStatuses = ['trial', 'active'];
                        if (!subData || !validStatuses.includes(subData.status)) {
                            router.push('/onboarding');
                        }
                    } else if (subResponse.status === 401 || subResponse.status === 404) {
                        router.push('/onboarding');
                    }
                }
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            }
        };

        if (user) {
            fetchData();
        }
    }, [user, isAdmin, router]);

    // Redirect 'default' to actual workspace
    useEffect(() => {
        // If we're on a reseller subdomain (isReseller is true), prioritize the resolved tenant
        if (workspaceId === 'default' && isReseller && membership?.tenant?.slug) {
            router.replace(`/dashboard/${membership.tenant.slug}`);
            return;
        }

        if (workspaceId === 'default' && user && !isReseller) {
            fetch('/api/v1/auth/workspaces', { credentials: 'include' })
                .then(res => res.json())
                .then(data => {
                    if (data && data.length > 0) {
                        const firstSlug = data[0].tenant?.slug;
                        if (firstSlug) {
                            router.replace(`/dashboard/${firstSlug}`);
                        }
                    }
                })
                .catch(err => console.error('Failed to resolve default workspace:', err));
        }
    }, [workspaceId, user, router, isReseller, membership]);

    // notifications
    const [notifications, setNotifications] = useState([
        { id: 1, title: 'New message received', message: 'From +91 98765 43210', time: '2m ago', unread: true },
        { id: 2, title: 'Campaign completed', message: 'Welcome Series sent to 150 contacts', time: '1h ago', unread: true },
        { id: 3, title: 'AI Agent resolved', message: 'Support bot handled 5 queries', time: '3h ago', unread: false },
    ]);

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

    // Filter navigation items based on context
    const permissions = membership?.permissions || [];
    const visibleNavigation = navigation.filter(item => {
        // If we are in a reseller context, only show Reseller items + Dashboard
        if (isReseller) {
            const resellerFeatures = ['Dashboard', 'My Clients', 'Branding'];
            if (!resellerFeatures.includes(item.name)) return false;
        }

        // Feature Gates for Client Dashboard
        if (!isReseller && !isAdmin) {
            const tenant = membership?.tenant;
            if (item.name === 'Developer API' && !tenant?.apiAccessEnabled) return false;
            // Other feature gates can go here based on reseller-set limits
        }

        if (isAdmin && !isReseller) return true; // Super Admin sees everything in main app
        if (item.adminOnly) return false;
        if ((item as any).resellerOnly && !isReseller) return false;
        if (item.permission && !permissions.includes(item.permission)) return false;
        return true;
    });

    const planInfo = PLAN_COLORS[userPlan];
    const unreadCount = notifications.filter(n => n.unread).length;
    const userName = user?.name || 'User';
    const email = user?.email || '';

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) {
        return null; // Hook handles redirect
    }

    return (
        <div className="flex h-screen bg-muted/40 font-sans" style={{
            // @ts-ignore
            '--primary': membership?.branding?.primaryColor || '#7C3AED',
            '--primary-hover': (membership?.branding?.primaryColor || '#7C3AED') + 'CC',
            '--primary-foreground': '#ffffff'
        }}>
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm sm:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={clsx(
                "fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-background transition-all duration-300 sm:translate-x-0",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full",
                isSidebarCollapsed ? "w-20" : "w-64"
            )}>
                <div className="flex h-16 items-center px-4 border-b justify-between">
                    {/* Logo */}
                    <Link href="/" className={clsx(
                        "flex items-center gap-2 font-bold text-xl text-primary overflow-hidden transition-all",
                        isSidebarCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                    )}>
                        <img
                            src={membership?.branding?.logo || "/logo.png"}
                            alt={membership?.branding?.brandName || "Aerostic"}
                            className="w-8 h-8 object-contain rounded-lg"
                        />
                        <span>{membership?.branding?.brandName || (isReseller ? membership?.tenant?.name : "Aerostic")}</span>
                    </Link>

                    {/* Collapse Toggle (Desktop only) */}
                    <button
                        onClick={toggleSidebarCollapse}
                        className="hidden sm:flex p-1.5 hover:bg-muted rounded-md text-muted-foreground transition-colors"
                    >
                        {isSidebarCollapsed ? <Crown className="w-4 h-4" /> : <ChevronDown className="w-4 h-4 -rotate-90" />}
                    </button>

                    {/* Mobile Logo Placeholder when sidebar hidden/collapsed */}
                    {isSidebarCollapsed && (
                        <img src="/logo.png" alt="Aerostic" className="w-8 h-8 object-contain sm:block hidden" />
                    )}
                </div>
                <div className={clsx("px-4 py-4 border-b", isSidebarCollapsed && "px-2")}>
                    <WorkspaceSwitcher isCollapsed={isSidebarCollapsed} />
                </div>
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {visibleNavigation.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/dashboard' && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsSidebarOpen(false)}
                                className={clsx(
                                    'flex items-center rounded-lg text-sm font-medium transition-all duration-200',
                                    isSidebarCollapsed ? 'justify-center p-2.5 mx-2' : 'gap-3 px-3 py-2.5',
                                    isActive
                                        ? 'bg-primary text-primary-foreground shadow-md'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                                    (item as any).adminOnly && !isActive && 'border border-purple-200 bg-purple-50/50'
                                )}
                                title={isSidebarCollapsed ? item.name : undefined}
                            >
                                <item.icon className={clsx("w-4 h-4 shrink-0", isActive ? "text-white" : "text-muted-foreground")} />
                                {!isSidebarCollapsed && <span>{item.name}</span>}
                                {(item as any).adminOnly && !isActive && !isSidebarCollapsed && (
                                    <Shield className="w-3 h-3 text-purple-500 ml-auto" />
                                )}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t bg-muted/20">
                    <button
                        onClick={logout}
                        className={clsx(
                            "flex items-center text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg w-full transition-colors",
                            isSidebarCollapsed ? "justify-center p-2" : "gap-3 px-3 py-2"
                        )}
                        title={isSidebarCollapsed ? "Logout" : undefined}
                    >
                        <LogOut className="w-4 h-4" />
                        {!isSidebarCollapsed && <span>Logout</span>}
                    </button>
                    {!isSidebarCollapsed && (
                        <div className="mt-4 text-[10px] text-center text-muted-foreground uppercase tracking-widest font-semibold">
                            v1.0.0 Alpha
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <div className={clsx(
                "flex flex-col w-full min-h-screen transition-all duration-300",
                isSidebarCollapsed ? "sm:pl-20" : "sm:pl-64"
            )}>
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur px-4 md:px-8 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 -ml-2 text-muted-foreground hover:text-foreground sm:hidden"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        {/* Breadcrumb / Title Stub */}
                        <h2 className="text-lg font-semibold text-foreground capitalize">
                            {isReseller && (pathname === `/dashboard/${workspaceId}` || pathname.endsWith(workspaceId))
                                ? 'Partner Console'
                                : pathname.split('/')[3]?.replace('-', ' ') || 'Overview'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Plan Badge */}
                        <Link
                            href={`/dashboard/${workspaceId}/billing`}
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
                                        <Link href={`/dashboard/${workspaceId}/notifications`} className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
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
                                    <p className="text-sm font-medium leading-none text-gray-900">
                                        {isReseller ? (membership?.branding?.brandName || membership?.tenant?.name || userName) : userName}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {isReseller ? (membership?.branding?.supportEmail || email) : email}
                                    </p>
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
                                                {(isReseller ? (membership?.branding?.brandName || membership?.tenant?.name || userName) : userName)[0]?.toUpperCase()}
                                            </div>
                                            <div className="text-white">
                                                <p className="font-semibold">{isReseller ? (membership?.branding?.brandName || membership?.tenant?.name || userName) : userName}</p>
                                                <p className="text-xs text-white/80">{isReseller ? (membership?.branding?.supportEmail || email) : email}</p>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${planInfo.bg} ${planInfo.text}`}>
                                                {planInfo.name}
                                            </span>
                                            {isAdmin && (
                                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                                    Platform Admin
                                                </span>
                                            )}
                                            {membership?.role && (
                                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 capitalize">
                                                    {membership.role}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="py-2">
                                        <Link
                                            href={`/dashboard/${workspaceId}/profile`}
                                            onClick={() => { setShowProfileMenu(false); setIsSidebarOpen(false); }}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <User className="w-4 h-4 text-gray-400" />
                                            My Profile
                                        </Link>
                                        <Link
                                            href={`/dashboard/${workspaceId}/billing`}
                                            onClick={() => { setShowProfileMenu(false); setIsSidebarOpen(false); }}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <CreditCard className="w-4 h-4 text-gray-400" />
                                            Billing & Plans
                                        </Link>
                                        <Link
                                            href={`/dashboard/${workspaceId}/settings/whatsapp`}
                                            onClick={() => { setShowProfileMenu(false); setIsSidebarOpen(false); }}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <Settings className="w-4 h-4 text-gray-400" />
                                            Settings
                                        </Link>
                                        <Link
                                            href="/docs"
                                            onClick={() => { setShowProfileMenu(false); setIsSidebarOpen(false); }}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <HelpCircle className="w-4 h-4 text-gray-400" />
                                            Help & Docs
                                        </Link>
                                    </div>

                                    {/* Logout */}
                                    <div className="border-t border-gray-100 py-2">
                                        <button
                                            onClick={logout}
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
                <main className="flex-1 p-4 md:p-8 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
