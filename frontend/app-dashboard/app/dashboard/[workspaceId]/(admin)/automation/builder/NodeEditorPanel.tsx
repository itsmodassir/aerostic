'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
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
    const [mailboxes, setMailboxes] = useState<any[]>([]);
    const [emailTemplates, setEmailTemplates] = useState<any[]>([]);

    useEffect(() => {
        setLocalData(node.data);
        if (node.type === 'email') {
            const fetchData = async () => {
                try {
                    const [mbRes, tpRes] = await Promise.all([
                        api.get('/mailboxes'),
                        api.get('/email-templates')
                    ]);
                    setMailboxes(mbRes.data);
                    setEmailTemplates(tpRes.data);
                } catch (err) {
                    console.error('Failed to fetch email data', err);
                }
            };
            fetchData();
        }
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

    const renderEmailConfig = () => (
        <div className="space-y-6">
            <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
                <button
                    onClick={() => {
                        handleChange('smtpSource', 'system');
                        handleChange('mailboxId', null);
                    }}
                    className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition-all ${localData.smtpSource === 'system' || !localData.smtpSource ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    System Email
                </button>
                <button
                    onClick={() => handleChange('smtpSource', 'personal')}
                    className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition-all ${localData.smtpSource === 'personal' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Personal SMTP
                </button>
            </div>

            {localData.smtpSource === 'personal' && (
                <div className="animate-in slide-in-from-top-2 duration-200">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block italic text-blue-500">Choose SMTP</label>
                    <select
                        value={localData.mailboxId || ''}
                        onChange={(e) => handleChange('mailboxId', e.target.value)}
                        className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm bg-white font-medium"
                    >
                        <option value="">Default Active SMTP</option>
                        {mailboxes.map(mb => (
                            <option key={mb.id} value={mb.id}>{mb.name} ({mb.emailAddress})</option>
                        ))}
                    </select>
                    {mailboxes.length === 0 && (
                        <p className="mt-1 text-[10px] text-amber-600 font-medium">No SMTP configurations found in settings.</p>
                    )}
                </div>
            )}

            <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">To (Recipient)</label>
                <VariableInput
                    value={localData.to || ''}
                    onChange={(v) => handleChange('to', v)}
                    nodes={nodes}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm shadow-sm"
                    placeholder="{{contact.email}}"
                />
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Content Source</label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleChange('contentSource', 'direct')}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${localData.contentSource === 'direct' || !localData.contentSource ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}
                        >
                            MESSAGE
                        </button>
                        <button
                            onClick={() => handleChange('contentSource', 'template')}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${localData.contentSource === 'template' ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}
                        >
                            TEMPLATE
                        </button>
                    </div>
                </div>

                {(localData.contentSource === 'template') ? (
                    <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block italic text-purple-500">Select Template</label>
                            <select
                                value={localData.templateId || ''}
                                onChange={(e) => handleChange('templateId', e.target.value)}
                                className="w-full p-3 rounded-xl border-2 border-purple-100 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all text-sm bg-white font-bold text-purple-900"
                            >
                                <option value="">Choose Template...</option>
                                {emailTemplates.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                            {emailTemplates.length === 0 && (
                                <p className="mt-1 text-[10px] text-amber-600 font-medium">No email templates found.</p>
                            )}
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Subject Overlay</label>
                            <VariableInput
                                value={localData.subject || ''}
                                onChange={(v) => handleChange('subject', v)}
                                nodes={nodes}
                                className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
                                placeholder="Overrides template subject if provided"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Subject</label>
                            <VariableInput
                                value={localData.subject || ''}
                                onChange={(v) => handleChange('subject', v)}
                                nodes={nodes}
                                className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm shadow-sm"
                                placeholder="Email subject..."
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">HTML / Text Body</label>
                            <VariableInput
                                value={localData.body || ''}
                                onChange={(v) => handleChange('body', v)}
                                nodes={nodes}
                                textarea
                                className="w-full min-h-[150px] p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-xs font-mono resize-none bg-gray-50/50"
                                placeholder="<h1>Hello!</h1>..."
                            />
                        </div>
                    </div>
                )}
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
                    {node.type === 'email' && renderEmailConfig()}
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
