import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CodeRequest {
  prompt: string;
  language: string;
  context?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, language, context }: CodeRequest = await req.json();

    console.log('Generating code with prompt:', prompt, 'language:', language);

    if (!prompt || prompt.trim().length === 0) {
      throw new Error("Prompt is required");
    }

    if (!language) {
      throw new Error("Programming language is required");
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    // Create a detailed system prompt based on the language
    let systemPrompt = `You are an expert ${language} programmer. Generate clean, well-commented, and functional ${language} code based on the user's request. `;
    
    switch (language.toLowerCase()) {
      case 'javascript':
        systemPrompt += "Use modern ES6+ syntax, include proper error handling, and add helpful comments. If creating functions, make them reusable and well-structured.";
        break;
      case 'python':
        systemPrompt += "Follow PEP 8 style guidelines, use appropriate data structures, include docstrings, and handle edge cases properly.";
        break;
      case 'html':
        systemPrompt += "Create semantic, accessible HTML with proper structure. Include meta tags, appropriate attributes, and follow modern HTML5 standards.";
        break;
      case 'css':
        systemPrompt += "Write modern CSS with proper selectors, responsive design principles, and clean organization. Use CSS Grid/Flexbox when appropriate.";
        break;
      case 'typescript':
        systemPrompt += "Use proper TypeScript types, interfaces, and modern syntax. Include type annotations and handle type safety properly.";
        break;
      case 'json':
        systemPrompt += "Create valid JSON with proper structure, appropriate nesting, and meaningful property names.";
        break;
      default:
        systemPrompt += "Follow the language's best practices and conventions.";
    }

    systemPrompt += " Only return the code without explanations unless specifically asked for comments or documentation.";

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: context ? `Context: ${context}\n\nRequest: ${prompt}` : prompt }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 2000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error("No code generated from OpenAI");
    }

    const generatedCode = data.choices[0].message.content;

    console.log('Successfully generated code');

    return new Response(JSON.stringify({ 
      code: generatedCode,
      language: language 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-code function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An unexpected error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});