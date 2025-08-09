
import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, Bot, User, Copy, Play, Code } from "lucide-react";
import { toast } from "sonner";

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
  onKeyPress
}: ChatAreaProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [typingText, setTypingText] = useState("");
  const [showTypingPreview, setShowTypingPreview] = useState(false);

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
          <div key={`code-${index}`} className="my-6 rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
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
            <div className="bg-gray-900 text-gray-100 p-4 overflow-x-auto">
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
    <div className="flex flex-col h-full bg-background transition-colors">
      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="max-w-4xl mx-auto px-4 py-6">
            {messages.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Bot className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-6">
                  Chat Assistant
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                  I'm your intelligent coding companion! I learn from our conversations and provide contextual, 
                  detailed answers with live code examples and step-by-step explanations.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mt-8">
                  {[
                    { icon: "🌐", title: "Build a React website", desc: "Get complete code with explanations" },
                    { icon: "🎨", title: "Design system help", desc: "UI/UX principles and best practices" },
                    { icon: "🔧", title: "Debug my code", desc: "Step-by-step problem solving" },
                    { icon: "📚", title: "Learn new concepts", desc: "Clear explanations with examples" }
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => onInputChange(suggestion.title)}
                      className="p-6 text-left border border-gray-200 dark:border-gray-700 rounded-xl hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 group"
                      aria-label={`Use suggestion: ${suggestion.title} - ${suggestion.desc}`}
                    >
                      <div className="text-2xl mb-2">{suggestion.icon}</div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {suggestion.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{suggestion.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-8 py-4">
                {messages.map((message) => (
                  <div key={message.id} className="group">
                    <div className="flex items-start space-x-4">
                      {/* Avatar */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        message.role === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                      }`}>
                        {message.role === 'user' ? (
                          <User className="h-5 w-5" />
                        ) : (
                          <Bot className="h-5 w-5" />
                        )}
                      </div>
                      
                      {/* Message Content */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                          {message.role === 'user' ? 'You' : 'AI Assistant'}
                          {message.role === 'assistant' && (
                            <span className="ml-2 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                              Enhanced
                            </span>
                          )}
                        </div>
                        <div className="prose prose-sm max-w-none text-gray-800 dark:text-gray-200">
                          {message.role === 'assistant' ? (
                            <div className="space-y-4">{formatAIResponse(message.content)}</div>
                          ) : (
                            <p className="whitespace-pre-wrap mb-0 leading-relaxed">{message.content}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Live typing preview */}
                {isLoading && (
                  <div className="group">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center">
                        <Bot className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                          AI Assistant
                          <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                            Thinking...
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-400">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                          <span className="text-sm">Analyzing context and generating response...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="border-t border-border bg-background">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Send a message..."
              className="min-h-[64px] max-h-40 resize-none rounded-2xl pr-16 text-base leading-relaxed transition-all"
              disabled={isLoading}
              rows={3}
            />
            <Button
              onClick={onSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              size="lg"
              className="absolute right-3 bottom-3 h-10 w-10 p-0 rounded-xl"
              aria-label={isLoading ? "Sending message..." : "Send message"}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
          <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
            <p>Press Enter to send, Shift+Enter for new line</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
