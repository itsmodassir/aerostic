'use client';

import React, { memo, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, MessageSquare, Users2, Settings, Zap, LogOut,
    Megaphone, FileText, Bot, Shield, Target, Calendar, Workflow,
    ChevronDown, Crown, ShoppingCart
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
    { name: 'Inbox', href: '/inbox', icon: MessageSquare, permission: 'inbox:read' },
    { name: 'Campaigns', href: '/campaigns', icon: Megaphone, permission: 'campaigns:read' },
    { name: 'Orders', href: '/orders', icon: ShoppingCart },
    { name: 'Catalogue', href: '/commerce/catalogue', icon: LayoutDashboard },
    { name: 'Templates', href: '/templates', icon: FileText, permission: 'campaigns:read' },
    { name: 'WhatsApp Flows', href: '/settings/whatsapp/flows', icon: Workflow, permission: 'campaigns:read' },
    { name: 'Analytics', href: '/analytics', icon: BarChart2 },
    { name: 'Automations', href: '/automations', icon: Zap, permission: 'campaigns:read' },
    { name: 'AI Agent', href: '/ai-agents', icon: Bot, permission: 'automation:create' },
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
            { name: 'Wallet', href: '/billing' },
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
    
    // Optimized workspace prefixing logic with better fallbacks
    const workspacePrefix = useMemo(() => {
        // First priority: Tenant slug from active membership
        if (membership?.tenant?.slug) return `/dashboard/${membership.tenant.slug}`;
        if (membership?.tenantId) return `/dashboard/${membership.tenantId}`;
        
        // Second priority: Extract from URL if membership is still loading
        const matches = pathname.match(/\/dashboard\/([^\/]+)/);
        if (matches && matches[1] !== 'new') {
            return `/dashboard/${matches[1]}`;
        }
        
        return '';
    }, [membership, pathname]);

    const visibleNavigation = useMemo(() => {
        const items = NAVIGATION.map(item => {
            // Apply workspace prefix to all internal links
            const transformHref = (href?: string) => {
                if (!href || href.startsWith('http')) return href;
                if (href === '/dashboard' && workspacePrefix) return workspacePrefix;
                if (!workspacePrefix) return href;
                if (href.startsWith(workspacePrefix)) return href;
                return `${workspacePrefix}${href}`;
            };

            const newItem = { ...item, href: transformHref(item.href) };
            if (item.children) {
                newItem.children = item.children.map(child => ({
                    ...child,
                    href: transformHref(child.href) || '#'
                })).filter(child => {
                    if (isAdmin) return true;
                    if (child.permission && !permissions.includes(child.permission)) return false;
                    return true;
                });
            }
            return newItem;
        }).filter(item => {
            if (item.children && item.children.length === 0) return false;
            if (isAdmin) return true;
            if (item.adminOnly) return false;
            if (item.permission && !permissions.includes(item.permission)) return false;
            return true;
        });

        return items;
    }, [isAdmin, permissions, workspacePrefix]);

    return (
        <>
            {isSidebarOpen && (
                <button
                    aria-label="Close navigation"
                    className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-[1px] sm:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
            <aside className={clsx(
                "fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-background transition-all duration-300 sm:translate-x-0",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full",
                isSidebarCollapsed ? "sm:w-20" : "sm:w-64",
                "w-[min(20rem,88vw)] shadow-2xl shadow-slate-950/10 sm:shadow-none"
            )}>
            <div className="flex h-16 items-center border-b px-4 justify-between">
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
            
            <div className={clsx("border-b px-4 py-4", isSidebarCollapsed && "sm:px-2")}>
                <WorkspaceSwitcher isCollapsed={isSidebarCollapsed} />
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4 sm:px-4 sm:py-6 space-y-1">
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
        </>
    );
});

const NavRow = memo(function NavRow({ item, pathname, isCollapsed, onCloseMobile }: any) {
    const [isOpen, setIsOpen] = React.useState(false);
    const hasChildren = item.children && item.children.length > 0;
    
    // Improved active detection for workspace-prefixed paths
    const isActive = useMemo(() => {
        if (!item.href && !hasChildren) return false;
        
        const checkActive = (href: string) => {
            if (pathname === href) return true;
            // Handle routes like /dashboard/[slug] accurately
            if (href.endsWith('/dashboard') || href.match(/\/dashboard\/[^\/]+$/)) {
                return pathname === href;
            }
            return pathname.startsWith(href);
        };

        if (item.href && checkActive(item.href)) return true;
        if (hasChildren) {
            return item.children.some((c: any) => checkActive(c.href));
        }
        return false;
    }, [pathname, item.href, item.children, hasChildren]);

    const isChildActive = hasChildren && item.children.some((c: any) => pathname === c.href || (c.href !== '/dashboard' && pathname.startsWith(c.href)));

    if (hasChildren) {
        const showExpand = isOpen || isChildActive;
        return (
            <div className="flex flex-col mb-1">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={clsx(
                        'flex justify-between items-center rounded-lg text-sm font-medium transition-all duration-200 w-full',
                        isCollapsed ? 'sm:justify-center sm:p-2.5 sm:mx-2 px-3 py-2.5' : 'px-3 py-2.5',
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
                isCollapsed ? 'sm:justify-center sm:p-2.5 sm:mx-2 px-3 py-2.5' : 'gap-3 px-3 py-2.5',
                isActive ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
        >
            <item.icon className={clsx("w-4 h-4 shrink-0", isActive ? "text-white" : "text-muted-foreground")} />
            {!isCollapsed && <span>{item.name}</span>}
        </Link>
    );
});

export default Sidebar;
