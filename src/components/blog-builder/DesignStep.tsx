
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2 } from "lucide-react";

interface DesignStepProps {
  selectedTheme: string;
  setSelectedTheme: (value: string) => void;
  isGenerating: boolean;
  onGenerateContent: () => void;
}

const DesignStep = ({ selectedTheme, setSelectedTheme, isGenerating, onGenerateContent }: DesignStepProps) => {
  const themes = [
    { id: "modern", name: "Modern Minimalist", preview: "Clean lines, lots of white space" },
    { id: "creative", name: "Creative Portfolio", preview: "Bold colors, artistic layout" },
    { id: "business", name: "Professional Business", preview: "Corporate look, formal design" },
    { id: "lifestyle", name: "Lifestyle Blog", preview: "Warm colors, cozy feeling" },
    { id: "tech", name: "Tech & Innovation", preview: "Dark theme, futuristic elements" },
    { id: "travel", name: "Travel Adventures", preview: "Beautiful imagery, wanderlust vibes" }
  ];

  return (
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
        onClick={onGenerateContent} 
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
  );
};

export default DesignStep;
