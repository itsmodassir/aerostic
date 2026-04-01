"use client";

import React from "react";
import {
  MessageCircle,
  GitBranch,
  Clock,
  CircleStop,
  Variable,
  Info,
  Zap,
  Image,
  Video,
  FileText,
  Split,
  Globe,
} from "lucide-react";
import { NodeKind } from "./types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../ui/tooltip";
import { cn } from "@/lib/utils";

interface SidebarProps {
  onAddNode: (kind: NodeKind) => void;
}

const nodeCategories = [
  {
    label: "Core",
    items: [
      {
        kind: "trigger" as NodeKind,
        name: "Trigger",
        icon: Zap,
        color: "text-amber-500",
        bg: "bg-amber-50",
        border: "border-amber-200",
        tip: "Starting point of your automated flow.",
      },
    ],
  },
  {
    label: "Communication",
    items: [
      {
        kind: "custom_reply" as NodeKind,
        name: "Message",
        icon: MessageCircle,
        color: "text-blue-500",
        bg: "bg-blue-50",
        border: "border-blue-200",
        tip: "Send an automated response to the customer.",
      },
      {
        kind: "photo" as NodeKind,
        name: "Photo",
        icon: Image,
        color: "text-emerald-500",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        tip: "Send an image to the customer.",
      },
      {
        kind: "video" as NodeKind,
        name: "Video",
        icon: Video,
        color: "text-rose-500",
        bg: "bg-rose-50",
        border: "border-rose-200",
        tip: "Send a video to the customer.",
      },
      {
        kind: "doc" as NodeKind,
        name: "Document",
        icon: FileText,
        color: "text-indigo-500",
        bg: "bg-indigo-50",
        border: "border-indigo-200",
        tip: "Send a document or PDF to the customer.",
      },
    ],
  },
  {
    label: "Logic & Flow",
    items: [
      {
        kind: "conditions" as NodeKind,
        name: "Logic",
        icon: GitBranch,
        color: "text-purple-500",
        bg: "bg-purple-50",
        border: "border-purple-200",
        tip: "Check message keywords to branch the flow.",
      },
      {
        kind: "if_else" as NodeKind,
        name: "If / Else",
        icon: Split,
        color: "text-orange-500",
        bg: "bg-orange-50",
        border: "border-orange-200",
        tip: "Branch the flow based on complex logic or variables.",
      },
      {
        kind: "delay" as NodeKind,
        name: "Delay",
        icon: Clock,
        color: "text-slate-500",
        bg: "bg-slate-50",
        border: "border-slate-200",
        tip: "Pause execution for a specific duration.",
      },
      {
        kind: "set_variable" as NodeKind,
        name: "Variable",
        icon: Variable,
        color: "text-violet-500",
        bg: "bg-violet-50",
        border: "border-violet-200",
        tip: "Store custom data during flow execution.",
      },
      {
        kind: "browser_agent" as NodeKind,
        name: "Browser Agent",
        icon: Globe,
        color: "text-violet-600",
        bg: "bg-violet-50",
        border: "border-violet-200",
        tip: "Autonomous browser interaction to research web and extract data.",
      },
    ],
  },
  {
    label: "Finish",
    items: [
      {
        kind: "end" as NodeKind,
        name: "End Flow",
        icon: CircleStop,
        color: "text-rose-500",
        bg: "bg-rose-50",
        border: "border-rose-200",
        tip: "Permanently stop the flow execution here.",
      },
    ],
  },
];

export function Sidebar({ onAddNode }: SidebarProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col h-full bg-white border-r border-slate-200 overflow-hidden w-64 shrink-0 shadow-sm z-20">
        <div className="px-6 py-6 border-b border-slate-100 bg-white">
          <div className="font-black text-xs text-slate-900 uppercase tracking-widest leading-none mb-1">Flow Nexus</div>
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Click to add components</div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8 scrollbar-hide">
          {nodeCategories.map((category) => (
            <div key={category.label} className="space-y-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-300 px-2 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-slate-200" />
                {category.label}
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                {category.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.kind} className="relative group">
                      <button
                        onClick={() => onAddNode(item.kind)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3.5 py-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer active:scale-[0.98] outline-none",
                          "border-slate-50 bg-slate-50/50 hover:border-slate-200 hover:bg-white hover:shadow-lg hover:-translate-y-0.5",
                          "group-hover:border-slate-200"
                        )}
                      >
                        <div className={cn("w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-110", item.color)}>
                           <Icon className="w-5 h-5 fill-current" />
                        </div>
                        <div className="text-left">
                            <span className="block text-[11px] font-black text-slate-900 uppercase tracking-tight">
                                {item.name}
                            </span>
                             <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Component</span>
                        </div>
                      </button>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            className="absolute top-3 right-3 p-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all bg-white hover:bg-slate-50 shadow-sm border border-slate-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Info className="w-3 h-3 text-slate-300 hover:text-slate-500" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-[200px] bg-slate-900 text-white rounded-xl border-none shadow-2xl p-4">
                          <p className="font-black text-[10px] uppercase tracking-widest mb-2 flex items-center gap-2">
                             <item.icon size={12} className={item.color} />
                             {item.name}
                          </p>
                          <p className="text-[11px] text-slate-300 leading-relaxed font-medium">{item.tip}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
