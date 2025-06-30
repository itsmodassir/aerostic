
import { Globe, Sparkles, Settings } from "lucide-react";

const BenefitsSection = () => {
  return (
    <div className="mt-12 grid md:grid-cols-3 gap-6">
      <div className="text-center p-6 bg-white/50 rounded-lg">
        <Globe className="h-8 w-8 text-primary mx-auto mb-3" />
        <h3 className="font-semibold mb-2">Complete Website</h3>
        <p className="text-sm text-gray-600">Full website with pages and navigation</p>
      </div>
      <div className="text-center p-6 bg-white/50 rounded-lg">
        <Sparkles className="h-8 w-8 text-primary mx-auto mb-3" />
        <h3 className="font-semibold mb-2">AI-Generated Content</h3>
        <p className="text-sm text-gray-600">Professional content created by AI</p>
      </div>
      <div className="text-center p-6 bg-white/50 rounded-lg">
        <Settings className="h-8 w-8 text-primary mx-auto mb-3" />
        <h3 className="font-semibold mb-2">Ready to Publish</h3>
        <p className="text-sm text-gray-600">Saved to your dashboard for easy access</p>
      </div>
    </div>
  );
};

export default BenefitsSection;
