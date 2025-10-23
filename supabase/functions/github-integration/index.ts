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
    const { action, projectId, repoName, githubToken } = await req.json();

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

    if (action === 'create-repo') {
      if (!repoName || !githubToken) {
        throw new Error("Repository name and GitHub token are required");
      }

      // Create GitHub repository
      const createRepoResponse = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify({
          name: repoName,
          description: project.description || '',
          private: false,
          auto_init: true
        })
      });

      if (!createRepoResponse.ok) {
        const error = await createRepoResponse.json();
        throw new Error(error.message || 'Failed to create repository');
      }

      const repoData = await createRepoResponse.json();
      const repoUrl = repoData.html_url;

      // Update project with GitHub info
      await supabaseClient
        .from('projects')
        .update({
          github_repo_url: repoUrl,
          github_connected: true
        })
        .eq('id', projectId);

      return new Response(
        JSON.stringify({ success: true, repoUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'push') {
      if (!githubToken || !project.github_repo_url) {
        throw new Error("GitHub token and repository URL are required");
      }

      // Extract owner and repo from URL
      const urlParts = project.github_repo_url.split('/');
      const owner = urlParts[urlParts.length - 2];
      const repo = urlParts[urlParts.length - 1];

      // Push files to GitHub
      for (const file of project.project_files) {
        const path = file.file_path.startsWith('/') ? file.file_path.slice(1) : file.file_path;
        const content = btoa(file.content);

        // Check if file exists
        const getFileResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
          {
            headers: {
              'Authorization': `token ${githubToken}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          }
        );

        const fileExists = getFileResponse.ok;
        const existingFile = fileExists ? await getFileResponse.json() : null;

        // Create or update file
        await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `token ${githubToken}`,
              'Content-Type': 'application/json',
              'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
              message: `Update ${path}`,
              content: content,
              sha: existingFile?.sha
            })
          }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error("Invalid action");

  } catch (error) {
    console.error('GitHub integration error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
