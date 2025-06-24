
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/Navigation";
import { Globe, Sparkles, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

const BlogBuilder = () => {
  const [step, setStep] = useState(1);
  const [blogData, setBlogData] = useState({
    name: "",
    description: "",
    topic: "",
    style: "modern",
    domain: ""
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState({
    title: "",
    about: "",
    posts: []
  });

  const themes = [
    { id: "modern", name: "Modern Minimalist", preview: "Clean lines, lots of white space" },
    { id: "creative", name: "Creative Portfolio", preview: "Colorful and artistic design" },
    { id: "business", name: "Professional Business", preview: "Corporate and trustworthy" },
    { id: "personal", name: "Personal Journal", preview: "Warm and intimate feel" },
    { id: "tech", name: "Tech Blog", preview: "Dark theme with code highlights" },
    { id: "lifestyle", name: "Lifestyle Magazine", preview: "Elegant and photo-focused" }
  ];

  const generateBlogContent = async () => {
    setIsGenerating(true);
    
    try {
      const prompt = `Create content for a blog about "${blogData.topic}". 
      Blog name: "${blogData.name}"
      Description: "${blogData.description}"
      
      Please provide:
      1. A catchy blog title (if different from the name)
      2. An engaging "About Me" or "About This Blog" section (2-3 paragraphs)
      3. 3 sample blog post titles related to the topic
      
      Make it engaging and professional.`;

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
          }]
        })
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        const content = data.candidates[0].content.parts[0].text;
        // Simple parsing - in a real app, you'd want more sophisticated parsing
        setGeneratedContent({
          title: blogData.name,
          about: content,
          posts: [
            "Getting Started with " + blogData.topic,
            "Advanced Tips for " + blogData.topic,
            "Common Mistakes in " + blogData.topic
          ]
        });
        toast.success("Blog content generated successfully!");
        setStep(4);
      } else {
        throw new Error("Failed to generate content");
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
                    <Label htmlFor="blogName">Blog Name</Label>
                    <Input
                      id="blogName"
                      placeholder="e.g., My Awesome Blog"
                      value={blogData.name}
                      onChange={(e) => setBlogData({...blogData, name: e.target.value})}
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="blogTopic">Main Topic/Niche</Label>
                    <Input
                      id="blogTopic"
                      placeholder="e.g., Technology, Travel, Cooking, Fitness"
                      value={blogData.topic}
                      onChange={(e) => setBlogData({...blogData, topic: e.target.value})}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="blogDescription">Blog Description</Label>
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
                        <h3 className="font-semibold mb-2">{theme.name}</h3>
                        <p className="text-sm text-gray-600">{theme.preview}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Domain Name */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="domain">Choose Your Domain Name</Label>
                    <div className="mt-2 flex">
                      <Input
                        id="domain"
                        placeholder="myblog"
                        value={blogData.domain}
                        onChange={(e) => setBlogData({...blogData, domain: e.target.value})}
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
                </div>
              )}

              {/* Step 4: Launch */}
              {step === 4 && (
                <div className="text-center space-y-6">
                  {isGenerating ? (
                    <div>
                      <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                      <p>AI is creating your blog content...</p>
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

                      <div className="bg-gray-50 rounded-lg p-6 text-left max-w-2xl mx-auto">
                        <h4 className="font-semibold mb-4">Blog Preview:</h4>
                        <div className="space-y-4">
                          <div>
                            <strong>Blog Name:</strong> {blogData.name}
                          </div>
                          <div>
                            <strong>URL:</strong> {blogData.domain}.setmyblog.ai
                          </div>
                          <div>
                            <strong>Theme:</strong> {themes.find(t => t.id === blogData.style)?.name}
                          </div>
                          <div>
                            <strong>AI-Generated Content:</strong> Ready with About page and sample posts
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                        <Button size="lg">
                          Launch My Blog
                        </Button>
                        <Button variant="outline" size="lg">
                          Customize Further
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
                      (step === 1 && (!blogData.name || !blogData.topic)) ||
                      (step === 3 && !blogData.domain)
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
