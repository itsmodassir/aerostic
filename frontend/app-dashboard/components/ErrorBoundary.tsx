'use client';

import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    name?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(`[ErrorBoundary:${this.props.name || 'Component'}] Error:`, error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="flex flex-col items-center justify-center p-8 bg-white border border-slate-100 rounded-[32px] shadow-lg">
                    <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-6">
                        <AlertTriangle size={32} />
                    </div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight mb-2">Component Error</h2>
                    <p className="text-sm font-bold text-slate-400 text-center max-w-[280px] mb-8">
                        The {this.props.name || 'component'} encountered a critical error while rendering.
                    </p>
                    <button 
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all active:scale-95"
                    >
                        <RefreshCw size={16} />
                        Attempt Restart
                    </button>
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-8 p-4 bg-slate-50 rounded-xl w-full">
                            <code className="text-[10px] text-rose-600 font-bold block mb-1">Stack Trace:</code>
                            <pre className="text-[9px] text-slate-500 font-medium overflow-x-auto overflow-y-auto max-h-40 no-scrollbar">
                                {this.state.error?.stack}
                            </pre>
                        </div>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}
