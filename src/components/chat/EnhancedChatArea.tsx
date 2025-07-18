import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Copy, User, Bot, Send, Eye, Download, Code, Image, Globe } from 'lucide-react';
import { toast } from 'sonner';

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
    // Extract code blocks
    const codeBlocks = extractCode(content);
    let processedContent = content;

    // Create processed content with code blocks replaced
    codeBlocks.forEach((block, index) => {
      const placeholder = `__CODE_BLOCK_${index}__`;
      processedContent = processedContent.replace(
        new RegExp('```' + block.language + '[\\s\\S]*?```', 'g'),
        placeholder
      );
    });

    // Split content by paragraphs and process
    const parts = processedContent.split('\n\n');
    const elements: React.ReactNode[] = [];
    let codeBlockIndex = 0;

    parts.forEach((part, index) => {
      const trimmedPart = part.trim();
      
      if (trimmedPart.includes('__CODE_BLOCK_')) {
        // Render interactive code block
        const block = codeBlocks[codeBlockIndex];
        if (block) {
          elements.push(
            <div key={`code-${index}`} className="my-4 relative group">
              <div className="flex items-center justify-between bg-gradient-to-r from-primary/10 to-secondary/10 px-4 py-3 rounded-t-lg border border-b-0">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    {block.language.toUpperCase()} Code
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(block.code)}
                    className="h-8 px-3 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadCode(block.code, `code.${block.language}`)}
                    className="h-8 px-3 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
              <pre className="bg-card border border-t-0 p-4 rounded-b-lg overflow-x-auto shadow-sm">
                <code className="text-sm font-mono leading-relaxed text-foreground">
                  {block.code}
                </code>
              </pre>
            </div>
          );
          codeBlockIndex++;
        }
        return;
      }

      if (!trimmedPart) return;

      // Handle explanations with *** pattern
      if (trimmedPart.includes('***') || trimmedPart.match(/^\*{3,}/)) {
        const explanationText = trimmedPart.replace(/\*+/g, '').trim();
        elements.push(
          <div key={index} className="my-4 p-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/50 dark:border-blue-800/30 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 text-sm">
                  💡 Code Explanation
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                  {explanationText}
                </p>
              </div>
            </div>
          </div>
        );
        return;
      }

      // Handle different content types
      if (trimmedPart.startsWith('# ')) {
        elements.push(
          <h1 key={index} className="text-2xl font-bold mt-6 mb-3 text-foreground border-b border-border pb-2">
            {trimmedPart.substring(2)}
          </h1>
        );
      } else if (trimmedPart.startsWith('## ')) {
        elements.push(
          <h2 key={index} className="text-xl font-semibold mt-5 mb-2 text-foreground flex items-center gap-2">
            <div className="w-1 h-6 bg-primary rounded-full"></div>
            {trimmedPart.substring(3)}
          </h2>
        );
      } else if (trimmedPart.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="text-lg font-medium mt-4 mb-2 text-foreground">
            {trimmedPart.substring(4)}
          </h3>
        );
      } else if (trimmedPart.match(/^\d+\./)) {
        // Enhanced numbered list
        const lines = trimmedPart.split('\n').filter(line => line.trim());
        elements.push(
          <div key={index} className="my-4">
            <ol className="space-y-2">
              {lines.map((line, lineIndex) => (
                <li key={lineIndex} className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                    {lineIndex + 1}
                  </span>
                  <span className="text-sm leading-relaxed text-foreground flex-1">
                    {line.replace(/^\d+\.\s*/, '')}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        );
      } else if (trimmedPart.includes('- ') || trimmedPart.includes('• ')) {
        // Enhanced bulleted list
        const lines = trimmedPart.split('\n').filter(line => line.trim() && (line.includes('- ') || line.includes('• ')));
        elements.push(
          <div key={index} className="my-4">
            <ul className="space-y-2">
              {lines.map((line, lineIndex) => (
                <li key={lineIndex} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2"></div>
                  <span className="text-sm leading-relaxed text-foreground flex-1">
                    {line.replace(/^[\s]*[-•]\s*/, '')}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      } else {
        // Enhanced paragraph with inline code highlighting and better formatting
        const processedText = trimmedPart
          .replace(/`([^`]+)`/g, '<code class="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-sm font-mono border">$1</code>')
          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
          .replace(/\*(.*?)\*/g, '<em class="italic text-muted-foreground">$1</em>');
        
        elements.push(
          <div
            key={index} 
            className="text-sm leading-relaxed my-3 text-foreground p-2 rounded-md hover:bg-muted/30 transition-colors"
            dangerouslySetInnerHTML={{ __html: processedText }}
          />
        );
      }
    });

    return (
      <div className="space-y-1">
        {elements}
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
            <Card className="p-8 text-center max-w-md">
              <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Enhanced AI Assistant</h3>
              <p className="text-muted-foreground mb-4">
                I can help you with:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 text-left">
                <li>• Generate images and logos</li>
                <li>• Create complete websites</li>
                <li>• Write and debug code</li>
                <li>• Answer questions</li>
                <li>• Provide tutorials and guides</li>
              </ul>
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