
import { useState } from "react";
import { toast } from "sonner";

export const usePromptGenerator = () => {
  const [basicPrompt, setBasicPrompt] = useState("");
  const [subject, setSubject] = useState("");
  const [style, setStyle] = useState("realistic");
  const [mood, setMood] = useState("neutral");
  const [lighting, setLighting] = useState("natural");
  const [composition, setComposition] = useState("centered");
  const [details, setDetails] = useState("medium");
  const [generatedPrompt, setGeneratedPrompt] = useState("");

  const styles = [
    { id: "realistic", name: "Realistic Photography" },
    { id: "artistic", name: "Artistic Painting" },
    { id: "cartoon", name: "Cartoon/Animation" },
    { id: "abstract", name: "Abstract Art" },
    { id: "vintage", name: "Vintage/Retro" },
    { id: "futuristic", name: "Futuristic/Sci-Fi" },
    { id: "minimalist", name: "Minimalist" },
    { id: "watercolor", name: "Watercolor" },
    { id: "digital_art", name: "Digital Art" },
    { id: "oil_painting", name: "Oil Painting" },
    { id: "pencil_sketch", name: "Pencil Sketch" },
    { id: "anime", name: "Anime/Manga" }
  ];

  const moods = [
    { id: "neutral", name: "Neutral" },
    { id: "happy", name: "Happy/Joyful" },
    { id: "dramatic", name: "Dramatic" },
    { id: "peaceful", name: "Peaceful/Serene" },
    { id: "mysterious", name: "Mysterious" },
    { id: "energetic", name: "Energetic" },
    { id: "melancholic", name: "Melancholic" },
    { id: "romantic", name: "Romantic" },
    { id: "epic", name: "Epic/Heroic" },
    { id: "dark", name: "Dark/Gothic" }
  ];

  const lightingOptions = [
    { id: "natural", name: "Natural Daylight" },
    { id: "golden_hour", name: "Golden Hour" },
    { id: "blue_hour", name: "Blue Hour" },
    { id: "dramatic", name: "Dramatic Lighting" },
    { id: "soft", name: "Soft Lighting" },
    { id: "studio", name: "Studio Lighting" },
    { id: "candlelight", name: "Candlelight" },
    { id: "neon", name: "Neon Lighting" },
    { id: "backlit", name: "Backlit" },
    { id: "rim_light", name: "Rim Lighting" }
  ];

  const compositions = [
    { id: "centered", name: "Centered" },
    { id: "rule_of_thirds", name: "Rule of Thirds" },
    { id: "close_up", name: "Close-up" },
    { id: "wide_shot", name: "Wide Shot" },
    { id: "birds_eye", name: "Bird's Eye View" },
    { id: "worms_eye", name: "Worm's Eye View" },
    { id: "dutch_angle", name: "Dutch Angle" },
    { id: "symmetrical", name: "Symmetrical" },
    { id: "asymmetrical", name: "Asymmetrical" }
  ];

  const detailLevels = [
    { id: "minimal", name: "Minimal Details" },
    { id: "medium", name: "Medium Details" },
    { id: "high", name: "High Details" },
    { id: "ultra", name: "Ultra Detailed" }
  ];

  const quickPrompts = [
    "A majestic mountain landscape at sunrise",
    "Portrait of a wise old wizard with a long beard",
    "A cozy coffee shop on a rainy day",
    "Futuristic city skyline with flying cars",
    "A cute puppy playing in a field of flowers",
    "Abstract geometric shapes in vibrant colors",
    "A magical forest with glowing mushrooms",
    "Vintage car parked in front of a diner"
  ];

  const generatePrompt = () => {
    if (!subject.trim() && !basicPrompt.trim()) {
      toast.error("Please enter a subject or basic prompt");
      return;
    }

    const mainSubject = subject.trim() || basicPrompt.trim();
    const selectedStyle = styles.find(s => s.id === style)?.name || "realistic";
    const selectedMood = moods.find(m => m.id === mood)?.name || "neutral";
    const selectedLighting = lightingOptions.find(l => l.id === lighting)?.name || "natural";
    const selectedComposition = compositions.find(c => c.id === composition)?.name || "centered";
    
    let prompt = mainSubject;
    
    // Add style
    if (style !== "realistic") {
      prompt += `, ${selectedStyle.toLowerCase()} style`;
    }
    
    // Add mood if not neutral
    if (mood !== "neutral") {
      prompt += `, ${selectedMood.toLowerCase()} mood`;
    }
    
    // Add lighting
    prompt += `, ${selectedLighting.toLowerCase()}`;
    
    // Add composition
    if (composition !== "centered") {
      prompt += `, ${selectedComposition.toLowerCase()} composition`;
    }
    
    // Add detail level
    switch (details) {
      case "minimal":
        prompt += ", simple, clean";
        break;
      case "high":
        prompt += ", highly detailed, intricate";
        break;
      case "ultra":
        prompt += ", ultra detailed, hyperrealistic, 8k resolution";
        break;
    }
    
    // Add quality enhancers
    prompt += ", professional photography, high quality";
    
    setGeneratedPrompt(prompt);
    toast.success("Prompt generated successfully!");
  };

  const copyToClipboard = async () => {
    if (!generatedPrompt) return;
    
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      toast.success("Prompt copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy prompt");
    }
  };

  const clearAll = () => {
    setBasicPrompt("");
    setSubject("");
    setStyle("realistic");
    setMood("neutral");
    setLighting("natural");
    setComposition("centered");
    setDetails("medium");
    setGeneratedPrompt("");
    toast.success("All fields cleared");
  };

  const useQuickPrompt = (prompt: string) => {
    setSubject(prompt);
    toast.success("Quick prompt loaded!");
  };

  return {
    // State
    basicPrompt,
    subject,
    style,
    mood,
    lighting,
    composition,
    details,
    generatedPrompt,
    
    // Data
    styles,
    moods,
    lightingOptions,
    compositions,
    detailLevels,
    quickPrompts,
    
    // Setters
    setBasicPrompt,
    setSubject,
    setStyle,
    setMood,
    setLighting,
    setComposition,
    setDetails,
    
    // Actions
    generatePrompt,
    copyToClipboard,
    clearAll,
    useQuickPrompt
  };
};
