
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

    // Enhanced prompt for better content generation
    const prompt = `Create comprehensive content for a professional blog website with these details:
    
    Blog Name: ${blogName}
    Topic/Niche: ${blogTopic}
    Description: ${blogDescription || 'A modern blog focused on ' + blogTopic}
    Theme Style: ${selectedTheme}
    
    Generate a JSON response with exactly these keys:
    
    1. "title": An engaging blog title (can be different from the provided name)
    2. "tagline": A compelling subtitle/tagline (1 sentence, under 100 characters)
    3. "aboutContent": A professional About section (2-3 paragraphs, 150-300 words)
    4. "firstPost": An object with:
       - "title": An engaging first blog post title
       - "content": A complete blog post (800-1200 words) with proper structure
    
    Make the content:
    - Professional and engaging
    - SEO-friendly with relevant keywords
    - Tailored specifically to the ${blogTopic} niche
    - Appropriate for the ${selectedTheme} theme style
    - Ready for immediate publication
    
    Return ONLY valid JSON with no additional text or formatting.`;

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

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyBW15VMWdcIShXkc3md5uG32T1rbCKX5Mc`, {
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
    console.log('Gemini API response:', JSON.stringify(data, null, 2));
    
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const content = data.candidates[0].content.parts[0].text;
      console.log('Generated content:', content);
      
      let parsedContent;
      try {
        // Clean up the content to ensure it's valid JSON
        const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        parsedContent = JSON.parse(cleanContent);
        
        // Validate the structure
        if (!parsedContent.title || !parsedContent.tagline || !parsedContent.aboutContent || !parsedContent.firstPost) {
          throw new Error("Missing required fields in generated content");
        }
        
        // Ensure firstPost has the correct structure
        if (typeof parsedContent.firstPost === 'string') {
          parsedContent.firstPost = {
            title: `Getting Started with ${blogTopic}`,
            content: parsedContent.firstPost
          };
        }
        
      } catch (parseError) {
        console.error('JSON parsing failed:', parseError);
        console.log('Raw content:', content);
        
        // Create a structured fallback response
        parsedContent = {
          title: blogName,
          tagline: `Your premier destination for ${blogTopic} insights and inspiration`,
          aboutContent: `Welcome to ${blogName}, your go-to resource for everything related to ${blogTopic}. We're passionate about sharing valuable insights, expert tips, and the latest trends in the ${blogTopic} space.\n\nOur mission is to provide high-quality, engaging content that helps our readers stay informed and inspired. Whether you're a beginner looking to learn the basics or an expert seeking advanced insights, you'll find valuable information here that can help you on your ${blogTopic} journey.`,
          firstPost: {
            title: `Welcome to ${blogName}: Your ${blogTopic} Journey Starts Here`,
            content: `# Welcome to ${blogName}!\n\nWe're excited to welcome you to ${blogName}, your new favorite destination for ${blogTopic} content. This blog was created with one goal in mind: to provide you with valuable, actionable insights about ${blogTopic}.\n\n## What You Can Expect\n\nHere at ${blogName}, we believe that ${blogTopic} is more than just a topic – it's a passion, a skill, and for many, a way of life. That's why we're committed to bringing you:\n\n- **Expert insights** from industry professionals\n- **Practical tips** you can implement right away\n- **Latest trends** and developments in ${blogTopic}\n- **In-depth analysis** of important topics\n- **Community-driven content** based on your interests\n\n## Our Approach\n\nWe understand that ${blogTopic} can be complex, which is why we strive to make our content accessible to everyone. Whether you're just starting out or you're already well-versed in ${blogTopic}, our goal is to provide value at every level.\n\n## What's Coming Next\n\nIn the coming weeks and months, you can expect regular updates covering various aspects of ${blogTopic}. We'll be diving deep into subjects that matter most to our community, sharing practical advice, and exploring new developments in the field.\n\n## Join Our Community\n\nWe believe that the best learning happens when we learn together. We encourage you to engage with our content, share your thoughts, and connect with other ${blogTopic} enthusiasts who visit our blog.\n\n## Stay Connected\n\nMake sure to bookmark ${blogName} and check back regularly for new content. We're just getting started, and we can't wait to share this journey with you!\n\nWelcome aboard, and here's to your success in ${blogTopic}!`
          }
        };
      }
      
      console.log('Final parsed content:', JSON.stringify(parsedContent, null, 2));
      
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
