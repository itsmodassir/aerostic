
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

// Request type detection
// Parse multiple prompts from a single message
function parseMultiplePrompts(message: string): string[] {
  // Split by common separators for multiple requests
  const separators = [
    ' and then ',
    ' then ',
    ' after that ',
    ' next ',
    ' also ',
    ' additionally ',
    '\n\n',
    '. Then ',
    '. Next ',
    '. Also ',
    '. Additionally ',
    '. After that '
  ];
  
  let prompts = [message];
  
  // Split by separators
  for (const separator of separators) {
    const newPrompts: string[] = [];
    for (const prompt of prompts) {
      if (prompt.toLowerCase().includes(separator.toLowerCase())) {
        const parts = prompt.split(new RegExp(separator, 'gi'));
        newPrompts.push(...parts);
      } else {
        newPrompts.push(prompt);
      }
    }
    prompts = newPrompts;
  }
  
  // Clean and filter prompts
  return prompts
    .map(p => p.trim())
    .filter(p => p.length > 3) // Remove very short prompts
    .slice(0, 5); // Limit to 5 prompts max for performance
}

function detectRequestType(message: string) {
  const lowerMessage = message.toLowerCase();
  
  // Image generation keywords
  const imageKeywords = ['generate image', 'create image', 'make image', 'generate picture', 'create picture', 'draw', 'illustrate'];
  
  // Logo generation keywords  
  const logoKeywords = ['generate logo', 'create logo', 'make logo', 'design logo', 'logo for'];
  
  // Website generation keywords
  const websiteKeywords = ['generate website', 'create website', 'build website', 'make website', 'develop site', 'create site', 'build site'];
  
  // Code generation keywords
  const codeKeywords = ['generate code', 'write code', 'create code', 'build app', 'develop app', 'create app', 'make app'];

  if (logoKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return { type: 'logo_generation', keywords: logoKeywords.filter(k => lowerMessage.includes(k)) };
  } else if (websiteKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return { type: 'website_generation', keywords: websiteKeywords.filter(k => lowerMessage.includes(k)) };
  } else if (codeKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return { type: 'code_generation', keywords: codeKeywords.filter(k => lowerMessage.includes(k)) };
  } else if (imageKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return { type: 'image_generation', keywords: imageKeywords.filter(k => lowerMessage.includes(k)) };
  }
  
  return { type: 'general_chat', keywords: [] };
}

// Image generation handler
async function handleImageGeneration(message: string, conversationId: string, supabase: any) {
  try {
    console.log('🎨 Handling image generation request');
    
    // Extract image prompt from message
    const prompt = extractImagePrompt(message);
    
    // Call image generation function
    const { data: imageData, error: imageError } = await supabase.functions.invoke('generate-image', {
      body: { prompt, size: "1024x1024", quality: "hd" }
    });

    if (imageError) {
      throw new Error(`Image generation failed: ${imageError.message}`);
    }

    const response = `🎨 **Image Generated Successfully!**

**Prompt Used:** ${imageData.prompt}

![Generated Image](${imageData.imageUrl})

**💡 Tips for better images:**
- Be specific with details (colors, style, composition)
- Mention the mood or atmosphere you want
- Specify the art style (realistic, cartoon, abstract, etc.)
- Include lighting preferences (bright, moody, dramatic)

Would you like me to generate another variation or create something different?`;

    return new Response(JSON.stringify({ 
      response,
      conversationId,
      enhanced: true,
      type: 'image_generation',
      imageUrl: imageData.imageUrl
    }), {
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Image generation error:', error);
    return new Response(JSON.stringify({ 
      response: `❌ **Image Generation Failed**

I encountered an issue generating your image: ${error.message}

**💡 Let me help you with:**
- Refining your image prompt
- Trying a different description
- Generating other types of content

What would you like me to try instead?`,
      conversationId,
      error: true
    }), {
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
    });
  }
}

// Logo generation handler
async function handleLogoGeneration(message: string, conversationId: string, supabase: any) {
  try {
    console.log('🏷️ Handling logo generation request');
    
    const logoPrompt = `Professional logo design: ${extractLogoPrompt(message)}. Modern, clean, memorable design suitable for branding. High quality, vector-style, simple but distinctive. Use appropriate colors and typography.`;
    
    const { data: imageData, error: imageError } = await supabase.functions.invoke('generate-image', {
      body: { prompt: logoPrompt, size: "1024x1024", quality: "hd" }
    });

    if (imageError) {
      throw new Error(`Logo generation failed: ${imageError.message}`);
    }

    const response = `🏷️ **Professional Logo Generated!**

![Logo Design](${imageData.imageUrl})

**🎨 Logo Details:**
- **Style:** Modern and professional
- **Format:** High-resolution PNG
- **Usage:** Perfect for websites, business cards, letterheads

**💡 Logo Tips:**
- Ensure it works in both color and black & white
- Test at different sizes (favicon to billboard)
- Consider trademark implications
- Get feedback from your target audience

Would you like me to create variations or design additional branding materials?`;

    return new Response(JSON.stringify({ 
      response,
      conversationId,
      enhanced: true,
      type: 'logo_generation',
      imageUrl: imageData.imageUrl
    }), {
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Logo generation error:', error);
    return new Response(JSON.stringify({ 
      response: `❌ **Logo Generation Failed**

I had trouble creating your logo: ${error.message}

**🎨 I can help you with:**
- Refining the logo concept
- Creating different logo styles
- Generating other brand materials
- Providing logo design tips

What aspect of your brand would you like to explore?`,
      conversationId,
      error: true
    }), {
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
    });
  }
}

// Website generation handler
async function handleWebsiteGeneration(message: string, conversationId: string, supabase: any) {
  try {
    console.log('🌐 Handling website generation request');
    
    const websitePrompt = `${message}. 
          
          Provide a fully functional, production-ready website with:
          - Complete file structure
          - All necessary components/modules
          - Proper styling and responsive design
          - Error handling and validation
          - Documentation and comments
          - Best practices implementation
          
          Make it a comprehensive, working solution that can be immediately used.`;
    
    const { data: codeData, error: codeError } = await supabase.functions.invoke('generate-code', {
      body: { 
        prompt: websitePrompt,
        language: 'html'
      }
    });

    if (codeError) {
      throw new Error(`Website generation failed: ${codeError.message}`);
    }

    const response = `🌐 **Complete Website Generated!**

\`\`\`html
${codeData.generatedCode}
\`\`\`

**🚀 Website Features:**
- ✅ Responsive design for all devices
- ✅ Modern CSS styling and animations
- ✅ Clean, semantic HTML structure
- ✅ Cross-browser compatibility
- ✅ SEO-friendly markup
- ✅ Accessibility features

**📋 Implementation Steps:**
1. Copy the code above
2. Save as \`index.html\`
3. Open in your web browser
4. Customize colors, content, and styling as needed

**💡 Enhancement Ideas:**
- Add interactive JavaScript features
- Integrate with a CMS or database
- Add contact forms or e-commerce
- Optimize for search engines

Would you like me to add specific features or create additional pages?`;

    return new Response(JSON.stringify({ 
      response,
      conversationId,
      enhanced: true,
      type: 'website_generation',
      generatedCode: codeData.generatedCode
    }), {
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Website generation error:', error);
    return new Response(JSON.stringify({ 
      response: `❌ **Website Generation Failed**

I encountered an issue creating your website: ${error.message}

**🌐 I can help you with:**
- Creating simpler website components
- Providing HTML/CSS templates
- Building specific page sections
- Offering design guidance

What type of website feature would you like me to focus on?`,
      conversationId,
      error: true
    }), {
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
    });
  }
}

// Code generation handler
async function handleCodeGeneration(message: string, conversationId: string, supabase: any) {
  try {
    console.log('💻 Handling code generation request');
    
    const language = extractLanguage(message);
    
    const { data: codeData, error: codeError } = await supabase.functions.invoke('generate-code', {
      body: { 
        prompt: message,
        language: language
      }
    });

    if (codeError) {
      throw new Error(`Code generation failed: ${codeError.message}`);
    }

    const response = `💻 **Code Generated Successfully!**

\`\`\`${language}
${codeData.generatedCode}
\`\`\`

**🔧 Code Features:**
- ✅ Production-ready and well-commented
- ✅ Follows best practices and conventions
- ✅ Error handling and validation included
- ✅ Modular and maintainable structure

**📚 Implementation Guide:**
1. Review the code structure and logic
2. Install any required dependencies
3. Test in your development environment
4. Customize variables and configuration
5. Deploy when ready

**🚀 Next Steps:**
- Add unit tests for reliability
- Implement additional features
- Optimize for performance
- Add documentation

Need help with implementation or want me to explain any part of the code?`;

    return new Response(JSON.stringify({ 
      response,
      conversationId,
      enhanced: true,
      type: 'code_generation',
      generatedCode: codeData.generatedCode,
      language: language
    }), {
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Code generation error:', error);
    return new Response(JSON.stringify({ 
      response: `❌ **Code Generation Failed**

I had trouble generating your code: ${error.message}

**💻 I can help you with:**
- Writing specific functions or components
- Debugging existing code
- Explaining programming concepts
- Providing code examples and tutorials

What specific coding challenge can I help you solve?`,
      conversationId,
      error: true
    }), {
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
    });
  }
}

// Helper functions
function extractImagePrompt(message: string): string {
  const patterns = [
    /generate image of (.+)/i,
    /create image of (.+)/i,
    /make image of (.+)/i,
    /generate picture of (.+)/i,
    /create picture of (.+)/i,
    /draw (.+)/i,
    /illustrate (.+)/i
  ];
  
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) return match[1].trim();
  }
  
  return message.replace(/generate image|create image|make image|generate picture|create picture|draw|illustrate/gi, '').trim();
}

function extractLogoPrompt(message: string): string {
  const patterns = [
    /logo for (.+)/i,
    /generate logo for (.+)/i,
    /create logo for (.+)/i,
    /make logo for (.+)/i,
    /design logo for (.+)/i
  ];
  
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) return match[1].trim();
  }
  
  return message.replace(/generate logo|create logo|make logo|design logo|logo/gi, '').trim();
}

// Handle multiple prompts sequentially
async function handleMultiplePrompts(prompts: string[], conversationId: string, supabase: any, conversationHistory: any[]) {
  console.log(`🔄 Processing ${prompts.length} prompts sequentially`);
  
  let combinedResponse = `# 🎯 Multi-Prompt Response\n\nI'll address each of your requests in order:\n\n`;
  let promptIndex = 1;
  
  for (const prompt of prompts) {
    try {
      console.log(`Processing prompt ${promptIndex}/${prompts.length}: ${prompt}`);
      
      combinedResponse += `## ${promptIndex}. ${prompt.length > 50 ? prompt.substring(0, 50) + '...' : prompt}\n\n`;
      
      // Detect request type for this specific prompt
      const requestType = detectRequestType(prompt);
      
      if (requestType.type === 'image_generation') {
        const imagePrompt = extractImagePrompt(prompt);
        const { data: imageData, error: imageError } = await supabase.functions.invoke('generate-image', {
          body: { prompt: imagePrompt, size: "1024x1024", quality: "hd" }
        });
        
        if (!imageError && imageData) {
          combinedResponse += `🎨 **Image Generated:**\n\n![Generated Image](${imageData.imageUrl})\n\n`;
        } else {
          combinedResponse += `❌ Image generation failed: ${imageError?.message || 'Unknown error'}\n\n`;
        }
        
      } else if (requestType.type === 'logo_generation') {
        const logoPrompt = `Professional logo design: ${extractLogoPrompt(prompt)}. Modern, clean, memorable design suitable for branding.`;
        const { data: logoData, error: logoError } = await supabase.functions.invoke('generate-image', {
          body: { prompt: logoPrompt, size: "1024x1024", quality: "hd" }
        });
        
        if (!logoError && logoData) {
          combinedResponse += `🏷️ **Logo Generated:**\n\n![Logo Design](${logoData.imageUrl})\n\n`;
        } else {
          combinedResponse += `❌ Logo generation failed: ${logoError?.message || 'Unknown error'}\n\n`;
        }
        
      } else if (requestType.type === 'code_generation') {
        const language = extractLanguage(prompt);
        const { data: codeData, error: codeError } = await supabase.functions.invoke('generate-code', {
          body: { prompt, language }
        });
        
        if (!codeError && codeData) {
          combinedResponse += `💻 **Code Generated:**\n\n\`\`\`${language}\n${codeData.generatedCode}\n\`\`\`\n\n`;
        } else {
          combinedResponse += `❌ Code generation failed: ${codeError?.message || 'Unknown error'}\n\n`;
        }
        
      } else {
        // Handle as general chat with Gemini API
        const response = await processWithGemini(prompt, conversationHistory);
        combinedResponse += `${response}\n\n`;
      }
      
      combinedResponse += `---\n\n`;
      promptIndex++;
      
    } catch (error) {
      console.error(`Error processing prompt ${promptIndex}:`, error);
      combinedResponse += `❌ **Error processing this request:** ${error.message}\n\n---\n\n`;
      promptIndex++;
    }
  }
  
  combinedResponse += `✅ **All ${prompts.length} prompts processed successfully!**\n\nIs there anything specific you'd like me to elaborate on or modify?`;
  
  return new Response(JSON.stringify({ 
    response: combinedResponse,
    conversationId,
    enhanced: true,
    multiPrompt: true,
    promptCount: prompts.length
  }), {
    headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
  });
}

// Process single prompt with Gemini API
async function processWithGemini(prompt: string, conversationHistory: any[]): Promise<string> {
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY_CHAT');
  
  const systemPrompt = `You are a helpful AI assistant. Provide clear, concise, and well-formatted responses.`;
  
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

  // Add the current prompt
  conversationContext.push({
    role: 'user',
    parts: [{ text: prompt }]
  });

  const geminiRequest = {
    contents: conversationContext,
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
      candidateCount: 1,
    },
  };

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(geminiRequest),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error('Invalid response from Gemini API');
  }

  return data.candidates[0].content.parts[0].text;
}

function extractLanguage(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('javascript') || lowerMessage.includes('js')) return 'javascript';
  if (lowerMessage.includes('typescript') || lowerMessage.includes('ts')) return 'typescript';
  if (lowerMessage.includes('python') || lowerMessage.includes('py')) return 'python';
  if (lowerMessage.includes('react')) return 'javascript';
  if (lowerMessage.includes('html')) return 'html';
  if (lowerMessage.includes('css')) return 'css';
  if (lowerMessage.includes('java')) return 'java';
  if (lowerMessage.includes('c++') || lowerMessage.includes('cpp')) return 'cpp';
  if (lowerMessage.includes('c#') || lowerMessage.includes('csharp')) return 'csharp';
  if (lowerMessage.includes('php')) return 'php';
  if (lowerMessage.includes('ruby')) return 'ruby';
  if (lowerMessage.includes('go') || lowerMessage.includes('golang')) return 'go';
  if (lowerMessage.includes('rust')) return 'rust';
  
  return 'javascript'; // Default
}

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

    // Parse multiple prompts
    const prompts = parseMultiplePrompts(message);
    console.log(`Detected ${prompts.length} prompt(s):`, prompts);
    
    // If multiple prompts detected, process them sequentially
    if (prompts.length > 1) {
      return await handleMultiplePrompts(prompts, conversationId, supabase, conversationHistory);
    }
    
    // Single prompt - detect request type and route accordingly
    const requestType = detectRequestType(message);
    console.log('Detected request type:', requestType);

    // Route to specialized handlers
    if (requestType.type === 'image_generation') {
      return await handleImageGeneration(message, conversationId, supabase);
    } else if (requestType.type === 'logo_generation') {
      return await handleLogoGeneration(message, conversationId, supabase);
    } else if (requestType.type === 'website_generation') {
      return await handleWebsiteGeneration(message, conversationId, supabase);
    } else if (requestType.type === 'code_generation') {
      return await handleCodeGeneration(message, conversationId, supabase);
    }

    // Enhanced system prompt for general chat with article/blog keywords detection
    const articleKeywords = ['write article', 'create article', 'blog post', 'write blog', 'article about', 'blog about'];
    const isArticleRequest = articleKeywords.some(keyword => message.toLowerCase().includes(keyword));
    
    const systemPrompt = `You are an advanced AI assistant with comprehensive capabilities.

🎯 FORMATTING REQUIREMENTS - ALWAYS FOLLOW:
${isArticleRequest ? `
📝 ARTICLE/BLOG FORMAT (You're writing an article/blog):
- Start with an engaging # title 
- Use ## for main sections and ### for subsections
- Include > blockquotes for important insights
- Use numbered lists (1. 2. 3.) and bullet points (-)
- Add relevant tables when presenting data or comparisons
- Use **bold** for key terms and *italics* for emphasis
- NEVER use asterisks (*) for formatting - use proper markdown
- Include compelling subheadings that guide the reader
- End with a strong conclusion or call-to-action
- Break content into digestible sections
- Add 📊 📈 💡 🚀 emojis sparingly for visual appeal
` : `
📝 GENERAL RESPONSE FORMAT:
- Use # ## ### headings to structure your response
- Use > blockquotes for important points or quotes
- Use numbered lists (1. 2. 3.) for step-by-step guides
- Use bullet points (-) for feature lists or key points
- Create tables for data comparisons when relevant
- Use **bold** for emphasis and *italics* for subtle emphasis
- NEVER use asterisks (*) for formatting - use proper markdown
- Include relevant emojis sparingly (💡 🚀 ✅ ❌ 📊)
`}

🎯 CORE CAPABILITIES:
- Article and blog writing with engaging structure
- General conversation and comprehensive Q&A
- Code generation with detailed explanations
- Web development (React, TypeScript, HTML, CSS, JavaScript)
- Backend development and database design
- Software engineering best practices
- UI/UX design principles and recommendations
- Technical tutorials and guides
- Business and marketing insights

🚀 SPECIAL FEATURES:
- Generate images with detailed prompts (ask me to "generate image")
- Create professional logos (ask me to "create logo")
- Build complete websites (ask me to "build website")
- Write production-ready code (ask me to "generate code")
- Comprehensive articles and blog posts

⚡ RESPONSE QUALITY:
- Always provide well-structured, professional responses
- Include practical examples and actionable advice
- Offer next steps and related suggestions
- Make content engaging and easy to read
- Use tables, lists, and quotes effectively

Remember: Create beautiful, professional content that users will love to read and interact with.`;

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
      enhanced: true,
      type: 'general_chat'
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
