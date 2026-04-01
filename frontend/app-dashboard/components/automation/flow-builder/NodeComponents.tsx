import React from "react";
import { Handle, Position, NodeProps, type Node as XYNode } from "@xyflow/react";
import { 
  Zap, 
  MessageCircle, 
  GitBranch, 
  Clock, 
  CircleStop, 
  Variable, 
  Settings2,
  ChevronDown,
  Info,
  Image,
  Video,
  FileText,
  Split,
  ExternalLink
} from "lucide-react";
import { BuilderNodeData } from "./types";
import { cn } from "@/lib/utils";

const NodeWrapper = ({ children, selected, title, icon: Icon, color, bg }: any) => (
  <div className={cn(
    "min-w-[220px] max-w-[280px] bg-white rounded-2xl border-2 transition-all duration-200 overflow-hidden shadow-sm",
    selected ? "border-blue-500 ring-4 ring-blue-50/50 shadow-xl -translate-y-0.5" : "border-slate-100 ring-0 hover:border-slate-300"
  )}>
    <div className={cn("px-4 py-2 flex items-center gap-2 border-b-2", bg)}>
        <div className={cn("w-6 h-6 rounded-lg bg-white flex items-center justify-center shadow-sm", color)}>
            <Icon size={14} className="fill-current" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">{title}</span>
    </div>
    <div className="p-4 bg-white">
      {children}
    </div>
  </div>
);

export const TriggerNode = ({ data, selected }: NodeProps<XYNode<BuilderNodeData>>) => (
  <NodeWrapper title="Trigger" icon={Zap} color="text-yellow-500" bg="bg-yellow-50/50" selected={selected}>
    <div className="space-y-1">
        <p className="text-xs font-bold text-slate-800 tracking-tight">
            {data.trigger?.replace(/_/g, ' ') || 'Message Received'}
        </p>
        <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
            Flow starts when a customer initiates contact.
        </p>
    </div>
    <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white" />
  </NodeWrapper>
);

export const CustomReplyNode = ({ data, selected }: NodeProps<XYNode<BuilderNodeData>>) => (
  <NodeWrapper title="Message" icon={MessageCircle} color="text-blue-500" bg="bg-blue-50/50" selected={selected}>
    <div className="space-y-2">
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 min-h-[40px]">
            <p className="text-[11px] text-slate-600 font-medium leading-relaxed italic">
                {data.message || 'No message content...'}
            </p>
        </div>
        {data.buttons && data.buttons.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
                {data.buttons.map((b: any, i: number) => (
                    <span key={i} className="text-[9px] font-black uppercase bg-white border border-blue-100 text-blue-600 px-2 py-0.5 rounded-lg">
                        {b.text}
                    </span>
                ))}
            </div>
        )}
    </div>
    <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-slate-200 !border-2 !border-white" />
    
    {/* Default output handle */}
    {(!data.buttons || data.buttons.length === 0) && (
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white" />
    )}

    {/* Dynamic button handles */}
    {data.buttons?.map((button: any, index: number) => (
      <div 
        key={button.id} 
        className="absolute -right-3 flex flex-col items-center gap-1"
        style={{ top: `${(index + 1) * (100 / ((data.buttons?.length || 0) + 1))}%` }}
      >
        <Handle 
          type="source" 
          position={Position.Right} 
          id={button.id} 
          className="!w-4 !h-4 !bg-blue-500 !border-2 !border-white !static" 
        />
        <span className="text-[7px] font-black text-blue-600 uppercase max-w-[40px] truncate">
          {button.text}
        </span>
      </div>
    ))}
  </NodeWrapper>
);

export const PhotoNode = ({ data, selected }: NodeProps<XYNode<BuilderNodeData>>) => (
  <NodeWrapper title="Photo" icon={Image} color="text-emerald-500" bg="bg-emerald-50/50" selected={selected}>
    <div className="space-y-2">
      {data.imagePreview ? (
        <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-100 shadow-inner">
          <img src={data.imagePreview} alt="Preview" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-1">
          <Image size={20} className="text-slate-300" />
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">No Image selected</span>
        </div>
      )}
      {data.message && (
        <p className="text-[10px] text-slate-500 font-medium italic truncate">{data.message}</p>
      )}
    </div>
    <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-slate-200 !border-2 !border-white" />
    <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white" />
  </NodeWrapper>
);

export const VideoNode = ({ data, selected }: NodeProps<XYNode<BuilderNodeData>>) => (
  <NodeWrapper title="Video" icon={Video} color="text-rose-500" bg="bg-rose-50/50" selected={selected}>
    <div className="space-y-2">
      {data.videoPreview ? (
        <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-100 shadow-inner bg-slate-900 flex items-center justify-center">
          <Video size={24} className="text-white/50" />
        </div>
      ) : (
        <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-1">
          <Video size={20} className="text-slate-300" />
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">No Video selected</span>
        </div>
      )}
      {data.message && (
        <p className="text-[10px] text-slate-500 font-medium italic truncate">{data.message}</p>
      )}
    </div>
    <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-slate-200 !border-2 !border-white" />
    <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white" />
  </NodeWrapper>
);

export const DocNode = ({ data, selected }: NodeProps<XYNode<BuilderNodeData>>) => (
  <NodeWrapper title="Document" icon={FileText} color="text-indigo-500" bg="bg-indigo-50/50" selected={selected}>
    <div className="space-y-2">
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
          <FileText size={16} />
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="text-[10px] font-bold text-slate-700 truncate">{data.filename || 'attachment.pdf'}</p>
          <p className="text-[8px] text-slate-400 font-black uppercase">{data.fileSize || 'Unknown Size'}</p>
        </div>
      </div>
    </div>
    <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-slate-200 !border-2 !border-white" />
    <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white" />
  </NodeWrapper>
);

export const IfElseNode = ({ data, selected }: NodeProps<XYNode<BuilderNodeData>>) => (
  <NodeWrapper title="If / Else" icon={Split} color="text-orange-500" bg="bg-orange-50/50" selected={selected}>
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Badge className="bg-orange-100 text-orange-700 text-[8px] font-black uppercase px-1.5">If</Badge>
        <span className="text-[10px] font-bold text-slate-600 truncate">{data.variable || 'Variable'}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{data.operator || 'equals'}</span>
        <span className="text-[10px] font-black text-orange-600 truncate">{data.value || 'Value'}</span>
      </div>
    </div>
    <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-slate-200 !border-2 !border-white" />
    
    {/* True Branch */}
    <div className="absolute -right-3 top-1/3 -translate-y-1/2 flex flex-col items-center gap-1">
        <Handle type="source" position={Position.Right} id="true" className="!w-4 !h-4 !bg-emerald-500 !border-2 !border-white !static" />
        <span className="text-[8px] font-black text-emerald-600 uppercase">True</span>
    </div>
    {/* False Branch */}
    <div className="absolute -right-3 top-2/3 -translate-y-1/2 flex flex-col items-center gap-1">
        <Handle type="source" position={Position.Right} id="false" className="!w-4 !h-4 !bg-rose-500 !border-2 !border-white !static" />
        <span className="text-[8px] font-black text-rose-600 uppercase">False</span>
    </div>
  </NodeWrapper>
);

export const ConditionsNode = ({ data, selected }: NodeProps<XYNode<BuilderNodeData>>) => (
  <NodeWrapper title="Check Logic" icon={GitBranch} color="text-purple-500" bg="bg-purple-50/50" selected={selected}>
    <div className="space-y-2">
        <div className="flex items-center gap-2">
            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 text-[9px] font-black uppercase tracking-wider px-2 py-0.5">
                {data.matchType || 'Any'}
            </Badge>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Keywords</span>
        </div>
        <div className="flex flex-wrap gap-1">
            {data.keywords?.length ? data.keywords.map((k: string, i: number) => (
                <span key={i} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">
                    {k}
                </span>
            )) : <span className="text-[10px] text-slate-300 italic">No keywords added...</span>}
        </div>
    </div>
    <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-slate-200 !border-2 !border-white" />
    {/* Success Branch */}
    <div className="absolute -right-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
        <Handle type="source" position={Position.Right} id="true" className="!w-4 !h-4 !bg-emerald-500 !border-2 !border-white !static" />
        <span className="text-[8px] font-black text-emerald-600 uppercase">Match</span>
    </div>
    {/* Failed Branch */}
    <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 flex flex-col items-center">
        <Handle type="source" position={Position.Bottom} id="false" className="!w-3 !h-3 !bg-rose-500 !border-2 !border-white" />
        <span className="text-[8px] font-black text-rose-600 uppercase mt-2">Else</span>
    </div>
  </NodeWrapper>
);

export const SetVariableNode = ({ data, selected }: NodeProps<XYNode<BuilderNodeData>>) => (
  <NodeWrapper title="Variable" icon={Variable} color="text-violet-500" bg="bg-violet-50/50" selected={selected}>
    <div className="space-y-1.5 font-mono">
        <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-400">
            <span>Key</span>
            <span className="text-violet-600">Value</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
            <span className="text-[10px] font-black text-slate-700 truncate underline decoration-violet-200">{data.key || '???'}</span>
            <span className="text-[10px] text-slate-400">=</span>
            <span className="text-[10px] font-bold text-violet-600 truncate">{data.value || 'null'}</span>
        </div>
    </div>
    <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-slate-200 !border-2 !border-white" />
    <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white" />
  </NodeWrapper>
);

export const DelayNode = ({ data, selected }: NodeProps<XYNode<BuilderNodeData>>) => (
  <NodeWrapper title="Wait" icon={Clock} color="text-slate-500" bg="bg-slate-50/50" selected={selected}>
    <div className="flex items-baseline gap-2">
        <span className="text-2xl font-black text-slate-700 tracking-tighter">{data.waitDuration || 1}</span>
        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{data.waitUnit || 'minutes'}</span>
    </div>
    <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-slate-200 !border-2 !border-white" />
    <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white" />
  </NodeWrapper>
);

export const EndNode = ({ selected }: NodeProps<XYNode<BuilderNodeData>>) => (
  <div className={cn(
    "w-32 h-14 bg-white rounded-full border-2 flex items-center justify-center gap-2 shadow-sm transition-all",
    selected ? "border-red-500 shadow-lg ring-4 ring-red-50" : "border-slate-100"
  )}>
    <CircleStop size={16} className="text-red-500 fill-red-50" />
    <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">End Flow</span>
    <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-rose-500 !border-2 !border-white" />
  </div>
);

const Badge = ({ children, className }: any) => (
    <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-bold", className)}>
        {children}
    </span>
);

export const nodeTypes = {
  trigger: TriggerNode,
  custom_reply: CustomReplyNode,
  conditions: ConditionsNode,
  set_variable: SetVariableNode,
  delay: DelayNode,
  end: EndNode,
  photo: PhotoNode,
  video: VideoNode,
  doc: DocNode,
  if_else: IfElseNode,
};
