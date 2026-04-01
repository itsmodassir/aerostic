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
  Plus,
  Image,
  Video,
  FileText,
  Split,
  Link,
  Upload,
  Globe,
  Bot
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
                    
                    {/* Common Button Editor for message nodes */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 flex items-center justify-between">
                            Interactive Buttons
                            <span className="text-[9px] text-slate-400 lowercase">{(data.buttons?.length || 0)} / 3 used</span>
                        </label>
                        <div className="space-y-2">
                            {(data.buttons || []).map((btn: any, idx: number) => (
                                <div key={btn.id} className="flex gap-2 items-center bg-slate-50 p-2 rounded-xl border border-slate-100 group">
                                    <div className="flex-1 space-y-1">
                                        <Input 
                                            className="w-full bg-transparent border-none text-[11px] font-bold h-7 p-0 px-2 focus:ring-0"
                                            value={btn.text}
                                            placeholder="Button label..."
                                            onChange={(e) => {
                                                const newButtons = [...(data.buttons || [])];
                                                newButtons[idx] = { ...btn, text: e.target.value };
                                                onChange({ buttons: newButtons });
                                            }}
                                        />
                                        <div className="flex gap-2 px-2">
                                            <select 
                                                className="bg-transparent border-none text-[9px] font-black text-slate-400 uppercase outline-none"
                                                value={btn.type}
                                                onChange={(e) => {
                                                    const newButtons = [...(data.buttons || [])];
                                                    newButtons[idx] = { ...btn, type: e.target.value as 'reply' | 'url' };
                                                    onChange({ buttons: newButtons });
                                                }}
                                            >
                                                <option value="reply">Reply</option>
                                                <option value="url">URL</option>
                                            </select>
                                            {btn.type === 'url' && (
                                                <input 
                                                    className="flex-1 bg-transparent border-none text-[9px] font-medium text-blue-500 outline-none"
                                                    placeholder="https://..."
                                                    value={btn.url || ''}
                                                    onChange={(e) => {
                                                        const newButtons = [...(data.buttons || [])];
                                                        newButtons[idx] = { ...btn, url: e.target.value };
                                                        onChange({ buttons: newButtons });
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            const newButtons = (data.buttons || []).filter((_: any, i: number) => i !== idx);
                                            onChange({ buttons: newButtons });
                                        }}
                                        className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                            {(data.buttons?.length || 0) < 3 && (
                                <Button 
                                    variant="outline" 
                                    className="w-full border-dashed border-slate-200 text-slate-400 hover:text-blue-500 hover:border-blue-200 h-10 text-[10px] uppercase font-black tracking-widest rounded-xl transition-all"
                                    onClick={() => {
                                        const newId = `btn_${Math.random().toString(36).substr(2, 9)}`;
                                        onChange({ buttons: [...(data.buttons || []), { id: newId, text: 'New Button', type: 'reply' }] });
                                    }}
                                >
                                    <Plus size={14} className="mr-2" />
                                    Add Button
                                </Button>
                            )}
                        </div>
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

            {['photo', 'video', 'doc'].includes(type as any) && (
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Media Config</label>
                        <div className="p-8 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 group hover:bg-white hover:border-blue-200 transition-all cursor-pointer">
                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-400 shadow-sm group-hover:text-blue-500 group-hover:shadow-md transition-all">
                                <Upload size={24} />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-600">Upload {type}</span>
                        </div>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <Link size={12} />
                            </span>
                            <Input 
                                className="w-full bg-slate-50 border-none rounded-xl text-xs font-bold pl-9 p-3"
                                placeholder={`Or paste ${type} URL...`}
                                value={data.mediaUrl || ''}
                                onChange={(e) => onChange({ 
                                    mediaUrl: e.target.value, 
                                    imagePreview: type === 'photo' ? e.target.value : undefined,
                                    videoPreview: type === 'video' ? e.target.value : undefined 
                                })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Caption / Message</label>
                        <Textarea 
                            className="w-full bg-slate-50 border-none rounded-xl text-xs font-medium p-4 outline-none focus:ring-2 focus:ring-blue-500/20 resize-none min-h-[100px] shadow-inner"
                            placeholder="Add a caption to your media..."
                            value={data.message || ''}
                            onChange={(e) => onChange({ message: e.target.value })}
                        />
                    </div>

                    {/* Button editor for media nodes too */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 flex items-center justify-between">
                            Interactive Buttons
                            <span className="text-[9px] text-slate-400 lowercase">{(data.buttons?.length || 0)} / 3 used</span>
                        </label>
                        <div className="space-y-2">
                             {(data.buttons || []).map((btn: any, idx: number) => (
                                <div key={btn.id} className="flex gap-2 items-center bg-slate-50 p-2 rounded-xl border border-slate-100 group">
                                     <div className="flex-1 space-y-1">
                                        <Input 
                                            className="w-full bg-transparent border-none text-[11px] font-bold h-7 p-0 px-2 focus:ring-0"
                                            value={btn.text}
                                            placeholder="Button label..."
                                            onChange={(e) => {
                                                const newButtons = [...(data.buttons || [])];
                                                newButtons[idx] = { ...btn, text: e.target.value };
                                                onChange({ buttons: newButtons });
                                            }}
                                        />
                                        <div className="flex gap-2 px-2">
                                            <select 
                                                className="bg-transparent border-none text-[9px] font-black text-slate-400 uppercase outline-none"
                                                value={btn.type}
                                                onChange={(e) => {
                                                    const newButtons = [...(data.buttons || [])];
                                                    newButtons[idx] = { ...btn, type: e.target.value as 'reply' | 'url' };
                                                    onChange({ buttons: newButtons });
                                                }}
                                            >
                                                <option value="reply">Reply</option>
                                                <option value="url">URL</option>
                                            </select>
                                            {btn.type === 'url' && (
                                                <input 
                                                    className="flex-1 bg-transparent border-none text-[9px] font-medium text-blue-500 outline-none"
                                                    placeholder="https://..."
                                                    value={btn.url || ''}
                                                    onChange={(e) => {
                                                        const newButtons = [...(data.buttons || [])];
                                                        newButtons[idx] = { ...btn, url: e.target.value };
                                                        onChange({ buttons: newButtons });
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            const newButtons = (data.buttons || []).filter((_: any, i: number) => i !== idx);
                                            onChange({ buttons: newButtons });
                                        }}
                                        className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                            {(data.buttons?.length || 0) < 3 && (
                                <Button 
                                    variant="outline" 
                                    className="w-full border-dashed border-slate-200 text-slate-400 hover:text-blue-500 hover:border-blue-200 h-10 text-[10px] uppercase font-black rounded-xl"
                                    onClick={() => {
                                        const newId = `btn_${Math.random().toString(36).substr(2, 9)}`;
                                        onChange({ buttons: [...(data.buttons || []), { id: newId, text: 'New Button', type: 'reply' }] });
                                    }}
                                >
                                    <Plus size={14} className="mr-2" />
                                    Add Button
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {type === 'if_else' && (
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Logic Condition</label>
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <span className="text-[9px] font-black uppercase text-slate-300 px-1">Variable</span>
                                <Input 
                                    className="w-full bg-slate-50 border-none rounded-xl text-xs font-bold p-3"
                                    placeholder="e.g. user_intent or {{trigger.body}}"
                                    value={data.variable || ''}
                                    onChange={(e) => onChange({ variable: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <span className="text-[9px] font-black uppercase text-slate-300 px-1">Operator</span>
                                <select 
                                    className="w-full bg-slate-50 border-none rounded-xl text-xs font-bold p-3 outline-none"
                                    value={data.operator || 'equals'}
                                    onChange={(e) => onChange({ operator: e.target.value })}
                                >
                                    <option value="equals">Equals</option>
                                    <option value="contains">Contains</option>
                                    <option value="exists">Exists</option>
                                    <option value="isEmpty">Is Empty</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[9px] font-black uppercase text-slate-300 px-1">Value to match</span>
                                <Input 
                                    className="w-full bg-slate-50 border-none rounded-xl text-xs font-bold p-3"
                                    placeholder="Value to compare against"
                                    value={data.value || ''}
                                    onChange={(e) => onChange({ value: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100 space-y-2">
                        <div className="flex items-center gap-2 text-orange-700">
                            <Split size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Branching Guide</span>
                        </div>
                        <p className="text-[10px] text-orange-600 leading-relaxed font-medium">
                            If the condition is met, the flow follows the <span className="font-bold underline">True</span> branch. Otherwise, it follows <span className="font-bold underline">False</span>.
                        </p>
                    </div>
                </div>
            )}

            {type === 'browser_agent' && (
                <div className="space-y-6">
                    <div className="p-4 rounded-2xl bg-violet-50 border border-violet-100 flex gap-3">
                        <Globe size={16} className="text-violet-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-[11px] text-violet-800 font-black uppercase tracking-wider">Autonomous Browser Agent</p>
                            <p className="text-[10px] text-violet-600 leading-relaxed font-medium">
                                Describe a task for the agent to perform in the browser. It can navigate, research, and extract data.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Task Prompt</label>
                        <Textarea 
                            className="w-full bg-slate-50 border-none rounded-xl text-xs font-medium p-4 outline-none focus:ring-2 focus:ring-violet-500/20 resize-none min-h-[140px] shadow-inner"
                            placeholder="e.g. Navigate to example.com and find the latest pricing for the 'Premium' plan..."
                            value={data.taskPrompt || ''}
                            onChange={(e) => onChange({ taskPrompt: e.target.value })}
                        />
                        <p className="text-[9px] text-slate-400 font-medium px-1 flex items-center gap-1.5">
                            <Bot size={10} />
                            Be specific about the URL and the data you need.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">System Instructions (Optional)</label>
                        <Textarea 
                            className="w-full bg-slate-50 border-none rounded-xl text-[10px] font-medium p-3 outline-none focus:ring-2 focus:ring-violet-500/10 resize-none min-h-[80px]"
                            placeholder="Guidelines for the agent..."
                            value={data.systemPrompt || ''}
                            onChange={(e) => onChange({ systemPrompt: e.target.value })}
                        />
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
