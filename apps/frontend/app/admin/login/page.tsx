'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Eye, EyeOff, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/login', { email, password });

            // Check if user is admin
            const user = res.data.user;
            if (user.role !== 'admin') {
                setError('Access denied. This area is for administrators only.');
                setLoading(false);
                return;
            }

            localStorage.setItem('token', res.data.access_token);
            localStorage.setItem('user', JSON.stringify(user));
            // Redirect to admin root (which is rewritten to admin folder)
            router.push('/');
        } catch (err: any) {
            setError('Invalid admin credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-blue-600/10 blur-3xl animate-pulse" />
                <div className="absolute -bottom-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-purple-600/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="w-full max-w-md p-8 relative z-10">
                <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        <img src="/logo.png" alt="Aerostic Admin" className="w-16 h-16 object-contain mx-auto mb-6" />
                        <h1 className="text-2xl font-bold text-white mb-2">Admin Console</h1>
                        <p className="text-gray-400 text-sm">Restricted Access Area</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                Admin Email
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    required
                                    className="w-full pl-4 pr-10 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all outline-none text-white placeholder-gray-600"
                                    placeholder="admin@aerostic.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                {email && email.includes('@') && (
                                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    className="w-full pl-4 pr-10 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all outline-none text-white placeholder-gray-600"
                                    placeholder="Enter secure key"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-6 bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold rounded-xl hover:from-red-500 hover:to-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Lock className="w-4 h-4" />
                                    Authenticate
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-700/50 text-center">
                        <p className="text-gray-500 text-xs mb-4">
                            Unauthorized access is strictly prohibited and logged.
                            <br />
                            IP Address: Recorded
                        </p>
                        <a href="https://aerostic.com" className="text-gray-400 hover:text-white text-xs transition-colors flex items-center justify-center gap-2">
                            <ArrowRight className="w-3 h-3 rotate-180" />
                            Return to marketing site
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
