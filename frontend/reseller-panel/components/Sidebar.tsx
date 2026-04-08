'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    LayoutDashboard, Users2, ShieldCheck, Gem, 
    Settings, Globe, BarChart3, HelpCircle, LogOut,
    Plus, ChevronRight, Crown, Workflow, CreditCard, 
    MessageSquare, Target
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

const navigation = [
    { name: 'Overview', href: '/', icon: LayoutDashboard },
    { name: 'My Clients', href: '/clients', icon: Users2 },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Branding', href: '/branding', icon: Globe },
    { name: 'Commissions', href: '/commissions', icon: CreditCard },
    { 
        name: 'Settings', 
        icon: Settings,
        children: [
            { name: 'Partner Profile', href: '/settings/profile' },
            { name: 'API Access', href: '/settings/api' },
            { name: 'Security', href: '/settings/security' },
        ]
    },
];

export default function ResellerSidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-white border-r-2 border-slate-50 flex flex-col p-8 overflow-y-auto">
            <div className="mb-12">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 group-hover:rotate-12 transition-transform">
                        <Crown size={24} strokeWidth={3} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight lowercase font-black">Partner Hub<span className="text-indigo-600">.</span></h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Aerostic Reseller</p>
                    </div>
                </Link>
            </div>

            <nav className="flex-1 space-y-6">
                 <div>
                     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 ml-4 italic">Main_Console</h3>
                     <div className="space-y-2">
                        {navigation.map((item) => {
                            const href = item.href ?? '';
                            const isRootRoute = href === '/';
                            const isActive = pathname === href || (!isRootRoute && pathname.startsWith(href));
                            return (
                                <Link
                                    key={item.name}
                                    href={href || '#'}
                                    className={clsx(
                                        "group flex items-center gap-4 px-6 py-4 rounded-[22px] transition-all duration-300 relative overflow-hidden",
                                        isActive ? "bg-indigo-600 text-white shadow-2xl shadow-indigo-500/20" : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
                                    )}
                                >
                                    <item.icon size={20} strokeWidth={isActive ? 3 : 2} className={clsx("transition-transform group-hover:scale-110", isActive ? "text-white" : "text-slate-300")} />
                                    <span className="text-sm font-black tracking-tight lowercase leading-none">{item.name}</span>
                                    {isActive && (
                                        <motion.div 
                                            layoutId="active-nav"
                                            className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full shadow-lg"
                                        />
                                    )}
                                </Link>
                            );
                        })}
                     </div>
                 </div>

                 <div className="pt-6">
                     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 ml-4 italic">Support_Lab</h3>
                     <div className="space-y-2">
                        {[
                            { name: 'Documentation', icon: Globe },
                            { name: 'Raise Ticket', icon: Target },
                        ].map((item) => (
                            <button key={item.name} className="w-full group flex items-center gap-4 px-6 py-4 rounded-[22px] text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all">
                                <item.icon size={20} className="text-slate-300 transition-transform group-hover:scale-110" />
                                <span className="text-sm font-black tracking-tight lowercase leading-none">{item.name}</span>
                            </button>
                        ))}
                     </div>
                 </div>
            </nav>

            <div className="mt-auto pt-10 space-y-6">
                <div className="bg-indigo-50 rounded-[32px] p-8 border border-indigo-100/50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600 blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity" />
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3">Enterprise Access</p>
                        <h4 className="text-sm font-black text-slate-900 leading-tight mb-4">Unlimited workspace provisioning enabled.</h4>
                        <button className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:translate-x-1 transition-transform">
                            Full Capability <ChevronRight size={14} strokeWidth={3} />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-4 px-4">
                     <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 font-black text-sm">A</div>
                     <div className="flex-1 min-w-0">
                         <p className="text-xs font-black text-slate-900 truncate">Partner Console</p>
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">Authorized Distributor</p>
                     </div>
                     <button className="p-2 text-rose-400 hover:bg-rose-50 rounded-xl transition-colors">
                        <LogOut size={20} />
                     </button>
                </div>
            </div>
        </aside>
    );
}
