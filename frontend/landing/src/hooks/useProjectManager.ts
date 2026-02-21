import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProjectFile {
  id?: string;
  file_path: string;
  content: string;
  language: string;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  template_type: string;
  github_repo_url: string | null;
  github_connected: boolean;
  published_url: string | null;
  is_published: boolean;
  files: ProjectFile[];
}

export const useProjectManager = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });

      if (projectsError) throw projectsError;

      const projectsWithFiles = await Promise.all(
        (projectsData || []).map(async (project) => {
          const { data: filesData } = await supabase
            .from('project_files')
            .select('*')
            .eq('project_id', project.id);

          return {
            ...project,
            files: filesData || []
          };
        })
      );

      setProjects(projectsWithFiles);
    } catch (error: any) {
      toast.error("Failed to load projects: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (name: string, description: string, templateType: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to create projects");
        return null;
      }

      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          name,
          description,
          template_type: templateType,
          user_id: user.id
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Create default files based on template
      const defaultFiles = getDefaultFiles(templateType);
      const { error: filesError } = await supabase
        .from('project_files')
        .insert(
          defaultFiles.map(file => ({
            project_id: project.id,
            ...file
          }))
        );

      if (filesError) throw filesError;

      toast.success("Project created successfully!");
      await loadProjects();
      return project.id;
    } catch (error: any) {
      toast.error("Failed to create project: " + error.message);
      return null;
    }
  };

  const loadProject = async (projectId: string) => {
    setLoading(true);
    try {
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;

      const { data: files, error: filesError } = await supabase
        .from('project_files')
        .select('*')
        .eq('project_id', projectId);

      if (filesError) throw filesError;

      setCurrentProject({
        ...project,
        files: files || []
      });
    } catch (error: any) {
      toast.error("Failed to load project: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const saveFile = async (projectId: string, filePath: string, content: string, language: string) => {
    try {
      const { data: existingFile } = await supabase
        .from('project_files')
        .select('id')
        .eq('project_id', projectId)
        .eq('file_path', filePath)
        .single();

      if (existingFile) {
        const { error } = await supabase
          .from('project_files')
          .update({ content, language })
          .eq('id', existingFile.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('project_files')
          .insert({
            project_id: projectId,
            file_path: filePath,
            content,
            language
          });

        if (error) throw error;
      }

      // Update project updated_at
      await supabase
        .from('projects')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', projectId);

    } catch (error: any) {
      toast.error("Failed to save file: " + error.message);
    }
  };

  const deleteFile = async (projectId: string, filePath: string) => {
    try {
      const { error } = await supabase
        .from('project_files')
        .delete()
        .eq('project_id', projectId)
        .eq('file_path', filePath);

      if (error) throw error;
      toast.success("File deleted");
    } catch (error: any) {
      toast.error("Failed to delete file: " + error.message);
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
      toast.success("Project deleted");
      await loadProjects();
    } catch (error: any) {
      toast.error("Failed to delete project: " + error.message);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  return {
    projects,
    currentProject,
    loading,
    createProject,
    loadProject,
    saveFile,
    deleteFile,
    deleteProject,
    refreshProjects: loadProjects
  };
};

const getDefaultFiles = (templateType: string): ProjectFile[] => {
  switch (templateType) {
    case 'html':
      return [
        {
          file_path: '/index.html',
          content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Project</title>
    <link rel="stylesheet" href="/style.css">
</head>
<body>
    <h1>Welcome to Your Project</h1>
    <script src="/script.js"></script>
</body>
</html>`,
          language: 'html'
        },
        {
          file_path: '/style.css',
          content: `body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 20px;
  background: #f5f5f5;
}

h1 {
  color: #333;
}`,
          language: 'css'
        },
        {
          file_path: '/script.js',
          content: `console.log('Project loaded!');

// Your JavaScript code here`,
          language: 'javascript'
        }
      ];
    case 'react':
      return [
        {
          file_path: '/App.tsx',
          content: `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <h1>React App</h1>
    </div>
  );
}

export default App;`,
          language: 'typescript'
        },
        {
          file_path: '/App.css',
          content: `.App {
  text-align: center;
  padding: 20px;
}`,
          language: 'css'
        }
      ];
    default:
      return [];
  }
};
