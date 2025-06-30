
import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, Bot, User, Plus } from "lucide-react";

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

  // Enhanced AI response formatting
  const formatAIResponse = (content: string) => {
    // Remove all asterisks and clean up the content
    let cleanContent = content
      .replace(/\*\*\*/g, '') // Remove triple asterisks
      .replace(/\*\*/g, '') // Remove double asterisks
      .replace(/\*/g, '') // Remove single asterisks
      .replace(/#+\s*/g, '') // Remove markdown headers
      .trim();

    // Split content into paragraphs
    const paragraphs = cleanContent.split('\n\n').filter(p => p.trim());
    
    return paragraphs.map((paragraph, index) => {
      const trimmedParagraph = paragraph.trim();
      
      // Skip empty paragraphs
      if (!trimmedParagraph) return null;
      
      // Check if it's a numbered list
      if (/^\d+\./.test(trimmedParagraph)) {
        const listItems = trimmedParagraph.split('\n').filter(item => item.trim());
        return (
          <ol key={index} className="list-decimal list-inside space-y-2 mb-4 ml-4">
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
          <ul key={index} className="list-disc list-inside space-y-2 mb-4 ml-4">
            {listItems.map((item, itemIndex) => (
              <li key={itemIndex} className="text-gray-800 leading-relaxed">
                {item.replace(/^[-•]\s*/, '').trim()}
              </li>
            ))}
          </ul>
        );
      }
      
      // Check if it looks like a heading (short line that introduces content)
      if (trimmedParagraph.length < 60 && !trimmedParagraph.endsWith('.') && !trimmedParagraph.endsWith('?') && !trimmedParagraph.endsWith('!')) {
        return (
          <h3 key={index} className="text-lg font-semibold text-gray-900 mb-3 mt-4">
            {trimmedParagraph}
          </h3>
        );
      }
      
      // Check if it contains code (wrapped in backticks)
      if (trimmedParagraph.includes('`')) {
        const parts = trimmedParagraph.split('`');
        return (
          <p key={index} className="mb-4 leading-relaxed text-gray-800">
            {parts.map((part, partIndex) => 
              partIndex % 2 === 1 ? (
                <code key={partIndex} className="bg-gray-100 px-2 py-1 rounded font-mono text-sm text-blue-600">
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
    <div className="flex flex-col h-full bg-white">
      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="max-w-3xl mx-auto px-4 py-6">
            {messages.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Bot className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  How can I help you today?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto mt-8">
                  {[
                    "Explain quantum computing",
                    "Write a creative story",
                    "Help with coding",
                    "Plan a trip"
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => onInputChange(suggestion)}
                      className="p-4 text-left border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-gray-700">{suggestion}</span>
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
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                      }`}>
                        {message.role === 'user' ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>
                      
                      {/* Message Content */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 mb-2">
                          {message.role === 'user' ? 'You' : 'Assistant'}
                        </div>
                        <div className="prose prose-sm max-w-none text-gray-800">
                          {message.role === 'assistant' ? (
                            <div>{formatAIResponse(message.content)}</div>
                          ) : (
                            <p className="whitespace-pre-wrap mb-0">{message.content}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="group">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 mb-2">Assistant</div>
                        <div className="flex items-center space-x-2 text-gray-500">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Thinking...</span>
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

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message ChatGPT..."
              className="min-h-[60px] max-h-32 resize-none border-gray-300 rounded-xl pr-12 focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
              disabled={isLoading}
              rows={1}
            />
            <Button
              onClick={onSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              size="sm"
              className="absolute right-2 bottom-2 h-8 w-8 p-0 rounded-md bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100"
              variant="ghost"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
              ) : (
                <Send className="h-4 w-4 text-gray-600" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            ChatGPT can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
