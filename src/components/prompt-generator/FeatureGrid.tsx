
import { Sparkles, Palette, Copy, Lightbulb } from "lucide-react";

const FeatureGrid = () => {
  return (
    <div className="mt-12 grid md:grid-cols-4 gap-6">
      <div className="text-center p-6 bg-white/50 rounded-lg">
        <Sparkles className="h-8 w-8 text-primary mx-auto mb-3" />
        <h3 className="font-semibold mb-2">Smart Generation</h3>
        <p className="text-sm text-gray-600">Intelligent prompt construction</p>
      </div>
      <div className="text-center p-6 bg-white/50 rounded-lg">
        <Palette className="h-8 w-8 text-primary mx-auto mb-3" />
        <h3 className="font-semibold mb-2">Multiple Styles</h3>
        <p className="text-sm text-gray-600">12+ artistic styles to choose from</p>
      </div>
      <div className="text-center p-6 bg-white/50 rounded-lg">
        <Copy className="h-8 w-8 text-primary mx-auto mb-3" />
        <h3 className="font-semibold mb-2">Easy Copy</h3>
        <p className="text-sm text-gray-600">One-click copy to clipboard</p>
      </div>
      <div className="text-center p-6 bg-white/50 rounded-lg">
        <Lightbulb className="h-8 w-8 text-primary mx-auto mb-3" />
        <h3 className="font-semibold mb-2">Quick Prompts</h3>
        <p className="text-sm text-gray-600">Pre-made prompts for inspiration</p>
      </div>
    </div>
  );
};

export default FeatureGrid;
