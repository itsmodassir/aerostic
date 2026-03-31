"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { resolveWorkspaceId } from '@/components/dashboard/DashboardComponents';
import api from '@/lib/api';
import AutomationFlowBuilder from '../../../../../../components/automation/flow-builder/AutomationFlowBuilder';

export default function BuilderPage() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = resolveWorkspaceId(params?.workspaceId as string | string[] | undefined);
    const automationId = params?.id as string;
    
    const [automation, setAutomation] = useState<any>(null);
    const [loading, setLoading] = useState(automationId !== 'new');

    useEffect(() => {
        if (automationId !== 'new') {
            fetchAutomation();
        }
    }, [automationId]);

    const fetchAutomation = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/v1/new-automation/${automationId}`);
            if (res.status === 200) {
                setAutomation(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch automation:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
                <p className="text-xs font-semibold text-gray-400 font-mono uppercase tracking-widest">Loading Flow Canvas...</p>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] bg-white overflow-hidden">
            <AutomationFlowBuilder 
                automation={automation} 
                onClose={() => router.push(`/dashboard/${workspaceId}/automations`)} 
            />
        </div>
    );
}
