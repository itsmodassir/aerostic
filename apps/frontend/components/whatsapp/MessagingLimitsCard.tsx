import React from 'react';
import { TrendingUp, Users, Zap } from 'lucide-react';

interface MessagingLimitsCardProps {
    messagingLimit: string;
    messageCount: number;
    className?: string;
}

export default function MessagingLimitsCard({
    messagingLimit,
    messageCount,
    className = '',
}: MessagingLimitsCardProps) {
    const getLimitConfig = (limit: string) => {
        const normalizedLimit = limit?.toUpperCase() || 'UNKNOWN';

        switch (normalizedLimit) {
            case '1K':
            case 'TIER_1K':
                return { value: 1000, label: '1,000', tier: 'Tier 1', color: 'blue' };
            case '10K':
            case 'TIER_10K':
                return { value: 10000, label: '10,000', tier: 'Tier 2', color: 'purple' };
            case '100K':
            case 'TIER_100K':
                return { value: 100000, label: '100,000', tier: 'Tier 3', color: 'indigo' };
            case 'UNLIMITED':
            case 'TIER_UNLIMITED':
                return { value: Infinity, label: 'Unlimited', tier: 'Tier 4', color: 'green' };
            default:
                return { value: 0, label: 'Unknown', tier: 'Unknown', color: 'gray' };
        }
    };

    const config = getLimitConfig(messagingLimit);
    const percentage = config.value === Infinity ? 0 : (messageCount / config.value) * 100;
    const isNearLimit = percentage > 80;

    return (
        <div className={`bg-white rounded-2xl border border-gray-200 p-6 ${className}`}>
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 bg-${config.color}-100 rounded-xl flex items-center justify-center`}>
                    <TrendingUp className={`w-6 h-6 text-${config.color}-600`} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">Messaging Limit</h3>
                    <p className="text-sm text-gray-500">{config.tier}</p>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <div className="flex items-baseline justify-between mb-2">
                        <span className="text-3xl font-bold text-gray-900">{config.label}</span>
                        <span className="text-sm text-gray-500">per 24 hours</span>
                    </div>

                    {config.value !== Infinity && (
                        <>
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                <div
                                    className={`h-2 rounded-full transition-all ${isNearLimit ? 'bg-red-500' : `bg-${config.color}-500`
                                        }`}
                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                />
                            </div>
                            <p className="text-sm text-gray-600">
                                <span className="font-semibold">{messageCount.toLocaleString()}</span> messages sent
                                {isNearLimit && (
                                    <span className="text-red-600 ml-2">⚠️ Near limit</span>
                                )}
                            </p>
                        </>
                    )}
                </div>

                <div className="pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Tier Benefits</h4>
                    <ul className="space-y-1.5 text-sm text-gray-600">
                        {config.tier === 'Tier 1' && (
                            <>
                                <li className="flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-blue-500" />
                                    Starting tier for new accounts
                                </li>
                                <li className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-blue-500" />
                                    1,000 unique customers per day
                                </li>
                            </>
                        )}
                        {config.tier === 'Tier 2' && (
                            <>
                                <li className="flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-purple-500" />
                                    Upgraded after 7 days of good quality
                                </li>
                                <li className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-purple-500" />
                                    10,000 unique customers per day
                                </li>
                            </>
                        )}
                        {config.tier === 'Tier 3' && (
                            <>
                                <li className="flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-indigo-500" />
                                    High-volume messaging enabled
                                </li>
                                <li className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-indigo-500" />
                                    100,000 unique customers per day
                                </li>
                            </>
                        )}
                        {config.tier === 'Tier 4' && (
                            <>
                                <li className="flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-green-500" />
                                    No messaging restrictions
                                </li>
                                <li className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-green-500" />
                                    Unlimited unique customers
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}
