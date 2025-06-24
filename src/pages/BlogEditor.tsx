
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/Navigation";
import { Sparkles, Loader2, Copy, Download, Send } from "lucide-react";
import { toast } from "sonner";

const BlogEditor = () => {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("friendly");
  const [imagePrompt, setImagePrompt] = useState("");
  const [generatedPost, setGeneratedPost] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [wordCount, setWordCount] = useState(800);
  const [includeIntro, setIncludeIntro] = useState(true);
  const [includeConclusion, setIncludeConclusion] = useState(true);

  const generateBlogPost = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic for your blog post");
      return;
    }

    setIsLoading(true);
    
    try {
      const prompt = `Write a comprehensive blog post about "${topic}" in a ${tone} tone. 
      
      Requirements:
      - Target word count: approximately ${wordCount} words
      - ${includeIntro ? 'Include an engaging introduction' : 'Skip the introduction'}
      - ${includeConclusion ? 'Include a compelling conclusion' : 'Skip the conclusion'}
      - Use proper markdown formatting with headers (##, ###)
      - Make it SEO-friendly with relevant keywords
      - Include 3-5 main sections with descriptive subheadings
      - Add practical tips and actionable advice where relevant
      ${imagePrompt ? `- Suggest where to place an image about: ${imagePrompt}` : ''}
      
      Structure:
      ${includeIntro ? '1. Engaging title and introduction' : '1. Engaging title'}
      2. Main content with 3-5 subheadings
      3. Practical examples or tips
      ${includeConclusion ? '4. Strong conclusion with call-to-action' : ''}
      
      Make it engaging, informative, and valuable for readers.`;

      console.log('Generating blog post with prompt:', prompt);

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyAhDgajINy8ZYGV9oAHaaOPawlFBlZDS6A`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        const content = data.candidates[0].content.parts[0].text;
        setGeneratedPost(content);
        toast.success("🎉 Blog post generated successfully!");
      } else {
        throw new Error("No content generated from API");
      }
    } catch (error) {
      console.error("Error generating blog post:", error);
      toast.error("Failed to generate blog post. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
    a.download = `blog-post-${topic.replace(/\s+/g, '-').toLowerCase()}.md`;
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
    <div className="min-h-screen gradient-bg">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              AI Blog Editor
            </h1>
            <p className="text-xl text-gray-600">
              Create professional blog posts in seconds with Google Gemini AI
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Section */}
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

            {/* Output Section */}
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
          </div>

          {/* Features */}
          <div className="mt-12 grid md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-white/50 rounded-lg">
              <h3 className="font-semibold mb-2">SEO Optimized</h3>
              <p className="text-sm text-gray-600">Every post is optimized for search engines</p>
            </div>
            <div className="text-center p-6 bg-white/50 rounded-lg">
              <h3 className="font-semibold mb-2">Multiple Tones</h3>
              <p className="text-sm text-gray-600">Choose the perfect tone for your audience</p>
            </div>
            <div className="text-center p-6 bg-white/50 rounded-lg">
              <h3 className="font-semibold mb-2">Instant Results</h3>
              <p className="text-sm text-gray-600">Generate professional content in seconds</p>
            </div>
            <div className="text-center p-6 bg-white/50 rounded-lg">
              <h3 className="font-semibold mb-2">Ready to Publish</h3>
              <p className="text-sm text-gray-600">Copy, download, or publish directly</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogEditor;
