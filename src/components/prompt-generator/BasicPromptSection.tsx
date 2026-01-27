
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Wand2, Sparkles } from "lucide-react";

interface BasicPromptSectionProps {
  subject: string;
  setSubject: (value: string) => void;
  quickPrompts: string[];
  useQuickPrompt: (prompt: string) => void;
}

const BasicPromptSection = ({ subject, setSubject, quickPrompts, useQuickPrompt }: BasicPromptSectionProps) => {
  return (
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
  );
};

export default BasicPromptSection;
