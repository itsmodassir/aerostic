
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



  return (
    <div className="h-screen bg-background flex flex-col">
      <Navigation />
      
      {/* Top bar with History and Auth status */}
      <div className="pt-14 md:pt-16">
        <div className="border-b border-border">
          <div className="max-w-4xl mx-auto px-4 py-2 flex justify-between items-center">
            {!user && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>💬 Chatting as guest</span>
                <Link to="/auth">
                  <Button variant="outline" size="sm">Sign in to save chats</Button>
                </Link>
              </div>
            )}
            {user && <div />}
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
