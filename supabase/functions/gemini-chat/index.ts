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
        content: `You are a helpful AI assistant. You provide clear, accurate, and engaging responses. 
Format your responses with markdown for better readability:
- Use **bold** for important points
- Use bullet points and numbered lists for clarity
- Use code blocks with language tags for code examples
- Use headers (##) to organize long responses
- Keep responses well-structured and easy to read

Be conversational but professional. Help users with their questions and provide detailed explanations when needed.`
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
        temperature: 0.7,
        max_tokens: 2048,
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
