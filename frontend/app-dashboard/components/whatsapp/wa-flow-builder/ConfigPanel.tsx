"use client";

import React, { useState } from "react";
import {
  Trash2, Save, Loader2, Plus, Minus, X, ChevronLeft,
  MessageCircle, Image, Video, HelpCircle, Clock, Mail,
  Phone, Link2, GitBranch, Variable, Headphones, TrendingUp,
  MapPin, LayoutList, ListChecks, LayoutGrid, Zap, CircleStop
} from "lucide-react";
import { WaNodeData, MCQOption, ListSection, CarouselCard } from "./types";
import { uid } from "./utils";
import { cn } from "@/lib/utils";
import { type Node } from "@xyflow/react";

interface ConfigPanelProps {
  selected: Node<WaNodeData> | null;
  onChange: (patch: Partial<WaNodeData>) => void;
  onDelete: () => void;
}

const Field = ({
  label, children, hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) => (
  <div className="space-y-1.5">
    <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500">
      {label}
    </label>
    {children}
    {hint && <p className="text-[9px] text-slate-400 font-medium">{hint}</p>}
  </div>
);

const Input = ({
  value, onChange, placeholder, type = "text",
}: {
  value?: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) => (
  <input
    type={type}
    value={value ?? ""}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full text-[12px] px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all placeholder:text-slate-300 font-medium text-slate-800"
  />
);

const Textarea = ({
  value, onChange, placeholder, rows = 3,
}: {
  value?: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) => (
  <textarea
    rows={rows}
    value={value ?? ""}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full text-[12px] px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all placeholder:text-slate-300 font-medium text-slate-800 resize-none"
  />
);

const Select = ({
  value, onChange, options,
}: {
  value?: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) => (
  <select
    value={value ?? ""}
    onChange={(e) => onChange(e.target.value)}
    className="w-full text-[12px] px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all font-medium text-slate-800"
  >
    {options.map((o) => (
      <option key={o.value} value={o.value}>{o.label}</option>
    ))}
  </select>
);

// ─── Node-Specific Sections ───────────────────────────────────────────────────

function StartConfig({ data, onChange }: { data: WaNodeData; onChange: (p: Partial<WaNodeData>) => void }) {
  return (
    <>
      <Field label="Trigger Type">
        <Select
          value={data.triggerType}
          onChange={(v) => onChange({ triggerType: v as any })}
          options={[
            { value: "keyword", label: "Keyword Match" },
            { value: "any_message", label: "Any Message" },
            { value: "new_contact", label: "New Contact" },
            { value: "campaign_reply", label: "Campaign Reply" },
          ]}
        />
      </Field>
      {data.triggerType === "keyword" && (
        <Field label="Keyword" hint="User message must exactly match or contain this word.">
          <Input value={data.triggerKeyword} onChange={(v) => onChange({ triggerKeyword: v })} placeholder="e.g. hello" />
        </Field>
      )}
    </>
  );
}

function TextConfig({ data, onChange }: { data: WaNodeData; onChange: (p: Partial<WaNodeData>) => void }) {
  return (
    <Field label="Message Body" hint="Supports {{variable}} placeholders.">
      <Textarea value={data.text} onChange={(v) => onChange({ text: v })} placeholder="Type your message here..." rows={4} />
    </Field>
  );
}

function MediaConfig({ data, onChange, type }: { data: WaNodeData; onChange: (p: Partial<WaNodeData>) => void; type: "photo" | "video" }) {
  return (
    <>
      <Field label={type === "photo" ? "Image URL" : "Video URL"} hint="Publicly accessible direct URL.">
        <Input value={data.mediaUrl} onChange={(v) => onChange({ mediaUrl: v })} placeholder="https://example.com/file.jpg" />
      </Field>
      <Field label="Caption (optional)">
        <Textarea value={data.mediaCaption} onChange={(v) => onChange({ mediaCaption: v })} placeholder="Optional caption text..." rows={2} />
      </Field>
    </>
  );
}

function LinkConfig({ data, onChange }: { data: WaNodeData; onChange: (p: Partial<WaNodeData>) => void }) {
  return (
    <>
      <Field label="URL">
        <Input value={data.linkUrl} onChange={(v) => onChange({ linkUrl: v })} placeholder="https://your-site.com" />
      </Field>
      <Field label="Title">
        <Input value={data.linkTitle} onChange={(v) => onChange({ linkTitle: v })} placeholder="Visit our website" />
      </Field>
      <Field label="Description">
        <Textarea value={data.linkDescription} onChange={(v) => onChange({ linkDescription: v })} placeholder="Short description..." rows={2} />
      </Field>
    </>
  );
}

function EmailConfig({ data, onChange }: { data: WaNodeData; onChange: (p: Partial<WaNodeData>) => void }) {
  return (
    <>
      <Field label="Recipient Email" hint="Supports {{variable}} placeholders.">
        <Input value={data.emailTo} onChange={(v) => onChange({ emailTo: v })} placeholder="user@example.com" type="email" />
      </Field>
      <Field label="Subject">
        <Input value={data.emailSubject} onChange={(v) => onChange({ emailSubject: v })} placeholder="Your subject here" />
      </Field>
      <Field label="Body">
        <Textarea value={data.emailBody} onChange={(v) => onChange({ emailBody: v })} placeholder="Email body content..." rows={4} />
      </Field>
    </>
  );
}

function CallConfig({ data, onChange }: { data: WaNodeData; onChange: (p: Partial<WaNodeData>) => void }) {
  return (
    <Field label="Phone Number" hint="Include country code, e.g. +919876543210">
      <Input value={data.callNumber} onChange={(v) => onChange({ callNumber: v })} placeholder="+91..." />
    </Field>
  );
}

function QuestionConfig({ data, onChange }: { data: WaNodeData; onChange: (p: Partial<WaNodeData>) => void }) {
  return (
    <>
      <Field label="Question Text">
        <Textarea value={data.questionText} onChange={(v) => onChange({ questionText: v })} placeholder="What is your name?" rows={3} />
      </Field>
      <Field label="Save answer as variable">
        <Input value={data.questionSaveAs} onChange={(v) => onChange({ questionSaveAs: v })} placeholder="user_reply" />
      </Field>
      <Field label="Validator">
        <Select
          value={data.questionValidator}
          onChange={(v) => onChange({ questionValidator: v as any })}
          options={[
            { value: "none", label: "None (any text)" },
            { value: "text", label: "Text only" },
            { value: "number", label: "Numbers only" },
            { value: "email", label: "Email format" },
            { value: "phone", label: "Phone format" },
          ]}
        />
      </Field>
    </>
  );
}

function MCQConfig({ data, onChange }: { data: WaNodeData; onChange: (p: Partial<WaNodeData>) => void }) {
  const options: MCQOption[] = data.mcqOptions || [];
  const addOption = () => {
    if (options.length >= 3) return;
    onChange({ mcqOptions: [...options, { id: uid(), title: "" }] });
  };
  const removeOption = (id: string) => onChange({ mcqOptions: options.filter((o) => o.id !== id) });
  const updateOption = (id: string, title: string) =>
    onChange({ mcqOptions: options.map((o) => (o.id === id ? { ...o, title } : o)) });

  return (
    <>
      <Field label="Message Body">
        <Textarea value={data.mcqBody} onChange={(v) => onChange({ mcqBody: v })} placeholder="Choose an option below:" rows={3} />
      </Field>
      <Field label="Options" hint="Maximum 3 options (Meta limit).">
        <div className="space-y-2">
          {options.map((opt, i) => (
            <div key={opt.id} className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 w-4">{i + 1}.</span>
              <input
                value={opt.title}
                onChange={(e) => updateOption(opt.id, e.target.value)}
                placeholder={`Option ${i + 1}`}
                className="flex-1 text-[12px] px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all font-medium text-slate-800 placeholder:text-slate-300"
              />
              <button onClick={() => removeOption(opt.id)} className="p-1 hover:bg-red-50 rounded-lg transition-colors">
                <X size={12} className="text-red-400" />
              </button>
            </div>
          ))}
          {options.length < 3 && (
            <button
              onClick={addOption}
              className="flex items-center gap-2 text-[10px] font-black text-purple-600 uppercase tracking-widest hover:text-purple-800 transition-colors"
            >
              <Plus size={12} /> Add Option
            </button>
          )}
        </div>
      </Field>
    </>
  );
}

function ListConfig({ data, onChange }: { data: WaNodeData; onChange: (p: Partial<WaNodeData>) => void }) {
  const sections: ListSection[] = data.listSections || [];

  const addItem = (si: number) => {
    const updated = sections.map((sec, idx) =>
      idx === si ? { ...sec, items: [...sec.items, { id: uid(), title: "", description: "" }] } : sec
    );
    onChange({ listSections: updated });
  };

  const removeItem = (si: number, itemId: string) => {
    const updated = sections.map((sec, idx) =>
      idx === si ? { ...sec, items: sec.items.filter((it) => it.id !== itemId) } : sec
    );
    onChange({ listSections: updated });
  };

  const updateItem = (si: number, itemId: string, field: "title" | "description", value: string) => {
    const updated = sections.map((sec, idx) =>
      idx === si ? {
        ...sec, items: sec.items.map((it) => it.id === itemId ? { ...it, [field]: value } : it),
      } : sec
    );
    onChange({ listSections: updated });
  };

  const updateSectionTitle = (si: number, title: string) => {
    onChange({ listSections: sections.map((sec, idx) => idx === si ? { ...sec, title } : sec) });
  };

  return (
    <>
      <Field label="Header">
        <Input value={data.listHeader} onChange={(v) => onChange({ listHeader: v })} placeholder="Optional header text" />
      </Field>
      <Field label="Body">
        <Textarea value={data.listBody} onChange={(v) => onChange({ listBody: v })} placeholder="List description..." rows={2} />
      </Field>
      <Field label="Footer">
        <Input value={data.listFooter} onChange={(v) => onChange({ listFooter: v })} placeholder="Optional footer text" />
      </Field>
      <Field label="Button Label">
        <Input value={data.listButtonText} onChange={(v) => onChange({ listButtonText: v })} placeholder="View Options" />
      </Field>
      <Field label="Sections & Items" hint="Max 10 total items across all sections.">
        <div className="space-y-3">
          {sections.map((sec, si) => (
            <div key={si} className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-3 py-2 border-b border-slate-200">
                <input
                  value={sec.title}
                  onChange={(e) => updateSectionTitle(si, e.target.value)}
                  placeholder="Section title"
                  className="text-[11px] font-black text-slate-700 bg-transparent outline-none w-full placeholder:text-slate-300 uppercase tracking-wider"
                />
              </div>
              <div className="p-2 space-y-1.5">
                {sec.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <div className="flex-1 space-y-0.5">
                      <input
                        value={item.title}
                        onChange={(e) => updateItem(si, item.id, "title", e.target.value)}
                        placeholder="Item title"
                        className="w-full text-[11px] px-2 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-200 font-medium"
                      />
                    </div>
                    <button onClick={() => removeItem(si, item.id)} className="p-1 hover:bg-red-50 rounded-lg">
                      <X size={11} className="text-red-400" />
                    </button>
                  </div>
                ))}
                <button onClick={() => addItem(si)} className="flex items-center gap-1 text-[9px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-800 transition-colors py-0.5">
                  <Plus size={10} /> Add Item
                </button>
              </div>
            </div>
          ))}
        </div>
      </Field>
    </>
  );
}

function DelayConfig({ data, onChange }: { data: WaNodeData; onChange: (p: Partial<WaNodeData>) => void }) {
  return (
    <div className="flex gap-3">
      <Field label="Duration">
        <input
          type="number"
          min={1}
          value={data.waitDuration ?? 1}
          onChange={(e) => onChange({ waitDuration: parseInt(e.target.value) || 1 })}
          className="w-full text-[12px] px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200 font-medium text-slate-800"
        />
      </Field>
      <Field label="Unit">
        <Select
          value={data.waitUnit}
          onChange={(v) => onChange({ waitUnit: v as any })}
          options={[
            { value: "seconds", label: "Seconds" },
            { value: "minutes", label: "Minutes" },
            { value: "hours", label: "Hours" },
            { value: "days", label: "Days" },
          ]}
        />
      </Field>
    </div>
  );
}

function ConditionConfig({ data, onChange }: { data: WaNodeData; onChange: (p: Partial<WaNodeData>) => void }) {
  const keywords: string[] = data.keywords || [];
  const [kw, setKw] = useState("");
  const addKw = () => {
    if (!kw.trim()) return;
    onChange({ keywords: [...keywords, kw.trim()] });
    setKw("");
  };
  const removeKw = (i: number) => onChange({ keywords: keywords.filter((_, idx) => idx !== i) });

  return (
    <>
      <Field label="Match Type">
        <Select
          value={data.matchType}
          onChange={(v) => onChange({ matchType: v as any })}
          options={[
            { value: "any", label: "Any keyword" },
            { value: "all", label: "All keywords" },
          ]}
        />
      </Field>
      <Field label="Keywords">
        <div className="flex gap-2 mb-2">
          <input
            value={kw}
            onChange={(e) => setKw(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addKw()}
            placeholder="Type keyword, press Enter"
            className="flex-1 text-[12px] px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-200 font-medium"
          />
          <button onClick={addKw} className="px-3 py-2 bg-orange-100 text-orange-700 rounded-xl text-[10px] font-black hover:bg-orange-200 transition-colors">
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {keywords.map((k, i) => (
            <span key={i} className="flex items-center gap-1 text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-100 px-2 py-0.5 rounded-full">
              {k}
              <button onClick={() => removeKw(i)} className="hover:text-red-500 transition-colors">
                <X size={9} />
              </button>
            </span>
          ))}
        </div>
      </Field>
    </>
  );
}

function IfElseConfig({ data, onChange }: { data: WaNodeData; onChange: (p: Partial<WaNodeData>) => void }) {
  return (
    <>
      <Field label="Variable" hint="Use {{variable_name}} syntax.">
        <Input value={data.conditionVariable} onChange={(v) => onChange({ conditionVariable: v })} placeholder="{{user_reply}}" />
      </Field>
      <Field label="Operator">
        <Select
          value={data.conditionOperator}
          onChange={(v) => onChange({ conditionOperator: v as any })}
          options={[
            { value: "equals", label: "Equals" },
            { value: "not_equals", label: "Not Equals" },
            { value: "contains", label: "Contains" },
            { value: "starts_with", label: "Starts With" },
            { value: "greater_than", label: "Greater Than" },
            { value: "less_than", label: "Less Than" },
            { value: "is_set", label: "Is Set (exists)" },
          ]}
        />
      </Field>
      {data.conditionOperator !== "is_set" && (
        <Field label="Value">
          <Input value={data.conditionValue} onChange={(v) => onChange({ conditionValue: v })} placeholder="Value to compare..." />
        </Field>
      )}
    </>
  );
}

function SetVariableConfig({ data, onChange }: { data: WaNodeData; onChange: (p: Partial<WaNodeData>) => void }) {
  return (
    <>
      <Field label="Variable Name">
        <Input value={data.variableKey} onChange={(v) => onChange({ variableKey: v })} placeholder="my_variable" />
      </Field>
      <Field label="Value" hint="Supports {{other_variable}} references.">
        <Input value={data.variableValue} onChange={(v) => onChange({ variableValue: v })} placeholder="value or {{variable}}" />
      </Field>
    </>
  );
}

function SupportConfig({ data, onChange }: { data: WaNodeData; onChange: (p: Partial<WaNodeData>) => void }) {
  return (
    <>
      <Field label="Department">
        <Input value={data.supportDepartment} onChange={(v) => onChange({ supportDepartment: v })} placeholder="e.g. Technical, Billing" />
      </Field>
      <Field label="Message to User">
        <Textarea value={data.supportMessage} onChange={(v) => onChange({ supportMessage: v })} placeholder="A support agent will assist you shortly." rows={3} />
      </Field>
      <Field label="Ticket Tag">
        <Input value={data.supportTicketTag} onChange={(v) => onChange({ supportTicketTag: v })} placeholder="support" />
      </Field>
      <Field label="Auto-Escalate">
        <label className="flex items-center gap-2 cursor-pointer">
          <div
            onClick={() => onChange({ supportEscalate: !data.supportEscalate })}
            className={cn(
              "w-10 h-5 rounded-full transition-colors cursor-pointer relative",
              data.supportEscalate ? "bg-cyan-500" : "bg-slate-200"
            )}
          >
            <div className={cn(
              "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform",
              data.supportEscalate ? "translate-x-5" : "translate-x-0.5"
            )} />
          </div>
          <span className="text-[11px] font-bold text-slate-700">
            {data.supportEscalate ? "Enabled" : "Disabled"}
          </span>
        </label>
      </Field>
    </>
  );
}

function SalesConfig({ data, onChange }: { data: WaNodeData; onChange: (p: Partial<WaNodeData>) => void }) {
  return (
    <>
      <Field label="Sales Stage">
        <Select
          value={data.salesStage}
          onChange={(v) => onChange({ salesStage: v as any })}
          options={[
            { value: "lead_capture", label: "🔵 Lead Capture" },
            { value: "qualify", label: "🟡 Qualify Lead" },
            { value: "demo", label: "🟣 Schedule Demo" },
            { value: "close", label: "🟢 Close Deal" },
            { value: "nurture", label: "🔴 Nurture / Follow-up" },
          ]}
        />
      </Field>
      <Field label="Message" hint="What to say at this stage.">
        <Textarea value={data.salesMessage} onChange={(v) => onChange({ salesMessage: v })} placeholder="E.g. Let me tell you about our pricing..." rows={3} />
      </Field>
    </>
  );
}

// ─── NODE ICON MAP ─────────────────────────────────────────────────────────────

const NODE_META: Record<string, { title: string; accent: string; icon: React.ElementType }> = {
  wa_start:        { title: "Start Trigger",     accent: "text-yellow-600 bg-yellow-50", icon: Zap },
  wa_text:         { title: "Text Message",      accent: "text-blue-600 bg-blue-50",    icon: MessageCircle },
  wa_photo:        { title: "Send Photo",        accent: "text-emerald-600 bg-emerald-50", icon: Image },
  wa_video:        { title: "Send Video",        accent: "text-rose-600 bg-rose-50",    icon: Video },
  wa_link:         { title: "Share Link",        accent: "text-teal-600 bg-teal-50",    icon: Link2 },
  wa_email:        { title: "Send Email",        accent: "text-indigo-600 bg-indigo-50", icon: Mail },
  wa_call:         { title: "Initiate Call",     accent: "text-green-600 bg-green-50",  icon: Phone },
  wa_question:     { title: "Ask Question",      accent: "text-amber-600 bg-amber-50",  icon: HelpCircle },
  wa_mcq:          { title: "Buttons (MCQ)",     accent: "text-purple-600 bg-purple-50", icon: ListChecks },
  wa_list:         { title: "Interactive List",  accent: "text-cyan-600 bg-cyan-50",    icon: LayoutList },
  wa_carousel:     { title: "Carousel",          accent: "text-indigo-600 bg-indigo-50", icon: LayoutGrid },
  wa_delay:        { title: "Wait / Delay",      accent: "text-slate-600 bg-slate-100", icon: Clock },
  wa_condition:    { title: "Keyword Check",     accent: "text-orange-600 bg-orange-50", icon: GitBranch },
  wa_if_else:      { title: "If / Else",         accent: "text-violet-600 bg-violet-50", icon: ChevronLeft },
  wa_set_variable: { title: "Set Variable",      accent: "text-pink-600 bg-pink-50",    icon: Variable },
  wa_support:      { title: "Support System",    accent: "text-cyan-600 bg-cyan-50",    icon: Headphones },
  wa_sales:        { title: "Sales System",      accent: "text-green-600 bg-green-50",  icon: TrendingUp },
  wa_location:     { title: "Request Location",  accent: "text-red-600 bg-red-50",      icon: MapPin },
  wa_end:          { title: "End Flow",          accent: "text-red-600 bg-red-50",      icon: CircleStop },
};

// ─── Main Config Panel ─────────────────────────────────────────────────────────

export function ConfigPanel({ selected, onChange, onDelete }: ConfigPanelProps) {
  if (!selected) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
          <MessageCircle size={24} className="text-slate-300" />
        </div>
        <div>
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">No Node Selected</p>
          <p className="text-[10px] text-slate-400 font-medium mt-1 leading-relaxed">
            Click any node on the canvas to configure its properties.
          </p>
        </div>
      </div>
    );
  }

  const kind = selected.type || "";
  const meta = NODE_META[kind] || { title: kind, accent: "text-slate-600 bg-slate-100", icon: MessageCircle };
  const Icon = meta.icon;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Panel Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0", meta.accent)}>
          <Icon size={15} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-800 truncate">{meta.title}</p>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Node Properties</p>
        </div>
        <button
          onClick={onDelete}
          className="p-2 rounded-xl hover:bg-red-50 transition-colors group"
          title="Delete this node"
        >
          <Trash2 size={13} className="text-slate-400 group-hover:text-red-500 transition-colors" />
        </button>
      </div>

      {/* Scrollable Fields */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {/* Label field is always present */}
        <Field label="Node Label">
          <Input value={selected.data.label} onChange={(v) => onChange({ label: v })} placeholder="Node name..." />
        </Field>

        <hr className="border-slate-100" />

        {/* Kind-specific fields */}
        {kind === "wa_start" && <StartConfig data={selected.data} onChange={onChange} />}
        {kind === "wa_text" && <TextConfig data={selected.data} onChange={onChange} />}
        {kind === "wa_photo" && <MediaConfig data={selected.data} onChange={onChange} type="photo" />}
        {kind === "wa_video" && <MediaConfig data={selected.data} onChange={onChange} type="video" />}
        {kind === "wa_link" && <LinkConfig data={selected.data} onChange={onChange} />}
        {kind === "wa_email" && <EmailConfig data={selected.data} onChange={onChange} />}
        {kind === "wa_call" && <CallConfig data={selected.data} onChange={onChange} />}
        {kind === "wa_question" && <QuestionConfig data={selected.data} onChange={onChange} />}
        {kind === "wa_mcq" && <MCQConfig data={selected.data} onChange={onChange} />}
        {kind === "wa_list" && <ListConfig data={selected.data} onChange={onChange} />}
        {kind === "wa_delay" && <DelayConfig data={selected.data} onChange={onChange} />}
        {kind === "wa_condition" && <ConditionConfig data={selected.data} onChange={onChange} />}
        {kind === "wa_if_else" && <IfElseConfig data={selected.data} onChange={onChange} />}
        {kind === "wa_set_variable" && <SetVariableConfig data={selected.data} onChange={onChange} />}
        {kind === "wa_support" && <SupportConfig data={selected.data} onChange={onChange} />}
        {kind === "wa_sales" && <SalesConfig data={selected.data} onChange={onChange} />}
        {kind === "wa_location" && (
          <Field label="Prompt Text">
            <Textarea value={selected.data.text} onChange={(v) => onChange({ text: v })} placeholder="Please share your location." rows={2} />
          </Field>
        )}
        {kind === "wa_end" && (
          <p className="text-[11px] text-slate-400 italic text-center">End node has no configurable properties.</p>
        )}
      </div>
    </div>
  );
}
