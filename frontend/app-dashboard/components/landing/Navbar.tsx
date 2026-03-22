'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Features', href: '#features' },
        { name: 'Solutions', href: '#solutions' },
        { name: 'Pricing', href: '#pricing' },
        { name: 'Contact', href: '/contact' },
    ];

    return (
        <nav
            className={clsx(
                "fixed top-0 left-0 right-0 z-[100] transition-all duration-500",
                scrolled 
                    ? "bg-white/70 backdrop-blur-2xl border-b border-gray-100 py-4 shadow-2xl shadow-gray-200/20" 
                    : "bg-transparent py-8"
            )}
        >
            <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between">
                {/* Premium Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-12 h-12 bg-[#0F172A] rounded-[14px] flex items-center justify-center transform group-hover:rotate-12 transition-all duration-500 shadow-xl shadow-black/10 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-600 opacity-20 group-hover:opacity-40 transition-opacity" />
                        <span className="text-white font-black text-2xl relative z-10">A</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black tracking-tighter text-gray-900 leading-none">AER<span className="text-emerald-500">O</span>STIC</span>
                        <span className="text-[8px] font-black text-emerald-600 uppercase tracking-[.4em] mt-1 ml-0.5 opacity-60">Nexus Console</span>
                    </div>
                </Link>

                {/* Desktop High-End Nav */}
                <div className="hidden md:flex items-center gap-10">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-[10px] font-black uppercase tracking-[.2em] text-gray-400 hover:text-emerald-500 transition-all relative group"
                        >
                            {link.name}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 transition-all group-hover:w-full" />
                        </Link>
                    ))}
                </div>

                {/* Tactical Actions */}
                <div className="hidden md:flex items-center gap-6">
                    <Link
                        href="https://app.aimstore.in/login"
                        className="text-[10px] font-black uppercase tracking-[.2em] text-gray-900 hover:text-emerald-600 transition-all"
                    >
                        Registry Login
                    </Link>
                    <Link
                        href="https://app.aimstore.in/register"
                        className="bg-black text-white px-8 py-4 rounded-[18px] text-[10px] font-black uppercase tracking-[.2em] hover:bg-emerald-600 transition-all shadow-xl shadow-gray-400/20 flex items-center gap-3 group"
                    >
                        Initialize
                        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Neural Mobile Toggle */}
                <button
                    className="md:hidden p-4 bg-gray-50 text-gray-900 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all active:scale-90"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Matrix Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="md:hidden absolute top-full left-4 right-4 mt-4 bg-white rounded-[32px] border-2 border-gray-50 shadow-2xl overflow-hidden p-8"
                    >
                        <div className="flex flex-col gap-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="text-2xl font-black tracking-tighter text-gray-400 hover:text-emerald-600 transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="pt-8 border-t-2 border-gray-50 flex flex-col gap-4">
                                <Link
                                    href="https://app.aimstore.in/login"
                                    className="w-full text-center py-5 bg-gray-50 text-gray-900 font-black text-[10px] uppercase tracking-[.2em] rounded-2xl"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Access Terminal
                                </Link>
                                <Link
                                    href="https://app.aimstore.in/register"
                                    className="w-full text-center py-5 bg-emerald-500 text-white font-black text-[10px] uppercase tracking-[.2em] rounded-2xl shadow-xl shadow-emerald-500/20"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Initialize Nexus
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
