
import Navigation from "@/components/Navigation";
import { MessageCircle } from "lucide-react";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatArea from "@/components/chat/ChatArea";
import ChatFeatures from "@/components/chat/ChatFeatures";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Chat = () => {
  const { user } = useAuth();
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

  // If user is not logged in, show a welcome message with login prompt
  if (!user) {
    return (
      <div className="min-h-screen gradient-bg">
        <Navigation />
        
        <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <MessageCircle className="h-16 w-16 text-primary mx-auto mb-6" />
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              AI Chat Assistant
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Welcome to your intelligent AI assistant. Get instant help, answers, and have meaningful conversations.
            </p>
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Ready to get started?</h2>
              <p className="text-gray-600 mb-6">
                Sign in to access your personal AI chat assistant and start having intelligent conversations.
              </p>
              <Link to="/auth">
                <Button size="lg" className="text-lg px-8 py-3">
                  Sign In to Start Chatting
                </Button>
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-semibold text-gray-800 mb-2">💬 Intelligent Conversations</h3>
                <p className="text-gray-600 text-sm">Have natural conversations with our advanced AI assistant</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-semibold text-gray-800 mb-2">📚 Knowledge Base</h3>
                <p className="text-gray-600 text-sm">Get answers to questions across various topics and subjects</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-semibold text-gray-800 mb-2">🔄 Persistent History</h3>
                <p className="text-gray-600 text-sm">Your conversations are saved and organized for easy reference</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
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
  );
};

export default Chat;
