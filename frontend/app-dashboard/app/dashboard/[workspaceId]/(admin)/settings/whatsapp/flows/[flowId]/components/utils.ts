import { Node, Edge, MarkerType } from "@xyflow/react";
import { WhatsAppFlowJSON, FlowScreen, FlowComponent, ScreenNodeData } from "./types";

export const uid = () =>
    `node_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export function flowToNodes(flow: WhatsAppFlowJSON): { nodes: Node<ScreenNodeData>[], edges: Edge[] } {
    if (!flow || !flow.screens) return { nodes: [], edges: [] };

    const nodes: Node<ScreenNodeData>[] = flow.screens.map((screen, index) => ({
        id: screen.id,
        type: 'screen',
        position: { x: index * 400 + 100, y: 150 },
        data: {
            id: screen.id,
            title: screen.title,
            components: screen.layout?.children || []
        }
    }));

    const edges: Edge[] = [];
    flow.screens.forEach(screen => {
        const findNavigations = (components: FlowComponent[]) => {
            components.forEach(comp => {
                if (comp['on-click-action']?.name === 'navigate' && comp['on-click-action']?.next?.name) {
                    const target = comp['on-click-action'].next.name;
                    edges.push({
                        id: `e-${screen.id}-${target}`,
                        source: screen.id,
                        target: target,
                        animated: true,
                        markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
                        style: { stroke: '#3b82f6', strokeWidth: 2 }
                    });
                }
                if (comp.children) findNavigations(comp.children);
            });
        };
        if (screen.layout?.children) findNavigations(screen.layout.children);
    });

    return { nodes, edges };
}

export const sanitizeId = (name: string) => 
    name.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_').replace(/_+/g, '_').slice(0, 64);

export function nodesToFlow(nodes: Node<ScreenNodeData>[], edges: Edge[], originalFlow: WhatsAppFlowJSON): WhatsAppFlowJSON {
    const screens: FlowScreen[] = nodes.map(node => {
        const screenId = sanitizeId(node.id);
        const components = [...(node.data.components || [])];

        // Ensure connections are reflected in the JSON
        const outboundEdges = edges.filter(e => e.source === node.id);
        
        // This is a simplified mapper. In a real scenario, we'd need to know which 
        // component triggers which navigation. For now, we'll assume the Footer 
        // or the first clickable component navigates if there's only one edge.
        outboundEdges.forEach(edge => {
            const footer = components.find(c => c.type === 'Footer');
            const targetId = sanitizeId(edge.target);
            if (footer) {
                footer['on-click-action'] = {
                    name: 'navigate',
                    next: { type: 'screen', name: targetId }
                };
            }
        });

        return {
            id: screenId,
            title: node.data.title,
            layout: {
                type: 'Form',
                children: components
            }
        };
    });

    return {
        ...originalFlow,
        version: originalFlow.version || "7.3",
        screens
    };
}

