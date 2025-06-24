
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Navigation from "@/components/Navigation";
import { Sparkles, Loader2, Globe, Palette, FileText, Settings } from "lucide-react";
import { toast } from "sonner";

const BlogBuilder = () => {
  const [step, setStep] = useState(1);
  const [blogName, setBlogName] = useState("");
  const [blogTopic, setBlogTopic] = useState("");
  const [blogDescription, setBlogDescription] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("modern");
  const [domainName, setDomainName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState({
    title: "",
    tagline: "",
    aboutContent: "",
    firstPost: ""
  });

  const themes = [
    { id: "modern", name: "Modern Minimalist", preview: "Clean lines, lots of white space" },
    { id: "creative", name: "Creative Portfolio", preview: "Bold colors, artistic layout" },
    { id: "business", name: "Professional Business", preview: "Corporate look, formal design" },
    { id: "lifestyle", name: "Lifestyle Blog", preview: "Warm colors, cozy feeling" },
    { id: "tech", name: "Tech & Innovation", preview: "Dark theme, futuristic elements" },
    { id: "travel", name: "Travel Adventures", preview: "Beautiful imagery, wanderlust vibes" }
  ];

  const generateBlogContent = async () => {
    if (!blogName.trim() || !blogTopic.trim()) {
      toast.error("Please fill in blog name and topic");
      return;
    }

    setIsGenerating(true);
    
    try {
      const prompt = `Create content for a blog website with the following details:
      - Blog Name: ${blogName}
      - Blog Topic/Niche: ${blogTopic}
      - Description: ${blogDescription || 'Not provided'}
      - Theme: ${selectedTheme}
      
      Please generate:
      1. A catchy blog title (if different from the name provided)
      2. A compelling tagline/subtitle (1 sentence)
      3. An engaging "About" section (2-3 paragraphs)
      4. A sample first blog post title and content (500+ words)
      
      Make it professional, engaging, and tailored to the ${blogTopic} niche. Format the response as JSON with keys: title, tagline, aboutContent, firstPost`;

      console.log('Generating blog content with prompt:', prompt);

      const requestBody = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      };

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyAhDgajINy8ZYGV9oAHaaOPawlFBlZDS6A`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const responseText = await response.text();
      console.log('Raw API response:', responseText);

      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}, response: ${responseText}`);
        throw new Error(`API request failed with status ${response.status}`);
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
        console.log('Generated content:', content);
        
        // Try to parse as JSON first, if not, create structured content
        let parsedContent;
        try {
          parsedContent = JSON.parse(content);
        } catch {
          // If JSON parsing fails, create structured content from the text
          parsedContent = {
            title: blogName,
            tagline: `Welcome to ${blogName} - Your go-to source for ${blogTopic}`,
            aboutContent: content.substring(0, 500) + "...",
            firstPost: content
          };
        }
        
        setGeneratedContent(parsedContent);
        setStep(3);
        toast.success("🎉 Blog content generated successfully!");
      } else if (data.error) {
        console.error('API returned error:', data.error);
        throw new Error(`API Error: ${data.error.message || 'Unknown error'}`);
      } else {
        console.error('Unexpected API response structure:', data);
        throw new Error("No content generated from API");
      }
    } catch (error) {
      console.error("Error generating blog content:", error);
      
      if (error.message.includes('fetch')) {
        toast.error("Network error. Please check your internet connection and try again.");
      } else if (error.message.includes('API Error')) {
        toast.error(`API Error: ${error.message}`);
      } else {
        toast.error(`Failed to generate blog content: ${error.message}`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const buildWebsite = () => {
    toast.success("🚀 Website built successfully! (Demo mode - would deploy to your domain)");
    // In a real implementation, this would trigger the actual website deployment
  };

  const nextStep = () => {
    if (step === 1) {
      if (!blogName.trim() || !blogTopic.trim()) {
        toast.error("Please fill in the required fields");
        return;
      }
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
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
              AI Blog Builder
            </h1>
            <p className="text-xl text-gray-600">
              Create your complete blog website in 3 simple steps
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-12">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-primary' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                  <FileText className="h-4 w-4" />
                </div>
                <span className="font-medium">Basic Info</span>
              </div>
              <div className={`w-8 h-px ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`} />
              <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-primary' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                  <Palette className="h-4 w-4" />
                </div>
                <span className="font-medium">Design</span>
              </div>
              <div className={`w-8 h-px ${step >= 3 ? 'bg-primary' : 'bg-gray-200'}`} />
              <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-primary' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                  <Settings className="h-4 w-4" />
                </div>
                <span className="font-medium">Preview & Launch</span>
              </div>
            </div>
          </div>

          {/* Step Content */}
          <Card>
            <CardHeader>
              <CardTitle>
                {step === 1 && "Step 1: Basic Information"}
                {step === 2 && "Step 2: Choose Your Design"}
                {step === 3 && "Step 3: Preview & Launch"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="blogName">Blog Name *</Label>
                    <Input
                      id="blogName"
                      placeholder="e.g., Tech Insights, Cooking Adventures"
                      value={blogName}
                      onChange={(e) => setBlogName(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="blogTopic">Blog Topic/Niche *</Label>
                    <Input
                      id="blogTopic"
                      placeholder="e.g., Technology, Food, Travel, Business"
                      value={blogTopic}
                      onChange={(e) => setBlogTopic(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="blogDescription">Blog Description (Optional)</Label>
                    <Textarea
                      id="blogDescription"
                      placeholder="Brief description of what your blog will be about..."
                      value={blogDescription}
                      onChange={(e) => setBlogDescription(e.target.value)}
                      className="mt-2"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="domainName">Preferred Domain Name (Optional)</Label>
                    <Input
                      id="domainName"
                      placeholder="e.g., myblog.com"
                      value={domainName}
                      onChange={(e) => setDomainName(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <Label>Choose Your Blog Theme</Label>
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      {themes.map((theme) => (
                        <div
                          key={theme.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            selectedTheme === theme.id
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedTheme(theme.id)}
                        >
                          <h3 className="font-semibold mb-2">{theme.name}</h3>
                          <p className="text-sm text-gray-600">{theme.preview}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button 
                    onClick={generateBlogContent} 
                    disabled={isGenerating}
                    className="w-full"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Content...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate AI Content
                      </>
                    )}
                  </Button>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Your Generated Blog Preview</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-700">Blog Title:</h4>
                        <p className="text-lg">{generatedContent.title || blogName}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-700">Tagline:</h4>
                        <p>{generatedContent.tagline}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-700">About Section:</h4>
                        <p className="text-sm">{generatedContent.aboutContent?.substring(0, 200)}...</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-700">Sample First Post:</h4>
                        <p className="text-sm">{generatedContent.firstPost?.substring(0, 200)}...</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">What happens next?</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Your blog website will be created with the selected theme</li>
                      <li>• AI-generated content will be populated</li>
                      <li>• SEO optimization will be applied</li>
                      <li>• Domain setup (if provided)</li>
                    </ul>
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      onClick={buildWebsite} 
                      className="flex-1"
                      size="lg"
                    >
                      <Globe className="mr-2 h-4 w-4" />
                      Build My Website
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setStep(2)}
                      size="lg"
                    >
                      Edit Content
                    </Button>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              {step < 3 && (
                <div className="flex justify-between mt-8">
                  <Button 
                    variant="outline" 
                    onClick={prevStep}
                    disabled={step === 1}
                  >
                    Previous
                  </Button>
                  <Button onClick={nextStep}>
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Benefits */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white/50 rounded-lg">
              <Globe className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Complete Website</h3>
              <p className="text-sm text-gray-600">Full blog website with pages and navigation</p>
            </div>
            <div className="text-center p-6 bg-white/50 rounded-lg">
              <Sparkles className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">AI-Generated Content</h3>
              <p className="text-sm text-gray-600">Professional content created by AI</p>
            </div>
            <div className="text-center p-6 bg-white/50 rounded-lg">
              <Settings className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Ready to Publish</h3>
              <p className="text-sm text-gray-600">Instantly deployable and fully functional</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogBuilder;
