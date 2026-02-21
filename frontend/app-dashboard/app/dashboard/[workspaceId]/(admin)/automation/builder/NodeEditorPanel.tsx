'use client';

import React, { useEffect, useState } from 'react';
import { X, ChevronRight, Info, Zap, Settings2, MessageSquare, Globe, Bot, Cpu, Sparkles, Users, FileSpreadsheet, Mail, Megaphone, Braces, Plus } from 'lucide-react';
import { WorkflowUIFlowNode } from './page';
import { VariableInput } from './VariableInput';

interface NodeEditorPanelProps {
    node: WorkflowUIFlowNode;
    nodes: WorkflowUIFlowNode[];
    onUpdate: (id: string, data: any) => void;
    onClose: () => void;
}

export const NodeEditorPanel: React.FC<NodeEditorPanelProps> = ({ node, nodes, onUpdate, onClose }) => {
    const [localData, setLocalData] = useState(node.data);

    useEffect(() => {
        setLocalData(node.data);
    }, [node.id, node.data]);

    const handleChange = (field: string, value: any) => {
        const newData = { ...localData, [field]: value };
        setLocalData(newData);
        onUpdate(node.id, newData);
    };

    const renderMemoryConfig = () => (
        <div className="space-y-4">
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Operation</label>
                <select
                    value={localData.operation || 'SET'}
                    onChange={(e) => handleChange('operation', e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm bg-white"
                >
                    <option value="SET">Set / Update Value</option>
                    <option value="GET">Retrieve Value</option>
                    <option value="CLEAR">Clear Value</option>
                </select>
            </div>
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Memory Key</label>
                <VariableInput
                    value={localData.key || ''}
                    onChange={(v) => handleChange('key', v)}
                    nodes={nodes}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
                    placeholder="e.g. user_intent or lead_score"
                />
            </div>
            {(localData.operation === 'SET') && (
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Value to Save</label>
                    <VariableInput
                        value={localData.value || ''}
                        onChange={(v) => handleChange('value', v)}
                        nodes={nodes}
                        textarea
                        className="w-full h-24 p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm resize-none"
                        placeholder="Static text or {{variable}}"
                    />
                </div>
            )}
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block italic text-purple-600">Store Output As</label>
                <div className="flex items-center gap-2 bg-purple-50 p-2 rounded-xl border border-purple-100">
                    <Braces size={16} className="text-purple-500" />
                    <input
                        type="text"
                        value={localData.variableName || 'memoryOutput'}
                        onChange={(e) => handleChange('variableName', e.target.value)}
                        className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-sm font-semibold text-purple-700"
                        placeholder="variable_name"
                    />
                </div>
            </div>
        </div>
    );

    const renderKnowledgeConfig = () => (
        <div className="space-y-4">
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Knowledge Base</label>
                <select
                    value={localData.knowledgeBaseId || ''}
                    onChange={(e) => handleChange('knowledgeBaseId', e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm bg-white"
                >
                    <option value="">Select Knowledge Base...</option>
                    <option value="kb_default">Company Handbook</option>
                    <option value="kb_products">Product Catalog</option>
                    <option value="kb_faq">Customer FAQ</option>
                </select>
                <p className="mt-1 text-[10px] text-gray-400">Choose the document source to query.</p>
            </div>
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Search Query Template</label>
                <VariableInput
                    value={localData.queryTemplate || ''}
                    onChange={(v) => handleChange('queryTemplate', v)}
                    nodes={nodes}
                    textarea
                    className="w-full h-24 p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm resize-none"
                    placeholder="e.g. Find pricing for {{trigger.body}}"
                />
            </div>
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Match Limit (Chunks)</label>
                <input
                    type="number"
                    value={localData.limit || 3}
                    onChange={(e) => handleChange('limit', parseInt(e.target.value))}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
                    min="1"
                    max="10"
                />
            </div>
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block italic text-cyan-600">Store Results As</label>
                <div className="flex items-center gap-2 bg-cyan-50 p-2 rounded-xl border border-cyan-100">
                    <Globe size={16} className="text-cyan-500" />
                    <input
                        type="text"
                        value={localData.variableName || 'knowledgeOutput'}
                        onChange={(e) => handleChange('variableName', e.target.value)}
                        className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-sm font-semibold text-cyan-700"
                        placeholder="variable_name"
                    />
                </div>
            </div>
        </div>
    );

    const renderActionConfig = () => (
        <div className="space-y-4">
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Message Text</label>
                <VariableInput
                    value={localData.message || ''}
                    onChange={(v) => handleChange('message', v)}
                    nodes={nodes}
                    textarea
                    className="w-full min-h-[120px] p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm resize-none"
                    placeholder="Enter message to send..."
                />
                <p className="mt-2 text-[10px] text-gray-400">Use {'{{variable}}'} for dynamic data.</p>
            </div>
        </div>
    );

    const renderConditionConfig = () => (
        <div className="space-y-4">
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Input Source</label>
                <VariableInput
                    value={localData.input || ''}
                    onChange={(v) => handleChange('input', v)}
                    nodes={nodes}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
                    placeholder="{{trigger.body}}"
                />
            </div>
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Operator</label>
                <select
                    value={localData.operator || 'contains'}
                    onChange={(e) => handleChange('operator', e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm bg-white"
                >
                    <option value="contains">Contains</option>
                    <option value="equals">Equals</option>
                    <option value="startsWith">Starts With</option>
                    <option value="endsWith">Ends With</option>
                </select>
            </div>
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Keyword / Value</label>
                <VariableInput
                    value={localData.keyword || ''}
                    onChange={(v) => handleChange('keyword', v)}
                    nodes={nodes}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
                    placeholder="e.g. price"
                />
            </div>
        </div>
    );

    const renderApiConfig = () => (
        <div className="space-y-4">
            <div className="flex gap-2">
                <div className="w-1/3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Method</label>
                    <select
                        value={localData.method || 'GET'}
                        onChange={(e) => handleChange('method', e.target.value)}
                        className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm bg-white"
                    >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="PATCH">PATCH</option>
                        <option value="DELETE">DELETE</option>
                    </select>
                </div>
                <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">URL</label>
                    <VariableInput
                        value={localData.url || ''}
                        onChange={(v) => handleChange('url', v)}
                        nodes={nodes}
                        className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
                        placeholder="https://api.example.com"
                    />
                </div>
            </div>
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Headers (JSON)</label>
                <VariableInput
                    value={localData.headers || '{}'}
                    onChange={(v) => handleChange('headers', v)}
                    nodes={nodes}
                    textarea
                    className="w-full h-24 p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-xs font-mono resize-none"
                    placeholder='{"Content-Type": "application/json"}'
                />
            </div>
            {(localData.method !== 'GET' && localData.method !== 'DELETE') && (
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Body (JSON)</label>
                    <VariableInput
                        value={localData.body || '{}'}
                        onChange={(v) => handleChange('body', v)}
                        nodes={nodes}
                        textarea
                        className="w-full h-32 p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-xs font-mono resize-none"
                        placeholder='{"key": "value"}'
                    />
                </div>
            )}
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block italic text-blue-600">Store Response As</label>
                <div className="flex items-center gap-2 bg-blue-50 p-2 rounded-xl border border-blue-100">
                    <Braces size={16} className="text-blue-500" />
                    <input
                        type="text"
                        value={localData.variableName || 'apiResponse'}
                        onChange={(e) => handleChange('variableName', e.target.value)}
                        className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-sm font-semibold text-blue-700"
                        placeholder="variable_name"
                    />
                </div>
            </div>
        </div>
    );

    const renderAiConfig = () => (
        <div className="space-y-4">
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Model</label>
                <select
                    value={localData.model || 'gemini-1.5-flash'}
                    onChange={(e) => handleChange('model', e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm bg-white"
                >
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fast)</option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro (Powerful)</option>
                    <option value="gpt-4o">GPT-4o (Coming Soon)</option>
                </select>
            </div>
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">System Prompt</label>
                <VariableInput
                    value={localData.systemPrompt || ''}
                    onChange={(v) => handleChange('systemPrompt', v)}
                    nodes={nodes}
                    textarea
                    className="w-full h-24 p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm resize-none"
                    placeholder="You are a helpful assistant..."
                />
            </div>
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">User Prompt / Input</label>
                <VariableInput
                    value={localData.userPrompt || ''}
                    onChange={(v) => handleChange('userPrompt', v)}
                    nodes={nodes}
                    textarea
                    className="w-full h-32 p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm resize-none"
                    placeholder="Use {{trigger.body}} to reference the message."
                />
            </div>
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block italic text-purple-600">Store Result As</label>
                <div className="flex items-center gap-2 bg-purple-50 p-2 rounded-xl border border-purple-100">
                    <Bot size={16} className="text-purple-500" />
                    <input
                        type="text"
                        value={localData.variableName || 'aiResult'}
                        onChange={(e) => handleChange('variableName', e.target.value)}
                        className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-sm font-semibold text-purple-700"
                        placeholder="variable_name"
                    />
                </div>
            </div>
        </div>
    );

    const renderLeadConfig = () => (
        <div className="space-y-4">
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">New Status</label>
                <select
                    value={localData.status || ''}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm bg-white"
                >
                    <option value="">No Change</option>
                    <option value="new">New</option>
                    <option value="warm">Warm</option>
                    <option value="hot">Hot</option>
                    <option value="converted">Converted</option>
                    <option value="lost">Lost</option>
                </select>
            </div>
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">New Stage</label>
                <input
                    type="text"
                    value={localData.stage || ''}
                    onChange={(e) => handleChange('stage', e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
                    placeholder="e.g. negotiation"
                />
            </div>
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Add Tags (Comma separated)</label>
                <input
                    type="text"
                    value={localData.tags || ''}
                    onChange={(e) => handleChange('tags', e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
                    placeholder="interested, high-value"
                />
            </div>
        </div>
    );

    const getIcon = () => {
        switch (node.type) {
            case 'action': return <MessageSquare className="text-blue-600" />;
            case 'condition': return <Settings2 className="text-amber-600" />;
            case 'api_request': return <Globe className="text-cyan-600" />;
            case 'ai_agent':
            case 'gemini_model': return <Sparkles className="text-purple-600" />;
            case 'lead_update': return <Users className="text-emerald-600" />;
            case 'memory': return <Cpu className="text-indigo-600" />;
            case 'knowledge_query': return <Globe className="text-cyan-600" />;
            case 'webhook': return <Zap className="text-pink-600" />;
            default: return <Info className="text-gray-600" />;
        }
    };

    return (
        <div className="absolute top-0 right-0 h-full w-[400px] bg-white border-l shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
            {/* Panel Header */}
            <div className="px-6 py-5 border-b flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-xl shadow-sm border">
                        {getIcon()}
                    </div>
                    <div>
                        <input
                            value={localData.label || ''}
                            onChange={(e) => handleChange('label', e.target.value)}
                            className="font-bold text-gray-900 border-none bg-transparent p-0 focus:ring-0 w-full"
                        />
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{node.type.replace('_', ' ')}</div>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-200 rounded-xl text-gray-400 transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Node Description/Help */}
                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex gap-3">
                    <Info className="text-blue-500 shrink-0" size={18} />
                    <p className="text-xs text-blue-700 leading-relaxed italic">
                        {node.type === 'api_request' && "Perform dynamic HTTP requests to integrate with your existing software and external APIs."}
                        {node.type === 'action' && "Automatically reply to incoming messages. You can use dynamic variables here."}
                        {node.type === 'condition' && "Branch your workflow based on incoming text or data matching specific rules."}
                        {node.type === 'ai_agent' && "Use generative AI to process messages, summarize info, or generate smart replies."}
                        {node.type === 'lead_update' && "Automatically keep your CRM in sync by updating contact fields as they move through the flow."}
                        {node.type === 'memory' && "Store and retrieve persistent information about this contact to maintain state across different interactions."}
                        {node.type === 'knowledge_query' && "Search your uploaded documents and company knowledge using AI embeddings to provide context to your agent."}
                    </p>
                </div>

                <div className="space-y-6">
                    {node.type === 'action' && renderActionConfig()}
                    {node.type === 'condition' && renderConditionConfig()}
                    {node.type === 'api_request' && renderApiConfig()}
                    {(node.type === 'ai_agent' || node.type === 'gemini_model') && renderAiConfig()}
                    {node.type === 'lead_update' && renderLeadConfig()}
                    {node.type === 'memory' && renderMemoryConfig()}
                    {node.type === 'knowledge_query' && renderKnowledgeConfig()}
                </div>
            </div>

            {/* Panel Footer */}
            <div className="p-6 border-t bg-gray-50/50">
                <button
                    onClick={onClose}
                    className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group"
                >
                    Done Configuring
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};
