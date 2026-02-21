'use client';

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
            <div className="text-center space-y-8 max-w-lg mx-auto">
                {/* Animated 404 Graphic */}
                <div className="relative w-64 h-64 mx-auto">
                    <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse opacity-20"></div>
                    <div className="absolute inset-8 bg-blue-200 rounded-full animate-ping opacity-20 delay-75"></div>
                    <div className="relative flex items-center justify-center w-full h-full">
                        <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 animate-bounce">
                            404
                        </h1>
                    </div>
                </div>

                <div className="space-y-4 animate-in slide-in-from-bottom-5 duration-700 fade-in fill-mode-forwards">
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Oops! Page not found
                    </h2>
                    <p className="text-gray-500 text-lg">
                        The page you're looking for seems to have vanished into the digital void.
                        It might have been moved, deleted, or never existed.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in slide-in-from-bottom-5 duration-1000 delay-200 fade-in fill-mode-forwards">
                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all hover:scale-105 shadow-lg shadow-blue-200"
                    >
                        <Home className="w-4 h-4" />
                        Back to Home
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-all hover:scale-105"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
}
