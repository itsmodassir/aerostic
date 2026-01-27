
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, Loader2, MessageSquare, Edit3, History } from "lucide-react";

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ChatSidebarProps {
  conversations: Conversation[];
  currentConversation: string | null;
  loadingConversations: boolean;
  onSelectConversation: (id: string) => void;
  onCreateConversation: () => void;
  onDeleteConversation: (id: string) => void;
}

const ChatSidebar = ({
  conversations,
  currentConversation,
  loadingConversations,
  onSelectConversation,
  onCreateConversation,
  onDeleteConversation
}: ChatSidebarProps) => {
  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-2 mb-3">
          <History className="h-5 w-5 text-gray-400" />
          <h2 className="text-sm font-medium text-gray-300">Chat History</h2>
        </div>
        <Button
          onClick={onCreateConversation}
          className="w-full justify-start bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white"
          variant="outline"
        >
          <Plus className="h-4 w-4 mr-2" />
          New chat
        </Button>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {loadingConversations ? (
            <div className="p-4 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
              <p className="text-xs text-gray-400 mt-2">Loading conversations...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs mt-1 opacity-75">Start a new chat to begin</p>
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                    currentConversation === conversation.id
                      ? 'bg-gray-800 text-white border border-gray-600'
                      : 'hover:bg-gray-800 text-gray-300 hover:text-white'
                  }`}
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4 flex-shrink-0" />
                      <p className="text-sm font-medium truncate">
                        {conversation.title}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(conversation.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(conversation.id);
                      }}
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-gray-400 hover:text-red-400 hover:bg-gray-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-gray-400 text-center">
          AI Chat Assistant
        </div>
        <div className="text-xs text-gray-500 text-center mt-1">
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
