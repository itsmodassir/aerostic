"use client";

import React, { useState } from "react";
import {
  MessageCircle, Image, Video, Link2, Mail, Phone,
  HelpCircle, ListChecks, LayoutList, Clock, GitBranch,
  Split, Variable, Headphones, TrendingUp, MapPin,
  LayoutGrid, CircleStop, Zap, Info, ChevronDown, ChevronRight,
} from "lucide-react";
import { NodeKind } from "./types";
import { cn } from "@/lib/utils";

const NODE_CATALOG = [
  {
    category: "Start & End",
    icon: Zap,
    items: [
      { kind: "wa_start" as NodeKind, name: "Start Trigger", icon: Zap, color: "text-yellow-600", bg: "bg-yellow-50", tip: "The entry point of your flow." },
      { kind: "wa_end" as NodeKind, name: "End Flow", icon: CircleStop, color: "text-red-500", bg: "bg-red-50", tip: "Terminates the conversation flow." },
    ],
  },
  {
    category: "Content",
    icon: MessageCircle,
    items: [
      { kind: "wa_text" as NodeKind, name: "Text Message", icon: MessageCircle, color: "text-blue-600", bg: "bg-blue-50", tip: "Send a plain text message to the user." },
      { kind: "wa_photo" as NodeKind, name: "Photo", icon: Image, color: "text-emerald-600", bg: "bg-emerald-50", tip: "Send an image with optional caption." },
      { kind: "wa_video" as NodeKind, name: "Video", icon: Video, color: "text-rose-600", bg: "bg-rose-50", tip: "Send a video file via URL." },
      { kind: "wa_link" as NodeKind, name: "Website Link", icon: Link2, color: "text-teal-600", bg: "bg-teal-50", tip: "Share a link with title and description." },
    ],
  },
  {
    category: "Actions",
    icon: Phone,
    items: [
      { kind: "wa_email" as NodeKind, name: "Send Email", icon: Mail, color: "text-indigo-600", bg: "bg-indigo-50", tip: "Trigger an email to be sent." },
      { kind: "wa_call" as NodeKind, name: "Initiate Call", icon: Phone, color: "text-green-600", bg: "bg-green-50", tip: "Prompt a phone call to a number." },
      { kind: "wa_location" as NodeKind, name: "Request Location", icon: MapPin, color: "text-red-600", bg: "bg-red-50", tip: "Ask the user to share their GPS location." },
    ],
  },
  {
    category: "Interactive",
    icon: HelpCircle,
    items: [
      { kind: "wa_question" as NodeKind, name: "Question", icon: HelpCircle, color: "text-amber-600", bg: "bg-amber-50", tip: "Ask an open-ended question and save the reply." },
      { kind: "wa_mcq" as NodeKind, name: "Buttons (MCQ)", icon: ListChecks, color: "text-purple-600", bg: "bg-purple-50", tip: "Present up to 3 quick reply buttons (Meta limit)." },
      { kind: "wa_list" as NodeKind, name: "Interactive List", icon: LayoutList, color: "text-cyan-600", bg: "bg-cyan-50", tip: "Show a list menu with up to 10 items." },
      { kind: "wa_carousel" as NodeKind, name: "Carousel", icon: LayoutGrid, color: "text-indigo-600", bg: "bg-indigo-50", tip: "Send multiple cards with titles, images, and buttons." },
    ],
  },
  {
    category: "Logic",
    icon: GitBranch,
    items: [
      { kind: "wa_condition" as NodeKind, name: "Keyword Check", icon: GitBranch, color: "text-orange-600", bg: "bg-orange-50", tip: "Branch flow based on detected keywords." },
      { kind: "wa_if_else" as NodeKind, name: "If / Else", icon: Split, color: "text-violet-600", bg: "bg-violet-50", tip: "Branch logic based on variable comparisons." },
      { kind: "wa_delay" as NodeKind, name: "Wait / Delay", icon: Clock, color: "text-slate-600", bg: "bg-slate-100", tip: "Pause before sending the next message." },
      { kind: "wa_set_variable" as NodeKind, name: "Set Variable", icon: Variable, color: "text-pink-600", bg: "bg-pink-50", tip: "Store a value in a named variable." },
    ],
  },
  {
    category: "System",
    icon: Headphones,
    items: [
      { kind: "wa_support" as NodeKind, name: "Support System", icon: Headphones, color: "text-cyan-600", bg: "bg-cyan-50", tip: "Route to a support department and create a ticket." },
      { kind: "wa_sales" as NodeKind, name: "Sales System", icon: TrendingUp, color: "text-green-600", bg: "bg-green-50", tip: "Manage sales pipeline stages: lead, qualify, demo, close." },
    ],
  },
];

interface NodeSidebarProps {
  onAddNode: (kind: NodeKind) => void;
}

export function NodeSidebar({ onAddNode }: NodeSidebarProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    "Start & End": true,
    "Content": true,
    "Interactive": true,
    "Actions": false,
    "Logic": false,
    "System": false,
  });

  const toggle = (cat: string) =>
    setExpanded((prev) => ({ ...prev, [cat]: !prev[cat] }));

  return (
    <div className="flex flex-col h-full w-64 bg-white border-r border-slate-100 overflow-hidden shrink-0 z-20">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-800">Node Library</p>
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">Click to add to canvas</p>
      </div>

      {/* Scrollable node list */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-hide">
        {NODE_CATALOG.map((group) => (
          <div key={group.category}>
            {/* Category header */}
            <button
              onClick={() => toggle(group.category)}
              className="flex items-center justify-between w-full px-2 py-2 rounded-xl hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <group.icon size={11} className="text-slate-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-700 transition-colors">
                  {group.category}
                </span>
              </div>
              {expanded[group.category]
                ? <ChevronDown size={11} className="text-slate-300" />
                : <ChevronRight size={11} className="text-slate-300" />}
            </button>

            {expanded[group.category] && (
              <div className="flex flex-col gap-1 mb-1 pl-1">
                {group.items.map((item) => (
                  <button
                    key={item.kind}
                    onClick={() => onAddNode(item.kind)}
                    title={item.tip}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 border-transparent",
                      "hover:border-slate-200 hover:bg-white hover:shadow-sm",
                      "transition-all duration-200 group w-full text-left active:scale-95",
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                      "transition-transform duration-200 group-hover:scale-110 shadow-sm",
                      item.bg,
                    )}>
                      <item.icon size={14} className={item.color} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-black text-slate-800 leading-none truncate">{item.name}</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.12em] mt-0.5 truncate">Click to add</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Meta compliance footer */}
      <div className="px-4 py-3 border-t border-slate-100 bg-emerald-50/60">
        <div className="flex items-start gap-2">
          <Info size={12} className="text-emerald-600 mt-0.5 shrink-0" />
          <p className="text-[9px] text-emerald-700 font-bold leading-relaxed">
            Meta compliant · Buttons limited to 3 · Lists limited to 10 items
          </p>
        </div>
      </div>
    </div>
  );
}
