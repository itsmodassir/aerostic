'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    MessageSquare, ArrowRight, Building2, User, Mail, Lock,
    Eye, EyeOff, CheckCircle, Sparkles, Shield, Zap, Star, Rocket
} from 'lucide-react';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [tenantName, setTenantName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [step, setStep] = useState(1);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const tenantRes = await api.post('/tenants', { name: tenantName });
            const tenantId = tenantRes.data.id;
            await api.post('/users', {
                name,
                email,
                password,
                tenantId,
                role: 'super_admin'
            });
            router.push('/login');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const passwordStrength = () => {
        if (password.length === 0) return { level: 0, text: '', color: '' };
        if (password.length < 6) return { level: 1, text: 'Weak', color: 'bg-red-500' };
        if (password.length < 10) return { level: 2, text: 'Medium', color: 'bg-amber-500' };
        return { level: 3, text: 'Strong', color: 'bg-green-500' };
    };

    const strength = passwordStrength();

    const plans = [
        { name: 'Starter', price: '₹1,999', messages: '5,000' },
        { name: 'Growth', price: '₹4,999', messages: '25,000' },
        { name: 'Enterprise', price: 'Custom', messages: 'Unlimited' },
    ];

    return (
        <div className="flex min-h-screen">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 relative overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-32 right-16 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-purple-400/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
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
                            <Rocket className="w-10 h-10" />
                        </div>
                    ))}
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center p-16">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                            <MessageSquare className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-3xl font-bold text-white">Aerostic</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-5xl font-extrabold text-white leading-tight mb-6">
                        Start Your
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-pink-400">
                            Growth Journey
                        </span>
                    </h1>
                    <p className="text-xl text-purple-100 mb-10 max-w-md">
                        Create your workspace in seconds. No credit card required for 14-day trial.
                    </p>

                    {/* Pricing Preview */}
                    <div className="grid gap-3 max-w-sm">
                        {plans.map((plan, i) => (
                            <div key={i} className={`p-4 rounded-xl border transition-all ${i === 1
                                    ? 'bg-white/20 border-white/40 scale-105'
                                    : 'bg-white/10 border-white/20'
                                }`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-white font-semibold">{plan.name}</p>
                                        <p className="text-purple-200 text-sm">{plan.messages} msgs/month</p>
                                    </div>
                                    <p className="text-white font-bold text-lg">{plan.price}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Trust */}
                    <div className="mt-12 flex items-center gap-4">
                        <div className="flex -space-x-2">
                            {['R', 'P', 'A', 'S'].map((letter, i) => (
                                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white/20">
                                    {letter}
                                </div>
                            ))}
                        </div>
                        <p className="text-purple-200 text-sm">
                            <span className="text-white font-semibold">2,500+</span> businesses growing with Aerostic
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Panel - Register Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-lg">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                            <MessageSquare className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            Aerostic
                        </span>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-full text-sm font-medium mb-4">
                                <Sparkles className="w-4 h-4" />
                                14-day free trial
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Your Workspace</h2>
                            <p className="text-gray-500">Get started in less than 2 minutes</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 animate-shake">
                                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-red-500 text-lg">!</span>
                                </div>
                                <p className="text-red-600 text-sm font-medium">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleRegister} className="space-y-5">
                            {/* Workspace & Name Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Workspace
                                    </label>
                                    <div className={`relative transition-all duration-300 ${focusedField === 'tenant' ? 'transform scale-[1.02]' : ''
                                        }`}>
                                        <Building2 className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focusedField === 'tenant' ? 'text-purple-600' : 'text-gray-400'
                                            }`} />
                                        <input
                                            type="text"
                                            required
                                            className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10 transition-all outline-none text-gray-900"
                                            placeholder="Acme Corp"
                                            value={tenantName}
                                            onChange={(e) => setTenantName(e.target.value)}
                                            onFocus={() => setFocusedField('tenant')}
                                            onBlur={() => setFocusedField(null)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Your Name
                                    </label>
                                    <div className={`relative transition-all duration-300 ${focusedField === 'name' ? 'transform scale-[1.02]' : ''
                                        }`}>
                                        <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focusedField === 'name' ? 'text-purple-600' : 'text-gray-400'
                                            }`} />
                                        <input
                                            type="text"
                                            required
                                            className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10 transition-all outline-none text-gray-900"
                                            placeholder="John Doe"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            onFocus={() => setFocusedField('name')}
                                            onBlur={() => setFocusedField(null)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Work Email
                                </label>
                                <div className={`relative transition-all duration-300 ${focusedField === 'email' ? 'transform scale-[1.02]' : ''
                                    }`}>
                                    <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focusedField === 'email' ? 'text-purple-600' : 'text-gray-400'
                                        }`} />
                                    <input
                                        type="email"
                                        required
                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10 transition-all outline-none text-gray-900"
                                        placeholder="you@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onFocus={() => setFocusedField('email')}
                                        onBlur={() => setFocusedField(null)}
                                    />
                                    {email && email.includes('@') && email.includes('.') && (
                                        <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                                    )}
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className={`relative transition-all duration-300 ${focusedField === 'password' ? 'transform scale-[1.02]' : ''
                                    }`}>
                                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focusedField === 'password' ? 'text-purple-600' : 'text-gray-400'
                                        }`} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        minLength={6}
                                        className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10 transition-all outline-none text-gray-900"
                                        placeholder="Min 6 characters"
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
                                {/* Password Strength */}
                                {password.length > 0 && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <div className="flex gap-1 flex-1">
                                            {[1, 2, 3].map((level) => (
                                                <div
                                                    key={level}
                                                    className={`h-1.5 flex-1 rounded-full transition-colors ${level <= strength.level ? strength.color : 'bg-gray-200'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <span className={`text-xs font-medium ${strength.level === 1 ? 'text-red-500' :
                                                strength.level === 2 ? 'text-amber-500' : 'text-green-500'
                                            }`}>
                                            {strength.text}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 focus:ring-4 focus:ring-purple-500/30 transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Create Workspace
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-center text-gray-500">
                                By registering, you agree to our{' '}
                                <Link href="/terms" className="text-purple-600 hover:underline">Terms of Service</Link>
                                {' '}and{' '}
                                <Link href="/privacy" className="text-purple-600 hover:underline">Privacy Policy</Link>
                            </p>
                        </form>

                        {/* Divider */}
                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="px-4 bg-white text-gray-500 text-sm">Already have an account?</span>
                            </div>
                        </div>

                        {/* Login Link */}
                        <Link
                            href="/login"
                            className="w-full py-3.5 px-6 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-purple-500 hover:text-purple-600 transition-all flex items-center justify-center gap-2"
                        >
                            Sign in to existing workspace
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

            {/* Global Styles */}
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
