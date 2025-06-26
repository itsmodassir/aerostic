
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WebsiteRequest {
  blogName: string;
  blogTopic: string;
  blogDescription?: string;
  selectedTheme: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { blogName, blogTopic, blogDescription, selectedTheme }: WebsiteRequest = await req.json()

    console.log('Generating website content for:', blogName, blogTopic);

    const prompt = `Create content for a blog website with the following details:
    - Blog Name: ${blogName}
    - Blog Topic/Niche: ${blogTopic}
    - Description: ${blogDescription || 'Not provided'}
    - Theme: ${selectedTheme}
    
    Please generate:
    1. A catchy blog title (if different from the name provided)
    2. A compelling tagline/subtitle (1 sentence)
    3. An engaging "About" section (2-3 paragraphs)
    4. A sample first blog post title and content (500+ words)
    
    Make it professional, engaging, and tailored to the ${blogTopic} niche. Format the response as JSON with keys: title, tagline, aboutContent, firstPost`;

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
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
    
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const content = data.candidates[0].content.parts[0].text;
      
      let parsedContent;
      try {
        parsedContent = JSON.parse(content);
      } catch {
        // If JSON parsing fails, create a structured response
        parsedContent = {
          title: blogName,
          tagline: `Welcome to ${blogName} - Your go-to source for ${blogTopic}`,
          aboutContent: `Welcome to ${blogName}, your premier destination for everything related to ${blogTopic}. We are passionate about sharing insights, tips, and the latest trends in ${blogTopic}.\n\nOur mission is to provide valuable, engaging content that helps our readers stay informed and inspired. Whether you're a beginner or an expert in ${blogTopic}, you'll find something valuable here.`,
          firstPost: {
            title: `Getting Started with ${blogTopic}`,
            content: content.substring(0, 1000) + "..."
          }
        };
      }
      
      return new Response(
        JSON.stringify(parsedContent),
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
        error: error.message || 'Failed to generate website content' 
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
