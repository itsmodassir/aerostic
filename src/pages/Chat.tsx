
import { useState, useMemo } from "react";
import { Menu, History, User, Settings, Home, FileText, Globe, Image, Zap, MessageCircle, Code, LogOut, Sparkles, FolderKanban, Pin } from "lucide-react";

import ChatArea from "@/components/chat/ChatArea";
import { FolderManager } from "@/components/chat/FolderManager";
import { useChat } from "@/hooks/useChat";
import { useChatFolders } from "@/hooks/useChatFolders";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Chat = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const { folders, moveConversationToFolder } = useChatFolders();
  
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
    handleKeyPress,
    fetchMessages,
    togglePin
  } = useChat();

  const handleRefresh = async () => {
    if (currentConversation) {
      await fetchMessages(currentConversation);
    }
  };

  // Filter conversations by selected folder
  const filteredConversations = useMemo(() => {
    let filtered = selectedFolderId 
      ? conversations.filter((c: any) => c.folder_id === selectedFolderId)
      : conversations;
    
    // Sort: pinned first, then by updated_at
    return filtered.sort((a: any, b: any) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  }, [conversations, selectedFolderId]);

  const handleMoveToFolder = async (conversationId: string, folderId: string) => {
    await moveConversationToFolder(conversationId, folderId === 'none' ? null : folderId);
  };

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
    <div className="h-screen w-full bg-background flex flex-col overflow-hidden">
      {/* Top Header - Fixed */}
      <header className="flex-none w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
        <div className="h-14 flex items-center justify-center px-4">
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/e47c9b5a-4447-4b53-9d63-ce43b0477e62.png" 
              alt="Aerostic AI" 
              className="h-7 w-auto"
            />
            <span className="text-base font-semibold">AI Chat</span>
          </div>
        </div>
      </header>
      
      {/* Chat Area - Flexible */}
      <div className="flex-1 overflow-hidden">
        <ChatArea
          currentConversation={currentConversation}
          messages={messages}
          inputMessage={inputMessage}
          isLoading={isLoading}
          onInputChange={setInputMessage}
          onSendMessage={sendMessage}
          onKeyPress={handleKeyPress}
          onRefresh={handleRefresh}
        />
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t pb-safe">
        <div className="flex items-center justify-around h-16 max-w-screen-xl mx-auto px-4">
          {/* Home */}
          <Link to="/landing">
            <Button variant="ghost" size="lg" className="flex flex-col items-center gap-1 h-auto py-2 px-3">
              <Home className="h-5 w-5" />
              <span className="text-[10px]">Home</span>
            </Button>
          </Link>

          {/* History */}
          <Button 
            variant="ghost" 
            size="lg" 
            className="flex flex-col items-center gap-1 h-auto py-2 px-3"
            onClick={() => setHistoryOpen(true)}
          >
            <History className="h-5 w-5" />
            <span className="text-[10px]">History</span>
          </Button>

          {/* Chat (Active) */}
          <Button 
            variant="ghost" 
            size="lg" 
            className="flex flex-col items-center gap-1 h-auto py-2 px-3 text-primary"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-[10px] font-medium">Chat</span>
          </Button>

          {/* More Menu */}
          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="lg" className="flex flex-col items-center gap-1 h-auto py-2 px-3">
                <Menu className="h-5 w-5" />
                <span className="text-[10px]">Menu</span>
              </Button>
            </DrawerTrigger>
            <DrawerContent className="h-[85vh]">
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
                      <Button variant="outline" className="w-full justify-start">
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
                        <Button className="w-full">Sign In</Button>
                      </Link>
                    </div>
                  </div>
                )}

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
                        className="w-full justify-start"
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
                      <Button variant="ghost" className="w-full justify-start">
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
                      className="w-full justify-start text-destructive hover:text-destructive"
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

          {/* Profile */}
          {user ? (
            <Link to="/dashboard">
              <Button variant="ghost" size="lg" className="flex flex-col items-center gap-1 h-auto py-2 px-3">
                <User className="h-5 w-5" />
                <span className="text-[10px]">Profile</span>
              </Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button variant="ghost" size="lg" className="flex flex-col items-center gap-1 h-auto py-2 px-3">
                <User className="h-5 w-5" />
                <span className="text-[10px]">Sign In</span>
              </Button>
            </Link>
          )}
        </div>
      </div>


      {/* History Dialog with Folders */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5" />
              Chat History
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Folder Manager */}
            {user && (
              <>
                <FolderManager 
                  onSelectFolder={setSelectedFolderId}
                  selectedFolderId={selectedFolderId}
                />
                <Separator />
              </>
            )}
            
            {/* Conversations List */}
            <div className="space-y-2 max-h-[40vh] overflow-auto">
              {loadingConversations ? (
                <div className="text-sm text-muted-foreground">Loading…</div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  {selectedFolderId ? 'No conversations in this folder' : 'No conversations yet'}
                </div>
              ) : (
                filteredConversations.map((c: any) => (
                  <div key={c.id} className="group flex items-center gap-2">
                    <Button
                      variant="ghost"
                      className="flex-1 justify-start gap-2"
                      onClick={() => {
                        setCurrentConversation(c.id);
                        setHistoryOpen(false);
                      }}
                    >
                      {c.pinned && <Pin className="h-3 w-3 text-primary fill-primary" />}
                      {c.title}
                    </Button>
                    {user && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePin(c.id, c.pinned);
                          }}
                        >
                          <Pin className={`h-4 w-4 ${c.pinned ? 'fill-primary text-primary' : ''}`} />
                        </Button>
                        {folders.length > 0 && (
                          <Select
                            value={c.folder_id || 'none'}
                            onValueChange={(value) => handleMoveToFolder(c.id, value)}
                          >
                            <SelectTrigger className="w-[100px] h-8">
                              <SelectValue placeholder="Folder" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No Folder</SelectItem>
                              {folders.map((folder) => (
                                <SelectItem key={folder.id} value={folder.id}>
                                  {folder.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Chat;
