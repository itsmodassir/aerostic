
import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, Bot, User } from "lucide-react";

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
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">AI Chat Assistant</h1>
            <p className="text-sm text-gray-600">Powered by Google Gemini</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <Bot className="h-16 w-16 text-primary mx-auto mb-6" />
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                  Welcome to AI Chat Assistant
                </h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Start the conversation by typing a message below. I'm here to help with questions, creative tasks, and more!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  {[
                    "Hello! How can you help me today?",
                    "What are your main capabilities?",
                    "Help me write a professional email",
                    "Explain a complex topic simply"
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => onInputChange(suggestion)}
                      className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 rounded-xl text-sm transition-all border border-gray-200 hover:border-primary/30 text-left hover:shadow-md"
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
                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                          message.role === 'user'
                            ? 'bg-primary text-white ml-4'
                            : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white mr-4'
                        }`}
                      >
                        {message.role === 'user' ? (
                          <User className="h-5 w-5" />
                        ) : (
                          <Bot className="h-5 w-5" />
                        )}
                      </div>
                      <div
                        className={`rounded-2xl p-5 ${
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
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white mr-4 flex items-center justify-center">
                        <Bot className="h-5 w-5" />
                      </div>
                      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center space-x-3">
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
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
          </div>
        </ScrollArea>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="flex-shrink-0 border-t border-gray-200 bg-white p-6">
        <div className="flex space-x-4">
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
              className="min-h-[50px] max-h-32 resize-none border-gray-300 focus:border-primary focus:ring-primary bg-white rounded-xl"
              disabled={isLoading}
              rows={1}
            />
          </div>
          <Button
            onClick={onSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            size="lg"
            className="h-[50px] px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-3 text-center">
          AI responses are generated and may not always be accurate. Use with discretion.
        </p>
      </div>
    </div>
  );
};

export default ChatArea;
