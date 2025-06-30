
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationId } = await req.json();
    
    if (!message) {
      throw new Error('Message is required');
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY_CHAT');
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Initialize Supabase client to fetch conversation history
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Processing enhanced chat request:', { message, conversationId });

    let conversationHistory = [];
    
    // Fetch conversation history if conversationId exists
    if (conversationId) {
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('role, content')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching conversation history:', error);
      } else {
        conversationHistory = messages || [];
      }
    }

    // Enhanced system prompt for better AI behavior
    const systemPrompt = `You are an intelligent AI assistant with expertise in:
- Web development (React, TypeScript, HTML, CSS, JavaScript)
- Backend development (Node.js, Python, databases)
- Software engineering best practices
- UI/UX design principles
- Problem-solving and step-by-step explanations

IMPORTANT INSTRUCTIONS:
1. CONTEXT AWARENESS: Always consider the conversation history to provide contextual, relevant answers
2. USER BEHAVIOR LEARNING: Adapt your responses based on the user's previous questions and skill level
3. CLARITY & CONCEPT EXPLANATION: Break down complex topics into easy-to-understand concepts
4. CODE GENERATION: When asked to create code:
   - Provide clean, well-commented, production-ready code
   - Explain what the code does and how it works
   - Include implementation steps
   - Suggest best practices and potential improvements
5. PROGRESSIVE DISCLOSURE: Start with simple explanations, then provide more detail if needed
6. PRACTICAL EXAMPLES: Always include relevant examples to illustrate concepts

Response Format:
- Use clear headings and bullet points
- Format code blocks properly
- Provide step-by-step guides when appropriate
- Include explanations for technical terms
- Suggest next steps or related topics

Remember: You're helping users learn and build things effectively. Be patient, thorough, and encouraging.`;

    // Build conversation context with enhanced system prompt
    const conversationContext = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }]
      }
    ];

    // Add conversation history
    conversationHistory.forEach(msg => {
      conversationContext.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      });
    });

    // Add the current user message
    conversationContext.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // Enhanced request configuration for better responses
    const geminiRequest = {
      contents: conversationContext,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096, // Increased for longer, more detailed responses
        candidateCount: 1,
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

    console.log('Sending enhanced request to Gemini:', {
      messageCount: conversationContext.length,
      conversationId,
      maxTokens: geminiRequest.generationConfig.maxOutputTokens
    });

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(geminiRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Enhanced Gemini response received');

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Gemini API');
    }

    const aiResponse = data.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ 
      response: aiResponse,
      conversationId,
      enhanced: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in enhanced gemini-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An error occurred while processing your request' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
