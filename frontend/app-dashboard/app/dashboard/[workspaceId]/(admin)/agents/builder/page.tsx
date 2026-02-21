'use client';

import FlowCanvas from './FlowCanvas';

export default function AgentBuilderPage() {
    return (
        <div className="h-[calc(100vh-64px)] w-full">
            {/* 64px accounts for top nav height approx */}
            <FlowCanvas />
        </div>
    );
}
