
import { useRef, useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, Bot, User, Copy, Play, Code, Reply, X, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { VoiceRecorder } from "./VoiceRecorder";
import { MessageSearch } from "./MessageSearch";

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
      // Clear previous selection state
      setSelectedText("");
      
      // Set new selection with delay to prevent flicker
      setTimeout(() => {
        setSelectedText(selectedText);
        // Store which message this selection belongs to
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
          messageElement.setAttribute('data-has-selection', 'true');
        }
      }, 50);
    } else {
      // Clear selection if nothing is selected
      setSelectedText("");
      document.querySelectorAll('[data-has-selection]').forEach(el => {
        el.removeAttribute('data-has-selection');
      });
    }
  };

  // Clear selection when clicking elsewhere
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
    
    // Only allow pull if at the top of the scroll
    if (currentScrollTop <= 0 && pullDistance > 0) {
      setIsPulling(true);
      setPullDistance(Math.min(pullDistance * 0.5, PULL_THRESHOLD + 20));
      
      // Prevent default scroll behavior
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
      
      // Trigger refresh callback
      if (onRefresh) {
        await onRefresh();
      }
      
      // Simulate minimum refresh time for better UX
      setTimeout(() => {
        setIsRefreshing(false);
        toast.success("Messages refreshed!");
      }, 1000);
    }
    
    setIsPulling(false);
    setPullDistance(0);
  };

  const extractCode = (content: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const matches = [];
    let match;
    
    while ((match = codeBlockRegex.exec(content)) !== null) {
      matches.push({
        language: match[1] || 'text',
        code: match[2].trim()
      });
    }
    
    return matches;
  };

  // Enhanced AI response formatting with live preview support
  const formatAIResponse = (content: string, isLive = false) => {
    if (isLive) {
      return (
        <div className="text-gray-600 italic">
          <span className="inline-block w-2 h-4 bg-blue-500 animate-pulse mr-1"></span>
          {content}
        </div>
      );
    }

    // Clean content
    let cleanContent = content
      .replace(/\*\*\*/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .split('\n')
      .map(line => line.replace(/^#{1,6}\s*/, '')) // remove markdown heading markers like #, ##, etc.
      .join('\n')
      .trim();

    // Extract code blocks first
    const codeBlocks = extractCode(cleanContent);
    
    // Remove code blocks from content for paragraph processing
    const contentWithoutCode = cleanContent.replace(/```(\w+)?\n([\s\S]*?)```/g, '{{CODE_BLOCK}}');
    
    // Split content into paragraphs
    const paragraphs = contentWithoutCode.split('\n\n').filter(p => p.trim());
    let codeBlockIndex = 0;
    
    return paragraphs.map((paragraph, index) => {
      const trimmedParagraph = paragraph.trim();
      
      // Skip empty paragraphs
      if (!trimmedParagraph) return null;
      
      // Replace code block placeholder
      if (trimmedParagraph === '{{CODE_BLOCK}}') {
        const codeBlock = codeBlocks[codeBlockIndex++];
        if (!codeBlock) return null;
        
        return (
          <div key={`code-${crypto.randomUUID()}`} className="my-6 rounded-lg border border-border dark:border-border overflow-hidden">
            <div className="bg-muted px-4 py-2 border-b border-border flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Code className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {codeBlock.language}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(codeBlock.code)}
                  className="h-8 px-2"
                  aria-label={`Copy ${codeBlock.language} code to clipboard`}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="bg-secondary-foreground text-secondary p-4 overflow-x-auto">
              <pre className="text-sm">
                <code>{codeBlock.code}</code>
              </pre>
            </div>
          </div>
        );
      }
      
      // Check if it's a numbered list
      if (/^\d+\./.test(trimmedParagraph)) {
        const listItems = trimmedParagraph.split('\n').filter(item => item.trim());
        return (
          <ol key={index} className="list-decimal list-inside space-y-3 mb-6 ml-4">
            {listItems.map((item, itemIndex) => (
              <li key={itemIndex} className="text-gray-800 leading-relaxed">
                {item.replace(/^\d+\.\s*/, '')}
              </li>
            ))}
          </ol>
        );
      }
      
      // Check if it's a bullet list
      if (trimmedParagraph.includes('- ') || trimmedParagraph.includes('• ')) {
        const listItems = trimmedParagraph.split('\n').filter(item => 
          item.trim() && (item.includes('- ') || item.includes('• '))
        );
        return (
          <ul key={index} className="list-disc list-inside space-y-2 mb-6 ml-4">
            {listItems.map((item, itemIndex) => (
              <li key={itemIndex} className="text-gray-800 leading-relaxed">
                {item.replace(/^[-•]\s*/, '').trim()}
              </li>
            ))}
          </ul>
        );
      }
      
      // Check if it looks like a heading
      if (trimmedParagraph.length < 80 && !trimmedParagraph.endsWith('.') && 
          !trimmedParagraph.endsWith('?') && !trimmedParagraph.endsWith('!') &&
          (trimmedParagraph.includes(':') || trimmedParagraph.match(/^[A-Z][^.!?]*$/))) {
        return (
          <h3 key={index} className="text-xl font-bold text-gray-900 mb-4 mt-6 border-b border-gray-200 pb-2">
            {trimmedParagraph.replace(':', '')}
          </h3>
        );
      }
      
      // Check if it contains inline code
      if (trimmedParagraph.includes('`')) {
        const parts = trimmedParagraph.split('`');
        return (
          <p key={index} className="mb-4 leading-relaxed text-gray-800">
            {parts.map((part, partIndex) => 
              partIndex % 2 === 1 ? (
                <code key={partIndex} className="bg-gray-100 px-2 py-1 rounded font-mono text-sm text-blue-600 border">
                  {part}
                </code>
              ) : (
                part
              )
            )}
          </p>
        );
      }
      
      // Regular paragraph
      return (
        <p key={index} className="mb-4 leading-relaxed text-gray-800">
          {trimmedParagraph}
        </p>
      );
    }).filter(Boolean);
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

          {/* Search Bar with Glass Effect */}
          {messages.length > 0 && (
            <div className="relative mb-6 animate-fade-in">
              <MessageSearch onSearch={setSearchQuery} onClear={handleSearchClear} />
            </div>
          )}

          {messages.length === 0 ? (
            <div className="text-center py-16 relative">
              {/* Hero Bot Icon with Glow */}
              <div className="relative inline-block mb-8 animate-scale-in">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-purple-500 to-pink-500 rounded-full blur-2xl opacity-50 animate-pulse" />
                <div className="relative w-24 h-24 bg-gradient-to-br from-primary via-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto shadow-2xl backdrop-blur-xl border border-white/20">
                  <Bot className="h-12 w-12 text-white drop-shadow-lg" />
                </div>
              </div>
              
              {/* Title with Gradient */}
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent animate-fade-in">
                AI Chat Assistant
              </h2>
              
              {/* Description with Glass Card */}
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
              
              {/* Premium Suggestion Cards */}
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
                    className={`group relative text-left transition-all duration-300 hover:scale-105 animate-fade-in`}
                    style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                    aria-label={`Use suggestion: ${suggestion.title} - ${suggestion.desc}`}
                  >
                    {/* Glow effect */}
                    <div className={`absolute -inset-0.5 bg-gradient-to-r ${suggestion.gradient} rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300 ${suggestion.glow}`} />
                    
                    {/* Glass card */}
                    <div className={`relative bg-background/80 backdrop-blur-xl border ${suggestion.border} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300`}>
                      <div className="flex items-start gap-4">
                        {/* Icon with glass background */}
                        <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${suggestion.gradient} backdrop-blur-sm rounded-xl flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform duration-300`}>
                          {suggestion.icon}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                            {suggestion.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {suggestion.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 py-4">
              {searchQuery && filteredMessages.length === 0 && (
                <div className="text-center py-12 animate-fade-in">
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-muted/50 backdrop-blur-sm rounded-full border border-border/50">
                    <span className="text-sm text-muted-foreground">No messages found matching</span>
                    <span className="text-sm font-semibold text-primary">"{searchQuery}"</span>
                  </div>
                </div>
              )}
              {filteredMessages.map((message) => (
                <div key={message.id} className="group animate-fade-in">
                  <div className="flex items-start space-x-4">
                    {/* Premium Avatar with Glow */}
                    <div className="relative flex-shrink-0">
                      <div className={`absolute inset-0 rounded-full blur-md ${
                        message.role === 'user' 
                          ? 'bg-blue-500/50' 
                          : 'bg-gradient-to-br from-purple-500/50 to-pink-500/50'
                      } opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                      <div className={`relative w-11 h-11 rounded-full flex items-center justify-center shadow-lg ${
                        message.role === 'user' 
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' 
                          : 'bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 text-white'
                      }`}>
                        {message.role === 'user' ? (
                          <User className="h-5 w-5" />
                        ) : (
                          <Bot className="h-5 w-5" />
                        )}
                      </div>
                    </div>
                    
                    {/* Glass Message Bubble */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">
                            {message.role === 'user' ? 'You' : 'AI Assistant'}
                          </span>
                          {message.role === 'assistant' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full border border-green-500/20">
                              <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                              Enhanced
                            </span>
                          )}
                        </div>
                        
                        {/* Message Actions */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(message.content)}
                            className="h-7 w-7 p-0 hover:bg-muted/50 rounded-lg"
                            aria-label="Copy message"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Message Content with Glass Background */}
                      <div className="relative group/message">
                        <div className={`relative ${
                          message.role === 'assistant' 
                            ? 'bg-muted/30 backdrop-blur-sm border border-border/50 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow' 
                            : ''
                        }`}>
                          <div 
                            className="prose prose-sm max-w-none dark:prose-invert select-text"
                            data-message-id={message.id}
                            onMouseUp={() => handleTextSelection(message.id)}
                          >
                            {message.role === 'assistant' ? (
                              <div className="space-y-3">{formatAIResponse(message.content)}</div>
                            ) : (
                              <p className="whitespace-pre-wrap mb-0 leading-relaxed text-foreground">{message.content}</p>
                            )}
                          </div>
                        </div>
                        
                        {/* Reply to Selection - Premium Chip */}
                        {selectedText && (
                          <div className="mt-3 animate-scale-in">
                            <div className="relative group/reply">
                              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-xl blur opacity-50 group-hover/reply:opacity-100 transition duration-300" />
                              <div className="relative bg-blue-500/10 backdrop-blur-sm border border-blue-500/30 rounded-xl p-3">
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <Reply className="h-3 w-3 text-blue-500" />
                                      <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400">SELECTED TEXT</span>
                                    </div>
                                    <p className="text-sm text-blue-700 dark:text-blue-300 truncate font-medium">"{selectedText}"</p>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => replyToSelection(selectedText, message.id)}
                                    className="h-8 gap-1.5 border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400"
                                  >
                                    <Reply className="h-3 w-3" />
                                    Reply
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Enhanced typing indicator */}
              {isLoading && (
                <div className="group animate-fade-in">
                  <div className="flex items-start space-x-4">
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-full blur-xl opacity-75 animate-pulse" />
                      <div className="relative w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 text-white flex items-center justify-center shadow-xl">
                        <Bot className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-semibold text-foreground">AI Assistant</span>
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full shadow-lg animate-pulse">
                          <Loader2 className="h-2.5 w-2.5 animate-spin" />
                          Thinking
                        </span>
                      </div>
                      <div className="relative max-w-md">
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur" />
                        <div className="relative bg-muted/50 backdrop-blur-xl border border-border/50 rounded-3xl px-5 py-4 shadow-lg">
                          <div className="flex items-center gap-3">
                            <div className="flex gap-1.5">
                              <div className="w-2.5 h-2.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce shadow-lg" />
                              <div className="w-2.5 h-2.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0.15s' }} />
                              <div className="w-2.5 h-2.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0.3s' }} />
                            </div>
                            <span className="text-xs text-muted-foreground font-medium">Generating response...</span>
                          </div>
                        </div>
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

      {/* Input Area - Sleek Floating Design */}
      <div className="flex-none pb-4 relative">
        {/* Gradient overlay for depth */}
        <div className="absolute inset-x-0 bottom-4 h-24 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
        
        <div className="max-w-3xl mx-auto px-4 py-3 relative">
          {/* Reply Context Chip - Compact */}
          {replyingTo && (
            <div className="mb-2 inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 backdrop-blur-sm rounded-full border border-primary/20 animate-scale-in">
              <Reply className="h-3 w-3 text-primary" />
              <span className="text-xs text-primary font-medium truncate max-w-[200px]">
                "{replyingTo.text}"
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearReplyContext}
                className="h-5 w-5 p-0 hover:bg-primary/20 rounded-full"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          
          {/* Main Input Container - Premium Glass Effect */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-purple-500/30 to-pink-500/30 rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative bg-background/95 backdrop-blur-xl rounded-3xl border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <Textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={replyingTo ? "Continue your reply..." : "Type your message..."}
                className="w-full min-h-[52px] max-h-32 resize-none bg-transparent border-0 px-5 py-3.5 pr-28 text-sm leading-relaxed placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:outline-none"
                disabled={isLoading}
                rows={1}
              />
              
              {/* Action Buttons - Sleek Pills */}
              <div className="absolute right-2 bottom-2 flex items-center gap-1.5">
                <div className="flex items-center bg-muted/50 rounded-2xl p-1 backdrop-blur-sm">
                  <VoiceRecorder
                    onTranscription={(text) => onInputChange(inputMessage + (inputMessage ? ' ' : '') + text)}
                    disabled={isLoading}
                  />
                  
                  <div className="w-px h-5 bg-border/50 mx-1" />
                  
                  <Button
                    onClick={onSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    size="sm"
                    className="h-8 w-8 p-0 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={isLoading ? "Sending message..." : "Send message"}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Helper Text - Ultra Compact */}
          <div className="flex items-center justify-center gap-3 mt-2 px-4">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/70">
              <div className="w-1 h-1 rounded-full bg-muted-foreground/40" />
              <span>Enter to send</span>
            </div>
            <div className="w-px h-3 bg-border/30" />
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/70">
              <div className="w-1 h-1 rounded-full bg-muted-foreground/40" />
              <span>Shift+Enter for new line</span>
            </div>
            {replyingTo && (
              <>
                <div className="w-px h-3 bg-border/30" />
                <div className="flex items-center gap-1.5 text-[10px] text-primary/80 font-medium">
                  <div className="w-1 h-1 rounded-full bg-primary/60 animate-pulse" />
                  <span>Replying</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
