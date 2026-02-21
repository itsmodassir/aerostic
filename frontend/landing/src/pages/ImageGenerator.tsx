
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { RefreshCw, Sparkles } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { usePromptGenerator } from "@/hooks/usePromptGenerator";
import PromptGeneratorHeader from "@/components/prompt-generator/PromptGeneratorHeader";
import BasicPromptSection from "@/components/prompt-generator/BasicPromptSection";
import ContentTypeSection from "@/components/prompt-generator/ContentTypeSection";
import StyleSection from "@/components/prompt-generator/StyleSection";
import AdvancedStyleSection from "@/components/prompt-generator/AdvancedStyleSection";
import EnvironmentSection from "@/components/prompt-generator/EnvironmentSection";
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
    cameraAngle,
    aspectRatio,
    colorPalette,
    textures,
    environment,
    timeOfDay,
    weather,
    artMovement,
    contentType,
    generatedPrompt,
    contentTypes,
    styles,
    moods,
    lightingOptions,
    compositions,
    cameraAngles,
    aspectRatios,
    colorPalettes,
    textureOptions,
    environments,
    timeOptions,
    weatherOptions,
    artMovements,
    detailLevels,
    quickPrompts,
    setSubject,
    setStyle,
    setMood,
    setLighting,
    setComposition,
    setDetails,
    setCameraAngle,
    setAspectRatio,
    setColorPalette,
    setTextures,
    setEnvironment,
    setTimeOfDay,
    setWeather,
    setArtMovement,
    setContentType,
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
          <div className="max-w-7xl mx-auto">
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

                <ContentTypeSection
                  contentType={contentType}
                  setContentType={setContentType}
                  aspectRatio={aspectRatio}
                  setAspectRatio={setAspectRatio}
                  contentTypes={contentTypes}
                  aspectRatios={aspectRatios}
                />

                <StyleSection
                  style={style}
                  setStyle={setStyle}
                  mood={mood}
                  setMood={setMood}
                  styles={styles}
                  moods={moods}
                />

                <AdvancedStyleSection
                  artMovement={artMovement}
                  setArtMovement={setArtMovement}
                  colorPalette={colorPalette}
                  setColorPalette={setColorPalette}
                  textures={textures}
                  setTextures={setTextures}
                  artMovements={artMovements}
                  colorPalettes={colorPalettes}
                  textureOptions={textureOptions}
                />

                <EnvironmentSection
                  environment={environment}
                  setEnvironment={setEnvironment}
                  timeOfDay={timeOfDay}
                  setTimeOfDay={setTimeOfDay}
                  weather={weather}
                  setWeather={setWeather}
                  environments={environments}
                  timeOptions={timeOptions}
                  weatherOptions={weatherOptions}
                />

                <TechnicalSection
                  lighting={lighting}
                  setLighting={setLighting}
                  composition={composition}
                  setComposition={setComposition}
                  cameraAngle={cameraAngle}
                  setCameraAngle={setCameraAngle}
                  details={details}
                  setDetails={setDetails}
                  lightingOptions={lightingOptions}
                  compositions={compositions}
                  cameraAngles={cameraAngles}
                  detailLevels={detailLevels}
                />

                <div className="flex gap-3">
                  <Button 
                    onClick={generatePrompt} 
                    className="flex-1"
                    size="lg"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Detailed Prompt
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
