
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { RefreshCw, Sparkles } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { usePromptGenerator } from "@/hooks/usePromptGenerator";
import PromptGeneratorHeader from "@/components/prompt-generator/PromptGeneratorHeader";
import BasicPromptSection from "@/components/prompt-generator/BasicPromptSection";
import StyleSection from "@/components/prompt-generator/StyleSection";
import TechnicalSection from "@/components/prompt-generator/TechnicalSection";
import GeneratedPromptSection from "@/components/prompt-generator/GeneratedPromptSection";
import PromptTips from "@/components/prompt-generator/PromptTips";
import FeatureGrid from "@/components/prompt-generator/FeatureGrid";

const ImageGenerator = () => {
  const {
    subject,
    style,
    mood,
    lighting,
    composition,
    details,
    generatedPrompt,
    styles,
    moods,
    lightingOptions,
    compositions,
    detailLevels,
    quickPrompts,
    setSubject,
    setStyle,
    setMood,
    setLighting,
    setComposition,
    setDetails,
    generatePrompt,
    copyToClipboard,
    clearAll,
    useQuickPrompt
  } = usePromptGenerator();

  return (
    <ProtectedRoute>
      <div className="min-h-screen gradient-bg">
        <Navigation />
        
        <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <PromptGeneratorHeader />

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Controls */}
              <div className="space-y-6">
                <BasicPromptSection
                  subject={subject}
                  setSubject={setSubject}
                  quickPrompts={quickPrompts}
                  useQuickPrompt={useQuickPrompt}
                />

                <StyleSection
                  style={style}
                  setStyle={setStyle}
                  mood={mood}
                  setMood={setMood}
                  styles={styles}
                  moods={moods}
                />

                <TechnicalSection
                  lighting={lighting}
                  setLighting={setLighting}
                  composition={composition}
                  setComposition={setComposition}
                  details={details}
                  setDetails={setDetails}
                  lightingOptions={lightingOptions}
                  compositions={compositions}
                  detailLevels={detailLevels}
                />

                <div className="flex gap-3">
                  <Button 
                    onClick={generatePrompt} 
                    className="flex-1"
                    size="lg"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Prompt
                  </Button>
                  <Button 
                    onClick={clearAll} 
                    variant="outline"
                    size="lg"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Generated Prompt */}
              <div className="space-y-6">
                <GeneratedPromptSection
                  generatedPrompt={generatedPrompt}
                  copyToClipboard={copyToClipboard}
                />

                <PromptTips />
              </div>
            </div>

            <FeatureGrid />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ImageGenerator;
