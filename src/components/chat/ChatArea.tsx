
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

  // Auto-focus textarea when conversation is selected
  useEffect(() => {
    if (currentConversation && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [currentConversation]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputMessage.trim() && !isLoading) {
        onSendMessage();
      }
    }
  };

  // Format AI response with proper line breaks and structure
  const formatMessage = (content: string) => {
    return content
      .split('\n')
      .map((line, index) => (
        <span key={index}>
          {line}
          {index < content.split('\n').length - 1 && <br />}
        </span>
      ));
  };

  return (
    <Card className="lg:col-span-3 flex flex-col h-full">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          {currentConversation ? 'AI Chat Assistant' : 'Select or start a conversation'}
        </CardTitle>
        {currentConversation && (
          <p className="text-sm text-gray-600">
            Ask me anything! I'm here to help with information, explanations, and friendly conversation.
          </p>
        )}
      </CardHeader>
      
      <CardContent className="p-0 flex flex-col flex-1 min-h-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          {!currentConversation ? (
            <div className="text-center py-12">
              <Bot className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Welcome to AI Chat!
              </h3>
              <p className="text-gray-500 mb-4 max-w-md mx-auto">
                Start a new conversation or select an existing one from the sidebar to begin chatting with your AI assistant.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg mx-auto text-sm">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <strong className="text-blue-700">💡 Ask questions</strong>
                  <p className="text-blue-600 mt-1">Get explanations on any topic</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <strong className="text-green-700">🤝 Get help</strong>
                  <p className="text-green-600 mt-1">Assistance with tasks and problems</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <strong className="text-purple-700">💬 Have conversations</strong>
                  <p className="text-purple-600 mt-1">Friendly chat and discussions</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <strong className="text-orange-700">📝 Get creative</strong>
                  <p className="text-orange-600 mt-1">Writing help and brainstorming</p>
                </div>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Ready to chat!
              </h3>
              <p className="text-gray-600 mb-4">
                Start the conversation by typing a message below.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  "Hello! How are you today?",
                  "What can you help me with?",
                  "Tell me something interesting",
                  "How do you work?"
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => onInputChange(suggestion)}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition-colors"
                  >
                    {suggestion}
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
                          : 'bg-gray-200 text-gray-600 mr-3'
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
                          : 'bg-gray-50 text-gray-900 border border-gray-200'
                      }`}
                    >
                      <div className={`text-sm leading-relaxed ${
                        message.role === 'assistant' ? 'prose prose-sm max-w-none' : ''
                      }`}>
                        {message.role === 'assistant' ? (
                          <div className="whitespace-pre-wrap">
                            {formatMessage(message.content)}
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap">{message.content}</p>
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
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 text-gray-600 mr-3 flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
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

        {/* Input Area */}
        {currentConversation && (
          <div className="border-t p-4 bg-gray-50/50">
            <div className="flex space-x-3">
              <div className="flex-1">
                <Textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => onInputChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                  className="min-h-[44px] max-h-32 resize-none border-gray-300 focus:border-primary focus:ring-primary"
                  disabled={isLoading}
                  rows={1}
                />
              </div>
              <Button
                onClick={onSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                size="sm"
                className="h-[44px] px-4"
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
        )}
      </CardContent>
    </Card>
  );
};

export default ChatArea;
