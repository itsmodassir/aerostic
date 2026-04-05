'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-white rounded-3xl border-2 border-red-50 shadow-xl shadow-red-100/50 animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Something went wrong</h2>
          <p className="text-gray-500 max-w-md mx-auto mb-8 font-medium">
            The application encountered an unexpected error. This has been logged, but you might want to try refreshing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 px-6 py-3 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2 active:scale-95"
            >
              <RefreshCw size={18} />
              Refresh Page
            </button>
            <Link
              href="/"
              className="flex-1 px-6 py-3 bg-white border-2 border-gray-100 text-gray-600 font-black rounded-2xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Home size={18} />
              Go Home
            </Link>
          </div>
          {this.state.error && (
            <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100 w-full text-left overflow-hidden">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Error Technical details</p>
                <code className="text-xs text-red-600 font-mono break-all">{this.state.error.message}</code>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
