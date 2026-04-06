import React from 'react';
import { TrendingUp, Users, Zap } from 'lucide-react';
import { clsx } from 'clsx';

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
                return { value: 1000, label: '1,000', tier: 'Tier 1', colorClass: 'blue' };
            case '10K':
            case 'TIER_10K':
                return { value: 10000, label: '10,000', tier: 'Tier 2', colorClass: 'purple' };
            case '100K':
            case 'TIER_100K':
                return { value: 100000, label: '100,000', tier: 'Tier 3', colorClass: 'indigo' };
            case 'UNLIMITED':
            case 'TIER_UNLIMITED':
                return { value: Infinity, label: 'Unlimited', tier: 'Tier 4', colorClass: 'emerald' };
            default:
                return { value: 0, label: 'Unknown', tier: 'Unknown', colorClass: 'gray' };
        }
    };

    const config = getLimitConfig(messagingLimit);
    const percentage = config.value === Infinity ? 0 : (messageCount / config.value) * 100;
    const isNearLimit = percentage > 80;

    // Tailwind Color Maps to fix dynamic class interpolation bug
    const bgMap: any = {
        blue: 'bg-blue-50',
        purple: 'bg-purple-50',
        indigo: 'bg-indigo-50',
        emerald: 'bg-emerald-50',
        gray: 'bg-gray-50'
    };
    const textMap: any = {
        blue: 'text-blue-600',
        purple: 'text-purple-600',
        indigo: 'text-indigo-600',
        emerald: 'text-emerald-600',
        gray: 'text-gray-400'
    };
    const progressMap: any = {
        blue: 'bg-blue-500',
        purple: 'bg-purple-500',
        indigo: 'bg-indigo-500',
        emerald: 'bg-emerald-500',
        gray: 'bg-gray-300'
    };

    return (
        <div className={clsx("bg-white rounded-[32px] border border-gray-200/60 p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 h-full flex flex-col", className)}>
            <div className="flex items-center gap-4 mb-8">
                <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border", bgMap[config.colorClass])}>
                    <TrendingUp className={clsx("w-6 h-6", textMap[config.colorClass])} />
                </div>
                <div>
                    <h3 className="text-lg font-black text-gray-900 tracking-tight">Messaging Scale</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{config.tier} Verification Status</p>
                </div>
            </div>

            <div className="space-y-8 flex-1">
                <div>
                    <div className="flex items-baseline justify-between mb-4 px-1">
                        <span className="text-4xl font-black text-gray-900 tracking-tighter">{config.label}</span>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">/ 24h cycle</span>
                    </div>

                    {config.value !== Infinity && (
                        <div className="space-y-6">
                            <div className="w-full bg-gray-50 rounded-2xl h-6 p-1.5 border border-gray-100 shadow-inner">
                                <div
                                    className={clsx(
                                        "h-full rounded-xl transition-all duration-1000 shadow-sm",
                                        isNearLimit ? 'bg-red-500 shadow-red-100' : progressMap[config.colorClass]
                                    )}
                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                />
                            </div>
                            <div className="flex justify-between items-center px-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <span className="text-gray-900">{messageCount.toLocaleString()}</span> consumed today
                                </p>
                                {isNearLimit && (
                                    <div className="animate-pulse flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm">
                                        <Zap size={10} fill="currentColor" /> Near Limit
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-8 border-t border-gray-50">
                    <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 ml-1">Daily Entitlements</h4>
                    <div className="space-y-3">
                        {[
                            { icon: Zap, text: 'Automatic tier progression after quality usage', activeColor: textMap[config.colorClass] },
                            { icon: Users, text: `${config.label} unique customer initiations daily`, activeColor: textMap[config.colorClass] }
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50 hover:bg-gray-50 transition-colors group">
                                <item.icon className={clsx("w-5 h-5 shrink-0 transition-transform group-hover:scale-110", item.activeColor)} />
                                <p className="text-xs text-gray-600 font-bold leading-tight">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
