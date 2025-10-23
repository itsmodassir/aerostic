import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, projectType, projectName, userId } = await req.json();

    if (!prompt || !projectName || !userId) {
      throw new Error("Prompt, project name, and user ID are required");
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log('Generating project with AI:', { projectName, projectType });

    // Generate project with AI
    const systemPrompt = `You are an expert full-stack web developer. Generate a complete, production-ready website/app based on the user's requirements.

CRITICAL INSTRUCTIONS:
1. Generate THREE separate, complete files: index.html, style.css, and script.js
2. Return ONLY a valid JSON object with this exact structure:
{
  "files": [
    {
      "path": "/index.html",
      "content": "...complete HTML code...",
      "language": "html"
    },
    {
      "path": "/style.css", 
      "content": "...complete CSS code...",
      "language": "css"
    },
    {
      "path": "/script.js",
      "content": "...complete JavaScript code...",
      "language": "javascript"
    }
  ],
  "description": "Brief description of what was created"
}

REQUIREMENTS:
- HTML: Complete, semantic HTML5 with proper structure, meta tags, and linked CSS/JS files
- CSS: Modern, responsive design with mobile-first approach, beautiful colors, animations
- JavaScript: Interactive functionality, event handlers, clean code with comments
- Make it visually stunning with gradients, shadows, animations, and modern UI
- Include all features requested by the user
- Code should be production-ready and fully functional
- No placeholders or TODO comments

DO NOT include any text before or after the JSON object. Return ONLY the JSON.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content generated from AI");
    }

    console.log('AI response received, parsing...');

    // Parse the JSON response
    let projectData;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        projectData = JSON.parse(jsonMatch[0]);
      } else {
        projectData = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Raw content:', content);
      throw new Error("AI did not return valid JSON. Please try again.");
    }

    if (!projectData.files || !Array.isArray(projectData.files)) {
      throw new Error("Invalid project structure from AI");
    }

    console.log('Project structure parsed successfully');

    // Create project in database
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .insert({
        name: projectName,
        description: projectData.description || prompt.slice(0, 200),
        template_type: projectType || 'html',
        user_id: userId
      })
      .select()
      .single();

    if (projectError) {
      console.error('Database error creating project:', projectError);
      throw projectError;
    }

    console.log('Project created in database:', project.id);

    // Insert all files
    const { error: filesError } = await supabaseClient
      .from('project_files')
      .insert(
        projectData.files.map((file: any) => ({
          project_id: project.id,
          file_path: file.path,
          content: file.content,
          language: file.language
        }))
      );

    if (filesError) {
      console.error('Database error creating files:', filesError);
      throw filesError;
    }

    console.log('Project files created successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        projectId: project.id,
        projectName: project.name,
        description: projectData.description,
        filesCount: projectData.files.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-full-project:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
