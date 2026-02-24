'use client';

import Link from 'next/link';
import { useState } from 'react';
import api from '@/lib/api';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [step, setStep] = useState<'request' | 'reset'>('request');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const requestReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        try {
            await api.post('/auth/password/forgot', { email });
            setMessage('If an account exists, a reset code has been sent to your email.');
            setStep('reset');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to request reset code.');
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            setLoading(false);
            return;
        }

        try {
            await api.post('/auth/password/reset', {
                email,
                otp,
                newPassword,
            });
            setMessage('Password reset successful. You can now sign in.');
            setOtp('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Password reset failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset your password</h1>
                <p className="text-sm text-gray-600 mb-6">
                    {step === 'request'
                        ? 'Enter your email to receive a reset code.'
                        : 'Enter the code from your email and choose a new password.'}
                </p>

                {message && <p className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">{message}</p>}
                {error && <p className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

                {step === 'request' ? (
                    <form onSubmit={requestReset} className="space-y-4">
                        <input
                            type="email"
                            required
                            placeholder="you@company.com"
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-blue-600 text-white py-3 font-semibold hover:bg-blue-700 disabled:opacity-60"
                        >
                            {loading ? 'Sending...' : 'Send reset code'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={resetPassword} className="space-y-4">
                        <input
                            type="email"
                            required
                            placeholder="Email"
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input
                            type="text"
                            required
                            placeholder="6-digit code"
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                        />
                        <input
                            type="password"
                            required
                            minLength={8}
                            placeholder="New password"
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <input
                            type="password"
                            required
                            minLength={8}
                            placeholder="Confirm new password"
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-blue-600 text-white py-3 font-semibold hover:bg-blue-700 disabled:opacity-60"
                        >
                            {loading ? 'Resetting...' : 'Reset password'}
                        </button>
                    </form>
                )}

                <div className="mt-6 text-sm text-center">
                    <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                        Back to login
                    </Link>
                </div>
            </div>
        </main>
    );
}
