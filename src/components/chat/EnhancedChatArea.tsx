import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Copy, User, Bot, Send, Eye, Download, Code, Image, Globe } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface EnhancedMessage extends Message {
  type?: string;
  imageUrl?: string;
  generatedCode?: string;
  language?: string;
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

export const EnhancedChatArea = ({ 
  currentConversation, 
  messages, 
  inputMessage, 
  isLoading, 
  onInputChange, 
  onSendMessage, 
  onKeyPress 
}: ChatAreaProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [previewData, setPreviewData] = useState<{ type: string; content: string; url?: string } | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy text');
    }
  };

  const downloadCode = (code: string, filename: string) => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Code downloaded!');
  };

  const openPreview = (type: string, content: string, url?: string) => {
    setPreviewData({ type, content, url });
  };

  const extractCode = (content: string): { language: string; code: string }[] => {
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

  const renderEnhancedMessage = (message: EnhancedMessage): React.ReactNode => {
    const content = message.content;
    
    // Check if this is an enhanced message with special features
    if (message.type && message.type !== 'general_chat') {
      return (
        <div className="space-y-4">
          {/* Render the main content */}
          {formatAIResponse(content)}
          
          {/* Render enhanced features based on type */}
          {message.type === 'image_generation' && message.imageUrl && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-center gap-2 mb-3">
                <Image className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">Generated Image</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openPreview('image', content, message.imageUrl)}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-3 w-3" />
                  Preview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = message.imageUrl!;
                    a.download = 'generated-image.png';
                    a.click();
                    toast.success('Image download started!');
                  }}
                  className="flex items-center gap-2"
                >
                  <Download className="h-3 w-3" />
                  Download
                </Button>
              </div>
            </div>
          )}
          
          {message.type === 'logo_generation' && message.imageUrl && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-center gap-2 mb-3">
                <Image className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">Generated Logo</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openPreview('logo', content, message.imageUrl)}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-3 w-3" />
                  Preview Logo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = message.imageUrl!;
                    a.download = 'logo-design.png';
                    a.click();
                    toast.success('Logo download started!');
                  }}
                  className="flex items-center gap-2"
                >
                  <Download className="h-3 w-3" />
                  Download
                </Button>
              </div>
            </div>
          )}
          
          {(message.type === 'website_generation' || message.type === 'code_generation') && message.generatedCode && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-center gap-2 mb-3">
                {message.type === 'website_generation' ? (
                  <Globe className="h-4 w-4 text-primary" />
                ) : (
                  <Code className="h-4 w-4 text-primary" />
                )}
                <span className="font-medium text-sm">
                  {message.type === 'website_generation' ? 'Generated Website' : 'Generated Code'}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openPreview(message.type === 'website_generation' ? 'website' : 'code', message.generatedCode!)}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-3 w-3" />
                  Preview {message.type === 'website_generation' ? 'Website' : 'Code'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadCode(
                    message.generatedCode!, 
                    message.type === 'website_generation' ? 'website.html' : `code.${message.language || 'txt'}`
                  )}
                  className="flex items-center gap-2"
                >
                  <Download className="h-3 w-3" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(message.generatedCode!)}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-3 w-3" />
                  Copy
                </Button>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    // Regular message formatting
    return formatAIResponse(content);
  };

  const formatAIResponse = (content: string, isLive = false): React.ReactNode => {
    return (
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code: ({ node, inline, className, children, ...props }: any) => {
              const match = /language-(\w+)/.exec(className || '');
              const language = match ? match[1] : '';
              
              if (!inline && children) {
                return (
                  <div className="relative group my-4">
                    <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-0.5 rounded-lg">
                      <div className="bg-background rounded-lg overflow-hidden">
                        <div className="flex justify-between items-center px-4 py-2 bg-muted border-b">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 rounded-full bg-red-500"></div>
                              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            </div>
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              {language || 'code'}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-6 px-2"
                              onClick={() => copyToClipboard(String(children))}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-6 px-2"
                              onClick={() => downloadCode(String(children), `code.${language || 'txt'}`)}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <pre className="p-4 overflow-x-auto bg-slate-950 text-slate-100">
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </pre>
                      </div>
                    </div>
                  </div>
                );
              }
              return (
                <code className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm font-mono" {...props}>
                  {children}
                </code>
              );
            },
            h1: ({ children }) => (
              <div className="mb-6">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-3">
                  {children}
                </h1>
                <div className="h-1 bg-gradient-to-r from-primary to-secondary rounded-full w-20"></div>
              </div>
            ),
            h2: ({ children }) => (
              <h2 className="text-2xl font-bold text-foreground mb-4 mt-8 flex items-center gap-3">
                <div className="w-1 h-6 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-xl font-semibold text-foreground mb-3 mt-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                {children}
              </h3>
            ),
            h4: ({ children }) => (
              <h4 className="text-lg font-medium text-muted-foreground mb-2 mt-4">
                {children}
              </h4>
            ),
            p: ({ children }) => (
              <p className="mb-4 leading-relaxed text-foreground text-base">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="mb-6 space-y-2 ml-4">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="mb-6 space-y-2 ml-4">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="leading-relaxed text-foreground flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{children}</span>
              </li>
            ),
            blockquote: ({ children }) => (
              <div className="my-6 relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
                <blockquote className="ml-6 pl-6 py-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-r-lg border-l-0">
                  <div className="text-foreground italic text-base leading-relaxed">
                    {children}
                  </div>
                </blockquote>
              </div>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto my-6 rounded-lg border border-border shadow-sm">
                <table className="min-w-full divide-y divide-border">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-gradient-to-r from-primary/10 to-secondary/10">
                {children}
              </thead>
            ),
            th: ({ children }) => (
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground uppercase tracking-wider">
                {children}
              </th>
            ),
            tbody: ({ children }) => (
              <tbody className="bg-background divide-y divide-border">
                {children}
              </tbody>
            ),
            tr: ({ children }) => (
              <tr className="hover:bg-muted/50 transition-colors">
                {children}
              </tr>
            ),
            td: ({ children }) => (
              <td className="px-6 py-4 text-sm text-foreground">
                {children}
              </td>
            ),
            strong: ({ children }) => (
              <strong className="font-bold text-primary">
                {children}
              </strong>
            ),
            em: ({ children }) => (
              <em className="italic text-muted-foreground">
                {children}
              </em>
            ),
            hr: () => (
              <hr className="my-8 border-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
        {isLive && (
          <div className="flex items-center text-muted-foreground text-xs mt-3 p-2 bg-muted/50 rounded-md">
            <Loader2 className="h-3 w-3 animate-spin mr-2" />
            <span>AI is analyzing and generating response...</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {currentConversation ? (
          <>
            {messages.map((message) => (
              <div key={message.id} className="flex gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                }`}>
                  {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                
                <Card className="flex-1 p-4">
                  <div className="text-sm">
                    {message.role === 'user' ? (
                      <p className="text-foreground leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    ) : (
                      renderEnhancedMessage(message as EnhancedMessage)
                    )}
                  </div>
                </Card>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-secondary text-secondary-foreground">
                  <Bot className="h-4 w-4" />
                </div>
                <Card className="flex-1 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                </Card>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <Card className="relative p-8 text-center max-w-lg overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 border-2 border-primary/10 shadow-xl">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-50" />
              <div className="absolute -top-10 -right-10 w-20 h-20 bg-primary/10 rounded-full blur-xl" />
              <div className="absolute -bottom-10 -left-10 w-16 h-16 bg-secondary/10 rounded-full blur-xl" />
              
              {/* Content */}
              <div className="relative z-10">
                <div className="mb-6 relative">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg">
                    <Bot className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl blur-lg w-16 h-16 mx-auto" />
                </div>
                
                <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Enhanced AI Assistant
                </h3>
                <p className="text-muted-foreground mb-6 text-base leading-relaxed">
                  Your intelligent companion for creative and technical tasks
                </p>
                
                <div className="grid grid-cols-1 gap-3 text-left">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/5 to-transparent hover:from-primary/10 transition-all duration-200 group">
                    <div className="w-2 h-2 bg-primary rounded-full group-hover:scale-125 transition-transform" />
                    <span className="text-sm font-medium text-foreground">Generate stunning images and logos</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-secondary/5 to-transparent hover:from-secondary/10 transition-all duration-200 group">
                    <div className="w-2 h-2 bg-secondary rounded-full group-hover:scale-125 transition-transform" />
                    <span className="text-sm font-medium text-foreground">Create complete websites & applications</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/5 to-transparent hover:from-primary/10 transition-all duration-200 group">
                    <div className="w-2 h-2 bg-primary rounded-full group-hover:scale-125 transition-transform" />
                    <span className="text-sm font-medium text-foreground">Write, debug & optimize code</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-secondary/5 to-transparent hover:from-secondary/10 transition-all duration-200 group">
                    <div className="w-2 h-2 bg-secondary rounded-full group-hover:scale-125 transition-transform" />
                    <span className="text-sm font-medium text-foreground">Answer questions & provide tutorials</span>
                  </div>
                </div>
                
                <div className="mt-6 text-xs text-muted-foreground">
                  Start by typing your request below ✨
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            value={inputMessage}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me to generate images, create websites, write code, or answer questions..."
            className="flex-1 min-h-[40px] max-h-32 resize-none"
            disabled={isLoading}
          />
          <Button 
            onClick={onSendMessage} 
            disabled={!inputMessage.trim() || isLoading}
            size="icon"
            className="h-10 w-10"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewData} onOpenChange={() => setPreviewData(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewData?.type === 'image' && <Image className="h-5 w-5" />}
              {previewData?.type === 'logo' && <Image className="h-5 w-5" />}
              {previewData?.type === 'website' && <Globe className="h-5 w-5" />}
              {previewData?.type === 'code' && <Code className="h-5 w-5" />}
              {previewData?.type === 'image' && 'Image Preview'}
              {previewData?.type === 'logo' && 'Logo Preview'}
              {previewData?.type === 'website' && 'Website Preview'}
              {previewData?.type === 'code' && 'Code Preview'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="overflow-auto max-h-[60vh]">
            {(previewData?.type === 'image' || previewData?.type === 'logo') && previewData.url && (
              <div className="text-center">
                <img 
                  src={previewData.url} 
                  alt="Generated content" 
                  className="max-w-full h-auto rounded-lg shadow-lg"
                />
              </div>
            )}
            
            {previewData?.type === 'website' && (
              <Tabs defaultValue="preview" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="preview">Live Preview</TabsTrigger>
                  <TabsTrigger value="code">Source Code</TabsTrigger>
                </TabsList>
                <TabsContent value="preview" className="mt-4">
                  <div className="border rounded-lg overflow-hidden">
                    <iframe
                      srcDoc={previewData.content}
                      className="w-full h-96"
                      title="Website Preview"
                      sandbox="allow-scripts allow-same-origin"
                    />
                  </div>
                </TabsContent>
                <TabsContent value="code" className="mt-4">
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{previewData.content}</code>
                  </pre>
                </TabsContent>
              </Tabs>
            )}
            
            {previewData?.type === 'code' && (
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{previewData.content}</code>
              </pre>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};