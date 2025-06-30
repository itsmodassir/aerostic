
import { useState } from "react";
import { toast } from "sonner";

export const usePromptGenerator = () => {
  const [subject, setSubject] = useState("");
  const [style, setStyle] = useState("realistic");
  const [mood, setMood] = useState("neutral");
  const [lighting, setLighting] = useState("natural");
  const [composition, setComposition] = useState("centered");
  const [details, setDetails] = useState("medium");
  const [cameraAngle, setCameraAngle] = useState("eye_level");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [colorPalette, setColorPalette] = useState("natural");
  const [textures, setTextures] = useState("smooth");
  const [environment, setEnvironment] = useState("indoor");
  const [timeOfDay, setTimeOfDay] = useState("day");
  const [weather, setWeather] = useState("clear");
  const [artMovement, setArtMovement] = useState("none");
  const [contentType, setContentType] = useState("image");
  const [generatedPrompt, setGeneratedPrompt] = useState("");

  const contentTypes = [
    { id: "image", name: "Image/Photo" },
    { id: "video", name: "Video/Animation" },
    { id: "artwork", name: "Digital Artwork" },
    { id: "logo", name: "Logo/Brand Design" },
    { id: "illustration", name: "Illustration" },
    { id: "3d_render", name: "3D Render" }
  ];

  const styles = [
    { id: "realistic", name: "Realistic Photography" },
    { id: "cinematic", name: "Cinematic" },
    { id: "artistic", name: "Artistic Painting" },
    { id: "cartoon", name: "Cartoon/Animation" },
    { id: "anime", name: "Anime/Manga" },
    { id: "abstract", name: "Abstract Art" },
    { id: "vintage", name: "Vintage/Retro" },
    { id: "futuristic", name: "Futuristic/Sci-Fi" },
    { id: "minimalist", name: "Minimalist" },
    { id: "watercolor", name: "Watercolor" },
    { id: "digital_art", name: "Digital Art" },
    { id: "oil_painting", name: "Oil Painting" },
    { id: "pencil_sketch", name: "Pencil Sketch" },
    { id: "pixel_art", name: "Pixel Art" },
    { id: "pop_art", name: "Pop Art" },
    { id: "surreal", name: "Surreal/Fantasy" }
  ];

  const moods = [
    { id: "neutral", name: "Neutral" },
    { id: "happy", name: "Happy/Joyful" },
    { id: "dramatic", name: "Dramatic/Intense" },
    { id: "peaceful", name: "Peaceful/Serene" },
    { id: "mysterious", name: "Mysterious/Dark" },
    { id: "energetic", name: "Energetic/Dynamic" },
    { id: "melancholic", name: "Melancholic/Sad" },
    { id: "romantic", name: "Romantic/Intimate" },
    { id: "epic", name: "Epic/Heroic" },
    { id: "whimsical", name: "Whimsical/Playful" },
    { id: "horror", name: "Horror/Scary" },
    { id: "nostalgic", name: "Nostalgic/Vintage" }
  ];

  const lightingOptions = [
    { id: "natural", name: "Natural Daylight" },
    { id: "golden_hour", name: "Golden Hour" },
    { id: "blue_hour", name: "Blue Hour/Twilight" },
    { id: "dramatic", name: "Dramatic Lighting" },
    { id: "soft", name: "Soft/Diffused" },
    { id: "studio", name: "Studio Lighting" },
    { id: "candlelight", name: "Candlelight/Warm" },
    { id: "neon", name: "Neon/Colorful" },
    { id: "backlit", name: "Backlighting" },
    { id: "rim_light", name: "Rim Lighting" },
    { id: "volumetric", name: "Volumetric/God Rays" },
    { id: "harsh", name: "Harsh/High Contrast" }
  ];

  const compositions = [
    { id: "centered", name: "Centered" },
    { id: "rule_of_thirds", name: "Rule of Thirds" },
    { id: "close_up", name: "Close-up/Macro" },
    { id: "wide_shot", name: "Wide Shot/Panoramic" },
    { id: "birds_eye", name: "Bird's Eye View" },
    { id: "worms_eye", name: "Worm's Eye View" },
    { id: "dutch_angle", name: "Dutch Angle" },
    { id: "symmetrical", name: "Symmetrical" },
    { id: "asymmetrical", name: "Dynamic/Asymmetrical" },
    { id: "leading_lines", name: "Leading Lines" },
    { id: "framing", name: "Natural Framing" }
  ];

  const cameraAngles = [
    { id: "eye_level", name: "Eye Level" },
    { id: "low_angle", name: "Low Angle" },
    { id: "high_angle", name: "High Angle" },
    { id: "over_shoulder", name: "Over the Shoulder" },
    { id: "profile", name: "Profile/Side View" },
    { id: "three_quarter", name: "Three-Quarter View" },
    { id: "extreme_close", name: "Extreme Close-up" },
    { id: "establishing", name: "Establishing Shot" }
  ];

  const aspectRatios = [
    { id: "16:9", name: "16:9 (Widescreen)" },
    { id: "9:16", name: "9:16 (Portrait/Mobile)" },
    { id: "1:1", name: "1:1 (Square)" },
    { id: "4:3", name: "4:3 (Classic)" },
    { id: "3:2", name: "3:2 (Photography)" },
    { id: "21:9", name: "21:9 (Ultrawide)" },
    { id: "2:3", name: "2:3 (Portrait)" }
  ];

  const colorPalettes = [
    { id: "natural", name: "Natural Colors" },
    { id: "warm", name: "Warm Tones" },
    { id: "cool", name: "Cool Tones" },
    { id: "monochrome", name: "Monochrome/B&W" },
    { id: "vibrant", name: "Vibrant/Saturated" },
    { id: "pastel", name: "Pastel Colors" },
    { id: "neon", name: "Neon/Electric" },
    { id: "earth", name: "Earth Tones" },
    { id: "sunset", name: "Sunset Colors" },
    { id: "ocean", name: "Ocean Blues" }
  ];

  const textureOptions = [
    { id: "smooth", name: "Smooth/Clean" },
    { id: "rough", name: "Rough/Textured" },
    { id: "glossy", name: "Glossy/Reflective" },
    { id: "matte", name: "Matte/Non-reflective" },
    { id: "metallic", name: "Metallic/Shiny" },
    { id: "fabric", name: "Fabric/Cloth" },
    { id: "wood", name: "Wood Grain" },
    { id: "stone", name: "Stone/Marble" },
    { id: "glass", name: "Glass/Crystal" },
    { id: "organic", name: "Organic/Natural" }
  ];

  const environments = [
    { id: "indoor", name: "Indoor/Interior" },
    { id: "outdoor", name: "Outdoor/Exterior" },
    { id: "urban", name: "Urban/City" },
    { id: "nature", name: "Nature/Landscape" },
    { id: "studio", name: "Studio/Controlled" },
    { id: "fantasy", name: "Fantasy/Magical" },
    { id: "futuristic", name: "Futuristic/Sci-Fi" },
    { id: "underwater", name: "Underwater" },
    { id: "space", name: "Space/Cosmic" },
    { id: "abstract", name: "Abstract Environment" }
  ];

  const timeOptions = [
    { id: "day", name: "Daytime" },
    { id: "night", name: "Nighttime" },
    { id: "dawn", name: "Dawn/Sunrise" },
    { id: "dusk", name: "Dusk/Sunset" },
    { id: "golden_hour", name: "Golden Hour" },
    { id: "blue_hour", name: "Blue Hour" },
    { id: "midnight", name: "Midnight" },
    { id: "noon", name: "High Noon" }
  ];

  const weatherOptions = [
    { id: "clear", name: "Clear/Sunny" },
    { id: "cloudy", name: "Cloudy/Overcast" },
    { id: "rainy", name: "Rainy/Stormy" },
    { id: "snowy", name: "Snowy/Winter" },
    { id: "foggy", name: "Foggy/Misty" },
    { id: "windy", name: "Windy" },
    { id: "dramatic", name: "Dramatic Sky" },
    { id: "rainbow", name: "Rainbow/Post-rain" }
  ];

  const artMovements = [
    { id: "none", name: "None/Modern" },
    { id: "renaissance", name: "Renaissance" },
    { id: "baroque", name: "Baroque" },
    { id: "impressionism", name: "Impressionism" },
    { id: "expressionism", name: "Expressionism" },
    { id: "cubism", name: "Cubism" },
    { id: "surrealism", name: "Surrealism" },
    { id: "art_nouveau", name: "Art Nouveau" },
    { id: "art_deco", name: "Art Deco" },
    { id: "pop_art", name: "Pop Art" },
    { id: "minimalism", name: "Minimalism" }
  ];

  const detailLevels = [
    { id: "minimal", name: "Minimal Details" },
    { id: "medium", name: "Medium Details" },
    { id: "high", name: "High Details" },
    { id: "ultra", name: "Ultra Detailed" },
    { id: "hyperrealistic", name: "Hyperrealistic" }
  ];

  const quickPrompts = [
    "A majestic mountain landscape at sunrise with misty valleys",
    "Portrait of a wise old wizard with intricate robes and glowing staff",
    "A cozy coffee shop on a rainy day with warm lighting",
    "Futuristic cyberpunk city skyline with neon lights and flying cars",
    "A cute golden retriever puppy playing in a field of wildflowers",
    "Abstract geometric patterns in vibrant rainbow colors",
    "A magical enchanted forest with glowing mushrooms and fairy lights",
    "Vintage 1950s diner with classic cars parked outside",
    "Underwater coral reef scene with tropical fish and sea life",
    "Space scene with planets, nebulae, and distant galaxies",
    "Medieval castle on a hilltop during a dramatic thunderstorm",
    "Modern minimalist architecture with clean lines and natural lighting"
  ];

  const generatePrompt = () => {
    if (!subject.trim()) {
      toast.error("Please enter a subject or main content");
      return;
    }

    let prompt = subject.trim();
    
    // Add content type specific elements
    if (contentType === "video") {
      prompt += ", cinematic video, smooth motion";
    } else if (contentType === "3d_render") {
      prompt += ", 3D rendered, volumetric lighting";
    }
    
    // Add style
    const selectedStyle = styles.find(s => s.id === style)?.name || "realistic";
    if (style !== "realistic") {
      prompt += `, ${selectedStyle.toLowerCase()} style`;
    }
    
    // Add art movement
    if (artMovement !== "none") {
      const selectedMovement = artMovements.find(m => m.id === artMovement)?.name;
      prompt += `, in the style of ${selectedMovement?.toLowerCase()}`;
    }
    
    // Add mood
    if (mood !== "neutral") {
      const selectedMood = moods.find(m => m.id === mood)?.name || "neutral";
      prompt += `, ${selectedMood.toLowerCase()} mood`;
    }
    
    // Add environment and time
    if (environment !== "indoor") {
      const selectedEnv = environments.find(e => e.id === environment)?.name;
      prompt += `, ${selectedEnv?.toLowerCase()} setting`;
    }
    
    if (timeOfDay !== "day") {
      const selectedTime = timeOptions.find(t => t.id === timeOfDay)?.name;
      prompt += `, ${selectedTime?.toLowerCase()}`;
    }
    
    if (weather !== "clear") {
      const selectedWeather = weatherOptions.find(w => w.id === weather)?.name;
      prompt += `, ${selectedWeather?.toLowerCase()} weather`;
    }
    
    // Add lighting
    const selectedLighting = lightingOptions.find(l => l.id === lighting)?.name || "natural";
    prompt += `, ${selectedLighting.toLowerCase()} lighting`;
    
    // Add composition and camera angle
    if (composition !== "centered") {
      const selectedComposition = compositions.find(c => c.id === composition)?.name;
      prompt += `, ${selectedComposition?.toLowerCase()} composition`;
    }
    
    if (cameraAngle !== "eye_level") {
      const selectedAngle = cameraAngles.find(a => a.id === cameraAngle)?.name;
      prompt += `, ${selectedAngle?.toLowerCase()} camera angle`;
    }
    
    // Add color palette
    if (colorPalette !== "natural") {
      const selectedColors = colorPalettes.find(c => c.id === colorPalette)?.name;
      prompt += `, ${selectedColors?.toLowerCase()}`;
    }
    
    // Add textures
    if (textures !== "smooth") {
      const selectedTexture = textureOptions.find(t => t.id === textures)?.name;
      prompt += `, ${selectedTexture?.toLowerCase()} textures`;
    }
    
    // Add aspect ratio
    if (aspectRatio !== "16:9") {
      prompt += `, ${aspectRatio} aspect ratio`;
    }
    
    // Add detail level
    switch (details) {
      case "minimal":
        prompt += ", simple, clean, minimal details";
        break;
      case "high":
        prompt += ", highly detailed, intricate, fine details";
        break;
      case "ultra":
        prompt += ", ultra detailed, hyperrealistic, 8k resolution, extremely detailed";
        break;
      case "hyperrealistic":
        prompt += ", hyperrealistic, photorealistic, ultra high definition, masterpiece quality";
        break;
    }
    
    // Add quality enhancers based on content type
    if (contentType === "image" || contentType === "artwork") {
      prompt += ", professional photography, high quality, sharp focus";
    } else if (contentType === "video") {
      prompt += ", cinematic quality, professional video production, smooth motion";
    } else if (contentType === "3d_render") {
      prompt += ", professional 3D rendering, ray tracing, global illumination";
    } else if (contentType === "logo") {
      prompt += ", clean vector design, professional branding, scalable";
    }
    
    setGeneratedPrompt(prompt);
    toast.success("Detailed prompt generated successfully!");
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
    setSubject("");
    setStyle("realistic");
    setMood("neutral");
    setLighting("natural");
    setComposition("centered");
    setDetails("medium");
    setCameraAngle("eye_level");
    setAspectRatio("16:9");
    setColorPalette("natural");
    setTextures("smooth");
    setEnvironment("indoor");
    setTimeOfDay("day");
    setWeather("clear");
    setArtMovement("none");
    setContentType("image");
    setGeneratedPrompt("");
    toast.success("All fields cleared");
  };

  const useQuickPrompt = (prompt: string) => {
    setSubject(prompt);
    toast.success("Quick prompt loaded!");
  };

  return {
    // State
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
    
    // Data
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
    
    // Setters
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
    
    // Actions
    generatePrompt,
    copyToClipboard,
    clearAll,
    useQuickPrompt
  };
};
