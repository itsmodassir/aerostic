
import { Lightbulb } from "lucide-react";

const PromptGeneratorHeader = () => {
  return (
    <div className="text-center mb-12">
      <Lightbulb className="h-12 w-12 text-primary mx-auto mb-4" />
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        AI Prompt Generator
      </h1>
      <p className="text-xl text-gray-600">
        Create detailed, effective prompts for AI image generation tools
      </p>
    </div>
  );
};

export default PromptGeneratorHeader;
