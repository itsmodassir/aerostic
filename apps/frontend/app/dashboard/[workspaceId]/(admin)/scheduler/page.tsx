'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Calendar as CalendarIcon, Clock, Plus, Video, Trash2, MapPin, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { useParams } from 'next/navigation';

interface Appointment {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    status: string;
    meetingLink?: string;
    contact?: { name: string };
    agent?: { name: string };
}

export default function SchedulerPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const params = useParams();

    useEffect(() => {
        const fetchAppointments = async () => {
            const workspaceSlug = params.workspaceId as string;
            if (!workspaceSlug) return;

            try {
                const res = await api.get('/auth/workspaces');
                const activeMembership = res.data.find((m: any) => m.tenant?.slug === workspaceSlug);

                if (activeMembership?.tenant?.id) {
                    const tid = activeMembership.tenant.id;
                    const appointmentsRes = await api.get(`/scheduler?tenantId=${tid}`);
                    setAppointments(appointmentsRes.data);
                }
            } catch (e) {
                console.error('Failed to fetch appointments', e);
            } finally {
                setLoading(false);
            }
        };
        fetchAppointments();
    }, [params.workspaceId]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Scheduler</h1>
                    <p className="text-sm text-gray-500">Manage your bookings and appointments.</p>
                </div>
                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Plus size={18} />
                    New Appointment
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar Sidebar (Mini) */}
                <div className="lg:col-span-1 bg-white p-6 rounded-xl border shadow-sm h-fit">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-bold text-gray-900">February 2026</h2>
                        <div className="flex gap-2">
                            <button className="p-1 border rounded hover:bg-gray-50"><ChevronLeft size={16} /></button>
                            <button className="p-1 border rounded hover:bg-gray-50"><ChevronRight size={16} /></button>
                        </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="font-medium text-gray-400">{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-sm">
                        {Array.from({ length: 28 }, (_, i) => (
                            <div key={i} className={`p-2 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors ${i + 1 === 14 ? 'bg-blue-600 text-white' : 'text-gray-600'}`}>
                                {i + 1}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Appointments List */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                        Upcoming Appointments
                        <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            {appointments.length}
                        </span>
                    </h2>

                    {loading ? (
                        <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-dashed">Loading...</div>
                    ) : appointments.length === 0 ? (
                        <div className="p-12 text-center bg-white rounded-xl border border-dashed text-gray-500">
                            <CalendarIcon className="mx-auto mb-4 text-gray-300" size={48} />
                            <p>No appointments scheduled for this week.</p>
                            <button className="mt-4 text-blue-600 font-medium hover:underline text-sm">Schedule your first meeting</button>
                        </div>
                    ) : (
                        appointments.map((apt) => (
                            <div key={apt.id} className="bg-white p-5 rounded-xl border shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex flex-col items-center justify-center shrink-0">
                                        <span className="text-[10px] font-bold uppercase">{new Date(apt.startTime).toLocaleString('default', { month: 'short' })}</span>
                                        <span className="text-lg font-bold leading-tight">{new Date(apt.startTime).getDate()}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{apt.title}</h3>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                                            <span className="flex items-center gap-1"><Clock size={14} /> {new Date(apt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            <span className="flex items-center gap-1"><User size={14} /> {apt.contact?.name || 'Unknown'}</span>
                                            {apt.meetingLink && <span className="flex items-center gap-1 text-blue-600 font-medium"><Video size={14} /> Video Call</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 border-t md:border-0 pt-3 md:pt-0">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${apt.status === 'SCHEDULED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {apt.status}
                                    </span>
                                    <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
