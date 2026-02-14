'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, X, Play, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { socket } from '@/lib/socket';
import { toast } from 'sonner';
import api from '@/lib/api';

interface TestChatPanelProps {
    workspaceId: string;
    workflowId: string;
    onClose: () => void;
    onDebugEvent: (event: any) => void;
}

interface Message {
    id: string;
    role: 'user' | 'bot' | 'system';
    content: string;
    timestamp: Date;
}

export default function TestChatPanel({ workspaceId, workflowId, onClose, onDebugEvent }: TestChatPanelProps) {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'system', content: 'Test Mode Active. Type a message to trigger the workflow.', timestamp: new Date() }
    ]);
    const [input, setInput] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Connect to Tenant Room
        socket.emit('joinTenant', workspaceId);
        setIsConnected(true);

        // Listen for Bot Replies (from standard messages gateway)
        socket.on('newMessage', (data: any) => {
            if (data.direction === 'out') {
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'bot',
                    content: typeof data.content === 'string' ? data.content : data.content.body || JSON.stringify(data.content),
                    timestamp: new Date()
                }]);
            }
        });

        // Listen for Debug Events
        socket.on('workflowDebug', (data: any) => {
            console.log('Debug Event:', data);
            if (data.workflowId === workflowId) {
                onDebugEvent(data); // Pass to parent to style nodes

                if (data.status === 'failed') {
                    setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        role: 'system',
                        content: `❌ Error in node ${data.nodeId}: ${data.error}`,
                        timestamp: new Date()
                    }]);
                }
            }
        });

        return () => {
            socket.off('newMessage');
            socket.off('workflowDebug');
            // socket.emit('leaveTenant', workspaceId); // Optional, depending on app logic
        };
    }, [workspaceId, workflowId, onDebugEvent]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        setIsLoading(true);
        try {
            await api.post(`/workflows/${workflowId}/execute`, {
                triggerData: {
                    body: input,
                    from: 'TEST_USER'
                }
            });
        } catch (e: any) {
            toast.error('Failed to trigger workflow: ' + e.message);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'system',
                content: `❌ Error triggering workflow: ${e.message}`,
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl border-l z-50 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                    <h3 className="font-bold text-gray-800">Test Workflow</h3>
                </div>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                    <X size={20} />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`max-w-[80%] rounded-xl p-3 text-sm ${msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : msg.role === 'system'
                                    ? 'bg-red-100 text-red-800 border border-red-200 w-full text-center'
                                    : 'bg-white border text-gray-800 rounded-bl-none shadow-sm'
                                }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t bg-white">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type to test trigger..."
                        className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading}
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                </div>
                <p className="text-[10px] text-gray-400 text-center mt-2">
                    Trace events will highlight nodes in the graph.
                </p>
            </div>
        </div>
    );
}
