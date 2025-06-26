
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BlogRequest {
  topic: string;
  tone: string;
  wordCount: number;
  imagePrompt?: string;
  includeIntro: boolean;
  includeConclusion: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { topic, tone, wordCount, imagePrompt, includeIntro, includeConclusion }: BlogRequest = await req.json()

    console.log('Generating blog content for topic:', topic);

    const prompt = `Write a comprehensive blog post about "${topic}" in a ${tone} tone. 
    
    Requirements:
    - Target word count: approximately ${wordCount} words
    - ${includeIntro ? 'Include an engaging introduction' : 'Skip the introduction'}
    - ${includeConclusion ? 'Include a compelling conclusion' : 'Skip the conclusion'}
    - Use proper markdown formatting with headers (##, ###)
    - Make it SEO-friendly with relevant keywords
    - Include 3-5 main sections with descriptive subheadings
    - Add practical tips and actionable advice where relevant
    ${imagePrompt ? `- Suggest where to place an image about: ${imagePrompt}` : ''}
    
    Structure:
    ${includeIntro ? '1. Engaging title and introduction' : '1. Engaging title'}
    2. Main content with 3-5 subheadings
    3. Practical examples or tips
    ${includeConclusion ? '4. Strong conclusion with call-to-action' : ''}
    
    Make it engaging, informative, and valuable for readers. Focus on providing real value and actionable insights.`;

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH", 
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBW15VMWdcIShXkc3md5uG32T1rbCKX5Mc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error: ${response.status} - ${errorText}`);
      throw new Error(`Gemini API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini API response received');
    
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const content = data.candidates[0].content.parts[0].text;
      console.log('Blog content generated successfully');
      
      return new Response(
        JSON.stringify({ content }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    } else if (data.error) {
      console.error('Gemini API returned error:', data.error);
      throw new Error(`Gemini API Error: ${data.error.message || 'Unknown error'}`);
    } else {
      console.error('Unexpected API response structure:', data);
      throw new Error("No content generated from API - unexpected response structure");
    }
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to generate blog content' 
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
