"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
    Users, Mail, CheckCircle, XCircle, 
    Settings, Plus, ChevronRight, Activity,
    Shield, UserPlus, MessageSquare, Clock, Search
} from 'lucide-react';
import { clsx } from 'clsx';
import { resolveWorkspaceId } from './DashboardComponents';

export default function TeamTab({ planFeatures }: any) {
    const params = useParams();
    const workspaceId = resolveWorkspaceId(params?.workspaceId as string | string[] | undefined);
    const [teamMembers, setTeamMembers] = useState<any[]>([]);
    const [conversations, setConversations] = useState<any[]>([]);
    const [inboxStats, setInboxStats] = useState({ unassigned: 0, inProgress: 0, resolved: 0 });
    const [loading, setLoading] = useState(true);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<'Agent' | 'Viewer'>('Agent');
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const convoRes = await fetch('/api/v1/messages/conversations', { credentials: 'include' });
            if (convoRes.ok) {
                const convoData = await convoRes.json();
                setConversations(convoData);
                const unassigned = convoData.filter((c: any) => !c.assignedTo).length;
                const inProgress = convoData.filter((c: any) => c.status === 'open' && c.assignedTo).length;
                const resolved = convoData.filter((c: any) => c.status === 'closed').length;
                setInboxStats({ unassigned, inProgress, resolved });
            }

            const usersRes = await fetch('/api/v1/users', { credentials: 'include' });
            if (usersRes.ok) {
                const usersData = await usersRes.json();
                setTeamMembers(usersData.map((u: any) => ({
                    name: u.name,
                    email: u.email,
                    role: u.role === 'admin' ? 'Admin' : 'Agent',
                    avatar: (u.name || 'U')[0].toUpperCase(),
                    status: 'online'
                })));
            } else {
                setTeamMembers([{ name: 'You', email: 'user@example.com', role: 'Admin', avatar: 'Y', status: 'online' }]);
            }
        } catch (e) {
            setTeamMembers([{ name: 'You', email: 'user@example.com', role: 'Admin', avatar: 'Y', status: 'online' }]);
        } finally {
            setLoading(false);
        }
    };

    const inviteMember = async () => {
        if (!inviteEmail.trim()) return;
        setSaving(true);
        try {
            setTeamMembers([...teamMembers, {
                name: inviteEmail.split('@')[0],
                email: inviteEmail,
                role: inviteRole,
                avatar: inviteEmail[0].toUpperCase(),
                status: 'pending'
            }]);
            setSuccessMsg('Invitation authorized');
        } finally {
            setSaving(false);
            setShowInviteModal(false);
            setInviteEmail('');
            setTimeout(() => setSuccessMsg(''), 3000);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-blue-50 border-t-emerald-600 rounded-full animate-spin" />
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] animate-pulse">Syncing Team Network...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700 pb-20">
            {/* Inbox Telemetry */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {[
                    { label: 'Unassigned Packets', val: inboxStats.unassigned, color: 'bg-blue-600 shadow-blue-500/20' },
                    { label: 'In-Transit Flow', val: inboxStats.inProgress, color: 'bg-amber-600 shadow-amber-500/20' },
                    { label: 'Total Resolutions', val: inboxStats.resolved, color: 'bg-emerald-600 shadow-emerald-500/20' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[48px] border-2 border-gray-50 shadow-2xl shadow-gray-200/40 relative overflow-hidden group hover:border-black transition-all">
                        <div className={clsx("absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 opacity-10 blur-[40px] group-hover:scale-150 transition-transform duration-1000", stat.color)} />
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 leading-none">{stat.label}</p>
                        <h3 className="text-6xl font-black text-gray-900 tracking-tighter leading-none">{stat.val}</h3>
                    </div>
                ))}
            </div>

            {/* Team Repository */}
            <div className="bg-white rounded-[48px] border-2 border-gray-50 shadow-2xl shadow-gray-200/40 relative overflow-hidden">
                <div className="p-8 md:p-10 border-b-2 border-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border-2 border-blue-100 shadow-sm">
                            <Users size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Active Command</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Manage human-agent synergy ({teamMembers.length} active nodes)</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowInviteModal(true)}
                        className="px-6 py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all active:scale-95 shadow-xl shadow-gray-200 flex items-center gap-3"
                    >
                        <UserPlus size={18} strokeWidth={3} />
                        Authorize Member
                    </button>
                </div>

                <div className="p-8 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {teamMembers.map((member, i) => (
                        <div key={i} className="p-6 bg-gray-50/50 rounded-[32px] border-2 border-transparent hover:border-gray-200 hover:bg-white transition-all group flex items-center justify-between gap-6">
                            <div className="flex items-center gap-6 min-w-0">
                                <div className="relative">
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-[22px] flex items-center justify-center text-white text-xl font-black shadow-lg group-hover:scale-110 transition-transform">
                                        {member.avatar}
                                    </div>
                                    <div className={clsx(
                                        "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white shadow-sm",
                                        member.status === 'online' ? "bg-emerald-500" :
                                        member.status === 'pending' ? "bg-amber-400" : "bg-gray-400"
                                    )} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-lg font-black text-gray-900 tracking-tight uppercase truncate">{member.name}</p>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate">{member.email}</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <div className={clsx(
                                    "px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm",
                                    member.role === 'Admin' ? "bg-purple-50 text-purple-600 border-purple-100" : "bg-blue-50 text-blue-600 border-blue-100"
                                )}>
                                    {member.role}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Inbox Nexus (Shared Inbox Preview) */}
            <div className="bg-white rounded-[48px] border-2 border-gray-50 shadow-2xl shadow-gray-200/40 relative overflow-hidden">
                <div className="p-8 md:p-10 border-b-2 border-gray-50 flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            <Mail className="text-emerald-500" size={24} strokeWidth={2.5} />
                            Shared Nexus
                        </h3>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Real-time collaborative inbox telemetry</p>
                    </div>
                    <Link href={`/dashboard/${workspaceId}/inbox`} className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-black hover:text-white transition-all active:scale-95 shadow-sm">
                        <ChevronRight size={24} strokeWidth={3} />
                    </Link>
                </div>
                
                <div className="p-8 md:p-10 space-y-4">
                     {conversations.slice(0, 5).map((convo: any, i: number) => (
                        <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-gray-50/50 rounded-[32px] border-2 border-transparent hover:border-emerald-200 hover:bg-white transition-all cursor-pointer group gap-6">
                            <div className="flex items-center gap-6 flex-1 min-w-0">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border-2 border-gray-100 text-gray-400 font-black shadow-sm group-hover:bg-emerald-500 group-hover:text-white group-hover:border-transparent transition-all">
                                    {(convo.contactName || 'U')[0].toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-lg font-black text-gray-900 tracking-tight uppercase leading-none mb-1.5 truncate">{convo.contactName || convo.phone}</p>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate max-w-sm italic opacity-60">"{convo.lastMessage || 'Signal Established'}"</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 w-full sm:w-auto justify-between">
                                <div className="flex items-center gap-2">
                                    <Clock size={12} className="text-gray-300" />
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Active</span>
                                </div>
                                <div className={clsx(
                                    "px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm",
                                    convo.status === 'open' ? "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-50" : "bg-gray-100 text-gray-400"
                                )}>
                                    {convo.status}
                                </div>
                            </div>
                        </div>
                     ))}
                </div>
            </div>

            {/* Authorization Matrix */}
            <div className="bg-[#1E293B] rounded-[48px] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-10 -mr-32 -mt-32" />
                <div className="mb-10">
                    <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                        <Shield className="text-blue-500" size={24} strokeWidth={2.5} />
                        Authorization Matrix
                    </h3>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-1">Cross-role permission hierarchy benchmarks</p>
                </div>
                
                <div className="overflow-x-auto scrollbar-none">
                    <table className="w-full">
                        <thead>
                            <tr className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 border-b border-white/5">
                                <th className="pb-6 text-left">Protocol Permission</th>
                                <th className="pb-6 text-center">Root Command</th>
                                <th className="pb-6 text-center">Active Agent</th>
                                <th className="pb-6 text-center">View Observer</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                             {[
                                { name: 'Full Transmission Access', admin: true, agent: true, viewer: false },
                                { name: 'Registry Retrieval', admin: true, agent: true, viewer: true },
                                { name: 'Operational Broadcasts', admin: true, agent: true, viewer: false },
                                { name: 'Nexus Node Management', admin: true, agent: false, viewer: false },
                                { name: 'Financial Ledger Access', admin: true, agent: false, viewer: false },
                            ].map((perm, i) => (
                                <tr key={i} className="group hover:bg-white/5 transition-all">
                                    <td className="py-6 text-xs font-black uppercase tracking-widest text-white/70">{perm.name}</td>
                                    <td className="py-6 flex justify-center">{perm.admin ? <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50" /> : <div className="w-4 h-4 rounded-full border-2 border-white/10" />}</td>
                                    <td className="py-6 text-center">{perm.agent ? <div className="w-4 h-4 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50 mx-auto" /> : <div className="w-4 h-4 rounded-full border-2 border-white/10 mx-auto" />}</td>
                                    <td className="py-6 text-center">{perm.viewer ? <div className="w-4 h-4 bg-white/20 rounded-full mx-auto" /> : <div className="w-4 h-4 rounded-full border-2 border-white/10 mx-auto" />}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[48px] max-w-md w-full p-10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-50 rounded-full blur-[60px] -ml-16 -mt-16 opacity-60" />
                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-8 bg-gradient-to-br from-black to-gray-500 bg-clip-text text-transparent">Authorize Node Access</h2>
                        <div className="space-y-6 mb-10">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Registry Email</label>
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm font-black tracking-tight"
                                    placeholder="node@nexus.network"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Access Tier</label>
                                <select
                                    value={inviteRole}
                                    onChange={(e) => setInviteRole(e.target.value as any)}
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm font-black tracking-tight appearance-none"
                                >
                                    <option value="Agent">Operational Agent - Write/Send</option>
                                    <option value="Viewer">Observation Node - Read-only</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setShowInviteModal(false)} className="flex-1 px-4 py-4 bg-gray-50 text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-gray-100 transition-all active:scale-95">Abort Mission</button>
                            <button onClick={inviteMember} disabled={saving || !inviteEmail.trim()} className="flex-[2] px-4 py-4 bg-black text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-600 transition-all active:scale-95 shadow-xl shadow-gray-200">Generate Invite</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notifications */}
            {successMsg && (
                <div className="fixed top-8 right-8 z-[110] animate-in slide-in-from-right duration-500">
                    <div className="bg-black text-white px-8 py-5 rounded-[24px] shadow-2xl flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20"><CheckCircle size={24} strokeWidth={3} /></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">{successMsg}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
