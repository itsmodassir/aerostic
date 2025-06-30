
import { FileText, Palette, Settings } from "lucide-react";

interface ProgressStepsProps {
  currentStep: number;
}

const ProgressSteps = ({ currentStep }: ProgressStepsProps) => {
  return (
    <div className="flex justify-center mb-12">
      <div className="flex items-center space-x-4">
        <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-primary' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
            <FileText className="h-4 w-4" />
          </div>
          <span className="font-medium">Basic Info</span>
        </div>
        <div className={`w-8 h-px ${currentStep >= 2 ? 'bg-primary' : 'bg-gray-200'}`} />
        <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-primary' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
            <Palette className="h-4 w-4" />
          </div>
          <span className="font-medium">Design</span>
        </div>
        <div className={`w-8 h-px ${currentStep >= 3 ? 'bg-primary' : 'bg-gray-200'}`} />
        <div className={`flex items-center space-x-2 ${currentStep >= 3 ? 'text-primary' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
            <Settings className="h-4 w-4" />
          </div>
          <span className="font-medium">Preview & Launch</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressSteps;
