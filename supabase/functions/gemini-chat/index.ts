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

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('Lovable API key not configured');
    }

    // Initialize Supabase client to fetch conversation history
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Processing chat request:', { message, conversationId });

    let conversationHistory: Array<{role: string, content: string}> = [];
    
    // Fetch conversation history if conversationId exists
    if (conversationId && !conversationId.startsWith('local-')) {
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('role, content')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(20); // Limit to last 20 messages for context

      if (error) {
        console.error('Error fetching conversation history:', error);
      } else {
        conversationHistory = messages || [];
      }
    }

    console.log('Conversation history length:', conversationHistory.length);

    // Build messages array for Lovable AI
    const messages = [
      {
        role: 'system',
        content: `You are Aerostic AI, a friendly and professional AI assistant. Your responses should be clear, structured, and easy to understand.

STRUCTURE & ORGANIZATION:
- Start with a brief acknowledgment of the user's question
- Break down complex topics into clear sections with headers (##)
- Use bullet points for lists and steps
- End with a helpful summary or next steps when relevant

FORMATTING STANDARDS:
- Use **bold** for key terms and important concepts
- Use \`inline code\` for commands, function names, and technical terms
- Use code blocks with proper language tags (\`\`\`javascript, \`\`\`python, \`\`\`typescript, etc.)
- Use > blockquotes for important notes or warnings
- Use numbered lists (1., 2., 3.) for sequential steps
- Use bullet points (-) for non-sequential items
- Use horizontal rules (---) to separate major sections

CODE & TECHNICAL CONTENT:
- Always include language tags in code blocks for syntax highlighting
- Add brief comments in code to explain complex parts
- Provide context before and after code examples
- Explain what the code does in simple terms

CLARITY & READABILITY:
- Write in short paragraphs (2-4 sentences max)
- Use simple, conversational language
- Explain technical terms when first mentioned
- Use analogies and examples for complex concepts
- Avoid long walls of text - break content into digestible chunks

CONSISTENCY:
- Maintain a friendly but professional tone
- Be concise but thorough
- Stay on topic and directly address the question
- Provide actionable information when possible

HELPFUL ADDITIONS:
- Suggest related topics when relevant
- Warn about common pitfalls
- Provide alternative approaches when applicable
- Use emojis sparingly for emphasis (✅ ❌ 💡 ⚠️)`
      },
      ...conversationHistory,
      {
        role: 'user',
        content: message
      }
    ];

    console.log('Sending request to Lovable AI Gateway...');

    // Call Lovable AI Gateway
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: messages,
        temperature: 0.6,
        max_tokens: 3000,
        top_p: 0.9,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      } else if (aiResponse.status === 402) {
        throw new Error('AI usage limit reached. Please add credits to your workspace.');
      } else {
        throw new Error(`AI service error: ${aiResponse.status}`);
      }
    }

    const aiData = await aiResponse.json();
    
    if (!aiData.choices || !aiData.choices[0] || !aiData.choices[0].message) {
      console.error('Invalid AI response:', aiData);
      throw new Error('Invalid response from AI service');
    }

    const assistantMessage = aiData.choices[0].message.content;
    console.log('✅ AI response received successfully');

    return new Response(
      JSON.stringify({
        response: assistantMessage,
        enhanced: true,
        model: 'google/gemini-2.5-flash'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Error in chat function:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to process chat request';
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
