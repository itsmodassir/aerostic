'use client';

import React from 'react';
import { Phone, Mail, Calendar, MoreVertical, User } from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface ContactRowProps {
    contact: {
        id: string;
        name: string;
        phoneNumber: string;
        email?: string;
        createdAt: string;
    };
    onEdit: () => void;
    onDelete: () => void;
    isActive: boolean;
    onToggleMenu: () => void;
}

const ContactRow: React.FC<ContactRowProps> = ({ contact, onEdit, onDelete, isActive, onToggleMenu }) => {
    return (
        <motion.tr 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="group hover:bg-slate-50/80 transition-colors border-b border-slate-50 relative"
        >
            <td className="px-6 py-5">
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-blue-100 group-hover:scale-105 transition-transform duration-300">
                        {contact.name[0]?.toUpperCase() || <User size={18} />}
                    </div>
                    <div className="min-w-0">
                        <div className="font-black text-slate-800 text-sm truncate">{contact.name}</div>
                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">
                            REF: {contact.id.slice(0, 8)}
                        </div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-5">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5 text-xs font-bold text-slate-600">
                        <div className="p-1 bg-slate-100 rounded-md text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                            <Phone size={12} />
                        </div>
                        {contact.phoneNumber}
                    </div>
                    {contact.email && (
                        <div className="flex items-center gap-2.5 text-[11px] font-bold text-slate-400">
                            <div className="p-1 bg-slate-100 rounded-md text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                                <Mail size={12} />
                            </div>
                            <span className="truncate max-w-[150px]">{contact.email}</span>
                        </div>
                    )}
                </div>
            </td>
            <td className="px-6 py-5">
                <div className="flex items-center gap-2.5 text-xs font-bold text-slate-500">
                    <div className="p-1.5 bg-slate-50 rounded-lg text-slate-300">
                        <Calendar size={14} />
                    </div>
                    {format(new Date(contact.createdAt), 'MMM dd, yyyy')}
                </div>
            </td>
            <td className="px-6 py-5 text-right relative">
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleMenu();
                    }}
                    className={clsx(
                        "p-2 rounded-xl transition-all shadow-sm border",
                        isActive ? "bg-white border-slate-200 text-slate-900" : "opacity-0 group-hover:opacity-100 bg-white/50 border-transparent text-slate-400 hover:border-slate-200 hover:text-slate-600"
                    )}
                >
                    <MoreVertical size={16} />
                </button>
                
                {isActive && (
                    <div className="absolute right-6 top-14 w-40 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-100 p-1.5 z-50 animate-in fade-in zoom-in-95 fill-mode-forwards">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onEdit(); }} 
                            className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-black text-slate-700 hover:bg-slate-50 transition-colors uppercase tracking-widest"
                        >
                            Edit Profile
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDelete(); }} 
                            className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-black text-rose-600 hover:bg-rose-50 transition-colors uppercase tracking-widest"
                        >
                            Remove
                        </button>
                    </div>
                )}
            </td>
        </motion.tr>
    );
};

export default React.memo(ContactRow);
