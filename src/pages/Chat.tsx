
import { useState } from "react";
import { Menu, History, User, Settings, Home, FileText, Globe, Image, Zap, MessageCircle, Code, LogOut, Sparkles } from "lucide-react";

import ChatArea from "@/components/chat/ChatArea";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

const Chat = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useIsMobile();
  
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

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      navigate("/");
      setDrawerOpen(false);
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  const mainPages = [
    { name: "Home", path: "/landing", icon: Home },
    { name: "Features", path: "/features", icon: Sparkles },
    { name: "Pricing", path: "/pricing", icon: Zap },
    { name: "About", path: "/about", icon: FileText },
    { name: "Help Center", path: "/help", icon: MessageCircle },
  ];

  const aiTools = [
    { name: "AI Chat", path: "/chat", icon: MessageCircle },
    { name: "Code Editor", path: "/code-editor", icon: Code },
    { name: "Auto-Code Generator", path: "/create-app", icon: Zap },
    { name: "Blog Editor", path: "/blog-editor", icon: FileText, protected: true },
    { name: "Website Builder", path: "/blog-builder", icon: Globe, protected: true },
    { name: "Image Generator", path: "/image-generator", icon: Image, protected: true }
  ];



  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border shadow-sm safe-top">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Left: Menu Button */}
          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="lg" className="touch-target">
                <Menu className="h-6 w-6" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="h-[85vh] safe-bottom">
              <DrawerHeader className="border-b">
                <DrawerTitle>Menu</DrawerTitle>
              </DrawerHeader>
              <div className="overflow-y-auto px-4 py-4 space-y-6">
                {/* Profile Section */}
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user.email?.[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user.email}</p>
                        <p className="text-xs text-muted-foreground">Signed in</p>
                      </div>
                    </div>
                    
                    <Link to="/dashboard" onClick={() => setDrawerOpen(false)}>
                      <Button variant="outline" className="w-full justify-start touch-target">
                        <User className="h-5 w-5 mr-3" />
                        Dashboard
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">💬 Chatting as guest</p>
                      <Link to="/auth" onClick={() => setDrawerOpen(false)}>
                        <Button className="w-full touch-target">Sign In</Button>
                      </Link>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Chat History */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-muted-foreground px-2">Chat</h3>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start touch-target"
                    onClick={() => {
                      setHistoryOpen(true);
                      setDrawerOpen(false);
                    }}
                  >
                    <History className="h-5 w-5 mr-3" />
                    Chat History
                  </Button>
                </div>

                <Separator />

                {/* AI Tools */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-muted-foreground px-2">AI Tools</h3>
                  {aiTools.map((tool) => (
                    <Link
                      key={tool.path}
                      to={tool.path}
                      onClick={() => setDrawerOpen(false)}
                    >
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start touch-target"
                        disabled={tool.protected && !user}
                      >
                        <tool.icon className="h-5 w-5 mr-3" />
                        <span className="flex-1 text-left">{tool.name}</span>
                        {tool.protected && !user && (
                          <span className="text-xs text-muted-foreground">Sign in</span>
                        )}
                      </Button>
                    </Link>
                  ))}
                </div>

                <Separator />

                {/* Pages */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-muted-foreground px-2">Pages</h3>
                  {mainPages.map((page) => (
                    <Link
                      key={page.path}
                      to={page.path}
                      onClick={() => setDrawerOpen(false)}
                    >
                      <Button variant="ghost" className="w-full justify-start touch-target">
                        <page.icon className="h-5 w-5 mr-3" />
                        {page.name}
                      </Button>
                    </Link>
                  ))}
                </div>

                {user && (
                  <>
                    <Separator />
                    <Button 
                      variant="outline" 
                      className="w-full justify-start touch-target text-destructive hover:text-destructive"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      Sign Out
                    </Button>
                  </>
                )}
              </div>
            </DrawerContent>
          </Drawer>

          {/* Center: Logo/Title */}
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/e47c9b5a-4447-4b53-9d63-ce43b0477e62.png" 
              alt="Aerostic AI" 
              className="h-8 w-auto"
            />
            <span className="text-lg font-bold">AI Chat</span>
          </div>

          {/* Right: History Button (desktop) */}
          {!isMobile && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setHistoryOpen(true)}
            >
              <History className="h-5 w-5 mr-2" />
              History
            </Button>
          )}
          {isMobile && <div className="w-12" />} {/* Spacer for mobile */}
        </div>
      </header>
      
      {/* Chat Area */}
      <div className="pt-16">
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
