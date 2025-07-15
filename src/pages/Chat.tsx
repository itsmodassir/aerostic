
import { useState } from "react";
import Navigation from "@/components/Navigation";
import { MessageCircle, Menu, X } from "lucide-react";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatArea from "@/components/chat/ChatArea";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Chat = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false); // Hide by default for better UX
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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <Navigation />
      
      <div className="flex-1 flex pt-14 md:pt-16 overflow-hidden">
        {/* Mobile Sidebar Toggle Button */}
        <Button
          variant="ghost"
          size="sm"
          className="fixed top-16 md:top-20 left-3 z-50 md:hidden bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 h-8 w-8 p-0"
          onClick={toggleSidebar}
        >
          {sidebarOpen ? <X className="h-3 w-3" /> : <Menu className="h-3 w-3" />}
        </Button>

        {/* Desktop Sidebar Toggle Button */}
        <Button
          variant="ghost"
          size="sm"
          className={`hidden md:flex items-center justify-center w-8 h-8 fixed top-20 z-50 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 transition-all duration-300 ${
            sidebarOpen ? 'left-60' : 'left-2'
          }`}
          onClick={toggleSidebar}
          title={sidebarOpen ? 'Hide chat history' : 'Show chat history'}
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>

        {/* Sidebar */}
        <div className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden border-r border-gray-200 bg-white ${
          sidebarOpen ? 'block' : 'hidden'
        } md:block fixed md:relative z-40 h-full md:h-auto`}>
          <ChatSidebar
            conversations={conversations}
            currentConversation={currentConversation}
            loadingConversations={loadingConversations}
            onSelectConversation={setCurrentConversation}
            onCreateConversation={createNewConversation}
            onDeleteConversation={deleteConversation}
          />
        </div>

        {/* Main Chat Area */}
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          sidebarOpen ? 'md:ml-0' : 'md:ml-0'
        }`}>
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

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={toggleSidebar}
          />
        )}
      </div>
    </div>
  );
};

export default Chat;
