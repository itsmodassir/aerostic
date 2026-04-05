'use client';

import React from 'react';
import { Phone, Mail, MoreHorizontal, User, Star } from 'lucide-react';
import { clsx } from 'clsx';
import { format } from 'date-fns';

interface LeadProps {
    lead: {
        id: string;
        name: string;
        phoneNumber: string;
        email?: string;
        status: string;
        score: number;
        createdAt: string;
    };
    onClick: () => void;
    onMove: (newStatus: string) => void;
}

const LeadCard: React.FC<LeadProps> = ({ lead, onClick, onMove }) => {
    // Score based color intensity
    const scoreColor = lead.score > 80 ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 
                      lead.score > 50 ? 'text-blue-600 bg-blue-50 border-blue-100' : 
                      'text-slate-400 bg-slate-50 border-slate-100';

    return (
        <div 
            onClick={onClick}
            className="group relative bg-white/70 backdrop-blur-md border border-white/20 p-5 rounded-[24px] shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer active:scale-95"
        >
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-[24px] pointer-events-none" />
            
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform duration-300">
                            {lead.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-black text-slate-800 text-sm truncate group-hover:text-indigo-600 transition-colors">
                                {lead.name}
                            </h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Lead #{lead.id.slice(0, 4)}
                            </p>
                        </div>
                    </div>
                    <div className={clsx("px-2 py-1 rounded-lg border text-[10px] font-black tracking-tighter flex items-center gap-1", scoreColor)}>
                        <Star size={10} className={lead.score > 50 ? "fill-current" : ""} />
                        {lead.score}
                    </div>
                </div>

                <div className="space-y-2.5 mb-6">
                    <div className="flex items-center gap-2.5 text-xs text-slate-500 font-bold">
                        <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                            <Phone size={12} />
                        </div>
                        {lead.phoneNumber}
                    </div>
                    {lead.email && (
                        <div className="flex items-center gap-2.5 text-xs text-slate-500 font-bold">
                            <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                                <Mail size={12} />
                            </div>
                            <span className="truncate">{lead.email}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-tight">
                        {format(new Date(lead.createdAt), 'MMM dd, yyyy')}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
                            <MoreHorizontal size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(LeadCard);
