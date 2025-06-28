
import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, Bot, User, AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-focus textarea
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

  // Format AI response with proper structure and organization
  const formatAIResponse = (content: string) => {
    // Split content into paragraphs and format properly
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    
    return paragraphs.map((paragraph, index) => {
      const trimmedParagraph = paragraph.trim();
      
      // Check if it's a list item
      if (trimmedParagraph.startsWith('- ') || trimmedParagraph.startsWith('• ') || /^\d+\./.test(trimmedParagraph)) {
        const listItems = trimmedParagraph.split('\n').filter(item => item.trim());
        return (
          <ul key={index} className="list-disc list-inside space-y-1 mb-4">
            {listItems.map((item, itemIndex) => (
              <li key={itemIndex} className="text-gray-800">
                {item.replace(/^[-•]\s*/, '').replace(/^\d+\.\s*/, '')}
              </li>
            ))}
          </ul>
        );
      }
      
      // Check if it's a heading (starts with #)
      if (trimmedParagraph.startsWith('#')) {
        const level = trimmedParagraph.match(/^#+/)?.[0].length || 1;
        const text = trimmedParagraph.replace(/^#+\s*/, '');
        const HeadingTag = `h${Math.min(level + 1, 6)}` as keyof JSX.IntrinsicElements;
        return (
          <HeadingTag key={index} className="font-semibold text-gray-900 mb-2 mt-4">
            {text}
          </HeadingTag>
        );
      }
      
      // Check if it's code (wrapped in backticks)
      if (trimmedParagraph.includes('`')) {
        const parts = trimmedParagraph.split('`');
        return (
          <p key={index} className="mb-4 leading-relaxed text-gray-800">
            {parts.map((part, partIndex) => 
              partIndex % 2 === 1 ? (
                <code key={partIndex} className="bg-gray-100 px-2 py-1 rounded font-mono text-sm">
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
    });
  };

  return (
    <Card className="lg:col-span-3 flex flex-col h-full">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          AI Chat Assistant
        </CardTitle>
        <p className="text-sm text-gray-600">
          Start typing below to begin your conversation with AI
        </p>
      </CardHeader>
      
      <CardContent className="p-0 flex flex-col flex-1 min-h-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Ready to chat!
              </h3>
              <p className="text-gray-600 mb-6">
                Start the conversation by typing a message below. No need to create a new chat - just start typing!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {[
                  "Hello! How can you help me today?",
                  "What are your capabilities?",
                  "Explain quantum computing in simple terms",
                  "Help me write a professional email"
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => onInputChange(suggestion)}
                    className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 rounded-lg text-sm transition-all border border-gray-200 hover:border-primary/30 text-left"
                  >
                    <span className="font-medium text-gray-700">{suggestion}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`flex max-w-[85%] ${
                      message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === 'user'
                          ? 'bg-primary text-white ml-3'
                          : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white mr-3'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div
                      className={`rounded-2xl p-4 ${
                        message.role === 'user'
                          ? 'bg-primary text-white'
                          : 'bg-white border border-gray-200 shadow-sm'
                      }`}
                    >
                      <div className="text-sm">
                        {message.role === 'assistant' ? (
                          <div className="prose prose-sm max-w-none">
                            {formatAIResponse(message.content)}
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        )}
                      </div>
                      <p className={`text-xs mt-3 opacity-70 ${
                        message.role === 'user' ? 'text-white' : 'text-gray-500'
                      }`}>
                        {new Date(message.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex flex-row">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white mr-3 flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center space-x-3">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100"></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200"></div>
                        </div>
                        <span className="text-sm text-gray-600">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input Area - Always visible */}
        <div className="border-t p-4 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex space-x-3">
            <div className="flex-1">
              <Textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
                className="min-h-[44px] max-h-32 resize-none border-gray-300 focus:border-primary focus:ring-primary bg-white"
                disabled={isLoading}
                rows={1}
              />
            </div>
            <Button
              onClick={onSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              size="sm"
              className="h-[44px] px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            AI responses are generated and may not always be accurate. Use with discretion.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatArea;
