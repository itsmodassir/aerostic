import React from 'react';

export default function Sidebar() {
    const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside className="w-64 bg-white border-l p-4 flex flex-col gap-4">
            <div>
                <h3 className="font-bold text-gray-900 mb-2">Components</h3>
                <p className="text-xs text-gray-500 mb-4">Drag and drop nodes to build your flow.</p>
            </div>

            <div className="space-y-3">
                <div
                    className="p-3 bg-blue-50 border border-blue-200 rounded cursor-grab hover:shadow-md transition-shadow"
                    onDragStart={(event) => onDragStart(event, 'MessageNode')}
                    draggable
                >
                    <div className="font-semibold text-blue-800 text-sm">Send Message</div>
                    <div className="text-xs text-gray-500">Simple text response</div>
                </div>

                <div
                    className="p-3 bg-purple-50 border border-purple-200 rounded cursor-grab hover:shadow-md transition-shadow"
                    onDragStart={(event) => onDragStart(event, 'TemplateNode')}
                    draggable
                >
                    <div className="font-semibold text-purple-800 text-sm">Send Template</div>
                    <div className="text-xs text-gray-500">Marketing/Utility message</div>
                </div>

                <div
                    className="p-3 bg-orange-50 border border-orange-200 rounded cursor-grab hover:shadow-md transition-shadow"
                    onDragStart={(event) => onDragStart(event, 'ConditionNode')}
                    draggable
                >
                    <div className="font-semibold text-orange-800 text-sm">Condition</div>
                    <div className="text-xs text-gray-500">If / Else logic</div>
                </div>
            </div>

            <div className="mt-auto border-t pt-4">
                <h4 className="font-semibold text-sm mb-2">Instructions</h4>
                <ul className="text-xs text-gray-500 list-disc list-inside space-y-1">
                    <li>Start with the Trigger node</li>
                    <li>Connect nodes to define flow</li>
                    <li>Use attributes to set data</li>
                    <li>Save to activate the bot</li>
                </ul>
            </div>
        </aside>
    );
}
