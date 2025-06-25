
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Download, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from 'react-markdown';

interface BlogEditorOutputProps {
  generatedPost: string;
  topic: string;
}

const BlogEditorOutput = ({ generatedPost, topic }: BlogEditorOutputProps) => {
  const copyToClipboard = async () => {
    if (!generatedPost) return;
    
    try {
      await navigator.clipboard.writeText(generatedPost);
      toast.success("📋 Blog post copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy. Please try selecting and copying manually.");
    }
  };

  const downloadPost = () => {
    if (!generatedPost) return;
    
    const blob = new Blob([generatedPost], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blog-post-${topic.replace(/\s+/g, '-').toLowerCase() || 'untitled'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("📥 Blog post downloaded!");
  };

  const publishPost = () => {
    if (!generatedPost) return;
    toast.success("🚀 Post saved to your dashboard!");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Generated Blog Post</CardTitle>
          {generatedPost && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={downloadPost}>
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              <Button size="sm" onClick={publishPost}>
                <Send className="h-4 w-4 mr-1" />
                Saved
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {generatedPost ? (
          <div className="bg-gray-50 rounded-lg p-6 max-h-96 overflow-y-auto">
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 text-gray-900">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-xl font-semibold mb-3 mt-6 text-gray-800">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-lg font-medium mb-2 mt-4 text-gray-700">{children}</h3>,
                  p: ({ children }) => <p className="mb-4 text-gray-600 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-1 text-gray-600">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-1 text-gray-600">{children}</ol>,
                  li: ({ children }) => <li className="text-gray-600">{children}</li>,
                  strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                  em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-primary pl-4 italic text-gray-700 my-4">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {generatedPost}
              </ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Ready to Create Amazing Content!</h3>
            <p className="mb-2">Your AI-generated blog post will appear here with beautiful formatting</p>
            <p className="text-sm">Fill in the topic and click "Generate Blog Post" to get started</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BlogEditorOutput;
