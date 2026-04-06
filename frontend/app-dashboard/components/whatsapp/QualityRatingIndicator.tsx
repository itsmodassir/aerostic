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
        <div className={clsx("bg-white rounded-[32px] border border-gray-200/60 p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400 h-full flex flex-col", className)}>
            <div className="flex items-center gap-4 mb-8">
                <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border", config.borderColor, config.bgColor)}>
                    <Icon className={clsx("w-6 h-6", config.textColor)} />
                </div>
                <div>
                    <h3 className="text-lg font-black text-gray-900 tracking-tight">System Health</h3>
                    <div className={clsx("text-[10px] font-black uppercase tracking-[0.2em] mt-0.5 flex items-center gap-1.5", config.textColor)}>
                        <span>{config.emoji}</span> {config.label}
                    </div>
                </div>
            </div>

            <p className="text-sm text-gray-500 font-medium leading-relaxed mb-8 flex-1">
                {config.description}
            </p>

            <div className="pt-8 border-t border-gray-50">
                <a
                    href="https://developers.facebook.com/docs/whatsapp/messaging-limits"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex justify-between items-center w-full px-6 py-4 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-2xl transition-all group active:scale-95"
                >
                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] group-hover:text-black transition-colors">Health Protocols</span>
                    <ChevronRight size={16} className="text-gray-400 group-hover:text-black transition-transform group-hover:translate-x-1" />
                </a>
            </div>
        </div>
    );
}
