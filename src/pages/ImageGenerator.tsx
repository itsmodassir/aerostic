
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Navigation from "@/components/Navigation";
import { Image, Loader2, Download, Sparkles } from "lucide-react";
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
  const { user } = useAuth();

  const styles = [
    { id: "realistic", name: "Realistic", description: "Photo-realistic images" },
    { id: "artistic", name: "Artistic", description: "Creative and artistic style" },
    { id: "cartoon", name: "Cartoon", description: "Fun cartoon-style images" },
    { id: "abstract", name: "Abstract", description: "Abstract and conceptual" },
    { id: "vintage", name: "Vintage", description: "Retro and vintage look" },
    { id: "futuristic", name: "Futuristic", description: "Modern and futuristic" }
  ];

  const sizes = [
    { id: "1024x1024", name: "Square (1024x1024)" },
    { id: "1792x1024", name: "Landscape (1792x1024)" },
    { id: "1024x1792", name: "Portrait (1024x1792)" }
  ];

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a description for your image");
      return;
    }

    if (!user) {
      toast.error("Please sign in to generate images");
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log('Generating image with Gemini:', prompt);

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
        toast.success("🎨 Image generated successfully!");
        
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
      // For SVG data URLs, we need to handle differently
      if (generatedImage.startsWith('data:image/svg+xml')) {
        const link = document.createElement('a');
        link.href = generatedImage;
        link.download = `generated-image-${Date.now()}.svg`;
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
        a.download = `generated-image-${Date.now()}.png`;
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
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <Image className="h-12 w-12 text-primary mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                AI Image Generator
              </h1>
              <p className="text-xl text-gray-600">
                Create stunning images with Gemini AI in seconds
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Controls */}
              <Card>
                <CardHeader>
                  <CardTitle>Image Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="prompt">Image Description *</Label>
                    <Textarea
                      id="prompt"
                      placeholder="Describe the image you want to create... e.g., 'A majestic mountain landscape at sunset with snow-capped peaks'"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="mt-2"
                      rows={4}
                    />
                  </div>
                  
                  <div>
                    <Label>Style</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {styles.map((styleOption) => (
                        <div
                          key={styleOption.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-all ${
                            style === styleOption.id
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setStyle(styleOption.id)}
                        >
                          <h4 className="font-medium text-sm">{styleOption.name}</h4>
                          <p className="text-xs text-gray-600 mt-1">{styleOption.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="size">Image Size</Label>
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
                    <Label htmlFor="quality">Quality</Label>
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

                  <Button 
                    onClick={generateImage} 
                    disabled={isGenerating || !prompt.trim()}
                    className="w-full"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Image...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate with Gemini AI
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Generated Image */}
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
                          onClick={() => setGeneratedImage(null)}
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
                        <p>Your generated image will appear here</p>
                        <p className="text-sm mt-1">Powered by Google Gemini AI</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Features */}
            <div className="mt-12 grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-white/50 rounded-lg">
                <Sparkles className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Gemini AI Powered</h3>
                <p className="text-sm text-gray-600">Advanced Google AI creates high-quality images</p>
              </div>
              <div className="text-center p-6 bg-white/50 rounded-lg">
                <Image className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Multiple Styles</h3>
                <p className="text-sm text-gray-600">Choose from various artistic styles</p>
              </div>
              <div className="text-center p-6 bg-white/50 rounded-lg">
                <Download className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">High Resolution</h3>
                <p className="text-sm text-gray-600">Download images in multiple sizes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ImageGenerator;
