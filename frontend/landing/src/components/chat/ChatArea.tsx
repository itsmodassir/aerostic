import { useRef, useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Send, 
  Loader2, 
  Bot, 
  User, 
  Reply, 
  X, 
  RefreshCw, 
  Sparkles,
  Zap,
  Code,
  Lightbulb,
  Palette,
  Bug,
  Rocket,
  MessageSquare
} from "lucide-react";
import { toast } from "sonner";
import { VoiceRecorder } from "./VoiceRecorder";
import { MessageSearch } from "./MessageSearch";
import MessageActions from "./MessageActions";
import ExpandableCodeBlock from "./ExpandableCodeBlock";
import ToolsMenu from "./ToolsMenu";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface ChatAreaProps {
  currentConversation: string | null;
  messages: Message[];
  inputMessage: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onRefresh?: () => void;
  onRegenerate?: () => void;
}

const ChatArea = ({
  currentConversation,
  messages,
  inputMessage,
  isLoading,
  onInputChange,
  onSendMessage,
  onKeyPress,
  onRefresh,
  onRegenerate
}: ChatAreaProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [replyingTo, setReplyingTo] = useState<{text: string, messageId: string} | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  // Pull-to-refresh state
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const scrollTop = useRef(0);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  
  const PULL_THRESHOLD = 80;

  // Suggestion categories with unique icons and prompts
  const suggestionCategories = [
    { 
      id: 'code', 
      icon: Code, 
      label: "Code", 
      color: "from-blue-500 to-cyan-500",
      suggestions: [
        "Build a React component for...",
        "Write a function that...",
        "Help me debug this code"
      ]
    },
    { 
      id: 'design', 
      icon: Palette, 
      label: "Design", 
      color: "from-pink-500 to-rose-500",
      suggestions: [
        "Create a modern UI design for...",
        "Suggest color palette for...",
        "Design a responsive layout"
      ]
    },
    { 
      id: 'learn', 
      icon: Lightbulb, 
      label: "Learn", 
      color: "from-amber-500 to-orange-500",
      suggestions: [
        "Explain how ... works",
        "What's the difference between...",
        "Teach me about..."
      ]
    },
    { 
      id: 'debug', 
      icon: Bug, 
      label: "Debug", 
      color: "from-red-500 to-pink-500",
      suggestions: [
        "Why is my code not working?",
        "Find the bug in this code",
        "How to fix this error?"
      ]
    },
  ];

  // Quick prompts that appear as floating chips
  const quickPrompts = [
    { text: "Explain like I'm 5", icon: "🧒" },
    { text: "Give me code examples", icon: "💻" },
    { text: "Summarize this", icon: "📝" },
    { text: "Make it simpler", icon: "✨" },
  ];

  // Filter messages based on search query
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    
    const query = searchQuery.toLowerCase();
    return messages.filter(msg => 
      msg.content.toLowerCase().includes(query)
    );
  }, [messages, searchQuery]);

  const handleSearchClear = () => {
    setSearchQuery("");
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputMessage.trim() && !isLoading) {
        onSendMessage();
      }
    }
  };

  const clearReplyContext = () => {
    setReplyingTo(null);
    onInputChange("");
  };

  // Pull-to-refresh handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollContainerRef.current) return;
    touchStartY.current = e.touches[0].clientY;
    scrollTop.current = scrollContainerRef.current.scrollTop;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!scrollContainerRef.current || isRefreshing) return;
    
    const currentScrollTop = scrollContainerRef.current.scrollTop;
    const touchY = e.touches[0].clientY;
    const pullDistance = touchY - touchStartY.current;
    
    if (currentScrollTop <= 0 && pullDistance > 0) {
      setIsPulling(true);
      setPullDistance(Math.min(pullDistance * 0.5, PULL_THRESHOLD + 20));
      
      if (pullDistance > 10) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling) return;
    
    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      toast.info("Refreshing messages...");
      
      if (onRefresh) {
        await onRefresh();
      }
      
      setTimeout(() => {
        setIsRefreshing(false);
        toast.success("Messages refreshed!");
      }, 1000);
    }
    
    setIsPulling(false);
    setPullDistance(0);
  };

  // Enhanced AI response formatting with expandable code blocks
  const formatAIResponse = (content: string) => {
    return (
      <div className="gemini-response text-[15px] leading-[1.75] text-foreground/90">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code(props: any) {
              const { node, inline, className, children, ...rest } = props;
              const match = /language-(\w+)/.exec(className || '');
              const language = match ? match[1] : 'text';
              const codeString = String(children).replace(/\n$/, '');
              
              return !inline ? (
                <ExpandableCodeBlock code={codeString} language={language} />
              ) : (
                <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-md text-[13px] font-mono">
                  {children}
                </code>
              );
            },
            h1: ({ children }) => (
              <h1 className="text-xl md:text-2xl font-semibold text-foreground mt-5 mb-3 first:mt-0">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-lg md:text-xl font-semibold text-foreground mt-4 mb-2">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-base md:text-lg font-medium text-foreground mt-3 mb-2">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="mb-3 last:mb-0 text-foreground/85">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="space-y-1.5 mb-3 ml-1 text-foreground/85">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="space-y-1.5 mb-3 ml-1 text-foreground/85 list-decimal list-inside">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="flex items-start gap-2">
                <span className="text-primary mt-2 flex-shrink-0">•</span>
                <span className="flex-1">{children}</span>
              </li>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-3 border-primary/50 pl-4 py-1 my-3 text-foreground/70 italic bg-primary/5 rounded-r-lg">
                {children}
              </blockquote>
            ),
            a: ({ href, children }) => (
              <a 
                href={href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline underline-offset-2"
              >
                {children}
              </a>
            ),
            hr: () => (
              <hr className="my-4 border-t border-border/50" />
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto my-3 rounded-lg border border-border/50">
                <table className="min-w-full text-sm">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-muted/50 text-foreground/80">
                {children}
              </thead>
            ),
            th: ({ children }) => (
              <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-3 py-2 text-foreground/80 border-t border-border/30">
                {children}
              </td>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-foreground">
                {children}
              </strong>
            ),
            em: ({ children }) => (
              <em className="italic text-foreground/80">
                {children}
              </em>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  // Format relative time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  // Get active suggestions based on selected category
  const activeSuggestions = activeCategory 
    ? suggestionCategories.find(c => c.id === activeCategory)?.suggestions || []
    : [];

  return (
    <div className="h-full w-full flex flex-col bg-background relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="chat-orb chat-orb-1" />
        <div className="chat-orb chat-orb-2" />
        <div className="chat-orb chat-orb-3" />
      </div>

      {/* Messages Area - Scrollable */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto relative z-10"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Pull-to-refresh indicator */}
        <div 
          className="absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200 pointer-events-none z-10"
          style={{ 
            height: `${pullDistance}px`,
            opacity: isPulling ? 1 : 0,
          }}
        >
          <div className={`flex items-center justify-center w-10 h-10 rounded-full glass-bubble transition-transform duration-200 ${
            pullDistance >= PULL_THRESHOLD ? 'scale-110' : 'scale-100'
          }`}>
            <RefreshCw 
              className={`h-4 w-4 text-primary transition-transform duration-300 ${
                isRefreshing ? 'animate-spin' : pullDistance >= PULL_THRESHOLD ? 'rotate-180' : ''
              }`} 
            />
          </div>
        </div>
        
        <div 
          className="max-w-3xl mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-6 transition-transform duration-200 relative"
          style={{ 
            transform: `translateY(${pullDistance > 0 ? pullDistance : 0}px)`,
          }}
        >
          {/* Search Bar */}
          {messages.length > 0 && (
            <div className="relative mb-4 message-slide-in">
              <MessageSearch onSearch={setSearchQuery} onClear={handleSearchClear} />
            </div>
          )}

          {messages.length === 0 ? (
            <div className="text-center py-6 md:py-12 relative">
              {/* Animated Hero Section */}
              <div className="relative inline-block mb-6 md:mb-8">
                {/* Floating particles */}
                <div className="absolute -inset-8 pointer-events-none">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="particle"
                      style={{
                        left: `${20 + i * 12}%`,
                        top: `${30 + (i % 3) * 20}%`,
                        animationDelay: `${i * 0.5}s`,
                      }}
                    />
                  ))}
                </div>
                
                {/* Main icon with glow */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-purple-500/30 to-cyan-500/20 rounded-full blur-3xl opacity-60 animate-pulse" />
                  <div className="relative w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-primary via-purple-500 to-cyan-500 rounded-3xl rotate-3 flex items-center justify-center mx-auto shadow-2xl ai-avatar-glow message-slide-in">
                    <Sparkles className="h-10 w-10 md:h-12 md:w-12 text-white" />
                  </div>
                </div>
              </div>
              
              {/* Gradient heading */}
              <h2 className="text-3xl md:text-4xl font-bold mb-3 message-slide-in" style={{ animationDelay: '0.1s' }}>
                <span className="gradient-text">Hello, I'm Aimstors Solution</span>
              </h2>
              
              <p className="text-muted-foreground text-base md:text-lg mb-8 max-w-md mx-auto message-slide-in" style={{ animationDelay: '0.2s' }}>
                Your AI assistant for coding, design, learning, and more.
              </p>

              {/* Category Pills */}
              <div className="flex flex-wrap justify-center gap-2 mb-6 message-slide-in" style={{ animationDelay: '0.3s' }}>
                {suggestionCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(activeCategory === category.id ? null : category.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                      activeCategory === category.id
                        ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                        : 'glass-bubble hover:scale-105'
                    }`}
                  >
                    <category.icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{category.label}</span>
                  </button>
                ))}
              </div>

              {/* Dynamic Suggestions based on category */}
              {activeCategory && (
                <div className="space-y-2 max-w-md mx-auto mb-6 message-slide-in">
                  {activeSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => onInputChange(suggestion)}
                      className="w-full text-left p-3 rounded-xl glass-bubble suggestion-card group"
                      style={{ animationDelay: `${0.1 * index}s` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${
                          suggestionCategories.find(c => c.id === activeCategory)?.color
                        } flex items-center justify-center`}>
                          <MessageSquare className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors">
                          {suggestion}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Default suggestion cards when no category selected */}
              {!activeCategory && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
                  {[
                    { icon: "🚀", title: "Build something", desc: "Create apps, websites, tools", gradient: "from-blue-500/10 to-cyan-500/10" },
                    { icon: "🎨", title: "Design it", desc: "UI, colors, layouts", gradient: "from-pink-500/10 to-rose-500/10" },
                    { icon: "🧠", title: "Learn anything", desc: "Concepts explained simply", gradient: "from-amber-500/10 to-orange-500/10" },
                    { icon: "⚡", title: "Solve problems", desc: "Debug, optimize, improve", gradient: "from-purple-500/10 to-violet-500/10" }
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => onInputChange(suggestion.title + ": ")}
                      className={`group flex items-center gap-4 p-4 rounded-2xl border border-border/40 bg-gradient-to-br ${suggestion.gradient} hover:border-primary/30 suggestion-card text-left message-slide-in`}
                      style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                    >
                      <span className="text-3xl group-hover:scale-110 transition-transform">{suggestion.icon}</span>
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                          {suggestion.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {suggestion.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 md:space-y-5">
              {filteredMessages.map((message, index) => (
                <div
                  key={message.id}
                  data-message-id={message.id}
                  className={`flex gap-3 md:gap-4 group message-slide-in ${
                    message.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'
                  }`}
                  style={{ animationDelay: `${Math.min(index * 0.05, 0.3)}s` }}
                >
                  {/* Avatar with glow effect for AI */}
                  <div className={`flex-shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 ${
                    message.role === 'assistant' 
                      ? 'bg-gradient-to-br from-primary via-purple-500 to-cyan-500 shadow-lg ai-avatar-glow' 
                      : 'bg-muted'
                  }`}>
                    {message.role === 'assistant' ? (
                      <Sparkles className="h-5 w-5 text-white" />
                    ) : (
                      <User className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={`flex-1 min-w-0 ${message.role === 'user' ? 'flex flex-col items-end' : ''}`}>
                    {/* Timestamp */}
                    <span className="text-[10px] text-muted-foreground/50 mb-1 block font-medium">
                      {message.role === 'assistant' ? 'Aimstors Solution AI' : 'You'} · {formatTime(message.created_at)}
                    </span>
                    
                    <div className={`inline-block max-w-[90%] md:max-w-[85%] rounded-2xl ${
                      message.role === 'assistant'
                        ? 'glass-bubble p-4'
                        : 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground px-4 py-3 shadow-md'
                    }`}>
                      {message.role === 'assistant' ? (
                        <>
                          {formatAIResponse(message.content)}
                          <MessageActions 
                            content={message.content}
                            messageId={message.id}
                            onRegenerate={onRegenerate}
                            showRegenerate={index === filteredMessages.length - 1}
                          />
                        </>
                      ) : (
                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Enhanced Loading Indicator */}
              {isLoading && (
                <div className="flex gap-3 md:gap-4 message-slide-in">
                  <div className="flex-shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary via-purple-500 to-cyan-500 shadow-lg ai-avatar-glow">
                    <Sparkles className="h-5 w-5 text-white animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] text-muted-foreground/50 mb-1 block font-medium">
                      Aimstors Solution AI
                    </span>
                    <div className="glass-bubble p-4 inline-block">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1.5">
                          <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-2.5 h-2.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                        <span className="text-sm text-muted-foreground">Thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Quick prompt chips - appears when typing */}
      {messages.length > 0 && !isLoading && (
        <div className="flex-none py-2 px-4 overflow-x-auto">
          <div className="flex gap-2 justify-center max-w-3xl mx-auto">
            {quickPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => onInputChange(prompt.text)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-bubble text-sm whitespace-nowrap hover:scale-105 transition-transform"
              >
                <span>{prompt.icon}</span>
                <span className="text-muted-foreground">{prompt.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tools Menu - Floating button */}
      <ToolsMenu />

      {/* Input Area - Fixed at bottom with glow effect */}
      <div className="flex-none pb-3 md:pb-4 pt-2 relative z-20 bg-gradient-to-t from-background via-background to-transparent">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 md:px-6 relative">
          {replyingTo && (
            <div className="mb-2 flex items-center gap-2 px-3 py-2 glass-bubble rounded-t-xl border-b-0 message-slide-in">
              <Reply className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground flex-1 truncate">
                Replying to: "{replyingTo.text}"
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearReplyContext}
                className="h-5 w-5 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          <div className="relative input-glow rounded-2xl">
            <div className="relative glass-bubble rounded-2xl overflow-hidden">
              <Textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                className="min-h-[56px] max-h-[150px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 pr-24 pl-5 py-4 text-[15px] rounded-2xl"
                disabled={isLoading}
                rows={1}
              />
              
              <div className="absolute bottom-2 right-2 flex items-center gap-2">
                <VoiceRecorder
                  onTranscription={(text) => onInputChange(inputMessage + " " + text)}
                  disabled={isLoading}
                />
                
                <Button
                  onClick={onSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  size="sm"
                  className="rounded-xl h-10 w-10 p-0 bg-gradient-to-r from-primary via-purple-500 to-cyan-500 hover:opacity-90 transition-all disabled:opacity-30 shadow-lg fab-pulse"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  ) : (
                    <Send className="h-5 w-5 text-white" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground/50 text-center mt-3 hidden md:block">
            Aimstors Solution AI can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
