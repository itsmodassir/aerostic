"use client";

import React from "react";
import { 
  Settings2, 
  Trash2, 
  ChevronDown, 
  MessageCircle, 
  GitBranch, 
  Clock, 
  Variable,
  Info,
  X,
  Plus
} from "lucide-react";
import { BuilderNode, BuilderNodeData } from "./types";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
import { Input } from "../../ui/input";
import { Badge } from "../../ui/badge";
import { cn } from "@/lib/utils";

interface ConfigPanelProps {
  selected: BuilderNode | null;
  onChange: (patch: Partial<BuilderNodeData>) => void;
  onDelete: () => void;
}

export function ConfigPanel({ selected, onChange, onDelete }: ConfigPanelProps) {
  if (!selected) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-50/50">
        <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center text-slate-300 shadow-sm border border-slate-100 mb-4">
             <Settings2 size={32} />
        </div>
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">Configuration</h3>
        <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
            Select a node on the canvas to configure its properties.
        </p>
      </div>
    );
  }

  const { type, data } = selected;

  return (
    <div className="flex flex-col h-full bg-white divide-y divide-slate-100 overflow-hidden">
        {/* Panel Header */}
        <div className="px-6 py-5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg shadow-slate-200">
                    <Settings2 size={16} />
                </div>
                <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none mb-1">Properties</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter tracking-widest">{type}</p>
                </div>
            </div>
            <button 
                onClick={onDelete}
                className="p-2 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-all"
                title="Delete node"
            >
                <Trash2 size={16} />
            </button>
        </div>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {type === 'trigger' && (
                <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-100 flex gap-3">
                        <Info size={16} className="text-yellow-600 shrink-0" />
                        <p className="text-[11px] text-yellow-700 font-medium leading-relaxed">
                            This is the starting point of your flow. It triggers when a new message matches your criteria.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Trigger Event</label>
                        <select 
                            className="w-full bg-slate-50 border-none rounded-xl text-xs font-bold p-3 outline-none focus:ring-2 focus:ring-blue-500/20"
                            value={data.trigger}
                            onChange={(e) => onChange({ trigger: e.target.value })}
                        >
                            <option value="message_received">Message Received</option>
                            <option value="keyword_detected">Keyword Detected</option>
                        </select>
                    </div>
                </div>
            )}

            {type === 'custom_reply' && (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 flex items-center justify-between">
                            Message Content
                            <span className="text-[9px] text-blue-500 lowercase underline cursor-pointer">Use Variables</span>
                        </label>
                        <Textarea 
                            className="w-full bg-slate-50 border-none rounded-xl text-xs font-medium p-4 outline-none focus:ring-2 focus:ring-blue-500/20 resize-none min-h-[120px] shadow-inner"
                            placeholder="Type your message here..."
                            value={data.message || ''}
                            onChange={(e) => onChange({ message: e.target.value })}
                        />
                    </div>
                </div>
            )}

            {type === 'conditions' && (
                <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Keywords to Match</label>
                        <div className="flex gap-2">
                            <Input 
                                className="flex-1 bg-slate-50 border-none rounded-xl text-xs font-bold p-3"
                                placeholder="Enter keyword..."
                                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                    if (e.key === 'Enter' && e.currentTarget.value) {
                                        onChange({ keywords: [...(data.keywords || []), e.currentTarget.value] });
                                        e.currentTarget.value = '';
                                    }
                                }}
                            />
                            <Button size="icon" className="bg-slate-900 rounded-xl">
                                <Plus size={16} />
                            </Button>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {data.keywords?.map((k: string, i: number) => (
                            <Badge key={i} variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-none px-3 py-1.5 rounded-xl text-[10px] font-bold gap-2">
                                {k}
                                <X size={12} className="cursor-pointer" onClick={() => onChange({ keywords: data.keywords.filter((_: any, idx: number) => idx !== i) })}/>
                            </Badge>
                        ))}
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Logic Type</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['any', 'all', 'exact'].map(m => (
                                <button
                                    key={m}
                                    onClick={() => onChange({ matchType: m })}
                                    className={cn(
                                        "py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                        data.matchType === m ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100"
                                    )}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {type === 'set_variable' && (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Variable Key</label>
                        <Input 
                            className="w-full bg-slate-50 border-none rounded-xl text-xs font-bold p-3"
                            placeholder="e.g. user_intent"
                            value={data.key || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ key: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Static Value</label>
                        <Input 
                            className="w-full bg-slate-50 border-none rounded-xl text-xs font-bold p-3"
                            placeholder="Value to store"
                            value={data.value || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ value: e.target.value })}
                        />
                    </div>
                </div>
            )}

            {type === 'delay' && (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Wait Time</label>
                        <div className="flex gap-2">
                            <Input 
                                type="number"
                                className="flex-1 bg-slate-50 border-none rounded-xl text-xs font-bold p-3"
                                value={data.waitDuration || 1}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ waitDuration: parseInt(e.target.value) })}
                            />
                            <select 
                                className="bg-slate-900 border-none rounded-xl text-[10px] font-black text-white p-3 outline-none uppercase tracking-widest"
                                value={data.waitUnit}
                                onChange={(e) => onChange({ waitUnit: e.target.value as "minutes" | "hours" | "days" })}
                            >
                                <option value="minutes">Mins</option>
                                <option value="hours">Hrs</option>
                                <option value="days">Days</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-6 bg-slate-50/30">
             <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                        <Info size={16} />
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-1">Auto-Save Active</p>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-medium">Changes to node properties are saved instantly to the canvas.</p>
                    </div>
                </div>
             </div>
        </div>
    </div>
  );
}
