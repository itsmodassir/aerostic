import { useState } from "react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PromptGeneratorHeader from "@/components/prompt-generator/PromptGeneratorHeader";
import FeatureGrid from "@/components/prompt-generator/FeatureGrid";
import BasicPromptSection from "@/components/prompt-generator/BasicPromptSection";
import ContentTypeSection from "@/components/prompt-generator/ContentTypeSection";
import StyleSection from "@/components/prompt-generator/StyleSection";
import TechnicalSection from "@/components/prompt-generator/TechnicalSection";
import AdvancedStyleSection from "@/components/prompt-generator/AdvancedStyleSection";
import EnvironmentSection from "@/components/prompt-generator/EnvironmentSection";
import GeneratedPromptSection from "@/components/prompt-generator/GeneratedPromptSection";
import PromptTips from "@/components/prompt-generator/PromptTips";
import { usePromptGenerator } from "@/hooks/usePromptGenerator";

const PromptGenerator = () => {
  const {
    subject,
    setSubject,
    contentType,
    setContentType,
    style,
    setStyle,
    mood,
    setMood,
    lighting,
    setLighting,
    composition,
    setComposition,
    details,
    setDetails,
    cameraAngle,
    setCameraAngle,
    aspectRatio,
    setAspectRatio,
    colorPalette,
    setColorPalette,
    textures,
    setTextures,
    environment,
    setEnvironment,
    timeOfDay,
    setTimeOfDay,
    weather,
    setWeather,
    artMovement,
    setArtMovement,
    generatedPrompt,
    generatePrompt,
    copyToClipboard,
    clearAll,
    useQuickPrompt,
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
    quickPrompts
  } = usePromptGenerator();

  return (
    <div className="min-h-screen gradient-bg">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <PromptGeneratorHeader />
          <FeatureGrid />

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
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
              <AdvancedStyleSection 
                colorPalette={colorPalette}
                setColorPalette={setColorPalette}
                textures={textures}
                setTextures={setTextures}
                artMovement={artMovement}
                setArtMovement={setArtMovement}
                colorPalettes={colorPalettes}
                textureOptions={textureOptions}
                artMovements={artMovements}
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
            </div>

            <div className="space-y-6">
              <GeneratedPromptSection 
                generatedPrompt={generatedPrompt}
                copyToClipboard={copyToClipboard}
              />
              <div className="flex gap-2 mt-4">
                <Button onClick={generatePrompt} className="flex-1">
                  Generate Prompt
                </Button>
                <Button onClick={clearAll} variant="outline">
                  Clear All
                </Button>
              </div>
              <PromptTips />
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PromptGenerator;