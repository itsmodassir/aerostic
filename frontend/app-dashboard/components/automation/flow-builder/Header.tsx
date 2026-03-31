"use client";

import React from "react";
import { 
  ChevronLeft, 
  Save, 
  Settings, 
  Share2, 
  Play, 
  MoreHorizontal,
  Zap,
  Loader2,
  Edit3
} from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Badge } from "../../ui/badge";
import { cn } from "@/lib/utils";

interface HeaderProps {
    name: string;
    setName: (name: string) => void;
    description: string;
    setDescription: (description: string) => void;
    trigger: string;
    setTrigger: (trigger: string) => void;
    onClose: () => void;
    onSave: () => void;
    isSaving: boolean;
}

export function Header({
    name,
    setName,
    description,
    setDescription,
    onClose,
    onSave,
    isSaving
}: HeaderProps) {
  return (
    <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
            <button 
                onClick={onClose}
                className="p-2.5 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-all border border-transparent hover:border-slate-100"
            >
                <ChevronLeft size={18} />
            </button>
            <div className="h-8 w-px bg-slate-100 mx-1" />
            <div className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100 group-hover:scale-105 transition-transform">
                    <Zap size={18} className="fill-current" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <input 
                            className="text-sm font-black text-slate-900 bg-transparent border-none p-0 focus:ring-0 outline-none w-48 tracking-tight capitalize"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Flow Name..."
                        />
                        <Edit3 size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[9px] font-black uppercase bg-emerald-50 text-emerald-600 border-emerald-100 tracking-widest px-2 py-0">
                            Draft
                        </Badge>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Last saved: Just now</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="flex items-center gap-3">
            <Button 
                variant="ghost" 
                size="sm"
                className="h-10 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:text-slate-900 px-4"
            >
                <Settings size={14} className="mr-2" />
                Settings
            </Button>
            <Button 
                variant="ghost" 
                size="sm"
                className="h-10 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:text-slate-900 px-4"
            >
                <Share2 size={14} className="mr-2" />
                Share
            </Button>
            <div className="h-6 w-px bg-slate-100 mx-2" />
            <Button 
                onClick={onSave}
                disabled={isSaving}
                className="h-10 bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest px-6 rounded-xl shadow-lg shadow-slate-200 transition-all active:scale-[0.98]"
            >
                {isSaving ? (
                    <Loader2 size={14} className="mr-2 animate-spin" />
                ) : (
                    <Save size={14} className="mr-2" />
                )}
                {isSaving ? 'Saving...' : 'Deploy Flow'}
            </Button>
        </div>
    </header>
  );
}
