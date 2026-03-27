'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import {
    ArrowRight,
    CheckCircle2,
    ClipboardCopy,
    ExternalLink,
    GitBranch,
    RefreshCw,
    Sparkles,
    Split,
    Wand2,
    Workflow,
} from 'lucide-react';
import { toast } from 'sonner';
import clsx from 'clsx';

type TriggerMode = 'new_message' | 'template_reply' | 'flow_response';
type MatchOperator = 'contains' | 'exact';

type WorkflowSummary = {
    id: string;
    name: string;
    description?: string;
    isActive?: boolean;
    updatedAt?: string;
    nodes?: any[];
    edges?: any[];
};

const MODE_PRESETS: Record<TriggerMode, {
    title: string;
    subtitle: string;
    description: string;
    triggerLabel: string;
    example: string;
}> = {
    new_message: {
        title: 'Template / Quick Reply Response',
        subtitle: 'Use this when a customer replies with free text or taps a quick reply.',
        description: 'Routes incoming WhatsApp replies into a reusable workflow.',
        triggerLabel: 'Incoming WhatsApp Reply',
        example: 'price, yes, help, menu',
    },
    template_reply: {
        title: 'Template Button/List Reply',
        subtitle: 'Use this when customers answer through template quick buttons or list replies.',
        description: 'Routes structured template reply clicks into a reusable workflow.',
        triggerLabel: 'Template Reply Event',
        example: 'yes_continue, callback, pricing_menu',
    },
    flow_response: {
        title: 'WhatsApp Flow Response',
        subtitle: 'Use this for submitted WhatsApp flow forms or interactive screens.',
        description: 'Handles structured flow submissions and branches by field match.',
        triggerLabel: 'Flow Submission Event',
        example: 'email, city, selected_plan',
    },
};

function prettyDate(value?: string) {
    if (!value) return 'Recently';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Recently';
    return date.toLocaleString();
}

export default function TriggerFlowPage() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = Array.isArray(params.workspaceId)
        ? params.workspaceId[0]
        : (params.workspaceId as string) || 'default';

    const [tenantId, setTenantId] = useState<string>('');
    const [connectionStatus, setConnectionStatus] = useState<'connected' | 'pending' | 'disconnected'>('disconnected');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [workflows, setWorkflows] = useState<WorkflowSummary[]>([]);

    const [workflowName, setWorkflowName] = useState('WhatsApp Trigger Flow');
    const [triggerMode, setTriggerMode] = useState<TriggerMode>('new_message');
    const [matchField, setMatchField] = useState('messageBody');
    const [matchOperator, setMatchOperator] = useState<MatchOperator>('contains');
    const [matchValue, setMatchValue] = useState('help');
    const [replyText, setReplyText] = useState('Thanks. We received your message and our team will follow up.');
    const [fallbackText, setFallbackText] = useState('Thanks for writing in. Please share a bit more detail so we can help.');
    const [autoActivate, setAutoActivate] = useState(true);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                const res = await api.get('/auth/workspaces');
                const memberships = Array.isArray(res.data) ? res.data : [];
                const activeMembership = memberships.find((m: any) => m.tenant?.slug === workspaceId || m.tenant?.id === workspaceId);

                if (!activeMembership?.tenant?.id) {
                    toast.error('Workspace not found');
                    router.push('/dashboard');
                    return;
                }

                const resolvedTenantId = activeMembership.tenant.id;
                setTenantId(resolvedTenantId);
                localStorage.setItem('x-tenant-id', resolvedTenantId);

                try {
                    const statusRes = await api.get(`/whatsapp/status?tenantId=${resolvedTenantId}`);
                    setConnectionStatus(statusRes.data?.connected ? 'connected' : 'disconnected');
                } catch {
                    setConnectionStatus('disconnected');
                }

                await loadWorkflows();
            } catch (err) {
                console.error('Failed to initialize trigger flow page', err);
                toast.error('Failed to load trigger flow context');
            } finally {
                setLoading(false);
            }
        };

        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [workspaceId]);

    const loadWorkflows = async () => {
        try {
            const res = await api.get('/workflows');
            setWorkflows(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Failed to load workflows', err);
            setWorkflows([]);
        }
    };

    const presets = MODE_PRESETS[triggerMode];

    const blueprint = useMemo(() => {
        const triggerId = 'trigger-1';
        const conditionId = 'condition-1';
        const replyId = 'reply-1';
        const fallbackId = 'fallback-1';

        const nodes = [
            {
                id: triggerId,
                type: 'trigger',
                position: { x: 80, y: 120 },
                data: {
                    label: presets.triggerLabel,
                    triggerType: triggerMode,
                    eventType: triggerMode,
                    description: presets.description,
                },
            },
            {
                id: conditionId,
                type: 'condition',
                position: { x: 360, y: 120 },
                data: {
                    label: `Match ${matchField}`,
                    field: matchField,
                    condition: matchOperator,
                    value: matchValue,
                    trueLabel: 'Matched',
                    falseLabel: 'Fallback',
                },
            },
            {
                id: replyId,
                type: 'action',
                position: { x: 650, y: 60 },
                data: {
                    label: 'Send primary reply',
                    actionType: 'send_whatsapp',
                    payload: { text: replyText },
                },
            },
            {
                id: fallbackId,
                type: 'action',
                position: { x: 650, y: 220 },
                data: {
                    label: 'Send fallback reply',
                    actionType: 'send_whatsapp',
                    payload: { text: fallbackText },
                },
            },
        ];

        const edges = [
            {
                id: 'e-trigger-condition',
                source: triggerId,
                target: conditionId,
            },
            {
                id: 'e-condition-reply',
                source: conditionId,
                target: replyId,
                sourceHandle: 'true',
            },
            {
                id: 'e-condition-fallback',
                source: conditionId,
                target: fallbackId,
                sourceHandle: 'false',
            },
        ];

        return JSON.stringify({
            name: workflowName,
            description: `Generated from Trigger Flow page for ${triggerMode}.`,
            isActive: autoActivate,
            nodes,
            edges,
        }, null, 2);
    }, [autoActivate, fallbackText, matchField, matchOperator, matchValue, presets.description, presets.triggerLabel, replyText, triggerMode, workflowName]);

    const triggerWorkflows = useMemo(() => {
        return workflows.filter((workflow) => {
            const description = workflow.description?.toLowerCase() || '';
            const nodes = Array.isArray(workflow.nodes) ? workflow.nodes : [];
            const matchesNode = nodes.some((node: any) => {
                const triggerType = node?.data?.triggerType;
                return node?.type === 'trigger' && (triggerType === 'new_message' || triggerType === 'template_reply' || triggerType === 'flow_response' || triggerType === 'whatsapp_response');
            });

            return description.includes('trigger flow') || matchesNode;
        });
    }, [workflows]);

    const createWorkflow = async () => {
        if (!tenantId) return;

        if (!workflowName.trim() || !matchValue.trim() || !replyText.trim()) {
            toast.error('Fill in the workflow name, match text, and reply text');
            return;
        }

        setSaving(true);
        try {
            const parsed = JSON.parse(blueprint);
            const res = await api.post('/workflows', parsed);
            toast.success('Trigger flow workflow created');
            await loadWorkflows();
            if (res.data?.id) {
                router.push(`/automation/builder?id=${res.data.id}`);
            }
        } catch (err: any) {
            console.error('Failed to create trigger flow workflow', err);
            toast.error(err.response?.data?.message || 'Failed to create trigger flow');
        } finally {
            setSaving(false);
        }
    };

    const copyBlueprint = async () => {
        try {
            await navigator.clipboard.writeText(blueprint);
            toast.success('Blueprint copied');
        } catch {
            toast.error('Copy failed');
        }
    };

    if (loading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <div className="flex items-center gap-3 text-gray-500">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    Loading trigger flow builder...
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 animate-in fade-in duration-500">
            <div className="flex flex-col gap-6 mb-8">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-[0.2em]">
                            <Wand2 className="h-3.5 w-3.5" />
                            Trigger Flow
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight">WhatsApp Trigger Flow</h1>
                            <p className="mt-2 text-gray-500 max-w-2xl">
                                Build a clean response trigger for WhatsApp replies, quick replies, and flow submissions.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href="https://docs.yellow.ai/docs/cookbooks/studio/trigger-whatsappresponse"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-gray-200 bg-white text-gray-700 font-semibold hover:border-blue-200 hover:text-blue-700 transition-colors"
                        >
                            <ExternalLink className="h-4 w-4" />
                            Yellow.ai docs
                        </Link>
                        <Link
                            href="/automation/builder?id=new"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-blue-100 bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100 transition-colors"
                        >
                            <Workflow className="h-4 w-4" />
                            Open Builder
                        </Link>
                        <Link
                            href="/settings/whatsapp/flows"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors"
                        >
                            <Split className="h-4 w-4" />
                            WhatsApp Flows
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="text-xs uppercase tracking-[0.3em] text-gray-400 font-bold">Status</div>
                        <div className="mt-3 flex items-center gap-2">
                            <span className={clsx(
                                'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold',
                                connectionStatus === 'connected' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                            )}>
                                <CheckCircle2 className="h-4 w-4" />
                                {connectionStatus === 'connected' ? 'WhatsApp connected' : 'Reconnect required'}
                            </span>
                        </div>
                    </div>
                    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="text-xs uppercase tracking-[0.3em] text-gray-400 font-bold">Mode</div>
                        <div className="mt-3 font-black text-gray-900">{presets.title}</div>
                        <p className="mt-1 text-sm text-gray-500">{presets.subtitle}</p>
                    </div>
                    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="text-xs uppercase tracking-[0.3em] text-gray-400 font-bold">Saved triggers</div>
                        <div className="mt-3 text-3xl font-black text-gray-900">{triggerWorkflows.length}</div>
                        <p className="mt-1 text-sm text-gray-500">Workflows already using trigger nodes</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                <div className="xl:col-span-3 space-y-6">
                    <section className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900">Configure trigger</h2>
                                <p className="text-sm text-gray-500 mt-1">{presets.description}</p>
                            </div>
                            <div className="px-3 py-2 rounded-2xl bg-gray-50 text-gray-500 text-xs font-semibold">
                                Example: {presets.example}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <label className="space-y-2">
                                <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Workflow name</span>
                                <input
                                    value={workflowName}
                                    onChange={(e) => setWorkflowName(e.target.value)}
                                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-400"
                                    placeholder="WhatsApp Trigger Flow"
                                />
                            </label>

                            <label className="space-y-2">
                                <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Trigger type</span>
                                <select
                                    value={triggerMode}
                                    onChange={(e) => setTriggerMode(e.target.value as TriggerMode)}
                                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-400 bg-white"
                                >
                                    <option value="new_message">Template / Quick Reply Response</option>
                                    <option value="template_reply">Template Button/List Reply</option>
                                    <option value="flow_response">WhatsApp Flow Response</option>
                                </select>
                            </label>

                            <label className="space-y-2">
                                <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Match field</span>
                                <input
                                    value={matchField}
                                    onChange={(e) => setMatchField(e.target.value)}
                                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-400 font-mono text-sm"
                                    placeholder="messageBody or flowData.answer"
                                />
                                <p className="text-xs text-gray-400">Use dot notation for nested data from the WhatsApp payload.</p>
                            </label>

                            <label className="space-y-2">
                                <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Condition</span>
                                <select
                                    value={matchOperator}
                                    onChange={(e) => setMatchOperator(e.target.value as MatchOperator)}
                                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-400 bg-white"
                                >
                                    <option value="contains">Contains</option>
                                    <option value="exact">Exact match</option>
                                </select>
                            </label>

                            <label className="space-y-2 md:col-span-2">
                                <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Match value</span>
                                <input
                                    value={matchValue}
                                    onChange={(e) => setMatchValue(e.target.value)}
                                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-400"
                                    placeholder="help"
                                />
                            </label>

                            <label className="space-y-2 md:col-span-2">
                                <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Primary reply</span>
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    rows={4}
                                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-400 resize-none"
                                    placeholder="Thanks for reaching out..."
                                />
                            </label>

                            <label className="space-y-2 md:col-span-2">
                                <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Fallback reply</span>
                                <textarea
                                    value={fallbackText}
                                    onChange={(e) => setFallbackText(e.target.value)}
                                    rows={4}
                                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-400 resize-none"
                                    placeholder="Fallback reply for unmatched responses"
                                />
                            </label>
                        </div>

                        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                            <label className="inline-flex items-center gap-3 text-sm font-medium text-gray-600">
                                <input
                                    type="checkbox"
                                    checked={autoActivate}
                                    onChange={(e) => setAutoActivate(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                Activate workflow immediately
                            </label>

                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={copyBlueprint}
                                    className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl border border-gray-200 bg-white text-gray-700 font-semibold hover:border-gray-300"
                                >
                                    <ClipboardCopy className="h-4 w-4" />
                                    Copy blueprint
                                </button>
                                <button
                                    onClick={createWorkflow}
                                    disabled={saving}
                                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-60"
                                >
                                    {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                                    Create workflow
                                </button>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-[32px] border border-gray-200 bg-[#0b1220] text-white p-6 shadow-xl">
                        <div className="flex items-center justify-between gap-4 mb-5">
                            <div>
                                <h3 className="text-xl font-black">Blueprint preview</h3>
                                <p className="text-sm text-white/60 mt-1">
                                    This is the exact workflow JSON we send to the core automation engine.
                                </p>
                            </div>
                            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/10 text-white/80 text-xs font-bold uppercase tracking-[0.2em]">
                                <Sparkles className="h-4 w-4" />
                                Live JSON
                            </div>
                        </div>
                        <pre className="overflow-auto rounded-3xl bg-black/30 border border-white/10 p-5 text-[12px] leading-relaxed text-white/85 max-h-[520px]">
                            {blueprint}
                        </pre>
                    </section>
                </div>

                <div className="xl:col-span-2 space-y-6">
                    <section className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-11 w-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <GitBranch className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-gray-900">How it works</h3>
                                <p className="text-sm text-gray-500">Yellow.ai-style trigger flow, backed by our workflow engine.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {[
                                { title: '1. Inbound reply arrives', body: 'Text replies use new_message, template button/list replies use template_reply, and form submissions use flow_response.' },
                                { title: '2. Condition checks the payload', body: 'We read the selected field and compare it with contains or exact.' },
                                { title: '3. Matching branch sends a reply', body: 'The true branch sends your primary automated reply.' },
                                { title: '4. Fallback branch catches the rest', body: 'Anything unmatched can route to a fallback reply or handoff.' },
                            ].map((item) => (
                                <div key={item.title} className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                                    <div className="font-bold text-gray-900">{item.title}</div>
                                    <p className="mt-1 text-sm text-gray-600">{item.body}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between gap-4 mb-4">
                            <div>
                                <h3 className="text-lg font-black text-gray-900">Existing trigger workflows</h3>
                                <p className="text-sm text-gray-500">Anything built from this page or the automation engine.</p>
                            </div>
                            <button onClick={loadWorkflows} className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50">
                                <RefreshCw className="h-4 w-4" />
                                Refresh
                            </button>
                        </div>

                        <div className="space-y-3 max-h-[420px] overflow-auto pr-1">
                            {triggerWorkflows.length === 0 ? (
                                <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
                                    <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-gray-400">
                                        <Workflow className="h-5 w-5" />
                                    </div>
                                    <div className="font-bold text-gray-900">No trigger workflows yet</div>
                                    <p className="mt-1 text-sm text-gray-500">Create one to start routing WhatsApp replies automatically.</p>
                                </div>
                            ) : triggerWorkflows.map((workflow) => (
                                <div key={workflow.id} className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <div className="font-bold text-gray-900">{workflow.name}</div>
                                            <p className="mt-1 text-sm text-gray-500 line-clamp-2">{workflow.description || 'Trigger workflow'}</p>
                                        </div>
                                        <span className={clsx(
                                            'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider',
                                            workflow.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                                        )}>
                                            {workflow.isActive ? 'Active' : 'Draft'}
                                        </span>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                                        <span>Updated {prettyDate(workflow.updatedAt)}</span>
                                        <Link href={`/automation/builder?id=${workflow.id}`} className="text-blue-600 font-semibold hover:text-blue-700 inline-flex items-center gap-1">
                                            Open builder
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
