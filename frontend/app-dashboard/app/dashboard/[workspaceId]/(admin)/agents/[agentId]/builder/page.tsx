'use client';

import FlowCanvas from './FlowCanvas';

export default function AgentBuilderPage({ params }: { params: { workspaceId: string, agentId: string } }) {
    return (
        <div className="h-[calc(100vh-64px)] w-full">
            {/* 64px accounts for top nav height approx */}
            <FlowCanvas agentId={params.agentId} workspaceId={params.workspaceId} />
        </div>
    );
}
