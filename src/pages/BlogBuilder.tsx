
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Navigation from "@/components/Navigation";
import { Globe, Sparkles, Loader2, Check, Palette, Rocket } from "lucide-react";
import { toast } from "sonner";

const BlogBuilder = () => {
  const [step, setStep] = useState(1);
  const [blogData, setBlogData] = useState({
    name: "",
    description: "",
    topic: "",
    style: "modern",
    domain: "",
    color: "blue"
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState({
    title: "",
    about: "",
    posts: [],
    tagline: ""
  });

  const themes = [
    { id: "modern", name: "Modern Minimalist", preview: "Clean lines, lots of white space", color: "#3B82F6" },
    { id: "creative", name: "Creative Portfolio", preview: "Colorful and artistic design", color: "#8B5CF6" },
    { id: "business", name: "Professional Business", preview: "Corporate and trustworthy", color: "#1F2937" },
    { id: "personal", name: "Personal Journal", preview: "Warm and intimate feel", color: "#F59E0B" },
    { id: "tech", name: "Tech Blog", preview: "Dark theme with code highlights", color: "#10B981" },
    { id: "lifestyle", name: "Lifestyle Magazine", preview: "Elegant and photo-focused", color: "#EC4899" }
  ];

  const colorOptions = [
    { id: "blue", name: "Ocean Blue", color: "#3B82F6" },
    { id: "purple", name: "Royal Purple", color: "#8B5CF6" },
    { id: "green", name: "Nature Green", color: "#10B981" },
    { id: "pink", name: "Sunset Pink", color: "#EC4899" },
    { id: "orange", name: "Warm Orange", color: "#F59E0B" },
    { id: "gray", name: "Elegant Gray", color: "#6B7280" }
  ];

  const generateBlogContent = async () => {
    setIsGenerating(true);
    
    try {
      const prompt = `Create comprehensive content for a blog website about "${blogData.topic}". 
      
      Blog Details:
      - Name: "${blogData.name}"
      - Description: "${blogData.description}"
      - Style: ${blogData.style}
      
      Please provide in this exact format:
      
      TITLE: [A catchy blog title if different from the name, otherwise use the name]
      
      TAGLINE: [A memorable one-line tagline for the blog]
      
      ABOUT: [Write an engaging "About Me" or "About This Blog" section (3-4 paragraphs) that explains the purpose, target audience, and what readers can expect. Make it personal and compelling.]
      
      POST_TITLES: [Generate 5 sample blog post titles related to the topic, each on a new line with a dash]
      
      Make it professional, engaging, and tailored to the ${blogData.style} style.`;

      console.log('Generating blog content with prompt:', prompt);

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
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1500,
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
        
        // Parse the structured response
        const titleMatch = content.match(/TITLE:\s*(.+)/);
        const taglineMatch = content.match(/TAGLINE:\s*(.+)/);
        const aboutMatch = content.match(/ABOUT:\s*([\s\S]+?)(?=POST_TITLES:|$)/);
        const postsMatch = content.match(/POST_TITLES:\s*([\s\S]+)/);
        
        const parsedPosts = postsMatch 
          ? postsMatch[1].split('\n').filter(line => line.trim() && line.includes('-')).map(line => line.replace(/^-\s*/, '').trim())
          : [
              `Getting Started with ${blogData.topic}`,
              `Advanced Tips for ${blogData.topic}`,
              `Common Mistakes in ${blogData.topic}`,
              `Best Practices for ${blogData.topic}`,
              `Future Trends in ${blogData.topic}`
            ];

        setGeneratedContent({
          title: titleMatch ? titleMatch[1].trim() : blogData.name,
          tagline: taglineMatch ? taglineMatch[1].trim() : `Your guide to ${blogData.topic}`,
          about: aboutMatch ? aboutMatch[1].trim() : `Welcome to ${blogData.name}! This blog is dedicated to sharing insights and knowledge about ${blogData.topic}.`,
          posts: parsedPosts
        });
        
        toast.success("🎉 Blog content generated successfully!");
        setStep(4);
      } else {
        throw new Error("No content generated from API");
      }
    } catch (error) {
      console.error("Error generating blog content:", error);
      toast.error("Failed to generate blog content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const nextStep = () => {
    if (step === 3) {
      generateBlogContent();
    } else {
      setStep(step + 1);
    }
  };

  const prevStep = () => setStep(step - 1);

  const launchBlog = () => {
    toast.success("🚀 Blog launched successfully! (Demo mode)");
    // In a real implementation, this would deploy the blog
  };

  return (
    <div className="min-h-screen gradient-bg">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Build Your Blog with AI
            </h1>
            <p className="text-xl text-gray-600">
              Create a professional blog website in 3 simple steps
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-12">
            <div className="flex items-center justify-center space-x-4">
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= num ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step > num ? <Check className="h-5 w-5" /> : num}
                  </div>
                  {num < 4 && <div className={`w-12 h-1 ${step > num ? 'bg-primary' : 'bg-gray-200'}`} />}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-sm text-gray-600">
              <span>Blog Info</span>
              <span>Choose Style</span>
              <span>Domain Name</span>
              <span>Launch</span>
            </div>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {step === 1 && "Step 1: Tell Us About Your Blog"}
                {step === 2 && "Step 2: Choose Your Blog Style"}
                {step === 3 && "Step 3: Pick Your Domain Name"}
                {step === 4 && "Step 4: Your Blog is Ready!"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Step 1: Blog Information */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="blogName">Blog Name *</Label>
                    <Input
                      id="blogName"
                      placeholder="e.g., My Awesome Blog"
                      value={blogData.name}
                      onChange={(e) => setBlogData({...blogData, name: e.target.value})}
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="blogTopic">Main Topic/Niche *</Label>
                    <Input
                      id="blogTopic"
                      placeholder="e.g., Technology, Travel, Cooking, Fitness"
                      value={blogData.topic}
                      onChange={(e) => setBlogData({...blogData, topic: e.target.value})}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="blogDescription">Blog Description *</Label>
                    <Textarea
                      id="blogDescription"
                      placeholder="Brief description of what your blog will be about..."
                      value={blogData.description}
                      onChange={(e) => setBlogData({...blogData, description: e.target.value})}
                      className="mt-2"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Choose Style */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <p className="text-gray-600 mb-6">Choose a theme that matches your blog's personality:</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      {themes.map((theme) => (
                        <div
                          key={theme.id}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                            blogData.style === theme.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setBlogData({...blogData, style: theme.id})}
                        >
                          <div className="flex items-center mb-2">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: theme.color }}></div>
                            <h3 className="font-semibold ml-2">{theme.name}</h3>
                          </div>
                          <p className="text-sm text-gray-600">{theme.preview}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="flex items-center mb-4">
                      <Palette className="w-4 h-4 mr-2" />
                      Choose Primary Color:
                    </Label>
                    <div className="grid grid-cols-3 gap-3">
                      {colorOptions.map((color) => (
                        <div
                          key={color.id}
                          className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                            blogData.color === color.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setBlogData({...blogData, color: color.id})}
                        >
                          <div className="flex items-center">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: color.color }}></div>
                            <span className="text-sm ml-2">{color.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Domain Name */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="domain">Choose Your Domain Name *</Label>
                    <div className="mt-2 flex">
                      <Input
                        id="domain"
                        placeholder="myblog"
                        value={blogData.domain}
                        onChange={(e) => setBlogData({...blogData, domain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
                        className="rounded-r-none"
                      />
                      <span className="px-3 py-2 bg-gray-100 border border-l-0 rounded-r-md text-gray-600">
                        .setmyblog.ai
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Your blog will be available at: {blogData.domain || "yourblog"}.setmyblog.ai
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">🚀 What happens next?</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• AI will generate your blog content</li>
                      <li>• Your website will be built with your chosen theme</li>
                      <li>• You'll get a fully functional blog ready to go</li>
                      <li>• You can customize and add content anytime</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Step 4: Launch */}
              {step === 4 && (
                <div className="text-center space-y-6">
                  {isGenerating ? (
                    <div>
                      <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                      <p className="text-lg font-semibold">AI is creating your blog content...</p>
                      <p className="text-gray-600">This may take a few moments</p>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-8">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Check className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-green-600 mb-2">Congratulations!</h3>
                        <p className="text-gray-600">Your AI-powered blog is ready to go live!</p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-6 text-left max-w-2xl mx-auto mb-8">
                        <h4 className="font-semibold mb-4">📋 Blog Preview:</h4>
                        <div className="space-y-4">
                          <div>
                            <strong>Blog Name:</strong> {generatedContent.title}
                          </div>
                          <div>
                            <strong>Tagline:</strong> {generatedContent.tagline}
                          </div>
                          <div>
                            <strong>URL:</strong> {blogData.domain}.setmyblog.ai
                          </div>
                          <div>
                            <strong>Theme:</strong> {themes.find(t => t.id === blogData.style)?.name}
                          </div>
                          <div>
                            <strong>About Section:</strong> 
                            <p className="text-sm text-gray-600 mt-1 max-h-20 overflow-y-auto">
                              {generatedContent.about}
                            </p>
                          </div>
                          <div>
                            <strong>Sample Posts:</strong>
                            <ul className="text-sm text-gray-600 mt-1 space-y-1">
                              {generatedContent.posts.slice(0, 3).map((post, index) => (
                                <li key={index}>• {post}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" onClick={launchBlog}>
                          <Rocket className="mr-2 h-4 w-4" />
                          Launch My Blog
                        </Button>
                        <Button variant="outline" size="lg" onClick={() => setStep(1)}>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Create Another Blog
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              {step < 4 && (
                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={step === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={nextStep}
                    disabled={
                      (step === 1 && (!blogData.name || !blogData.topic || !blogData.description)) ||
                      (step === 3 && !blogData.domain) ||
                      isGenerating
                    }
                  >
                    {step === 3 ? (isGenerating ? "Creating..." : "Create Blog") : "Next"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BlogBuilder;
