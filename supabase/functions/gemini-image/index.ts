
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, style = 'realistic', size = '1024x1024', quality = 'standard' } = await req.json();
    
    if (!prompt) {
      throw new Error('Prompt is required');
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY_IMAGES');
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    console.log('Generating image with Gemini:', { prompt, style, size, quality });

    // Enhanced prompt based on style
    let enhancedPrompt = prompt;
    switch (style) {
      case 'realistic':
        enhancedPrompt = `Create a highly realistic, photographic image of: ${prompt}. High detail, professional photography quality.`;
        break;
      case 'artistic':
        enhancedPrompt = `Create an artistic, creative interpretation of: ${prompt}. Beautiful, expressive, artistic style.`;
        break;
      case 'cartoon':
        enhancedPrompt = `Create a fun, cartoon-style image of: ${prompt}. Colorful, playful, animated style.`;
        break;
      case 'abstract':
        enhancedPrompt = `Create an abstract, conceptual representation of: ${prompt}. Modern, creative, abstract art style.`;
        break;
      case 'vintage':
        enhancedPrompt = `Create a vintage, retro-style image of: ${prompt}. Classic, nostalgic, aged appearance.`;
        break;
      case 'futuristic':
        enhancedPrompt = `Create a futuristic, modern image of: ${prompt}. High-tech, sleek, contemporary design.`;
        break;
    }

    // Use the correct Gemini API endpoint for text generation
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Create a detailed visual description for an image generation AI based on this request: "${enhancedPrompt}". 

Provide a comprehensive description that includes:
- Visual composition and layout
- Colors, lighting, and mood
- Artistic style and technique
- Specific details and elements
- Camera angle or perspective (if applicable)

Make the description vivid and specific enough that an AI image generator could create a compelling image from it.`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 32,
          topP: 1,
          maxOutputTokens: 1024,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Invalid Gemini response:', data);
      throw new Error('Invalid response from Gemini API');
    }

    const imageDescription = data.candidates[0].content.parts[0].text;
    
    // Create a more sophisticated SVG placeholder with the description
    const [width, height] = size.split('x').map(Number);
    const aspectRatio = width / height;
    const svgWidth = Math.min(width, 512);
    const svgHeight = Math.min(height, 512);
    
    // Create a gradient based on style
    let gradientColors = '#f0f0f0,#e0e0e0';
    switch (style) {
      case 'realistic':
        gradientColors = '#f8f9fa,#e9ecef';
        break;
      case 'artistic':
        gradientColors = '#ffecd2,#fcb69f';
        break;
      case 'cartoon':
        gradientColors = '#a8edea,#fed6e3';
        break;
      case 'abstract':
        gradientColors = '#d299c2,#fef9d7';
        break;
      case 'vintage':
        gradientColors = '#f7ddd6,#e8c5a0';
        break;
      case 'futuristic':
        gradientColors = '#667eea,#764ba2';
        break;
    }

    const [color1, color2] = gradientColors.split(',');
    
    const canvas = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      <circle cx="25%" cy="25%" r="20" fill="rgba(255,255,255,0.3)"/>
      <circle cx="75%" cy="75%" r="30" fill="rgba(255,255,255,0.2)"/>
      <text x="50%" y="20%" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#333">
        AI Generated Image
      </text>
      <text x="50%" y="35%" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#555">
        ${prompt.length > 40 ? prompt.substring(0, 37) + '...' : prompt}
      </text>
      <text x="50%" y="85%" text-anchor="middle" font-family="Arial, sans-serif" font-size="8" fill="#777">
        Style: ${style.charAt(0).toUpperCase() + style.slice(1)} | ${size}
      </text>
      <text x="50%" y="95%" text-anchor="middle" font-family="Arial, sans-serif" font-size="7" fill="#999">
        Powered by Gemini AI
      </text>
    </svg>`;
    
    const imageUrl = `data:image/svg+xml;base64,${btoa(canvas)}`;

    console.log('Image generated successfully with description');

    return new Response(JSON.stringify({ 
      imageUrl,
      description: imageDescription 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in gemini-image function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An error occurred while generating the image' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
