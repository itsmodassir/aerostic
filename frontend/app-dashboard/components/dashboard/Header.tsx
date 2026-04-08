'use client';

import React, { memo, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Menu, Bell, Crown, ChevronDown, User, CreditCard, Settings, HelpCircle, LogOut
} from 'lucide-react';
import { clsx } from 'clsx';
import { useDashboard } from './DashboardContext';

const Header = memo(function Header({ user, isAdmin, logout }: { user: any, isAdmin: boolean, logout: () => void }) {
    const pathname = usePathname();
    const { 
        setIsSidebarOpen, notifications, unreadCount, markAllAsRead, membership, 
        isSidebarCollapsed 
    } = useDashboard();
    
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);

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

    const PLAN_COLORS: any = {
        starter: { bg: 'bg-gray-100', text: 'text-gray-700', name: 'Starter' },
        growth: { bg: 'bg-blue-100', text: 'text-blue-700', name: 'Growth' },
        enterprise: { bg: 'bg-purple-100', text: 'text-purple-700', name: 'Enterprise' },
    };
    
    const userPlan = user?.email?.includes('enterprise') ? 'enterprise' : (user?.email === 'md@modassir.info' ? 'growth' : 'starter');
    const planInfo = PLAN_COLORS[userPlan];

    return (
        <header className="sticky top-0 z-30 flex flex-col sm:flex-row h-auto sm:h-16 items-center justify-between border-b bg-background/95 backdrop-blur px-4 md:px-8 py-3 sm:py-0 shadow-sm gap-4 sm:gap-0">
            <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 -ml-2 text-muted-foreground hover:text-foreground sm:hidden"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                <Link
                    href="/billing"
                    className={clsx(
                        "hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium hover:opacity-80 transition-opacity",
                        planInfo.bg, planInfo.text
                    )}
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

                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900">Notifications</h3>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); markAllAsRead(); }}
                                    className="text-xs text-blue-600 hover:text-blue-700"
                                >
                                    Mark all read
                                </button>
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-6 text-center text-gray-500 text-sm">No recent activity</div>
                                ) : notifications.map(notif => (
                                    <div key={notif.id} className={clsx("p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer", notif.unread && "bg-blue-50/50")}>
                                        <div className="flex items-start gap-3">
                                            <div className={clsx("w-2 h-2 rounded-full mt-2", notif.unread ? 'bg-blue-500' : 'bg-gray-300')} />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                                                <p className="text-xs text-gray-400 mt-1">{notif.time || notif.createdAt}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
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
                            {(user?.name || 'U')[0].toUpperCase()}
                        </div>
                        <div className="text-left hidden md:block">
                            <p className="text-sm font-medium leading-none text-gray-900">{membership?.branding?.brandName || user?.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{membership?.branding?.supportEmail || user?.email}</p>
                        </div>
                        <ChevronDown className={clsx("w-4 h-4 text-gray-400 transition-transform", showProfileMenu && "rotate-180")} />
                    </button>

                    {showProfileMenu && (
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                            <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur text-white flex items-center justify-center font-bold text-lg">
                                        {(membership?.branding?.brandName || user?.name || 'U')[0]?.toUpperCase()}
                                    </div>
                                    <div className="text-white">
                                        <p className="font-semibold">{membership?.branding?.brandName || user?.name}</p>
                                        <p className="text-xs text-white/80">{membership?.branding?.supportEmail || user?.email}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="py-2">
                                <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                    <User className="w-4 h-4 text-gray-400" /> My Profile
                                </Link>
                                <Link href="/billing" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                    <CreditCard className="w-4 h-4 text-gray-400" /> Billing
                                </Link>
                                <div className="border-t border-gray-100 py-2">
                                    <button onClick={logout} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full">
                                        <LogOut className="w-4 h-4" /> Sign out
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
});

export default Header;
