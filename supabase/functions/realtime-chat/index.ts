import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  const apiKey = Deno.env.get('GEMINI_API_KEY_CHAT');
  
  if (!apiKey) {
    socket.close(1000, "API key not configured");
    return response;
  }

  console.log('🔌 WebSocket connection established for real-time chat');

  socket.onopen = () => {
    console.log('✅ WebSocket connection opened');
    socket.send(JSON.stringify({ 
      type: 'connection_established',
      message: 'Real-time chat connected successfully'
    }));
  };

  socket.onmessage = async (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('📨 Received message:', data);

      if (data.type === 'chat_message') {
        const { message, conversationId } = data;
        
        console.log('🚀 Starting real-time AI response generation');
        
        // Send typing indicator
        socket.send(JSON.stringify({
          type: 'typing_start',
          conversationId
        }));

        // Call OpenAI API with streaming
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY') || apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `You are an intelligent AI assistant. Provide helpful, accurate, and engaging responses. Keep responses conversational and well-formatted. Use markdown for code blocks when appropriate.`
              },
              {
                role: 'user',
                content: message
              }
            ],
            stream: true,
            temperature: 0.7,
            max_tokens: 2000
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        if (reader) {
          console.log('📡 Starting to stream AI response');
          
          // Send response start event
          socket.send(JSON.stringify({
            type: 'response_start',
            conversationId
          }));

          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              console.log('✅ AI response streaming completed');
              break;
            }

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const jsonStr = line.slice(6);
                
                if (jsonStr === '[DONE]') {
                  continue;
                }

                try {
                  const parsed = JSON.parse(jsonStr);
                  const content = parsed.choices?.[0]?.delta?.content;
                  
                  if (content) {
                    fullResponse += content;
                    
                    // Send real-time chunk to client
                    socket.send(JSON.stringify({
                      type: 'response_chunk',
                      conversationId,
                      content: content,
                      fullResponse: fullResponse
                    }));
                  }
                } catch (e) {
                  // Skip invalid JSON chunks
                  continue;
                }
              }
            }
          }

          // Send completion event
          socket.send(JSON.stringify({
            type: 'response_complete',
            conversationId,
            fullResponse: fullResponse
          }));
        }
      }
    } catch (error) {
      console.error('❌ Error processing message:', error);
      socket.send(JSON.stringify({
        type: 'error',
        message: 'Failed to process your request. Please try again.',
        error: error.message
      }));
    }
  };

  socket.onclose = () => {
    console.log('🔌 WebSocket connection closed');
  };

  socket.onerror = (error) => {
    console.error('❌ WebSocket error:', error);
  };

  return response;
});