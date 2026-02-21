'use client';

import Link from 'next/link';
import { MessageSquare, Rocket, Heart, Zap, Users, MapPin, ArrowRight } from 'lucide-react';

export default function CareersPage() {
    const openings = [
        {
            title: 'Senior Full-Stack Developer',
            department: 'Engineering',
            location: 'Remote / Noida',
            type: 'Full-time',
        },
        {
            title: 'Product Manager',
            department: 'Product',
            location: 'Noida',
            type: 'Full-time',
        },
        {
            title: 'Customer Success Manager',
            department: 'Customer Success',
            location: 'Remote',
            type: 'Full-time',
        },
        {
            title: 'AI/ML Engineer',
            department: 'Engineering',
            location: 'Remote / Noida',
            type: 'Full-time',
        },
    ];

    const perks = [
        { icon: <Rocket className="w-6 h-6" />, title: 'Rapid Growth', desc: 'Join a fast-growing startup with huge potential' },
        { icon: <Heart className="w-6 h-6" />, title: 'Health Benefits', desc: 'Comprehensive health insurance for you and family' },
        { icon: <Zap className="w-6 h-6" />, title: 'Learning Budget', desc: '₹50,000/year for courses, conferences, and books' },
        { icon: <Users className="w-6 h-6" />, title: 'Remote Friendly', desc: 'Work from anywhere in India' },
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Aerostic</span>
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
                        Join us in building the future of
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                            WhatsApp marketing
                        </span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        We're a passionate team on a mission to help businesses connect with customers.
                        If you love solving hard problems, we want to hear from you.
                    </p>
                </div>
            </section>

            {/* Perks */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-12">Why work at Aerostic?</h2>
                    <div className="grid md:grid-cols-4 gap-8">
                        {perks.map((perk, i) => (
                            <div key={i} className="text-center">
                                <div className="inline-flex p-4 bg-blue-100 text-blue-600 rounded-2xl mb-4">
                                    {perk.icon}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{perk.title}</h3>
                                <p className="text-gray-600">{perk.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Open Positions */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-4xl mx-auto px-6">
                    <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-12">Open Positions</h2>
                    <div className="space-y-4">
                        {openings.map((job, i) => (
                            <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                                    <div className="flex items-center gap-4 mt-2 text-gray-500 text-sm">
                                        <span>{job.department}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            {job.location}
                                        </span>
                                        <span>•</span>
                                        <span>{job.type}</span>
                                    </div>
                                </div>
                                <a
                                    href={`mailto:careers@aimstore.in?subject=Application for ${job.title}`}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                                >
                                    Apply <ArrowRight className="w-4 h-4" />
                                </a>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 text-center">
                        <p className="text-gray-600 mb-4">Don't see a role that fits? We're always looking for talented people.</p>
                        <a
                            href="mailto:careers@aimstore.in?subject=General Application"
                            className="inline-flex items-center gap-2 text-blue-600 font-medium hover:underline"
                        >
                            Send us your resume <ArrowRight className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-8">
                <div className="max-w-7xl mx-auto px-6 text-center text-gray-400">
                    <p>© {new Date().getFullYear()} Aerostic. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
