'use client';

import React, { memo, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, MessageSquare, Users2, Settings, Zap, LogOut,
    Megaphone, FileText, Bot, Shield, Target, Calendar, Workflow,
    ChevronDown, Crown
} from 'lucide-react';
import { clsx } from 'clsx';
import { useDashboard } from './DashboardContext';
import { WorkspaceSwitcher } from '@/components/WorkspaceSwitcher';

interface NavItem {
    name: string;
    href?: string;
    icon: any;
    permission?: string;
    adminOnly?: boolean;
    children?: { name: string; href: string; permission?: string }[];
}

const NAVIGATION: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Contacts', href: '/contacts', icon: Users2, permission: 'contacts:read' },
    { name: 'Messages', href: '/message', icon: MessageSquare, permission: 'inbox:read' },
    { name: 'Campaigns', href: '/campaigns', icon: Megaphone, permission: 'campaigns:read' },
    { name: 'Templates', href: '/templates', icon: FileText, permission: 'campaigns:read' },
    { name: 'WhatsApp Flows', href: '/settings/whatsapp/flows', icon: Workflow, permission: 'campaigns:read' },
    { name: 'Leads', href: '/leads', icon: Target },
    { name: 'Analytics', href: '/analytics', icon: BarChart2 },
    { name: 'Automation', href: '/automation', icon: Zap, permission: 'automation:create' },
    { name: 'Automations (AI)', href: '/automations', icon: Bot, permission: 'campaigns:read' },
    { name: 'AI Agent', href: '/ai-agent', icon: Bot, permission: 'automation:create' },
    { name: 'Scheduler', href: '/scheduler', icon: Calendar },
    {
        name: 'Settings',
        icon: Settings,
        permission: 'billing:manage',
        children: [
            { name: 'WhatsApp', href: '/settings/whatsapp' },
            { name: 'WA Forms', href: '/settings/whatsapp/forms' },
            { name: 'Trigger Flow', href: '/settings/whatsapp/trigger-flow' },
            { name: 'Email Flow', href: '/settings/email' },
            { name: 'AI Models', href: '/settings/ai' },
            { name: 'Wallet', href: '/wallet' },
            { name: 'Knowledge Base', href: '/knowledge-base', permission: 'automation:create' },
            { name: 'Referrals', href: '/referrals' },
        ]
    },
    { name: 'Platform Admin', href: 'https://admin.aimstore.in', icon: Shield, adminOnly: true },
    { name: 'Resellers', href: 'https://admin.aimstore.in/resellers', icon: Users2, adminOnly: true },
];

import { BarChart2 } from 'lucide-react';

const Sidebar = memo(function Sidebar({ user, isAdmin }: { user: any, isAdmin: boolean }) {
    const pathname = usePathname();
    const { isSidebarCollapsed, toggleSidebarCollapse, isSidebarOpen, setIsSidebarOpen, membership } = useDashboard();
    
    const permissions = user?.permissions || membership?.permissions || [];
    
    const visibleNavigation = useMemo(() => {
        return NAVIGATION.map(item => {
            if (item.children) {
                const visibleChildren = item.children.filter(child => {
                    if (isAdmin) return true;
                    if (child.permission && !permissions.includes(child.permission)) return false;
                    return true;
                });
                return { ...item, children: visibleChildren };
            }
            return item;
        }).filter(item => {
            if (item.children && item.children.length === 0) return false;
            if (isAdmin) return true;
            if (item.adminOnly) return false;
            if (item.permission && !permissions.includes(item.permission)) return false;
            return true;
        });
    }, [isAdmin, permissions]);

    return (
        <aside className={clsx(
            "fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-background transition-all duration-300 sm:translate-x-0",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full",
            isSidebarCollapsed ? "w-20" : "w-64"
        )}>
            <div className="flex h-16 items-center px-4 border-b justify-between">
                <Link href="/" className={clsx(
                    "flex items-center gap-2 font-bold text-xl text-primary overflow-hidden transition-all",
                    isSidebarCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                )}>
                    <span>{membership?.branding?.brandName || "Aerostic"}</span>
                </Link>

                <button
                    onClick={toggleSidebarCollapse}
                    className="hidden sm:flex p-1.5 hover:bg-muted rounded-md text-muted-foreground transition-colors"
                >
                    {isSidebarCollapsed ? <Crown className="w-4 h-4" /> : <ChevronDown className="w-4 h-4 -rotate-90" />}
                </button>

                {isSidebarCollapsed && (
                    <img src="/logo.png" alt="Aerostic" className="w-8 h-8 object-contain sm:block hidden" />
                )}
            </div>
            
            <div className={clsx("px-4 py-4 border-b", isSidebarCollapsed && "px-2")}>
                <WorkspaceSwitcher isCollapsed={isSidebarCollapsed} />
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {visibleNavigation.map((item) => (
                    <NavRow 
                        key={item.name} 
                        item={item} 
                        pathname={pathname} 
                        isCollapsed={isSidebarCollapsed} 
                        onCloseMobile={() => setIsSidebarOpen(false)} 
                    />
                ))}
            </nav>
        </aside>
    );
});

const NavRow = memo(function NavRow({ item, pathname, isCollapsed, onCloseMobile }: any) {
    const [isOpen, setIsOpen] = React.useState(false);
    const hasChildren = item.children && item.children.length > 0;
    const isChildActive = hasChildren && item.children.some((c: any) => pathname === c.href || (c.href !== '/dashboard' && pathname.startsWith(c.href)));
    const isActive = (item.href && pathname === item.href) || (item.href && item.href !== '/dashboard' && pathname.startsWith(item.href)) || isChildActive;

    if (hasChildren) {
        const showExpand = isOpen || isChildActive;
        return (
            <div className="flex flex-col mb-1">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={clsx(
                        'flex justify-between items-center rounded-lg text-sm font-medium transition-all duration-200 w-full',
                        isCollapsed ? 'justify-center p-2.5 mx-2' : 'px-3 py-2.5',
                        isActive && !isOpen ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}
                >
                    <div className="flex items-center gap-3">
                        <item.icon className={clsx("w-4 h-4 shrink-0", (isActive && !isOpen) ? "text-primary" : "text-muted-foreground")} />
                        {!isCollapsed && <span>{item.name}</span>}
                    </div>
                    {!isCollapsed && <ChevronDown className={clsx("w-4 h-4 transition-transform", showExpand ? "rotate-180" : "")} />}
                </button>
                {showExpand && !isCollapsed && (
                    <div className="flex flex-col gap-1 pl-9 pr-2 border-l-2 border-muted ml-4 mt-1 mb-2">
                        {item.children.map((child: any) => (
                            <Link
                                key={child.name}
                                href={child.href}
                                onClick={onCloseMobile}
                                className={clsx(
                                    'flex items-center rounded-md text-sm transition-all duration-200 py-2 px-3',
                                    pathname === child.href ? 'bg-primary text-primary-foreground shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                )}
                            >
                                <span>{child.name}</span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <Link
            href={item.href}
            onClick={onCloseMobile}
            className={clsx(
                'flex items-center rounded-lg text-sm font-medium transition-all duration-200 mb-1',
                isCollapsed ? 'justify-center p-2.5 mx-2' : 'gap-3 px-3 py-2.5',
                isActive ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
        >
            <item.icon className={clsx("w-4 h-4 shrink-0", isActive ? "text-white" : "text-muted-foreground")} />
            {!isCollapsed && <span>{item.name}</span>}
        </Link>
    );
});

export default Sidebar;
