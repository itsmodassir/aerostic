
import { Sparkles, Palette, Copy, Lightbulb, Monitor, Globe, Camera, Brush } from "lucide-react";

const FeatureGrid = () => {
  return (
    <div className="mt-12 grid md:grid-cols-4 lg:grid-cols-8 gap-4">
      <div className="text-center p-4 bg-white/50 rounded-lg">
        <Sparkles className="h-6 w-6 text-primary mx-auto mb-2" />
        <h3 className="font-semibold text-sm mb-1">Smart Generation</h3>
        <p className="text-xs text-gray-600">AI-powered prompt building</p>
      </div>
      <div className="text-center p-4 bg-white/50 rounded-lg">
        <Monitor className="h-6 w-6 text-primary mx-auto mb-2" />
        <h3 className="font-semibold text-sm mb-1">Multi-Content</h3>
        <p className="text-xs text-gray-600">Images, videos, 3D renders</p>
      </div>
      <div className="text-center p-4 bg-white/50 rounded-lg">
        <Palette className="h-6 w-6 text-primary mx-auto mb-2" />
        <h3 className="font-semibold text-sm mb-1">16+ Styles</h3>
        <p className="text-xs text-gray-600">Artistic styles & movements</p>
      </div>
      <div className="text-center p-4 bg-white/50 rounded-lg">
        <Camera className="h-6 w-6 text-primary mx-auto mb-2" />
        <h3 className="font-semibold text-sm mb-1">Pro Camera</h3>
        <p className="text-xs text-gray-600">Advanced camera controls</p>
      </div>
      <div className="text-center p-4 bg-white/50 rounded-lg">
        <Globe className="h-6 w-6 text-primary mx-auto mb-2" />
        <h3 className="font-semibold text-sm mb-1">Environments</h3>
        <p className="text-xs text-gray-600">10+ scene settings</p>
      </div>
      <div className="text-center p-4 bg-white/50 rounded-lg">
        <Brush className="h-6 w-6 text-primary mx-auto mb-2" />
        <h3 className="font-semibold text-sm mb-1">Color & Texture</h3>
        <p className="text-xs text-gray-600">Advanced styling options</p>
      </div>
      <div className="text-center p-4 bg-white/50 rounded-lg">
        <Copy className="h-6 w-6 text-primary mx-auto mb-2" />
        <h3 className="font-semibold text-sm mb-1">Easy Copy</h3>
        <p className="text-xs text-gray-600">One-click clipboard</p>
      </div>
      <div className="text-center p-4 bg-white/50 rounded-lg">
        <Lightbulb className="h-6 w-6 text-primary mx-auto mb-2" />
        <h3 className="font-semibold text-sm mb-1">Pro Tips</h3>
        <p className="text-xs text-gray-600">Expert guidance included</p>
      </div>
    </div>
  );
};

export default FeatureGrid;
