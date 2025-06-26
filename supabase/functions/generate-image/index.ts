
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ImageRequest {
  prompt: string;
  size?: string;
  quality?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt, size = "1024x1024", quality = "standard" }: ImageRequest = await req.json()

    console.log('Generating image with prompt:', prompt);

    if (!prompt || prompt.trim().length === 0) {
      throw new Error("Prompt is required");
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const requestBody = {
      model: "dall-e-3",
      prompt: prompt.trim(),
      n: 1,
      size: size,
      quality: quality,
      response_format: "url"
    };

    console.log('Sending request to OpenAI:', JSON.stringify(requestBody, null, 2));

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error: ${response.status} - ${errorText}`);
      throw new Error(`OpenAI API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI API response:', JSON.stringify(data, null, 2));
    
    if (data.data && data.data[0]?.url) {
      const imageUrl = data.data[0].url;
      console.log('Image generated successfully:', imageUrl);
      
      return new Response(
        JSON.stringify({ 
          imageUrl,
          prompt: data.data[0].revised_prompt || prompt
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    } else {
      console.error('Unexpected API response structure:', data);
      throw new Error("No image URL received from OpenAI API");
    }
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to generate image' 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
