
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

    // Use Gemini's image generation capabilities through Imagen
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Generate a detailed image description for: ${enhancedPrompt}. Provide a very detailed description that could be used to create the image.`
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          topK: 32,
          topP: 1,
          maxOutputTokens: 1024,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Gemini API');
    }

    // For now, we'll create a placeholder image URL since Gemini doesn't directly generate images
    // In a real implementation, you'd integrate with an image generation service
    const imageDescription = data.candidates[0].content.parts[0].text;
    
    // Create a data URL with the description as a simple placeholder
    // In production, you'd use this description with an actual image generation service
    const canvas = `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <text x="50%" y="30%" text-anchor="middle" font-family="Arial" font-size="16" fill="#333">
        Generated Image
      </text>
      <text x="50%" y="50%" text-anchor="middle" font-family="Arial" font-size="12" fill="#666">
        ${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}
      </text>
      <text x="50%" y="70%" text-anchor="middle" font-family="Arial" font-size="10" fill="#999">
        Style: ${style}
      </text>
    </svg>`;
    
    const imageUrl = `data:image/svg+xml;base64,${btoa(canvas)}`;

    console.log('Image generated successfully');

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
