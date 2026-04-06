"use client";

import React from "react";
import { Handle, Position, NodeProps, type Node as XYNode } from "@xyflow/react";
import {
  MessageCircle, Image, Video, Link2, Mail, Phone,
  HelpCircle, ListChecks, LayoutList, Clock, GitBranch,
  Split, Variable, Headphones, TrendingUp, MapPin,
  LayoutGrid, CircleStop, Zap, Globe, ExternalLink, CheckCircle
} from "lucide-react";
import { WaNodeData, MCQOption, ListSection } from "./types";
import { cn } from "@/lib/utils";

// ─── Shared Node Shell ────────────────────────────────────────────────────────

interface NodeShellProps {
  children: React.ReactNode;
  selected?: boolean;
  title: string;
  icon: React.ElementType;
  accent: string;   // tailwind color e.g. "blue"
  hasTarget?: boolean;
  hasSource?: boolean;
}

const ACCENT_MAP: Record<string, { header: string; icon: string; handle: string }> = {
  yellow:  { header: "bg-yellow-50 border-yellow-100",  icon: "text-yellow-600 bg-yellow-100",  handle: "!bg-yellow-500" },
  blue:    { header: "bg-blue-50 border-blue-100",      icon: "text-blue-600 bg-blue-100",      handle: "!bg-blue-500" },
  emerald: { header: "bg-emerald-50 border-emerald-100",icon: "text-emerald-600 bg-emerald-100",handle: "!bg-emerald-500" },
  rose:    { header: "bg-rose-50 border-rose-100",      icon: "text-rose-600 bg-rose-100",      handle: "!bg-rose-500" },
  teal:    { header: "bg-teal-50 border-teal-100",      icon: "text-teal-600 bg-teal-100",      handle: "!bg-teal-500" },
  amber:   { header: "bg-amber-50 border-amber-100",    icon: "text-amber-600 bg-amber-100",    handle: "!bg-amber-500" },
  purple:  { header: "bg-purple-50 border-purple-100",  icon: "text-purple-600 bg-purple-100",  handle: "!bg-purple-500" },
  orange:  { header: "bg-orange-50 border-orange-100",  icon: "text-orange-600 bg-orange-100",  handle: "!bg-orange-500" },
  violet:  { header: "bg-violet-50 border-violet-100",  icon: "text-violet-600 bg-violet-100",  handle: "!bg-violet-500" },
  cyan:    { header: "bg-cyan-50 border-cyan-100",      icon: "text-cyan-600 bg-cyan-100",      handle: "!bg-cyan-500" },
  green:   { header: "bg-green-50 border-green-100",    icon: "text-green-600 bg-green-100",    handle: "!bg-green-500" },
  indigo:  { header: "bg-indigo-50 border-indigo-100",  icon: "text-indigo-600 bg-indigo-100",  handle: "!bg-indigo-500" },
  pink:    { header: "bg-pink-50 border-pink-100",      icon: "text-pink-600 bg-pink-100",      handle: "!bg-pink-500" },
  slate:   { header: "bg-slate-50 border-slate-100",    icon: "text-slate-600 bg-slate-100",    handle: "!bg-slate-500" },
  red:     { header: "bg-red-50 border-red-100",        icon: "text-red-600 bg-red-100",        handle: "!bg-red-500" },
};

function NodeShell({
  children, selected, title, icon: Icon, accent, hasTarget = true, hasSource = true
}: NodeShellProps) {
  const a = ACCENT_MAP[accent] || ACCENT_MAP.blue;

  return (
    <div className={cn(
      "min-w-[240px] max-w-[300px] rounded-2xl border-2 bg-white shadow-sm transition-all duration-200 overflow-visible",
      selected
        ? "border-blue-500 ring-4 ring-blue-50 shadow-xl -translate-y-0.5"
        : "border-slate-100 hover:border-slate-300 hover:shadow-md"
    )}>
      {/* Header */}
      <div className={cn("px-4 py-2.5 flex items-center gap-2.5 border-b-2", a.header)}>
        <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center shrink-0", a.icon)}>
          <Icon size={13} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-700 select-none">
          {title}
        </span>
      </div>

      {/* Body */}
      <div className="p-4 relative">
        {hasTarget && (
          <Handle
            type="target"
            position={Position.Top}
            className={cn("!w-3 !h-3 !border-2 !border-white !-top-[7px] !left-1/2 !-translate-x-1/2", a.handle)}
          />
        )}
        {children}
        {hasSource && (
          <Handle
            type="source"
            position={Position.Bottom}
            className={cn("!w-3 !h-3 !border-2 !border-white !-bottom-[7px] !left-1/2 !-translate-x-1/2", a.handle)}
          />
        )}
      </div>
    </div>
  );
}

const Preview = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 min-h-[36px]">
    {children}
  </div>
);

const EmptyHint = ({ text }: { text: string }) => (
  <p className="text-[10px] italic text-slate-300 font-medium">{text}</p>
);

// ─── Start / Trigger ──────────────────────────────────────────────────────────

export const StartNode = ({ data, selected }: NodeProps<XYNode<WaNodeData>>) => (
  <NodeShell title="Start Trigger" icon={Zap} accent="yellow" hasTarget={false} selected={selected}>
    <Preview>
      <p className="text-[11px] font-bold text-slate-700 capitalize">
        {data.triggerType?.replace(/_/g, " ") || "Any Message"}
      </p>
      {data.triggerKeyword && (
        <p className="text-[10px] text-amber-600 font-mono mt-0.5">
          keyword: &quot;{data.triggerKeyword}&quot;
        </p>
      )}
    </Preview>
  </NodeShell>
);

// ─── Text Message ─────────────────────────────────────────────────────────────

export const TextNode = ({ data, selected }: NodeProps<XYNode<WaNodeData>>) => (
  <NodeShell title="Text Message" icon={MessageCircle} accent="blue" selected={selected}>
    <Preview>
      {data.text
        ? <p className="text-[11px] text-slate-600 font-medium leading-relaxed line-clamp-4 italic">{data.text}</p>
        : <EmptyHint text="No message content..." />}
    </Preview>
  </NodeShell>
);

// ─── Photo ─────────────────────────────────────────────────────────────────────

export const PhotoNode = ({ data, selected }: NodeProps<XYNode<WaNodeData>>) => (
  <NodeShell title="Send Photo" icon={Image} accent="emerald" selected={selected}>
    {data.mediaUrl ? (
      <img src={data.mediaUrl} alt="preview" className="w-full aspect-video object-cover rounded-xl border border-slate-100" />
    ) : (
      <div className="bg-slate-50 aspect-video rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-1">
        <Image size={20} className="text-slate-300" />
        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tight">No image set</span>
      </div>
    )}
    {data.mediaCaption && (
      <p className="text-[10px] text-slate-500 italic mt-2 truncate">{data.mediaCaption}</p>
    )}
  </NodeShell>
);

// ─── Video ────────────────────────────────────────────────────────────────────

export const VideoNode = ({ data, selected }: NodeProps<XYNode<WaNodeData>>) => (
  <NodeShell title="Send Video" icon={Video} accent="rose" selected={selected}>
    <div className="bg-slate-900 aspect-video rounded-xl flex flex-col items-center justify-center gap-1.5 border border-slate-800">
      <Video size={22} className="text-white/40" />
      {data.mediaUrl
        ? <p className="text-[9px] text-white/50 font-mono truncate max-w-[180px]">{data.mediaUrl}</p>
        : <span className="text-[9px] font-bold text-white/20 uppercase tracking-tight">No video URL set</span>}
    </div>
    {data.mediaCaption && (
      <p className="text-[10px] text-slate-500 italic mt-2 truncate">{data.mediaCaption}</p>
    )}
  </NodeShell>
);

// ─── Link / Website ──────────────────────────────────────────────────────────

export const LinkNode = ({ data, selected }: NodeProps<XYNode<WaNodeData>>) => (
  <NodeShell title="Share Link" icon={Link2} accent="teal" selected={selected}>
    <Preview>
      <div className="flex items-start gap-2">
        <div className="w-6 h-6 rounded-lg bg-teal-100 flex items-center justify-center shrink-0 mt-0.5">
          <Globe size={12} className="text-teal-600" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-slate-800 truncate">
            {data.linkTitle || <span className="text-slate-300 italic font-normal">No title</span>}
          </p>
          <p className="text-[10px] text-teal-600 font-mono truncate">
            {data.linkUrl || "https://..."}
          </p>
        </div>
      </div>
    </Preview>
  </NodeShell>
);

// ─── Email ────────────────────────────────────────────────────────────────────

export const EmailNode = ({ data, selected }: NodeProps<XYNode<WaNodeData>>) => (
  <NodeShell title="Send Email" icon={Mail} accent="indigo" selected={selected}>
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest w-10 shrink-0">To</span>
        <span className="text-[11px] font-mono text-indigo-600 truncate">{data.emailTo || <span className="text-slate-300">not set</span>}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest w-10 shrink-0">Subj</span>
        <span className="text-[11px] font-bold text-slate-700 truncate">{data.emailSubject || <span className="text-slate-300 font-normal italic">No subject</span>}</span>
      </div>
    </div>
  </NodeShell>
);

// ─── Call ─────────────────────────────────────────────────────────────────────

export const CallNode = ({ data, selected }: NodeProps<XYNode<WaNodeData>>) => (
  <NodeShell title="Initiate Call" icon={Phone} accent="green" selected={selected}>
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
        <Phone size={16} className="text-green-600" />
      </div>
      <div>
        <p className="text-[11px] font-black text-slate-800 font-mono">
          {data.callNumber || <span className="text-slate-300 font-normal italic font-sans">No number</span>}
        </p>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</p>
      </div>
    </div>
  </NodeShell>
);

// ─── Question ─────────────────────────────────────────────────────────────────

export const QuestionNode = ({ data, selected }: NodeProps<XYNode<WaNodeData>>) => (
  <NodeShell title="Ask Question" icon={HelpCircle} accent="amber" selected={selected}>
    <div className="space-y-2">
      <Preview>
        {data.questionText
          ? <p className="text-[11px] text-slate-600 italic font-medium leading-relaxed">{data.questionText}</p>
          : <EmptyHint text="No question text..." />}
      </Preview>
      {data.questionSaveAs && (
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Save as:</p>
          <code className="text-[9px] text-amber-600 font-mono bg-amber-50 px-1.5 py-0.5 rounded-md">
            {`{{${data.questionSaveAs}}}`}
          </code>
        </div>
      )}
    </div>
  </NodeShell>
);

// ─── MCQ / Buttons ────────────────────────────────────────────────────────────

export const MCQNode = ({ data, selected }: NodeProps<XYNode<WaNodeData>>) => {
  const options: MCQOption[] = data.mcqOptions || [];
  return (
    <NodeShell title="Buttons (MCQ)" icon={ListChecks} accent="purple" selected={selected}>
      <div className="space-y-2">
        <Preview>
          {data.mcqBody
            ? <p className="text-[11px] text-slate-600 italic font-medium leading-relaxed">{data.mcqBody}</p>
            : <EmptyHint text="No body text..." />}
        </Preview>
        <div className="flex flex-col gap-1.5">
          {options.slice(0, 3).map((opt, i) => (
            <div
              key={opt.id}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-purple-100 bg-purple-50/40"
            >
              <span className="text-[9px] font-black text-purple-400 w-4">{i + 1}.</span>
              <span className="text-[11px] font-bold text-slate-700 truncate">{opt.title || `Option ${i + 1}`}</span>
              <Handle
                type="source"
                id={opt.id}
                position={Position.Right}
                className="!w-3 !h-3 !bg-purple-500 !border-2 !border-white !static !transform-none ml-auto shrink-0"
              />
            </div>
          ))}
        </div>
        {options.length === 0 && <EmptyHint text="No options added (max 3)" />}
        {options.length > 3 && (
          <p className="text-[9px] text-red-500 font-black uppercase tracking-widest">
            ⚠ Max 3 buttons (Meta limit)
          </p>
        )}
      </div>
    </NodeShell>
  );
};

// ─── List Message ─────────────────────────────────────────────────────────────

export const ListNode = ({ data, selected }: NodeProps<XYNode<WaNodeData>>) => {
  const sections: ListSection[] = data.listSections || [];
  const totalItems = sections.reduce((s, sec) => s + sec.items.length, 0);
  return (
    <NodeShell title="Interactive List" icon={LayoutList} accent="cyan" selected={selected}>
      <div className="space-y-2">
        <Preview>
          {data.listBody
            ? <p className="text-[11px] text-slate-600 italic font-medium">{data.listBody}</p>
            : <EmptyHint text="No body text..." />}
        </Preview>
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
            {totalItems} item{totalItems !== 1 ? "s" : ""} in {sections.length} section{sections.length !== 1 ? "s" : ""}
          </span>
          {totalItems > 10 && (
            <span className="text-[8px] font-black text-red-500 uppercase">⚠ Max 10</span>
          )}
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-cyan-100 bg-cyan-50/40">
          <LayoutList size={12} className="text-cyan-600" />
          <span className="text-[11px] font-bold text-cyan-700">{data.listButtonText || "View Options"}</span>
        </div>
      </div>
    </NodeShell>
  );
};

// ─── Delay ────────────────────────────────────────────────────────────────────

export const DelayNode = ({ data, selected }: NodeProps<XYNode<WaNodeData>>) => (
  <NodeShell title="Wait / Delay" icon={Clock} accent="slate" selected={selected}>
    <div className="flex items-baseline gap-2 pb-1">
      <span className="text-3xl font-black text-slate-800 tracking-tighter tabular-nums">
        {data.waitDuration ?? 1}
      </span>
      <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
        {data.waitUnit || "minutes"}
      </span>
    </div>
    <div className="flex items-center gap-1.5">
      <div className="w-1 h-1 rounded-full bg-slate-300" />
      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Drip Interval</span>
    </div>
  </NodeShell>
);

// ─── Keyword Condition ────────────────────────────────────────────────────────

export const ConditionNode = ({ data, selected }: NodeProps<XYNode<WaNodeData>>) => (
  <NodeShell title="Keyword Check" icon={GitBranch} accent="orange" selected={selected}>
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Match</span>
        <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[9px] font-black uppercase">
          {data.matchType || "any"}
        </span>
      </div>
      <div className="flex flex-wrap gap-1">
        {(data.keywords || []).slice(0,6).map((kw: string, i: number) => (
          <span key={i} className="text-[9px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg">{kw}</span>
        ))}
        {!(data.keywords?.length) && <EmptyHint text="No keywords..." />}
      </div>
    </div>
    {/* Match branch */}
    <div className="absolute -right-4 top-1/3 flex flex-col items-center gap-0.5">
      <Handle type="source" id="match" position={Position.Right}
        className="!w-3.5 !h-3.5 !bg-emerald-500 !border-2 !border-white !static" />
      <span className="text-[7px] font-black text-emerald-600 uppercase">Match</span>
    </div>
    {/* Else branch */}
    <Handle type="source" id="else" position={Position.Bottom}
      className="!w-3 !h-3 !bg-rose-400 !border-2 !border-white" />
  </NodeShell>
);

// ─── If / Else ────────────────────────────────────────────────────────────────

export const IfElseNode = ({ data, selected }: NodeProps<XYNode<WaNodeData>>) => (
  <NodeShell title="If / Else" icon={Split} accent="violet" selected={selected}>
    <div className="space-y-1.5 text-[10px]">
      <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
        <code className="font-mono text-violet-600 truncate">{data.conditionVariable || "{{variable}}"}</code>
        <span className="text-slate-400 font-bold shrink-0">{data.conditionOperator || "equals"}</span>
        <code className="font-mono text-slate-700 truncate">&quot;{data.conditionValue || "..."}&quot;</code>
      </div>
    </div>
    {/* True */}
    <div className="absolute -right-4 top-1/3 flex flex-col items-center gap-0.5">
      <Handle type="source" id="true" position={Position.Right}
        className="!w-3.5 !h-3.5 !bg-emerald-500 !border-2 !border-white !static" />
      <span className="text-[7px] font-black text-emerald-600 uppercase">True</span>
    </div>
    {/* False */}
    <div className="absolute -right-4 top-2/3 flex flex-col items-center gap-0.5">
      <Handle type="source" id="false" position={Position.Right}
        className="!w-3.5 !h-3.5 !bg-rose-500 !border-2 !border-white !static" />
      <span className="text-[7px] font-black text-rose-600 uppercase">False</span>
    </div>
  </NodeShell>
);

// ─── Set Variable ─────────────────────────────────────────────────────────────

export const SetVariableNode = ({ data, selected }: NodeProps<XYNode<WaNodeData>>) => (
  <NodeShell title="Set Variable" icon={Variable} accent="pink" selected={selected}>
    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100 font-mono text-[10px]">
      <span className="text-pink-600 font-black truncate">{data.variableKey || "key"}</span>
      <span className="text-slate-400">←</span>
      <span className="text-slate-700 truncate">{data.variableValue || "value"}</span>
    </div>
  </NodeShell>
);

// ─── Support System ───────────────────────────────────────────────────────────

export const SupportNode = ({ data, selected }: NodeProps<XYNode<WaNodeData>>) => (
  <NodeShell title="Support System" icon={Headphones} accent="cyan" selected={selected}>
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-cyan-100 flex items-center justify-center">
          <Headphones size={15} className="text-cyan-600" />
        </div>
        <div>
          <p className="text-[11px] font-black text-slate-800">{data.supportDepartment || "General"}</p>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Dept.</p>
        </div>
      </div>
      <Preview>
        {data.supportMessage
          ? <p className="text-[10px] text-slate-500 italic leading-relaxed">{data.supportMessage}</p>
          : <EmptyHint text="No message set..." />}
      </Preview>
      {data.supportTicketTag && (
        <span className="inline-block text-[9px] font-black bg-cyan-50 text-cyan-700 border border-cyan-100 px-2 py-0.5 rounded-full uppercase">
          #{data.supportTicketTag}
        </span>
      )}
    </div>
  </NodeShell>
);

// ─── Sales System ─────────────────────────────────────────────────────────────

const SALES_STAGE_COLORS: Record<string, string> = {
  lead_capture: "bg-blue-100 text-blue-700",
  qualify: "bg-amber-100 text-amber-700",
  demo: "bg-purple-100 text-purple-700",
  close: "bg-green-100 text-green-700",
  nurture: "bg-rose-100 text-rose-700",
};

export const SalesNode = ({ data, selected }: NodeProps<XYNode<WaNodeData>>) => {
  const stageLabel = (data.salesStage || "lead_capture").replace(/_/g, " ");
  const stageColor = SALES_STAGE_COLORS[data.salesStage || "lead_capture"] || "bg-slate-100 text-slate-700";
  return (
    <NodeShell title="Sales System" icon={TrendingUp} accent="green" selected={selected}>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className={cn("text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full", stageColor)}>
            {stageLabel}
          </span>
        </div>
        <Preview>
          {data.salesMessage
            ? <p className="text-[10px] text-slate-500 italic leading-relaxed">{data.salesMessage}</p>
            : <EmptyHint text="No message set..." />}
        </Preview>
      </div>
    </NodeShell>
  );
};

// ─── Location Request ─────────────────────────────────────────────────────────

export const LocationNode = ({ data, selected }: NodeProps<XYNode<WaNodeData>>) => (
  <NodeShell title="Request Location" icon={MapPin} accent="red" selected={selected}>
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
        <MapPin size={16} className="text-red-600" />
      </div>
      <p className="text-[11px] text-slate-600 font-medium leading-snug">
        {data.text || "Please share your location."}
      </p>
    </div>
  </NodeShell>
);

// ─── Carousel ─────────────────────────────────────────────────────────────────

export const CarouselNode = ({ data, selected }: NodeProps<XYNode<WaNodeData>>) => {
  const cards = data.carouselCards || [];
  return (
    <NodeShell title="Carousel" icon={LayoutGrid} accent="indigo" selected={selected}>
      <div className="space-y-1.5">
        {cards.slice(0, 3).map((c: any, i: number) => (
          <div key={c.id} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50/50 rounded-xl border border-indigo-100">
            <div className="w-5 h-5 rounded-md bg-indigo-100 flex items-center justify-center">
              <LayoutGrid size={10} className="text-indigo-600" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 truncate">{c.title || `Card ${i + 1}`}</span>
          </div>
        ))}
        {cards.length === 0 && <EmptyHint text="No cards added..." />}
        {cards.length > 3 && (
          <p className="text-[9px] text-slate-400 font-bold uppercase">+{cards.length - 3} more cards</p>
        )}
      </div>
    </NodeShell>
  );
};

// ─── End Node ─────────────────────────────────────────────────────────────────

export const EndNode = ({ selected }: NodeProps<XYNode<WaNodeData>>) => (
  <div className={cn(
    "w-36 h-14 bg-white rounded-full border-2 flex items-center justify-center gap-2 shadow-sm transition-all",
    selected ? "border-red-500 shadow-lg ring-4 ring-red-50" : "border-slate-100 hover:border-slate-300"
  )}>
    <CircleStop size={15} className="text-red-500 fill-red-50" />
    <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">End Flow</span>
    <Handle type="target" position={Position.Top}
      className="!w-3 !h-3 !bg-red-400 !border-2 !border-white" />
  </div>
);

// ─── nodeTypes registry ───────────────────────────────────────────────────────

export const nodeTypes = {
  wa_start: StartNode,
  wa_text: TextNode,
  wa_photo: PhotoNode,
  wa_video: VideoNode,
  wa_link: LinkNode,
  wa_email: EmailNode,
  wa_call: CallNode,
  wa_question: QuestionNode,
  wa_mcq: MCQNode,
  wa_list: ListNode,
  wa_delay: DelayNode,
  wa_condition: ConditionNode,
  wa_if_else: IfElseNode,
  wa_set_variable: SetVariableNode,
  wa_support: SupportNode,
  wa_sales: SalesNode,
  wa_location: LocationNode,
  wa_carousel: CarouselNode,
  wa_end: EndNode,
};
