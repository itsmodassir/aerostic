
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2 } from "lucide-react";

interface DesignStepProps {
  selectedTheme: string;
  setSelectedTheme: (value: string) => void;
  isGenerating: boolean;
  onNext: () => Promise<void>;
  onPrev: () => void;
}

const DesignStep = ({ selectedTheme, setSelectedTheme, isGenerating, onNext, onPrev }: DesignStepProps) => {
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

      <div className="flex gap-4">
        <Button 
          onClick={onPrev} 
          variant="outline"
          className="flex-1"
          size="lg"
        >
          Previous
        </Button>
        <Button 
          onClick={onNext} 
          disabled={isGenerating}
          className="flex-1"
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
    </div>
  );
};

export default DesignStep;
