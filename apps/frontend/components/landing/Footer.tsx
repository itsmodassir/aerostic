'use client';

import Link from 'next/link';
import {
    Twitter, Linkedin, Github, Mail, Phone, MapPin,
    ArrowUpRight, ShieldCheck, Globe, Zap
} from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const productLinks = [
        { name: 'Features', href: '#features' },
        { name: 'Solutions', href: '#solutions' },
        { name: 'Pricing', href: '#pricing' },
        { name: 'API Docs', href: '/docs' },
        { name: 'Whats New', href: '/docs/updates' },
    ];

    const companyLinks = [
        { name: 'About', href: '/about' },
        { name: 'Careers', href: '/careers' },
        { name: 'Support', href: '/support' },
        { name: 'Contact', href: '/contact' },
        { name: 'Partners', href: '/partners' },
    ];

    const legalLinks = [
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Data Deletion', href: '/refund' },
        { name: 'Cookie Policy', href: '/privacy' },
    ];

    return (
        <footer className="bg-gray-50 border-t border-gray-100 pt-24 pb-12 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">
                    {/* Logo & Info */}
                    <div className="col-span-2 lg:col-span-2 space-y-8">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                                <span className="text-white font-bold text-xl">A</span>
                            </div>
                            <span className="text-xl font-bold tracking-tight text-gray-900 uppercase">AEROSTIC</span>
                        </Link>
                        <p className="text-gray-500 text-lg leading-relaxed max-w-sm font-medium">
                            The official WhatsApp Marketing & Automation Platform for high-growth businesses.
                            Safe, secure, and officially powered by Meta Cloud API.
                        </p>
                        <div className="flex items-center space-x-4">
                            <a href="#" className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-emerald-500 hover:border-emerald-100 transition-all">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-emerald-500 hover:border-emerald-100 transition-all">
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a href="#" className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-emerald-500 hover:border-emerald-100 transition-all">
                                <Github className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Links Sets */}
                    <div className="space-y-6">
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Product</h4>
                        <ul className="space-y-4">
                            {productLinks.map(link => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-gray-500 font-medium hover:text-emerald-600 transition-colors flex items-center group">
                                        <span>{link.name}</span>
                                        <ArrowUpRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Company</h4>
                        <ul className="space-y-4">
                            {companyLinks.map(link => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-gray-500 font-medium hover:text-emerald-600 transition-colors flex items-center group">
                                        <span>{link.name}</span>
                                        <ArrowUpRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Contact</h4>
                        <ul className="space-y-4">
                            <li className="flex items-center space-x-3 text-gray-500 font-medium">
                                <Mail className="w-4 h-4 text-emerald-500" />
                                <a href="mailto:support@aerostic.com" className="hover:text-emerald-600">support@aerostic.com</a>
                            </li>
                            <li className="flex items-center space-x-3 text-gray-500 font-medium">
                                <Phone className="w-4 h-4 text-emerald-500" />
                                <a href="tel:+1234567890" className="hover:text-emerald-600">+1 (234) 567-890</a>
                            </li>
                            <li className="flex items-start space-x-3 text-gray-500 font-medium">
                                <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-1" />
                                <span>San Francisco, CA 94105</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Strip */}
                <div className="pt-12 border-t border-gray-200/50 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex flex-wrap items-center justify-center gap-6">
                        {legalLinks.map(link => (
                            <Link key={link.name} href={link.href} className="text-xs font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest transition-colors">
                                {link.name}
                            </Link>
                        ))}
                    </div>
                    <div className="flex flex-col items-center md:items-end space-y-2">
                        <p className="text-sm text-gray-400 font-medium">
                            &copy; {currentYear} Aerostic Platform. All rights reserved.
                        </p>
                        <div className="flex items-center space-x-1 text-[10px] font-black text-emerald-500/50 uppercase tracking-tighter">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Verified Meta Business Partner</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
