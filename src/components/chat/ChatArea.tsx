import { useRef, useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, Bot, User, Copy, Play, Code, Reply, X, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { VoiceRecorder } from "./VoiceRecorder";
import { MessageSearch } from "./MessageSearch";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
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
}

interface EnhancedMessage extends Message {
  type?: string;
  imageUrl?: string;
  generatedCode?: string;
  language?: string;
}

const ChatArea = ({
  currentConversation,
  messages,
  inputMessage,
  isLoading,
  onInputChange,
  onSendMessage,
  onKeyPress,
  onRefresh
}: ChatAreaProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [typingText, setTypingText] = useState("");
  const [showTypingPreview, setShowTypingPreview] = useState(false);
  const [selectedText, setSelectedText] = useState("");
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
  }, [messages, showTypingPreview]);

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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy text");
    }
  };

  const handleTextSelection = (messageId: string) => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();
    
    if (selectedText && selectedText.length > 0) {
      setSelectedText("");
      setTimeout(() => {
        setSelectedText(selectedText);
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
          messageElement.setAttribute('data-has-selection', 'true');
        }
      }, 50);
    } else {
      setSelectedText("");
      document.querySelectorAll('[data-has-selection]').forEach(el => {
        el.removeAttribute('data-has-selection');
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = () => {
      if (!window.getSelection()?.toString()) {
        setSelectedText("");
        document.querySelectorAll('[data-has-selection]').forEach(el => {
          el.removeAttribute('data-has-selection');
        });
      }
    };

    document.addEventListener('mouseup', handleClickOutside);
    return () => document.removeEventListener('mouseup', handleClickOutside);
  }, []);

  const replyToSelection = (text: string, messageId: string) => {
    setReplyingTo({ text, messageId });
    onInputChange(`Regarding: "${text}"\n\n`);
    textareaRef.current?.focus();
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

  // Enhanced AI response formatting with react-markdown
  const formatAIResponse = (content: string, isLive = false) => {
    if (isLive) {
      return (
        <div className="text-muted-foreground italic">
          <span className="inline-block w-2 h-4 bg-primary animate-pulse mr-1"></span>
          {content}
        </div>
      );
    }

    return (
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Custom code block renderer with syntax highlighting
            code(props: any) {
              const { node, inline, className, children, ...rest } = props;
              const match = /language-(\w+)/.exec(className || '');
              const language = match ? match[1] : 'text';
              const codeString = String(children).replace(/\n$/, '');
              
              return !inline ? (
                <div className="my-4 rounded-lg border border-border overflow-hidden shadow-sm">
                  <div className="bg-muted px-4 py-2 border-b border-border flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Code className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground capitalize">
                        {language}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(codeString)}
                      className="h-8 px-2 hover:bg-background"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <SyntaxHighlighter
                    language={language}
                    style={vscDarkPlus}
                    customStyle={{
                      margin: '0',
                      padding: '1rem',
                      background: 'hsl(var(--secondary))',
                      fontSize: '0.875rem',
                    } as any}
                    showLineNumbers={codeString.split('\n').length > 10}
                    wrapLines={true}
                  >
                    {codeString}
                  </SyntaxHighlighter>
                </div>
              ) : (
                <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary border border-border">
                  {children}
                </code>
              );
            },
            // Custom heading renderers
            h1: ({ children }) => (
              <h1 className="text-3xl font-bold text-foreground mt-6 mb-4 pb-2 border-b border-border">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-2xl font-bold text-foreground mt-5 mb-3">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-xl font-semibold text-foreground mt-4 mb-2">
                {children}
              </h3>
            ),
            // Custom paragraph renderer
            p: ({ children }) => (
              <p className="mb-4 leading-relaxed text-foreground">
                {children}
              </p>
            ),
            // Custom list renderers
            ul: ({ children }) => (
              <ul className="list-disc list-inside space-y-2 mb-4 ml-4 text-foreground">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside space-y-2 mb-4 ml-4 text-foreground">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="leading-relaxed">
                {children}
              </li>
            ),
            // Custom blockquote renderer
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-primary pl-4 py-2 my-4 bg-muted/50 rounded-r-lg italic text-muted-foreground">
                {children}
              </blockquote>
            ),
            // Custom link renderer
            a: ({ href, children }) => (
              <a 
                href={href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                {children}
              </a>
            ),
            // Custom horizontal rule
            hr: () => (
              <hr className="my-6 border-t border-border" />
            ),
            // Custom table renderers
            table: ({ children }) => (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full divide-y divide-border">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-muted">
                {children}
              </thead>
            ),
            th: ({ children }) => (
              <th className="px-4 py-2 text-left text-sm font-semibold text-foreground">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-4 py-2 text-sm text-foreground border-t border-border">
                {children}
              </td>
            ),
            // Custom strong/bold renderer
            strong: ({ children }) => (
              <strong className="font-bold text-foreground">
                {children}
              </strong>
            ),
            // Custom em/italic renderer
            em: ({ children }) => (
              <em className="italic text-foreground">
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

  return (
    <div className="h-full w-full flex flex-col bg-background">
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
          className="absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200 pointer-events-none"
          style={{ 
            height: `${pullDistance}px`,
            opacity: isPulling ? 1 : 0,
          }}
        >
          <div className={`flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 transition-transform duration-200 ${
            pullDistance >= PULL_THRESHOLD ? 'scale-110' : 'scale-100'
          }`}>
            <RefreshCw 
              className={`h-5 w-5 text-primary transition-transform duration-300 ${
                isRefreshing ? 'animate-spin' : pullDistance >= PULL_THRESHOLD ? 'rotate-180' : ''
              }`} 
            />
          </div>
        </div>
        
        <div 
          className="max-w-5xl mx-auto px-4 py-8 transition-transform duration-200 relative"
          style={{ 
            transform: `translateY(${pullDistance > 0 ? pullDistance : 0}px)`,
          }}
        >
          {/* Ambient background orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 -left-20 w-72 h-72 bg-gradient-to-br from-primary/20 via-purple-500/20 to-transparent rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-40 -right-20 w-96 h-96 bg-gradient-to-tl from-pink-500/20 via-primary/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          {/* Search Bar */}
          {messages.length > 0 && (
            <div className="relative mb-6 animate-fade-in">
              <MessageSearch onSearch={setSearchQuery} onClear={handleSearchClear} />
            </div>
          )}

          {messages.length === 0 ? (
            <div className="text-center py-16 relative">
              {/* Hero Bot Icon */}
              <div className="relative inline-block mb-8 animate-scale-in">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-purple-500 to-pink-500 rounded-full blur-2xl opacity-50 animate-pulse" />
                <div className="relative w-24 h-24 bg-gradient-to-br from-primary via-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto shadow-2xl backdrop-blur-xl border border-white/20">
                  <Bot className="h-12 w-12 text-white drop-shadow-lg" />
                </div>
              </div>
              
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent animate-fade-in">
                AI Chat Assistant
              </h2>
              
              <div className="max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-purple-500/30 to-pink-500/30 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500" />
                  <div className="relative bg-background/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-lg">
                    <p className="text-muted-foreground leading-relaxed">
                      I'm your intelligent coding companion! I learn from our conversations and provide contextual, 
                      detailed answers with <span className="text-primary font-semibold">live code examples</span> and step-by-step explanations.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Suggestion Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                {[
                  { 
                    icon: "🌐", 
                    title: "Build a React website", 
                    desc: "Get complete code with explanations",
                    gradient: "from-blue-500/10 to-cyan-500/10",
                    border: "border-blue-500/30",
                    glow: "group-hover:shadow-blue-500/25"
                  },
                  { 
                    icon: "🎨", 
                    title: "Design system help", 
                    desc: "UI/UX principles and best practices",
                    gradient: "from-purple-500/10 to-pink-500/10",
                    border: "border-purple-500/30",
                    glow: "group-hover:shadow-purple-500/25"
                  },
                  { 
                    icon: "🔧", 
                    title: "Debug my code", 
                    desc: "Step-by-step problem solving",
                    gradient: "from-orange-500/10 to-red-500/10",
                    border: "border-orange-500/30",
                    glow: "group-hover:shadow-orange-500/25"
                  },
                  { 
                    icon: "📚", 
                    title: "Learn new concepts", 
                    desc: "Clear explanations with examples",
                    gradient: "from-green-500/10 to-emerald-500/10",
                    border: "border-green-500/30",
                    glow: "group-hover:shadow-green-500/25"
                  }
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => onInputChange(suggestion.title)}
                    className={`group relative bg-gradient-to-br ${suggestion.gradient} backdrop-blur-sm border ${suggestion.border} rounded-2xl p-6 text-left hover:scale-105 transition-all duration-300 hover:shadow-2xl ${suggestion.glow} animate-fade-in`}
                    style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                  >
                    <div className="text-4xl mb-3">{suggestion.icon}</div>
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {suggestion.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {suggestion.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  data-message-id={message.id}
                  className={`flex gap-4 group animate-fade-in ${
                    message.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'
                  }`}
                  onMouseUp={() => handleTextSelection(message.id)}
                >
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                    message.role === 'assistant' 
                      ? 'bg-gradient-to-br from-primary via-purple-500 to-pink-500' 
                      : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                  }`}>
                    {message.role === 'assistant' ? (
                      <Bot className="h-5 w-5 text-white" />
                    ) : (
                      <User className="h-5 w-5 text-white" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={`flex-1 min-w-0 ${message.role === 'user' ? 'flex justify-end' : ''}`}>
                    <div className={`inline-block max-w-[85%] rounded-2xl shadow-md border border-border ${
                      message.role === 'assistant'
                        ? 'bg-background/80 backdrop-blur-sm'
                        : 'bg-primary text-primary-foreground'
                    } px-5 py-4`}>
                      {message.role === 'assistant' ? (
                        formatAIResponse(message.content)
                      ) : (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-4 animate-fade-in">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-primary via-purple-500 to-pink-500 shadow-lg">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 bg-background/80 backdrop-blur-sm rounded-2xl px-5 py-4 shadow-md border border-border">
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="flex-none pb-4 relative">
        {/* Gradient fade overlay */}
        <div className="absolute bottom-4 left-0 right-0 h-20 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
        
        <div className="max-w-5xl mx-auto px-4 relative">
          {replyingTo && (
            <div className="mb-2 flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-t-xl border border-border border-b-0">
              <Reply className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground flex-1 truncate">
                Replying to: "{replyingTo.text}"
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearReplyContext}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          <div className="relative bg-background/95 backdrop-blur-xl rounded-2xl border border-border shadow-2xl">
            <Textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything... (Shift+Enter for new line)"
              className="min-h-[60px] max-h-[200px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 pr-24 text-base"
              disabled={isLoading}
            />
            
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <VoiceRecorder
                onTranscription={(text) => onInputChange(inputMessage + " " + text)}
                disabled={isLoading}
              />
              
              <Button
                onClick={onSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                size="sm"
                className="rounded-xl h-10 px-4 bg-gradient-to-r from-primary via-purple-500 to-pink-500 hover:opacity-90 transition-all shadow-lg"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-2">
            Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Enter</kbd> to send, 
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs ml-1">Shift + Enter</kbd> for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
