"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface HeatmapData {
    signature: string;
    hour: string;
    intensity: number;
    risk: string;
}

interface CoordinatedAttackHeatmapProps {
    data: HeatmapData[];
}

export function CoordinatedAttackHeatmap({ data }: CoordinatedAttackHeatmapProps) {
    // Process data into a grid
    const signatures = Array.from(new Set(data.map(d => d.signature)));
    const hours = Array.from(new Set(data.map(d => new Date(d.hour).getHours()))).sort((a, b) => a - b);

    const getIntensityColor = (intensity: number, risk: string) => {
        if (intensity === 0) return 'bg-slate-100';
        if (risk === 'critical') return 'bg-red-600';
        if (risk === 'high') return 'bg-orange-500';
        return 'bg-amber-400';
    };

    const getOpacity = (intensity: number) => {
        return Math.min(0.2 + (intensity / 10), 1);
    };

    return (
        <Card className="shadow-sm border-slate-200">
            <CardHeader>
                <CardTitle className="text-lg">Global Correlation Heatmap</CardTitle>
                <CardDescription>Coordinated attack signatures grouped by intensity and time.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="relative overflow-x-auto pb-4">
                    <div className="flex">
                        {/* Time labels column */}
                        <div className="w-24 mt-8 flex flex-col gap-2 pr-2">
                            {signatures.map(sig => (
                                <div key={sig} className="h-6 text-[10px] font-bold text-slate-400 truncate text-right uppercase tracking-tighter" title={sig}>
                                    {sig.replace('coordinated_', '').slice(0, 10)}...
                                </div>
                            ))}
                        </div>

                        {/* Grid */}
                        <div className="flex-1">
                            <div className="flex gap-2 mb-2">
                                {hours.map(hour => (
                                    <div key={hour} className="w-6 text-center text-[9px] font-black text-slate-300">
                                        {hour}h
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col gap-2">
                                {signatures.map(sig => (
                                    <div key={sig} className="flex gap-2">
                                        {hours.map(hour => {
                                            const cell = data.find(d => d.signature === sig && new Date(d.hour).getHours() === hour);
                                            return (
                                                <motion.div
                                                    key={hour}
                                                    whileHover={{ scale: 1.2, zIndex: 10 }}
                                                    className={`w-6 h-6 rounded-sm cursor-pointer border border-white/20 ${getIntensityColor(cell?.intensity || 0, cell?.risk || '')}`}
                                                    style={{ opacity: cell ? getOpacity(cell.intensity) : 0.05 }}
                                                    title={`${sig}\nIntensity: ${cell?.intensity.toFixed(1) || 0} Tenants\nRisk: ${cell?.risk || 'Normal'}`}
                                                />
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Legend */}
                <div className="mt-4 flex items-center justify-end gap-4 text-[10px] font-bold text-slate-400">
                    <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-sm bg-amber-400 opacity-40" /> Low
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-sm bg-orange-500 opacity-70" /> High
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-sm bg-red-600" /> Critical
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
