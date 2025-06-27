
import Navigation from "@/components/Navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { MessageCircle } from "lucide-react";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatArea from "@/components/chat/ChatArea";
import ChatFeatures from "@/components/chat/ChatFeatures";
import { useChat } from "@/hooks/useChat";

const Chat = () => {
  const {
    conversations,
    currentConversation,
    messages,
    inputMessage,
    isLoading,
    loadingConversations,
    setCurrentConversation,
    setInputMessage,
    createNewConversation,
    deleteConversation,
    sendMessage,
    handleKeyPress
  } = useChat();

  return (
    <ProtectedRoute>
      <div className="min-h-screen gradient-bg">
        <Navigation />
        
        <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                AI Chat Assistant
              </h1>
              <p className="text-xl text-gray-600">
                Ask me anything and get intelligent, helpful responses
              </p>
            </div>

            <div className="grid lg:grid-cols-4 gap-6 h-[600px]">
              <ChatSidebar
                conversations={conversations}
                currentConversation={currentConversation}
                loadingConversations={loadingConversations}
                onSelectConversation={setCurrentConversation}
                onCreateConversation={createNewConversation}
                onDeleteConversation={deleteConversation}
              />

              <ChatArea
                currentConversation={currentConversation}
                messages={messages}
                inputMessage={inputMessage}
                isLoading={isLoading}
                onInputChange={setInputMessage}
                onSendMessage={sendMessage}
                onKeyPress={handleKeyPress}
              />
            </div>

            <ChatFeatures />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Chat;
