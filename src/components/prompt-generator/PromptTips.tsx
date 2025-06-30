
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

const PromptTips = () => {
  return (
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
  );
};

export default PromptTips;
