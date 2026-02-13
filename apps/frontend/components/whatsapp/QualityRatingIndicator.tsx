import React from 'react';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2 } from 'lucide-react';

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
                    color: 'green',
                    bgColor: 'bg-green-100',
                    textColor: 'text-green-700',
                    borderColor: 'border-green-200',
                    icon: CheckCircle2,
                    label: 'High Quality',
                    description: 'Your messaging quality is excellent. No restrictions applied.',
                    emoji: '🟢',
                };
            case 'YELLOW':
                return {
                    color: 'yellow',
                    bgColor: 'bg-yellow-100',
                    textColor: 'text-yellow-700',
                    borderColor: 'border-yellow-200',
                    icon: AlertCircle,
                    label: 'Medium Quality',
                    description: 'Your quality rating has decreased. Monitor your messaging practices.',
                    emoji: '🟡',
                };
            case 'RED':
                return {
                    color: 'red',
                    bgColor: 'bg-red-100',
                    textColor: 'text-red-700',
                    borderColor: 'border-red-200',
                    icon: TrendingDown,
                    label: 'Low Quality',
                    description: 'Your account has quality issues. Messaging may be restricted.',
                    emoji: '🔴',
                };
            default:
                return {
                    color: 'gray',
                    bgColor: 'bg-gray-100',
                    textColor: 'text-gray-700',
                    borderColor: 'border-gray-200',
                    icon: AlertCircle,
                    label: 'Unknown',
                    description: 'Quality rating not available. Sync your account to update.',
                    emoji: '⚪',
                };
        }
    };

    const config = getRatingConfig(rating);
    const Icon = config.icon;

    return (
        <div className={`bg-white rounded-2xl border border-gray-200 p-6 ${className}`}>
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 ${config.bgColor} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${config.textColor}`} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">Quality Rating</h3>
                    <p className={`text-sm font-medium ${config.textColor}`}>
                        {config.emoji} {config.label}
                    </p>
                </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">{config.description}</p>

            {rating?.toUpperCase() !== 'GREEN' && rating?.toUpperCase() !== 'UNKNOWN' && (
                <a
                    href="https://developers.facebook.com/docs/whatsapp/messaging-limits"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                >
                    Learn how to improve
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </a>
            )}
        </div>
    );
}
