
import { useState } from "react";
import Navigation from "@/components/Navigation";
import { MessageCircle, ChevronDown } from "lucide-react";

import ChatArea from "@/components/chat/ChatArea";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const Chat = () => {
  const { user } = useAuth();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  
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
      
      {/* Top bar with collapsible options */}
      <div className="pt-14 md:pt-16">
        <Collapsible open={optionsOpen} onOpenChange={setOptionsOpen} className="border-b border-border">
          <div className="max-w-4xl mx-auto px-4">
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full py-3 flex items-center justify-between touch-target"
              >
                <span className="text-sm font-medium">Chat Options</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${optionsOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="pb-3">
              <div className="space-y-3 pt-2">
                {!user && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">💬 Chatting as guest</span>
                    <Link to="/auth">
                      <Button variant="outline" size="sm" className="touch-target">Sign in to save chats</Button>
                    </Link>
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full touch-target" 
                  onClick={() => setHistoryOpen(true)}
                >
                  View Chat History
                </Button>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

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
