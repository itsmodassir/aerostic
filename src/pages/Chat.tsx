
import { useState } from "react";
import Navigation from "@/components/Navigation";
import { MessageCircle } from "lucide-react";

import ChatArea from "@/components/chat/ChatArea";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Chat = () => {
  const { user } = useAuth();
  const [historyOpen, setHistoryOpen] = useState(false);
  
  const {
    conversations,
    currentConversation,
    messages,
    inputMessage,
    isLoading,
    loadingConversations,
    setCurrentConversation,
    setInputMessage,
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
            <h1 className="text-5xl font-bold text-foreground mb-6">
              AI Chat Assistant
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Welcome to your intelligent AI assistant. Get instant help, answers, and have meaningful conversations.
            </p>
            <div className="bg-card rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-semibold text-card-foreground mb-4">Ready to get started?</h2>
              <p className="text-muted-foreground mb-6">
                Sign in to access your personal AI chat assistant and start having intelligent conversations.
              </p>
              <Link to="/auth">
                <Button size="lg" className="text-lg px-8 py-3">
                  Sign In to Start Chatting
                </Button>
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="bg-card p-6 rounded-lg shadow">
                <h3 className="font-semibold text-card-foreground mb-2">💬 Intelligent Conversations</h3>
                <p className="text-muted-foreground text-sm">Have natural conversations with our advanced AI assistant</p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow">
                <h3 className="font-semibold text-card-foreground mb-2">📚 Knowledge Base</h3>
                <p className="text-muted-foreground text-sm">Get answers to questions across various topics and subjects</p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow">
                <h3 className="font-semibold text-card-foreground mb-2">🔄 Persistent History</h3>
                <p className="text-muted-foreground text-sm">Your conversations are saved and organized for easy reference</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="h-screen bg-background flex flex-col">
      <Navigation />
      
      {/* Top bar with History */}
      <div className="pt-14 md:pt-16">
        <div className="border-b border-border">
          <div className="max-w-4xl mx-auto px-4 py-2 flex justify-end">
            <Button variant="ghost" size="sm" onClick={() => setHistoryOpen(true)}>History</Button>
          </div>
        </div>

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

      {/* History Dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chat History</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-[50vh] overflow-auto">
            {loadingConversations ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : conversations.length === 0 ? (
              <div className="text-sm text-muted-foreground">No conversations yet.</div>
            ) : (
              conversations.map((c) => (
                <Button
                  key={c.id}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    setCurrentConversation(c.id);
                    setHistoryOpen(false);
                  }}
                >
                  {c.title}
                </Button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Chat;
