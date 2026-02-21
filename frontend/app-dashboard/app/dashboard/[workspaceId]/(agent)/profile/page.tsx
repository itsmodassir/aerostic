'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    User, Mail, Phone, Building2, MapPin, Globe, Camera,
    Save, Crown, Shield, Calendar, MessageSquare, Bot,
    CheckCircle, AlertCircle, Key, Lock
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function ProfilePage() {
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    // User data
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [company, setCompany] = useState('');
    const [address, setAddress] = useState('');
    const [website, setWebsite] = useState('');
    const [userPlan, setUserPlan] = useState<'starter' | 'growth' | 'enterprise'>('starter');
    const [isAdmin, setIsAdmin] = useState(false);
    const [joinedDate, setJoinedDate] = useState('');

    // Stats
    const [stats, setStats] = useState({
        messagesSent: 0,
        contacts: 0,
        agents: 0,
        campaigns: 0,
    });

    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            setEmail(user.email || '');
            setName(user.name || user.email?.split('@')[0] || '');
            setCompany((user as any).tenantName || 'My Workspace'); // tenantName might need to come from elsewhere or user object needs update
            // For now, let's assume user object has what we need or we fetch it.
            // user.iat is not in User interface usually, but we have createdAt
            // setJoinedDate...

            // Set plan and admin status
            if (user.email === 'md@modassir.info' || user.role === 'super_admin') {
                setUserPlan('growth'); // Demo logic
                setIsAdmin(true);
            }

            // Demo stats
            setStats({
                messagesSent: 12500,
                contacts: 850,
                agents: 3,
                campaigns: 15,
            });
        }
    }, [user]);

    const handleSave = async () => {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const planColors = {
        starter: { bg: 'from-gray-500 to-gray-600', badge: 'bg-gray-100 text-gray-700' },
        growth: { bg: 'from-blue-500 to-blue-600', badge: 'bg-blue-100 text-blue-700' },
        enterprise: { bg: 'from-purple-500 to-purple-600', badge: 'bg-purple-100 text-purple-700' },
    };

    const planInfo = planColors[userPlan];

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Profile Header */}
            <div className={`bg-gradient-to-r ${planInfo.bg} rounded-2xl p-8 text-white relative overflow-hidden`}>
                <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
                <div className="absolute left-0 bottom-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24" />

                <div className="relative flex items-center gap-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-4xl font-bold">
                            {name[0]?.toUpperCase() || 'U'}
                        </div>
                        <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-600 shadow-lg hover:bg-gray-100">
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">{name || 'User'}</h1>
                        <p className="text-white/80 mt-1">{email}</p>
                        <div className="flex items-center gap-2 mt-3">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${planInfo.badge}`}>
                                <Crown className="w-3 h-3 inline mr-1" />
                                {userPlan.charAt(0).toUpperCase() + userPlan.slice(1)} Plan
                            </span>
                            {isAdmin && (
                                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                    <Shield className="w-3 h-3 inline mr-1" />
                                    Admin
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mt-8 relative">
                    <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold">{stats.messagesSent.toLocaleString()}</p>
                        <p className="text-sm text-white/70 flex items-center justify-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            Messages Sent
                        </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold">{stats.contacts}</p>
                        <p className="text-sm text-white/70 flex items-center justify-center gap-1">
                            <User className="w-3 h-3" />
                            Contacts
                        </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold">{stats.agents}</p>
                        <p className="text-sm text-white/70 flex items-center justify-center gap-1">
                            <Bot className="w-3 h-3" />
                            AI Agents
                        </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold">{stats.campaigns}</p>
                        <p className="text-sm text-white/70 flex items-center justify-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Campaigns
                        </p>
                    </div>
                </div>
            </div>

            {/* Success Message */}
            {saved && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-green-700 font-medium">Profile updated successfully!</p>
                </div>
            )}

            {/* Profile Form */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Personal Information</h2>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your full name"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                readOnly
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+91 98765 43210"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Company / Workspace</label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                placeholder="Your company name"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="url"
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                                placeholder="https://yourwebsite.com"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="City, Country"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Account Information</h2>

                <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div>
                            <p className="font-medium text-gray-900">Member Since</p>
                            <p className="text-sm text-gray-500">{joinedDate || 'January 2026'}</p>
                        </div>
                        <Calendar className="w-5 h-5 text-gray-400" />
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div>
                            <p className="font-medium text-gray-900">Current Plan</p>
                            <p className="text-sm text-gray-500">{userPlan.charAt(0).toUpperCase() + userPlan.slice(1)} - ₹{userPlan === 'starter' ? '1,999' : userPlan === 'growth' ? '4,999' : '14,999'}/mo</p>
                        </div>
                        <Link
                            href="/dashboard/billing"
                            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors text-sm"
                        >
                            Manage
                        </Link>
                    </div>

                    <div className="flex items-center justify-between py-3">
                        <div>
                            <p className="font-medium text-gray-900">Account Security</p>
                            <p className="text-sm text-gray-500">Password last changed 30 days ago</p>
                        </div>
                        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm flex items-center gap-2">
                            <Key className="w-4 h-4" />
                            Change Password
                        </button>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 rounded-2xl border border-red-200 p-6">
                <h2 className="text-lg font-bold text-red-800 mb-2">Danger Zone</h2>
                <p className="text-sm text-red-600 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                </p>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors text-sm">
                    Delete Account
                </button>
            </div>
        </div>
    );
}
