import React from 'react';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

interface QualityRatingIndicatorProps {
    rating: string;
    className?: string;
}

export default function QualityRatingIndicator({ rating, className = '' }: QualityRatingIndicatorProps) {
    const getRatingConfig = (rating: string) => {
        const normalizedRating = rating?.toUpperCase() || 'UNKNOWN';

        switch (normalizedRating) {
            case 'GREEN':
                return {
                    color: 'emerald',
                    bgColor: 'bg-emerald-50',
                    textColor: 'text-emerald-600',
                    borderColor: 'border-emerald-100',
                    icon: CheckCircle2,
                    label: 'Pristine Quality',
                    description: 'Your health metrics are optimal. Full deliverability active.',
                    emoji: '🟢',
                };
            case 'YELLOW':
                return {
                    color: 'amber',
                    bgColor: 'bg-amber-50',
                    textColor: 'text-amber-600',
                    borderColor: 'border-amber-100',
                    icon: AlertCircle,
                    label: 'Quality Warning',
                    description: 'Negative feedback detected. Please review your recent campaigns.',
                    emoji: '🟡',
                };
            case 'RED':
                return {
                    color: 'red',
                    bgColor: 'bg-red-50',
                    textColor: 'text-red-600',
                    borderColor: 'border-red-100',
                    icon: TrendingDown,
                    label: 'Restricted Access',
                    description: 'Critical quality issues. High risk of account suspension.',
                    emoji: '🔴',
                };
            default:
                return {
                    color: 'gray',
                    bgColor: 'bg-gray-50',
                    textColor: 'text-gray-400',
                    borderColor: 'border-gray-100',
                    icon: AlertCircle,
                    label: 'Sync Pending',
                    description: 'Refreshing telemetry data. Please wait context update.',
                    emoji: '⚪',
                };
        }
    };

    const config = getRatingConfig(rating);
    const Icon = config.icon;

    return (
        <div className={clsx("bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400", className)}>
            <div className="flex items-center gap-4 mb-6">
                <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center shadow-sm", config.bgColor)}>
                    <Icon className={clsx("w-5 h-5", config.textColor)} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900">System Health</h3>
                    <div className={clsx("text-xs font-semibold uppercase tracking-wider mt-0.5 flex items-center gap-1.5", config.textColor)}>
                        <span>{config.emoji}</span> {config.label}
                    </div>
                </div>
            </div>

            <p className="text-sm text-gray-500 leading-relaxed mb-6">
                {config.description}
            </p>

            <div className="pt-6 border-t border-gray-100">
                <a
                    href="https://developers.facebook.com/docs/whatsapp/messaging-limits"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex justify-between items-center w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors group"
                >
                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider group-hover:text-blue-600 transition-colors">Health Protocols</span>
                    <ChevronRight size={16} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                </a>
            </div>
        </div>
    );
}
