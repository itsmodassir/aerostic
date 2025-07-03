
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

interface GeneratedContent {
  title: string;
  tagline: string;
  aboutContent: string;
  firstPost: string;
}

interface PreviewStepProps {
  generatedContent: GeneratedContent;
  blogName: string;
  onBuild: () => Promise<void>;
  onPrev: () => void;
}

const PreviewStep = ({ generatedContent, blogName, onBuild, onPrev }: PreviewStepProps) => {
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Your Generated Blog Preview</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-700">Blog Title:</h4>
            <p className="text-lg">{generatedContent.title || blogName}</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700">Tagline:</h4>
            <p>{generatedContent.tagline}</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700">About Section:</h4>
            <p className="text-sm">{generatedContent.aboutContent?.substring(0, 200)}...</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700">Sample First Post:</h4>
            <p className="text-sm">{generatedContent.firstPost?.substring(0, 200)}...</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium mb-2">What happens next?</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Your blog website will be saved to your dashboard</li>
          <li>• AI-generated content will be stored</li>
          <li>• You can access and edit it anytime</li>
          <li>• Ready for deployment when you're ready</li>
        </ul>
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
          onClick={onBuild} 
          className="flex-1"
          size="lg"
        >
          <Globe className="mr-2 h-4 w-4" />
          Save My Website
        </Button>
      </div>
    </div>
  );
};

export default PreviewStep;
