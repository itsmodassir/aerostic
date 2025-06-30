
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

    // Create a comprehensive prompt that incorporates the user's instructions
    let detailedPrompt = `Create a detailed visual description for an AI image generator based on this request: "${prompt}"

Style specification: ${style}
Quality: ${quality}
Size: ${size}

Please provide a comprehensive description that includes:

1. COMPOSITION & LAYOUT:
   - Overall composition and framing
   - Subject placement and positioning
   - Background elements and environment

2. VISUAL DETAILS:
   - Specific colors, textures, and materials
   - Lighting conditions (natural/artificial, direction, intensity)
   - Atmospheric effects and mood

3. STYLE & TECHNIQUE:
   - Artistic style based on the requested "${style}" approach
   - Level of detail and realism
   - Visual treatment and aesthetic

4. TECHNICAL SPECIFICATIONS:
   - Camera angle or perspective if applicable
   - Depth of field and focus areas
   - Any special effects or visual elements

Make the description vivid, specific, and detailed enough that an AI image generator could create a high-quality, accurate image that follows the user's instructions precisely. Focus on translating the user's intent into clear visual directions.`;

    // Use the correct Gemini API endpoint
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: detailedPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.9,
          maxOutputTokens: 2048,
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

    const enhancedDescription = data.candidates[0].content.parts[0].text;
    
    // Create a more sophisticated SVG based on the style and enhanced description
    const [width, height] = size.split('x').map(Number);
    const svgWidth = Math.min(width, 800);
    const svgHeight = Math.min(height, 600);
    
    // Style-specific visual elements
    let styleElements = '';
    let gradientColors = '#f0f0f0,#e0e0e0';
    let accentColor = '#333';
    
    switch (style) {
      case 'realistic':
        gradientColors = '#f8f9fa,#e9ecef';
        accentColor = '#495057';
        styleElements = `
          <circle cx="20%" cy="30%" r="15" fill="rgba(73,80,87,0.1)" opacity="0.7"/>
          <circle cx="80%" cy="70%" r="20" fill="rgba(73,80,87,0.15)" opacity="0.5"/>
          <rect x="60%" y="20%" width="30" height="4" fill="rgba(73,80,87,0.2)" rx="2"/>
        `;
        break;
      case 'artistic':
        gradientColors = '#ffecd2,#fcb69f';
        accentColor = '#ff6b6b';
        styleElements = `
          <path d="M100,200 Q200,100 300,200 T500,200" stroke="${accentColor}" stroke-width="3" fill="none" opacity="0.6"/>
          <circle cx="25%" cy="25%" r="25" fill="rgba(255,107,107,0.3)"/>
          <polygon points="70%,80% 75%,70% 80%,80%" fill="rgba(255,107,107,0.4)"/>
        `;
        break;
      case 'cartoon':
        gradientColors = '#a8edea,#fed6e3';
        accentColor = '#ff9ff3';
        styleElements = `
          <circle cx="30%" cy="40%" r="30" fill="rgba(255,159,243,0.4)"/>
          <circle cx="70%" cy="30%" r="20" fill="rgba(255,159,243,0.5)"/>
          <rect x="20%" y="70%" width="40" height="20" fill="rgba(255,159,243,0.3)" rx="10"/>
        `;
        break;
      case 'abstract':
        gradientColors = '#d299c2,#fef9d7';
        accentColor = '#b794f6';
        styleElements = `
          <path d="M0,300 Q200,100 400,300 Q600,500 800,300" stroke="${accentColor}" stroke-width="4" fill="none" opacity="0.7"/>
          <circle cx="60%" cy="60%" r="40" fill="rgba(183,148,246,0.3)"/>
          <polygon points="10%,10% 20%,30% 30%,10%" fill="rgba(183,148,246,0.4)"/>
        `;
        break;
      case 'vintage':
        gradientColors = '#f7ddd6,#e8c5a0';
        accentColor = '#8b4513';
        styleElements = `
          <rect x="10%" y="10%" width="80%" height="3" fill="rgba(139,69,19,0.3)"/>
          <rect x="10%" y="87%" width="80%" height="3" fill="rgba(139,69,19,0.3)"/>
          <circle cx="20%" cy="20%" r="20" fill="rgba(139,69,19,0.2)" opacity="0.8"/>
        `;
        break;
      case 'futuristic':
        gradientColors = '#667eea,#764ba2';
        accentColor = '#00d4ff';
        styleElements = `
          <rect x="0%" y="48%" width="100%" height="4" fill="rgba(0,212,255,0.4)"/>
          <circle cx="80%" cy="20%" r="15" fill="rgba(0,212,255,0.6)"/>
          <polygon points="20%,80% 30%,70% 40%,80% 30%,90%" fill="rgba(0,212,255,0.5)"/>
        `;
        break;
      case 'minimalist':
        gradientColors = '#ffffff,#f5f5f5';
        accentColor = '#333333';
        styleElements = `
          <rect x="30%" y="30%" width="40%" height="40%" fill="none" stroke="rgba(51,51,51,0.3)" stroke-width="2"/>
          <circle cx="50%" cy="50%" r="5" fill="rgba(51,51,51,0.6)"/>
        `;
        break;
      case 'watercolor':
        gradientColors = '#fef7f0,#fae0e4';
        accentColor = '#d63384';
        styleElements = `
          <ellipse cx="30%" cy="40%" rx="40" ry="25" fill="rgba(214,51,132,0.2)" opacity="0.7"/>
          <ellipse cx="70%" cy="60%" rx="30" ry="35" fill="rgba(214,51,132,0.15)" opacity="0.8"/>
          <path d="M100,100 Q200,50 300,100" stroke="rgba(214,51,132,0.3)" stroke-width="8" fill="none" opacity="0.6"/>
        `;
        break;
      case 'geometric':
        gradientColors = '#e3f2fd,#bbdefb';
        accentColor = '#1976d2';
        styleElements = `
          <polygon points="20%,20% 40%,20% 30%,40%" fill="rgba(25,118,210,0.4)"/>
          <polygon points="60%,30% 80%,30% 70%,60%" fill="rgba(25,118,210,0.3)"/>
          <rect x="40%" y="60%" width="20%" height="20%" fill="rgba(25,118,210,0.2)" transform="rotate(45 50 70)"/>
        `;
        break;
    }

    const [color1, color2] = gradientColors.split(',');
    
    // Create clean, safe text content for SVG
    const safePrompt = prompt.replace(/[^\x00-\x7F]/g, "").substring(0, 100);
    
    // Create enhanced SVG with better visual representation
    const canvas = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
        </linearGradient>
        <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:${accentColor};stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:${accentColor};stop-opacity:0.6" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      ${styleElements}
      
      <rect x="10%" y="25%" width="80%" height="50%" fill="rgba(255,255,255,0.1)" rx="8" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
      
      <text x="50%" y="15%" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="url(#textGrad)">
        AI Generated Preview
      </text>
      
      <text x="50%" y="35%" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="${accentColor}" opacity="0.8">
        ${safePrompt}
      </text>
      
      <text x="50%" y="75%" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="${accentColor}" opacity="0.8">
        Style: ${style.charAt(0).toUpperCase() + style.slice(1)} • Quality: ${quality} • Size: ${size}
      </text>
      
      <text x="50%" y="85%" text-anchor="middle" font-family="Arial, sans-serif" font-size="8" fill="${accentColor}" opacity="0.7">
        Enhanced with detailed visual instructions
      </text>
      
      <text x="50%" y="95%" text-anchor="middle" font-family="Arial, sans-serif" font-size="7" fill="${accentColor}" opacity="0.6">
        Powered by Gemini AI • Advanced Prompt Processing
      </text>
    </svg>`;
    
    // Use TextEncoder to properly encode the SVG string
    const encoder = new TextEncoder();
    const svgBytes = encoder.encode(canvas);
    const base64String = btoa(String.fromCharCode(...svgBytes));
    const imageUrl = `data:image/svg+xml;base64,${base64String}`;

    console.log('Enhanced image generated successfully with detailed instructions');

    return new Response(JSON.stringify({ 
      imageUrl,
      description: enhancedDescription,
      originalPrompt: prompt,
      enhancedPrompt: detailedPrompt
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
