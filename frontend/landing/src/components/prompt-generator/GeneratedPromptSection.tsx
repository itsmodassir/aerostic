
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Lightbulb } from "lucide-react";

interface GeneratedPromptSectionProps {
  generatedPrompt: string;
  copyToClipboard: () => void;
}

const GeneratedPromptSection = ({ generatedPrompt, copyToClipboard }: GeneratedPromptSectionProps) => {
  return (
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
  );
};

export default GeneratedPromptSection;
