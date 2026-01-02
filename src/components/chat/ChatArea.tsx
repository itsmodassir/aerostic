import { useRef, useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Bot, User, Reply, X, RefreshCw, Sparkles } from "lucide-react";
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
  
  // Pull-to-refresh state
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const scrollTop = useRef(0);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  
  const PULL_THRESHOLD = 80;

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

  // Gemini-style AI response formatting with expandable code blocks
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
              <h1 className="text-xl md:text-2xl font-semibold text-foreground mt-5 mb-3 first:mt-0 animate-fade-in">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-lg md:text-xl font-semibold text-foreground mt-4 mb-2 animate-fade-in">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-base md:text-lg font-medium text-foreground mt-3 mb-2 animate-fade-in">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="mb-3 last:mb-0 text-foreground/85 animate-fade-in">
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
              <li className="flex items-start gap-2 animate-fade-in">
                <span className="text-primary mt-2 flex-shrink-0">•</span>
                <span className="flex-1">{children}</span>
              </li>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-3 border-primary/50 pl-4 py-1 my-3 text-foreground/70 italic bg-primary/5 rounded-r-lg animate-fade-in">
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
              <div className="overflow-x-auto my-3 rounded-lg border border-border/50 animate-fade-in">
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

  return (
    <div className="h-full w-full flex flex-col bg-background relative">
      {/* Messages Area - Scrollable */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto relative"
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
          <div className={`flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 transition-transform duration-200 ${
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
            <div className="relative mb-4 animate-fade-in">
              <MessageSearch onSearch={setSearchQuery} onClear={handleSearchClear} />
            </div>
          )}

          {messages.length === 0 ? (
            <div className="text-center py-8 md:py-16 relative">
              {/* Hero Bot Icon with gradient glow */}
              <div className="relative inline-block mb-6 md:mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-primary/10 rounded-full blur-2xl opacity-60 animate-pulse" />
                <div className="relative w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto shadow-lg animate-scale-in">
                  <Sparkles className="h-8 w-8 md:h-10 md:w-10 text-primary-foreground" />
                </div>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-semibold mb-3 text-foreground animate-fade-in" style={{ animationDelay: '0.1s' }}>
                Hi, how can I help you today?
              </h2>
              
              <p className="text-muted-foreground text-sm md:text-base mb-8 max-w-md mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
                I can help you with coding, design, explanations, and more.
              </p>
              
              {/* Suggestion Cards - Gemini style with staggered animation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 max-w-xl mx-auto">
                {[
                  { icon: "💻", title: "Write code for me", desc: "Any language or framework" },
                  { icon: "🎨", title: "Help with design", desc: "UI/UX best practices" },
                  { icon: "🔍", title: "Explain a concept", desc: "Simple explanations" },
                  { icon: "🐛", title: "Debug my code", desc: "Find and fix issues" }
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => onInputChange(suggestion.title)}
                    className="group flex items-center gap-3 p-3 md:p-4 rounded-xl border border-border/60 bg-card/50 hover:bg-card hover:border-primary/30 hover:shadow-md transition-all duration-300 text-left animate-fade-in"
                    style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                  >
                    <span className="text-xl md:text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">{suggestion.icon}</span>
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                        {suggestion.title}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {suggestion.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4 md:space-y-5">
              {filteredMessages.map((message, index) => (
                <div
                  key={message.id}
                  data-message-id={message.id}
                  className={`flex gap-2.5 md:gap-3 group animate-fade-in ${
                    message.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'
                  }`}
                  style={{ animationDelay: `${Math.min(index * 0.05, 0.3)}s` }}
                >
                  {/* Avatar - Gemini style */}
                  <div className={`flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 ${
                    message.role === 'assistant' 
                      ? 'bg-gradient-to-br from-primary/20 to-primary/10' 
                      : 'bg-muted'
                  }`}>
                    {message.role === 'assistant' ? (
                      <Bot className="h-4 w-4 md:h-4.5 md:w-4.5 text-primary" />
                    ) : (
                      <User className="h-4 w-4 md:h-4.5 md:w-4.5 text-muted-foreground" />
                    )}
                  </div>

                  {/* Message Content - Clean Gemini style */}
                  <div className={`flex-1 min-w-0 ${message.role === 'user' ? 'flex flex-col items-end' : ''}`}>
                    {/* Timestamp */}
                    <span className="text-[10px] text-muted-foreground/60 mb-1 block">
                      {formatTime(message.created_at)}
                    </span>
                    
                    <div className={`inline-block max-w-[90%] md:max-w-[85%] rounded-2xl ${
                      message.role === 'assistant'
                        ? 'bg-transparent'
                        : 'bg-muted/80 px-4 py-2.5'
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
                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words text-foreground">
                          {message.content}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Enhanced Loading Indicator */}
              {isLoading && (
                <div className="flex gap-2.5 md:gap-3 animate-fade-in">
                  <div className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
                    <Bot className="h-4 w-4 md:h-4.5 md:w-4.5 text-primary animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-muted-foreground py-2">
                      <div className="flex gap-1.5">
                        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                      <span className="text-xs text-muted-foreground/60">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Tools Menu - Floating button */}
      <ToolsMenu />

      {/* Input Area - Fixed at bottom - Gemini style */}
      <div className="flex-none pb-3 md:pb-4 pt-2 relative bg-background">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 md:px-6 relative">
          {replyingTo && (
            <div className="mb-2 flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-t-xl border border-border border-b-0 animate-fade-in">
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

          <div className="relative bg-muted/50 rounded-full border border-border/60 shadow-sm hover:shadow-md focus-within:shadow-md focus-within:border-primary/30 transition-all duration-200">
            <Textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              className="min-h-[48px] max-h-[120px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 pr-20 pl-4 py-3 text-[15px] rounded-full"
              disabled={isLoading}
              rows={1}
            />
            
            <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1.5">
              <VoiceRecorder
                onTranscription={(text) => onInputChange(inputMessage + " " + text)}
                disabled={isLoading}
              />
              
              <Button
                onClick={onSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                size="sm"
                className="rounded-full h-9 w-9 p-0 bg-primary hover:bg-primary/90 transition-all disabled:opacity-30"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground/60 text-center mt-2 hidden md:block">
            Aerostic AI can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
