'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    MessageSquare, ArrowRight, Mail, Lock, Eye, EyeOff,
    Sparkles, Shield, Zap, CheckCircle, Star
} from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'login' | 'otp'>('login');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Aggressively clear any existing session data on mount
        localStorage.clear();

        // Clear cookies for all possible domains
        const domains = [window.location.hostname, '.aerostic.com', 'app.aerostic.com'];
        domains.forEach(domain => {
            document.cookie = `access_token=; Path=/; Domain=${domain}; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
            document.cookie = `access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
        });
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/login/initiate', { email, password });
            setStep('otp');
        } catch (err: any) {
            console.error('Login error:', err);
            if (err.response?.status === 401) {
                setError('Invalid email or password');
            } else if (err.response?.status === 429) {
                setError('Too many login attempts. Please try again in an hour.');
            } else {
                setError(err.response?.data?.message || 'Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/login/verify', { email, otp });

            if (res.data.user) {
                localStorage.setItem('user', JSON.stringify(res.data.user));
            }

            // Redirect to workspace-specific dashboard
            const workspaceId = res.data.workspaceId;
            if (workspaceId) {
                router.push(`/dashboard/${workspaceId}`);
            } else {
                router.push('/auth/workspaces');
            }
        } catch (err: any) {
            console.error('OTP error:', err);
            setError(err.response?.data?.message || 'Invalid or expired OTP');
        } finally {
            setLoading(false);
        }
    };

    const features = [
        { icon: <Zap className="w-5 h-5" />, text: 'Send 10,000+ messages/month' },
        { icon: <Shield className="w-5 h-5" />, text: 'Official WhatsApp API' },
        { icon: <Sparkles className="w-5 h-5" />, text: 'AI-powered automation' },
    ];

    return (
        <div className="flex min-h-screen">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-32 right-16 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-400/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
                </div>

                {/* Floating Icons */}
                <div className="absolute inset-0 overflow-hidden">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute text-white/10"
                            style={{
                                top: `${15 + i * 15}%`,
                                left: `${10 + (i % 3) * 30}%`,
                                animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
                                animationDelay: `${i * 0.3}s`,
                            }}
                        >
                            <MessageSquare className="w-12 h-12" />
                        </div>
                    ))}
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center p-16">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-12">
                        <img src="/logo.png" alt="Aerostic" className="w-14 h-14 object-contain" />
                        <span className="text-3xl font-bold text-white">Aerostic</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-5xl font-extrabold text-white leading-tight mb-6">
                        Transform Your
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">
                            Customer Engagement
                        </span>
                    </h1>
                    <p className="text-xl text-blue-100 mb-10 max-w-md">
                        Join 2,500+ businesses using AI-powered WhatsApp automation to grow faster.
                    </p>

                    {/* Feature List */}
                    <div className="space-y-4">
                        {features.map((feature, i) => (
                            <div key={i} className="flex items-center gap-4 text-white/90">
                                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
                                    {feature.icon}
                                </div>
                                <span className="text-lg">{feature.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Testimonial Card */}
                    <div className="mt-12 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 max-w-sm">
                        <div className="flex gap-1 mb-3">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                            ))}
                        </div>
                        <p className="text-white/90 text-sm mb-4">
                            "Aerostic helped us 10x our customer response rate. The AI agents handle everything!"
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold">
                                R
                            </div>
                            <div>
                                <p className="text-white font-medium text-sm">Rahul Sharma</p>
                                <p className="text-blue-200 text-xs">CEO, TechStart India</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
                        <img src="/logo.png" alt="Aerostic" className="w-12 h-12 object-contain" />
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Aerostic
                        </span>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
                        <div className="text-center mb-8">
                            <Link href="https://aerostic.com" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 mb-4 lg:hidden">
                                <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                                Back to home
                            </Link>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                {step === 'login' ? 'Welcome back' : 'Verify login'}
                            </h2>
                            <p className="text-gray-500">
                                {step === 'login'
                                    ? 'Sign in to continue to your dashboard'
                                    : `We've sent a code to ${email}`}
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 animate-shake">
                                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-red-500 text-lg">!</span>
                                </div>
                                <p className="text-red-600 text-sm font-medium">{error}</p>
                            </div>
                        )}

                        {step === 'login' ? (
                            <form onSubmit={handleLogin} className="space-y-5">
                                {/* Email Field */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email address
                                    </label>
                                    <div className={`relative transition-all duration-300 ${focusedField === 'email' ? 'transform scale-[1.02]' : ''}`}>
                                        <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focusedField === 'email' ? 'text-blue-600' : 'text-gray-400'}`} />
                                        <input
                                            type="email"
                                            required
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-gray-900"
                                            placeholder="you@company.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            onFocus={() => setFocusedField('email')}
                                            onBlur={() => setFocusedField(null)}
                                        />
                                        {email && email.includes('@') && (
                                            <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                                        )}
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-semibold text-gray-700">
                                            Password
                                        </label>
                                        <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                            Forgot password?
                                        </Link>
                                    </div>
                                    <div className={`relative transition-all duration-300 ${focusedField === 'password' ? 'transform scale-[1.02]' : ''}`}>
                                        <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focusedField === 'password' ? 'text-blue-600' : 'text-gray-400'}`} />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-gray-900"
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            onFocus={() => setFocusedField('password')}
                                            onBlur={() => setFocusedField(null)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-500/30 transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
                                >
                                    {loading ? (
                                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Continue to OTP
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyOtp} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Verification Code
                                    </label>
                                    <div className={`relative transition-all duration-300 ${focusedField === 'otp' ? 'transform scale-[1.02]' : ''}`}>
                                        <Shield className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focusedField === 'otp' ? 'text-blue-600' : 'text-gray-400'}`} />
                                        <input
                                            type="text"
                                            required
                                            maxLength={6}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-gray-900 tracking-[0.5em] text-center font-bold text-xl"
                                            placeholder="000000"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                            onFocus={() => setFocusedField('otp')}
                                            onBlur={() => setFocusedField(null)}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setStep('login')}
                                        className="mt-2 text-sm text-blue-600 hover:underline"
                                    >
                                        Change email or password
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || otp.length < 6}
                                    className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-500/30 transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
                                >
                                    {loading ? (
                                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Verify & Enter Dashboard
                                            <CheckCircle className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}

                        {/* Divider */}
                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="px-4 bg-white text-gray-500 text-sm">New to Aerostic?</span>
                            </div>
                        </div>

                        {/* Register Link */}
                        <Link
                            href="/register"
                            className="w-full py-4 px-6 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all flex items-center justify-center gap-2 group"
                        >
                            Create your free workspace
                            <Sparkles className="w-4 h-4 text-amber-500 group-hover:animate-pulse" />
                        </Link>
                    </div>

                    {/* Trust Badges */}
                    <div className="mt-8 flex items-center justify-center gap-6 text-gray-400 text-sm">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            <span>256-bit SSL</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            <span>GDPR Compliant</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Global Styles for Animations */}
            <style jsx global>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(5deg); }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake {
                    animation: shake 0.3s ease-in-out;
                }
            `}</style>
        </div>
    );
}
