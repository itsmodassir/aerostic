
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

interface BlogEditorFormProps {
  onGenerate: (content: string) => void;
}

const BlogEditorForm = ({ onGenerate }: BlogEditorFormProps) => {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("friendly");
  const [imagePrompt, setImagePrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [wordCount, setWordCount] = useState(800);
  const [includeIntro, setIncludeIntro] = useState(true);
  const [includeConclusion, setIncludeConclusion] = useState(true);
  const { user } = useAuth();

  const generateBlogPost = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic for your blog post");
      return;
    }

    if (!user) {
      toast.error("Please sign in to generate blog posts");
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Generating blog post with topic:', topic);

      const { data, error } = await supabase.functions.invoke('generate-blog-content', {
        body: {
          topic,
          tone,
          wordCount,
          imagePrompt,
          includeIntro,
          includeConclusion
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to generate blog content');
      }

      if (data?.content) {
        // Save to database
        const { error: dbError } = await supabase
          .from('blog_posts')
          .insert({
            user_id: user.id,
            title: topic,
            content: data.content,
            topic,
            tone,
            word_count: wordCount,
            image_prompt: imagePrompt
          });

        if (dbError) {
          console.error('Database error:', dbError);
          toast.error('Failed to save blog post');
        }

        onGenerate(data.content);
        toast.success("🎉 Blog post generated successfully!");
        console.log('Generated content:', data.content);
      } else {
        throw new Error("No content received from API");
      }
    } catch (error) {
      console.error("Error generating blog post:", error);
      toast.error(`Failed to generate blog post: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Your Blog Post</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="topic">Blog Topic or Keywords *</Label>
          <Input
            id="topic"
            placeholder="e.g., 10 Tips for Remote Work Productivity"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="tone">Writing Tone</Label>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="friendly">Friendly & Conversational</SelectItem>
              <SelectItem value="professional">Professional & Formal</SelectItem>
              <SelectItem value="casual">Casual & Relaxed</SelectItem>
              <SelectItem value="authoritative">Authoritative & Expert</SelectItem>
              <SelectItem value="humorous">Light & Humorous</SelectItem>
              <SelectItem value="educational">Educational & Informative</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="wordCount">Target Word Count</Label>
          <Select value={wordCount.toString()} onValueChange={(value) => setWordCount(parseInt(value))}>
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="500">500 words (Short)</SelectItem>
              <SelectItem value="800">800 words (Medium)</SelectItem>
              <SelectItem value="1200">1200 words (Long)</SelectItem>
              <SelectItem value="1500">1500 words (Detailed)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="imagePrompt">Image Description (Optional)</Label>
          <Input
            id="imagePrompt"
            placeholder="e.g., home office setup with laptop and coffee"
            value={imagePrompt}
            onChange={(e) => setImagePrompt(e.target.value)}
            className="mt-2"
          />
        </div>

        <div className="flex gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={includeIntro}
              onChange={(e) => setIncludeIntro(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Include Introduction</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={includeConclusion}
              onChange={(e) => setIncludeConclusion(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Include Conclusion</span>
          </label>
        </div>

        <Button 
          onClick={generateBlogPost} 
          disabled={isLoading || !topic.trim()}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Post...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Blog Post
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default BlogEditorForm;
