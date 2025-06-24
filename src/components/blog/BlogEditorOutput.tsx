
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Download, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

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
    toast.success("🚀 Post published! (Demo mode - integrate with your CMS)");
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
                Publish
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {generatedPost ? (
          <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm font-mono">
              {generatedPost}
            </pre>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Your AI-generated blog post will appear here</p>
            <p className="text-sm mt-2">Fill in the topic and click "Generate Blog Post"</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BlogEditorOutput;
