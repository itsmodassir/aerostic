
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

const PromptTips = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Pro Tips for Better Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
            <p><strong>Be specific with subjects:</strong> Instead of "dog", use "golden retriever puppy with blue eyes"</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
            <p><strong>Combine multiple elements:</strong> Mix different styles, environments, and moods for unique results</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
            <p><strong>Use reference artists:</strong> "In the style of Van Gogh" or "like a Pixar movie"</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
            <p><strong>Quality keywords:</strong> Add "masterpiece", "award-winning", "professional" for better quality</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
            <p><strong>For videos:</strong> Include motion descriptions like "smooth camera movement", "dynamic action"</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
            <p><strong>Negative prompts:</strong> Mention what you DON'T want: "no text", "no watermarks", "no blur"</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PromptTips;
