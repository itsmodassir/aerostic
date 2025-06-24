
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

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

      const requestBody = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 3000,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH", 
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      };

      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyAhDgajINy8ZYGV9oAHaaOPawlFBlZDS6A`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);

      const responseText = await response.text();
      console.log('Raw response:', responseText);

      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}, response: ${responseText}`);
        throw new Error(`API request failed with status ${response.status}: ${responseText}`);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        throw new Error('Invalid JSON response from API');
      }

      console.log('Parsed API Response:', data);
      
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        const content = data.candidates[0].content.parts[0].text;
        onGenerate(content);
        toast.success("🎉 Blog post generated successfully!");
        console.log('Generated content:', content);
      } else if (data.error) {
        console.error('API returned error:', data.error);
        throw new Error(`API Error: ${data.error.message || 'Unknown error'}`);
      } else {
        console.error('Unexpected API response structure:', data);
        throw new Error("No content generated from API - unexpected response structure");
      }
    } catch (error) {
      console.error("Error generating blog post:", error);
      
      if (error.message.includes('fetch')) {
        toast.error("Network error. Please check your internet connection and try again.");
      } else if (error.message.includes('API Error')) {
        toast.error(`API Error: ${error.message}`);
      } else if (error.message.includes('JSON')) {
        toast.error("Invalid response from API. Please try again.");
      } else {
        toast.error(`Failed to generate blog post: ${error.message}`);
      }
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
