import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, Zap } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AIProjectGeneratorProps {
  onProjectCreated: (projectId: string) => void;
}

export const AIProjectGenerator = ({ onProjectCreated }: AIProjectGeneratorProps) => {
  const [prompt, setPrompt] = useState("");
  const [projectName, setProjectName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const examplePrompts = [
    "Create a modern portfolio website with a hero section, projects gallery, about section, and contact form. Use a dark theme with purple accents.",
    "Build a task management app with drag-and-drop functionality, categories, priority levels, and local storage.",
    "Design a restaurant website with menu sections, image gallery, reservation form, and Google Maps integration.",
    "Create a weather dashboard that shows current conditions, 5-day forecast, and beautiful weather animations.",
    "Build an e-commerce product landing page with image carousel, add to cart, product details, and reviews section."
  ];

  const generateProject = async () => {
    if (!prompt.trim() || !projectName.trim()) {
      toast.error("Please provide both project name and description");
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 1000);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to generate projects");
        return;
      }

      toast.info("🤖 AI is crafting your project...", { duration: 3000 });

      const { data, error } = await supabase.functions.invoke('generate-full-project', {
        body: {
          prompt: prompt.trim(),
          projectName: projectName.trim(),
          projectType: 'html',
          userId: user.id
        }
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.projectId) {
        toast.success(`🎉 ${data.projectName} created successfully!`);
        setPrompt("");
        setProjectName("");
        onProjectCreated(data.projectId);
      } else {
        throw new Error("No project ID returned");
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      clearInterval(progressInterval);
      toast.error("Failed to generate project: " + (error.message || "Unknown error"));
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const useExample = (example: string) => {
    setPrompt(example);
    // Generate a project name from the example
    const name = example.split('.')[0].slice(0, 30);
    setProjectName(name);
  };

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          AI Project Generator
          <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">POWERED BY AI</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Describe your dream website or app, and AI will generate a complete, production-ready project with HTML, CSS, and JavaScript.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Project Name */}
        <div>
          <Label htmlFor="project-name" className="text-base font-semibold">
            Project Name
          </Label>
          <Input
            id="project-name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="My Awesome Project"
            className="mt-2"
            disabled={isGenerating}
          />
        </div>

        {/* Prompt Input */}
        <div>
          <Label htmlFor="ai-prompt" className="text-base font-semibold">
            Describe Your Project
          </Label>
          <Textarea
            id="ai-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Be as detailed as possible. For example: 'Create a modern portfolio website with a dark theme, hero section with animated gradient background, projects showcase grid, smooth scrolling, contact form with validation, and responsive mobile design.'"
            className="mt-2 min-h-[150px]"
            disabled={isGenerating}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              {prompt.length} / 1000 characters
            </span>
            <span className="text-xs text-muted-foreground">
              💡 The more details, the better the result!
            </span>
          </div>
        </div>

        {/* Example Prompts */}
        <div>
          <Label className="text-sm font-semibold mb-2 block">
            ✨ Try these examples:
          </Label>
          <div className="grid gap-2">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                onClick={() => useExample(example)}
                disabled={isGenerating}
                className="text-left text-xs p-3 rounded-lg border border-border hover:border-primary hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        {isGenerating && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Generating your project...</span>
              <span className="font-semibold">{progress}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              AI is crafting your HTML, CSS, and JavaScript files...
            </p>
          </div>
        )}

        {/* Generate Button */}
        <Button
          onClick={generateProject}
          disabled={isGenerating || !prompt.trim() || !projectName.trim() || prompt.length < 20}
          className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-semibold py-6 text-lg"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating with AI...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-5 w-5" />
              Generate Complete Project
            </>
          )}
        </Button>

        {/* Info */}
        <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
          <p className="font-semibold">What will be generated:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>✅ Complete HTML structure with semantic markup</li>
            <li>✅ Beautiful, responsive CSS with modern design</li>
            <li>✅ Interactive JavaScript with all requested features</li>
            <li>✅ Mobile-first, production-ready code</li>
            <li>✅ No placeholders - fully functional project!</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
