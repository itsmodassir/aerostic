
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Navigation from "@/components/Navigation";
import { Lightbulb, Copy, RefreshCw, Sparkles, Palette, Camera, Wand2 } from "lucide-react";
import { toast } from "sonner";
import ProtectedRoute from "@/components/ProtectedRoute";

const ImageGenerator = () => {
  const [basicPrompt, setBasicPrompt] = useState("");
  const [subject, setSubject] = useState("");
  const [style, setStyle] = useState("realistic");
  const [mood, setMood] = useState("neutral");
  const [lighting, setLighting] = useState("natural");
  const [composition, setComposition] = useState("centered");
  const [details, setDetails] = useState("medium");
  const [generatedPrompt, setGeneratedPrompt] = useState("");

  const styles = [
    { id: "realistic", name: "Realistic Photography" },
    { id: "artistic", name: "Artistic Painting" },
    { id: "cartoon", name: "Cartoon/Animation" },
    { id: "abstract", name: "Abstract Art" },
    { id: "vintage", name: "Vintage/Retro" },
    { id: "futuristic", name: "Futuristic/Sci-Fi" },
    { id: "minimalist", name: "Minimalist" },
    { id: "watercolor", name: "Watercolor" },
    { id: "digital_art", name: "Digital Art" },
    { id: "oil_painting", name: "Oil Painting" },
    { id: "pencil_sketch", name: "Pencil Sketch" },
    { id: "anime", name: "Anime/Manga" }
  ];

  const moods = [
    { id: "neutral", name: "Neutral" },
    { id: "happy", name: "Happy/Joyful" },
    { id: "dramatic", name: "Dramatic" },
    { id: "peaceful", name: "Peaceful/Serene" },
    { id: "mysterious", name: "Mysterious" },
    { id: "energetic", name: "Energetic" },
    { id: "melancholic", name: "Melancholic" },
    { id: "romantic", name: "Romantic" },
    { id: "epic", name: "Epic/Heroic" },
    { id: "dark", name: "Dark/Gothic" }
  ];

  const lightingOptions = [
    { id: "natural", name: "Natural Daylight" },
    { id: "golden_hour", name: "Golden Hour" },
    { id: "blue_hour", name: "Blue Hour" },
    { id: "dramatic", name: "Dramatic Lighting" },
    { id: "soft", name: "Soft Lighting" },
    { id: "studio", name: "Studio Lighting" },
    { id: "candlelight", name: "Candlelight" },
    { id: "neon", name: "Neon Lighting" },
    { id: "backlit", name: "Backlit" },
    { id: "rim_light", name: "Rim Lighting" }
  ];

  const compositions = [
    { id: "centered", name: "Centered" },
    { id: "rule_of_thirds", name: "Rule of Thirds" },
    { id: "close_up", name: "Close-up" },
    { id: "wide_shot", name: "Wide Shot" },
    { id: "birds_eye", name: "Bird's Eye View" },
    { id: "worms_eye", name: "Worm's Eye View" },
    { id: "dutch_angle", name: "Dutch Angle" },
    { id: "symmetrical", name: "Symmetrical" },
    { id: "asymmetrical", name: "Asymmetrical" }
  ];

  const detailLevels = [
    { id: "minimal", name: "Minimal Details" },
    { id: "medium", name: "Medium Details" },
    { id: "high", name: "High Details" },
    { id: "ultra", name: "Ultra Detailed" }
  ];

  const generatePrompt = () => {
    if (!subject.trim() && !basicPrompt.trim()) {
      toast.error("Please enter a subject or basic prompt");
      return;
    }

    const mainSubject = subject.trim() || basicPrompt.trim();
    const selectedStyle = styles.find(s => s.id === style)?.name || "realistic";
    const selectedMood = moods.find(m => m.id === mood)?.name || "neutral";
    const selectedLighting = lightingOptions.find(l => l.id === lighting)?.name || "natural";
    const selectedComposition = compositions.find(c => c.id === composition)?.name || "centered";
    
    let prompt = mainSubject;
    
    // Add style
    if (style !== "realistic") {
      prompt += `, ${selectedStyle.toLowerCase()} style`;
    }
    
    // Add mood if not neutral
    if (mood !== "neutral") {
      prompt += `, ${selectedMood.toLowerCase()} mood`;
    }
    
    // Add lighting
    prompt += `, ${selectedLighting.toLowerCase()}`;
    
    // Add composition
    if (composition !== "centered") {
      prompt += `, ${selectedComposition.toLowerCase()} composition`;
    }
    
    // Add detail level
    switch (details) {
      case "minimal":
        prompt += ", simple, clean";
        break;
      case "high":
        prompt += ", highly detailed, intricate";
        break;
      case "ultra":
        prompt += ", ultra detailed, hyperrealistic, 8k resolution";
        break;
    }
    
    // Add quality enhancers
    prompt += ", professional photography, high quality";
    
    setGeneratedPrompt(prompt);
    toast.success("Prompt generated successfully!");
  };

  const copyToClipboard = async () => {
    if (!generatedPrompt) return;
    
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      toast.success("Prompt copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy prompt");
    }
  };

  const clearAll = () => {
    setBasicPrompt("");
    setSubject("");
    setStyle("realistic");
    setMood("neutral");
    setLighting("natural");
    setComposition("centered");
    setDetails("medium");
    setGeneratedPrompt("");
    toast.success("All fields cleared");
  };

  const quickPrompts = [
    "A majestic mountain landscape at sunrise",
    "Portrait of a wise old wizard with a long beard",
    "A cozy coffee shop on a rainy day",
    "Futuristic city skyline with flying cars",
    "A cute puppy playing in a field of flowers",
    "Abstract geometric shapes in vibrant colors",
    "A magical forest with glowing mushrooms",
    "Vintage car parked in front of a diner"
  ];

  const useQuickPrompt = (prompt: string) => {
    setSubject(prompt);
    toast.success("Quick prompt loaded!");
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen gradient-bg">
        <Navigation />
        
        <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <Lightbulb className="h-12 w-12 text-primary mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                AI Prompt Generator
              </h1>
              <p className="text-xl text-gray-600">
                Create detailed, effective prompts for AI image generation tools
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Controls */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wand2 className="h-5 w-5" />
                      Basic Prompt
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="subject" className="text-base font-medium">
                        Main Subject/Scene *
                      </Label>
                      <Textarea
                        id="subject"
                        placeholder="e.g., A beautiful woman with long flowing hair, A cyberpunk cityscape, An abstract geometric pattern..."
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="mt-2 min-h-[80px]"
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Label className="text-base font-medium mb-3 block">Quick Prompts</Label>
                      <div className="grid grid-cols-1 gap-2">
                        {quickPrompts.map((prompt, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => useQuickPrompt(prompt)}
                            className="text-left justify-start h-auto py-2 px-3"
                          >
                            <Sparkles className="h-3 w-3 mr-2 flex-shrink-0" />
                            <span className="text-xs">{prompt}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      Style & Aesthetics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-base font-medium">Style</Label>
                        <Select value={style} onValueChange={setStyle}>
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {styles.map((styleOption) => (
                              <SelectItem key={styleOption.id} value={styleOption.id}>
                                {styleOption.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-base font-medium">Mood</Label>
                        <Select value={mood} onValueChange={setMood}>
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {moods.map((moodOption) => (
                              <SelectItem key={moodOption.id} value={moodOption.id}>
                                {moodOption.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="h-5 w-5" />
                      Technical Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-base font-medium">Lighting</Label>
                        <Select value={lighting} onValueChange={setLighting}>
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {lightingOptions.map((lightingOption) => (
                              <SelectItem key={lightingOption.id} value={lightingOption.id}>
                                {lightingOption.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-base font-medium">Composition</Label>
                        <Select value={composition} onValueChange={setComposition}>
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {compositions.map((compositionOption) => (
                              <SelectItem key={compositionOption.id} value={compositionOption.id}>
                                {compositionOption.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-base font-medium">Detail Level</Label>
                      <Select value={details} onValueChange={setDetails}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {detailLevels.map((detailOption) => (
                            <SelectItem key={detailOption.id} value={detailOption.id}>
                              {detailOption.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-3">
                  <Button 
                    onClick={generatePrompt} 
                    className="flex-1"
                    size="lg"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Prompt
                  </Button>
                  <Button 
                    onClick={clearAll} 
                    variant="outline"
                    size="lg"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Generated Prompt */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Generated Prompt</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {generatedPrompt ? (
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-200">
                          <p className="text-gray-800 leading-relaxed font-medium">
                            {generatedPrompt}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={copyToClipboard}
                            className="flex-1"
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Prompt
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-12">
                        <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="font-medium">Your generated prompt will appear here</p>
                        <p className="text-sm mt-2">Fill in the details and click "Generate Prompt"</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Tips */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      Prompt Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <p><strong>Be specific:</strong> Instead of "dog", use "golden retriever puppy"</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <p><strong>Include context:</strong> Describe the setting, time of day, weather</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <p><strong>Mention quality:</strong> Add terms like "professional", "high resolution"</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <p><strong>Use artistic references:</strong> "In the style of Van Gogh" or "like a movie poster"</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Features */}
            <div className="mt-12 grid md:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-white/50 rounded-lg">
                <Sparkles className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Smart Generation</h3>
                <p className="text-sm text-gray-600">Intelligent prompt construction</p>
              </div>
              <div className="text-center p-6 bg-white/50 rounded-lg">
                <Palette className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Multiple Styles</h3>
                <p className="text-sm text-gray-600">12+ artistic styles to choose from</p>
              </div>
              <div className="text-center p-6 bg-white/50 rounded-lg">
                <Copy className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Easy Copy</h3>
                <p className="text-sm text-gray-600">One-click copy to clipboard</p>
              </div>
              <div className="text-center p-6 bg-white/50 rounded-lg">
                <Lightbulb className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Quick Prompts</h3>
                <p className="text-sm text-gray-600">Pre-made prompts for inspiration</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ImageGenerator;
