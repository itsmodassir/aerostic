'use client';

import { useState } from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
                    >
                        How can we <span className="text-emerald-500">help you?</span>
                    </motion.h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Have questions about the Official WhatsApp API or our platform?
                        Our experts are here to help you scale your business communication.
                    </p>
                </div>
            </section>

            {/* Contact Content */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16">

                        {/* Contact Information */}
                        <div className="space-y-12">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-8">Get in touch</h2>
                                <div className="space-y-8">
                                    <div className="flex items-start space-x-6">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                                            <Mail className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Email us</p>
                                            <a href="mailto:support@aimstore.in" className="text-xl font-bold text-gray-900 hover:text-emerald-600">
                                                support@aimstore.in
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-6">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                                            <Phone className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Call us</p>
                                            <a href="tel:+1234567890" className="text-xl font-bold text-gray-900 hover:text-emerald-600">
                                                +1 (234) 567-890
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-6">
                                        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Visit us</p>
                                            <p className="text-xl font-bold text-gray-900">
                                                San Francisco, CA 94105
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 rounded-3xl bg-gray-900 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
                                <h3 className="text-xl font-bold mb-4">Global Support Hours</h3>
                                <p className="text-gray-400 mb-6">Our team is available across multiple time zones to ensure you get the help you need.</p>
                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Monday - Friday</span>
                                        <span className="font-bold">9:00 AM - 6:00 PM EST</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Saturday</span>
                                        <span className="font-bold">10:00 AM - 2:00 PM EST</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-white p-8 md:p-12 rounded-[40px] border border-gray-100 shadow-2xl shadow-gray-200/50">
                            {submitted ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-12"
                                >
                                    <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle2 className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                                    <p className="text-gray-600 mb-8">Thank you for reaching out. One of our experts will get back to you within 24 hours.</p>
                                    <button
                                        onClick={() => setSubmitted(false)}
                                        className="text-emerald-600 font-bold hover:underline"
                                    >
                                        Send another message
                                    </button>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700">First Name</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="John"
                                                className="w-full px-5 py-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700">Last Name</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="Doe"
                                                className="w-full px-5 py-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Business Email</label>
                                        <input
                                            required
                                            type="email"
                                            placeholder="john@company.com"
                                            className="w-full px-5 py-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Subject</label>
                                        <select
                                            className="w-full px-5 py-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium appearance-none"
                                        >
                                            <option>General Inquiry</option>
                                            <option>Sales & Enterprise</option>
                                            <option>Technical Support</option>
                                            <option>Partnership</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Message</label>
                                        <textarea
                                            required
                                            rows={5}
                                            placeholder="How can we help you?"
                                            className="w-full px-5 py-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium resize-none"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-emerald-500 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-emerald-200 hover:bg-emerald-600 hover:-translate-y-1 transition-all flex items-center justify-center space-x-2"
                                    >
                                        <span>Send Message</span>
                                        <Send className="w-5 h-5" />
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
