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
    const { projectId } = await req.json();

    if (!projectId) {
      throw new Error("Project ID is required");
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get project files
    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .select('*, project_files(*)')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      throw new Error("Project not found");
    }

    // For now, we'll generate a simple static site URL
    // In production, you'd deploy to a CDN or hosting service
    const publishedUrl = `https://${projectId}.your-domain.app`;

    // Bundle all files into a single HTML if it's a web project
    let bundledContent = '';
    const htmlFile = project.project_files.find((f: any) => f.file_path.endsWith('.html'));
    const cssFile = project.project_files.find((f: any) => f.file_path.endsWith('.css'));
    const jsFile = project.project_files.find((f: any) => f.file_path.endsWith('.js'));

    if (htmlFile) {
      bundledContent = htmlFile.content;
      
      // Inject CSS
      if (cssFile) {
        bundledContent = bundledContent.replace(
          '</head>',
          `<style>${cssFile.content}</style></head>`
        );
      }
      
      // Inject JS
      if (jsFile) {
        bundledContent = bundledContent.replace(
          '</body>',
          `<script>${jsFile.content}</script></body>`
        );
      }
    }

    // Update project with published URL
    await supabaseClient
      .from('projects')
      .update({
        published_url: publishedUrl,
        is_published: true
      })
      .eq('id', projectId);

    // In a real implementation, you would:
    // 1. Upload files to a storage bucket or CDN
    // 2. Configure a custom domain
    // 3. Set up SSL/TLS
    // 4. Configure caching and optimization

    return new Response(
      JSON.stringify({ 
        success: true, 
        publishedUrl,
        message: "Project published successfully! Note: This is a demo URL. Connect to a real hosting service for production deployment."
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Publish error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
