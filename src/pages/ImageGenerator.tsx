
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Navigation from "@/components/Navigation";
import { Image, Loader2, Download, Sparkles, Info } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import ProtectedRoute from "@/components/ProtectedRoute";

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("realistic");
  const [size, setSize] = useState("1024x1024");
  const [quality, setQuality] = useState("standard");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [enhancedDescription, setEnhancedDescription] = useState<string | null>(null);
  const { user } = useAuth();

  const styles = [
    { id: "realistic", name: "Realistic", description: "Photo-realistic images with natural details" },
    { id: "artistic", name: "Artistic", description: "Creative and expressive artistic style" },
    { id: "cartoon", name: "Cartoon", description: "Fun, colorful cartoon-style images" },
    { id: "abstract", name: "Abstract", description: "Abstract and conceptual art" },
    { id: "vintage", name: "Vintage", description: "Retro and nostalgic vintage look" },
    { id: "futuristic", name: "Futuristic", description: "Modern and high-tech aesthetic" }
  ];

  const sizes = [
    { id: "1024x1024", name: "Square (1024x1024)" },
    { id: "1792x1024", name: "Landscape (1792x1024)" },
    { id: "1024x1792", name: "Portrait (1024x1792)" }
  ];

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a detailed description for your image");
      return;
    }

    if (!user) {
      toast.error("Please sign in to generate images");
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log('Generating image with enhanced instructions:', prompt);

      const { data, error } = await supabase.functions.invoke('gemini-image', {
        body: {
          prompt,
          style,
          size,
          quality
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to generate image');
      }

      if (data && data.imageUrl) {
        setGeneratedImage(data.imageUrl);
        setEnhancedDescription(data.description);
        toast.success("🎨 Image generated with enhanced instructions!");
        
        // Save to user's generated images
        await supabase
          .from('generated_images')
          .insert({
            user_id: user.id,
            prompt,
            style,
            size,
            quality,
            image_url: data.imageUrl
          });
      } else {
        throw new Error("No image URL received from API");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error(`Failed to generate image: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async () => {
    if (!generatedImage) return;
    
    try {
      if (generatedImage.startsWith('data:image/svg+xml')) {
        const link = document.createElement('a');
        link.href = generatedImage;
        link.download = `ai-generated-${Date.now()}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Image downloaded successfully!");
      } else {
        const response = await fetch(generatedImage);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-generated-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Image downloaded successfully!");
      }
    } catch (error) {
      console.error("Error downloading image:", error);
      toast.error("Failed to download image");
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen gradient-bg">
        <Navigation />
        
        <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <Image className="h-12 w-12 text-primary mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Advanced AI Image Generator
              </h1>
              <p className="text-xl text-gray-600">
                Create stunning images with detailed instructions using Gemini AI
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Controls */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Image Generation Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="prompt" className="text-base font-medium">
                      Detailed Image Description *
                    </Label>
                    <p className="text-sm text-gray-600 mb-2">
                      Be specific about what you want - include details about style, colors, composition, lighting, and mood.
                    </p>
                    <Textarea
                      id="prompt"
                      placeholder="Example: 'A serene mountain landscape at golden hour, with snow-capped peaks reflecting in a crystal-clear alpine lake. Include pine trees in the foreground, dramatic clouds in the sky, and warm golden lighting. The scene should feel peaceful and majestic, shot from a low angle to emphasize the grandeur of the mountains.'"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="mt-2 min-h-[120px]"
                      rows={6}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Tip: The more detailed your description, the better the AI can understand and create your vision.
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-base font-medium mb-3 block">Art Style</Label>
                    <div className="grid grid-cols-1 gap-3">
                      {styles.map((styleOption) => (
                        <div
                          key={styleOption.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            style === styleOption.id
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                          }`}
                          onClick={() => setStyle(styleOption.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-sm">{styleOption.name}</h4>
                              <p className="text-xs text-gray-600 mt-1">{styleOption.description}</p>
                            </div>
                            {style === styleOption.id && (
                              <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="size" className="text-base font-medium">Image Size</Label>
                      <Select value={size} onValueChange={setSize}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {sizes.map((sizeOption) => (
                            <SelectItem key={sizeOption.id} value={sizeOption.id}>
                              {sizeOption.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="quality" className="text-base font-medium">Quality</Label>
                      <Select value={quality} onValueChange={setQuality}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="hd">HD (High Quality)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    onClick={generateImage} 
                    disabled={isGenerating || !prompt.trim()}
                    className="w-full"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing Instructions & Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate with Enhanced AI
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Generated Image */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Generated Image</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {generatedImage ? (
                      <div className="space-y-4">
                        <div className="relative">
                          <img
                            src={generatedImage}
                            alt="Generated image"
                            className="w-full rounded-lg shadow-lg"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={downloadImage}
                            variant="outline"
                            className="flex-1"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                          <Button 
                            onClick={() => {
                              setGeneratedImage(null);
                              setEnhancedDescription(null);
                            }}
                            variant="outline"
                          >
                            Clear
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <Image className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p className="font-medium">Your generated image will appear here</p>
                          <p className="text-sm mt-2">Advanced instruction processing with Gemini AI</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Enhanced Description */}
                {enhancedDescription && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        AI Processing Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {enhancedDescription}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        This shows how the AI interpreted and enhanced your instructions for better image generation.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Features */}
            <div className="mt-12 grid md:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-white/50 rounded-lg">
                <Sparkles className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Enhanced Processing</h3>
                <p className="text-sm text-gray-600">AI analyzes and enhances your instructions</p>
              </div>
              <div className="text-center p-6 bg-white/50 rounded-lg">
                <Image className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Multiple Styles</h3>
                <p className="text-sm text-gray-600">Choose from 6 distinct artistic styles</p>
              </div>
              <div className="text-center p-6 bg-white/50 rounded-lg">
                <Download className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">High Resolution</h3>
                <p className="text-sm text-gray-600">Download images in multiple sizes</p>
              </div>
              <div className="text-center p-6 bg-white/50 rounded-lg">
                <Info className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Detailed Instructions</h3>
                <p className="text-sm text-gray-600">AI follows your specific requirements</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ImageGenerator;
