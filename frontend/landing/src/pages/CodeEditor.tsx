import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { FileTree } from "@/components/code-editor/FileTree";
import { LivePreview } from "@/components/code-editor/LivePreview";
import { AIProjectGenerator } from "@/components/code-editor/AIProjectGenerator";
import { useProjectManager } from "@/hooks/useProjectManager";
import { Code, Save, FolderOpen, Github, Globe, Plus, Trash2, Loader2, Download, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  language?: string;
}

const CodeEditor = () => {
  const navigate = useNavigate();
  const { projects, currentProject, loading, createProject, loadProject, saveFile, deleteFile, deleteProject, refreshProjects } = useProjectManager();
  
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContents, setFileContents] = useState<Record<string, string>>({});
  const [currentFileContent, setCurrentFileContent] = useState("");
  const [currentLanguage, setCurrentLanguage] = useState("html");
  
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [newProjectTemplate, setNewProjectTemplate] = useState("html");
  
  const [githubToken, setGithubToken] = useState("");
  const [repoName, setRepoName] = useState("");
  const [showGithubDialog, setShowGithubDialog] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  
  const [publishLoading, setPublishLoading] = useState(false);

  // Build file tree from current project
  useEffect(() => {
    if (!currentProject) return;
    
    const tree: FileNode[] = [];
    const contents: Record<string, string> = {};
    
    currentProject.files.forEach(file => {
      contents[file.file_path] = file.content;
      
      const parts = file.file_path.split('/').filter(Boolean);
      let currentLevel = tree;
      
      parts.forEach((part, index) => {
        const isFile = index === parts.length - 1;
        const path = '/' + parts.slice(0, index + 1).join('/');
        
        let existing = currentLevel.find(node => node.name === part);
        if (!existing) {
          existing = {
            name: part,
            path,
            type: isFile ? 'file' : 'folder',
            children: isFile ? undefined : [],
            language: isFile ? file.language : undefined
          };
          currentLevel.push(existing);
        }
        
        if (!isFile && existing.children) {
          currentLevel = existing.children;
        }
      });
    });
    
    setFileTree(tree);
    setFileContents(contents);
    
    // Select first HTML file by default
    const firstHtml = currentProject.files.find(f => f.file_path.endsWith('.html'));
    if (firstHtml && !selectedFile) {
      setSelectedFile(firstHtml.file_path);
      setCurrentFileContent(firstHtml.content);
      setCurrentLanguage(firstHtml.language);
    }
  }, [currentProject]);

  // Update current file content when selection changes
  useEffect(() => {
    if (selectedFile && fileContents[selectedFile]) {
      setCurrentFileContent(fileContents[selectedFile]);
      const ext = selectedFile.split('.').pop();
      setCurrentLanguage(ext || 'html');
    }
  }, [selectedFile, fileContents]);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      toast.error("Please enter a project name");
      return;
    }
    
    const projectId = await createProject(newProjectName, newProjectDesc, newProjectTemplate);
    if (projectId) {
      setShowNewProjectDialog(false);
      setNewProjectName("");
      setNewProjectDesc("");
      await loadProject(projectId);
      toast.success("Project created! Start building your app.");
    }
  };

  const handleSaveFile = async () => {
    if (!currentProject || !selectedFile) return;
    
    await saveFile(currentProject.id, selectedFile, currentFileContent, currentLanguage);
    setFileContents({
      ...fileContents,
      [selectedFile]: currentFileContent
    });
    toast.success("File saved");
  };

  const handleFileCreate = async (path: string, type: 'file' | 'folder') => {
    if (!currentProject) return;
    
    if (type === 'file') {
      const ext = path.split('.').pop() || 'txt';
      const lang = ext === 'js' ? 'javascript' : ext === 'ts' ? 'typescript' : ext;
      await saveFile(currentProject.id, path, '', lang);
      await loadProject(currentProject.id);
    }
  };

  const handleFileDelete = async (path: string) => {
    if (!currentProject) return;
    await deleteFile(currentProject.id, path);
    await loadProject(currentProject.id);
  };

  const handleGithubConnect = async () => {
    if (!currentProject || !githubToken || !repoName) {
      toast.error("Please provide GitHub token and repository name");
      return;
    }
    
    setGithubLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('github-integration', {
        body: {
          action: 'create-repo',
          projectId: currentProject.id,
          repoName,
          githubToken
        }
      });
      
      if (error) throw error;
      
      toast.success("Connected to GitHub! Repository created.");
      setShowGithubDialog(false);
      await loadProject(currentProject.id);
    } catch (error: any) {
      toast.error("Failed to connect to GitHub: " + error.message);
    } finally {
      setGithubLoading(false);
    }
  };

  const handleGithubPush = async () => {
    if (!currentProject || !githubToken) return;
    
    setGithubLoading(true);
    try {
      const { error } = await supabase.functions.invoke('github-integration', {
        body: {
          action: 'push',
          projectId: currentProject.id,
          githubToken
        }
      });
      
      if (error) throw error;
      toast.success("Pushed to GitHub successfully!");
    } catch (error: any) {
      toast.error("Failed to push: " + error.message);
    } finally {
      setGithubLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!currentProject) return;
    
    setPublishLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('publish-project', {
        body: { projectId: currentProject.id }
      });
      
      if (error) throw error;
      
      toast.success(data.message || "Project published!");
      await loadProject(currentProject.id);
    } catch (error: any) {
      toast.error("Failed to publish: " + error.message);
    } finally {
      setPublishLoading(false);
    }
  };

  const handleDownloadProject = () => {
    if (!currentProject) return;
    
    const zip: Record<string, string> = {};
    currentProject.files.forEach(file => {
      zip[file.file_path] = file.content;
    });
    
    const zipContent = JSON.stringify(zip, null, 2);
    const blob = new Blob([zipContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentProject.name}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Project downloaded!");
  };

  // Get preview content
  const getPreviewContent = () => {
    const html = fileContents['/index.html'] || '';
    const css = fileContents['/style.css'] || '';
    const js = fileContents['/script.js'] || '';
    return { html, css, javascript: js };
  };

  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      <Navigation />
      
      <div className="pt-20 flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="px-4 py-3 bg-card border-b border-border">
          <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Code className="h-6 w-6 text-primary" />
              <h1 className="text-lg font-bold">Vibe Coding Studio</h1>
              
              {currentProject && (
                <div className="flex items-center gap-2 ml-4">
                  <Select value={currentProject.id} onValueChange={loadProject}>
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => currentProject && deleteProject(currentProject.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Project
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>
                      Start a new web project from a template
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label>Project Name</Label>
                      <Input
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        placeholder="My Awesome Project"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input
                        value={newProjectDesc}
                        onChange={(e) => setNewProjectDesc(e.target.value)}
                        placeholder="Optional description"
                      />
                    </div>
                    <div>
                      <Label>Template</Label>
                      <Select value={newProjectTemplate} onValueChange={setNewProjectTemplate}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="html">HTML/CSS/JS</SelectItem>
                          <SelectItem value="react">React App</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCreateProject}>Create Project</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              {currentProject && (
                <>
                  <Button onClick={handleSaveFile} disabled={!selectedFile}>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                  
                  <Dialog open={showGithubDialog} onOpenChange={setShowGithubDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Github className="mr-2 h-4 w-4" />
                        GitHub
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>GitHub Integration</DialogTitle>
                        <DialogDescription>
                          Connect and push your project to GitHub
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label>GitHub Personal Access Token</Label>
                          <Input
                            type="password"
                            value={githubToken}
                            onChange={(e) => setGithubToken(e.target.value)}
                            placeholder="ghp_..."
                          />
                        </div>
                        {!currentProject.github_connected && (
                          <div>
                            <Label>Repository Name</Label>
                            <Input
                              value={repoName}
                              onChange={(e) => setRepoName(e.target.value)}
                              placeholder="my-project"
                            />
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        {currentProject.github_connected ? (
                          <Button onClick={handleGithubPush} disabled={githubLoading}>
                            {githubLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Push to GitHub
                          </Button>
                        ) : (
                          <Button onClick={handleGithubConnect} disabled={githubLoading}>
                            {githubLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Connect GitHub
                          </Button>
                        )}
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  
                  <Button onClick={handlePublish} disabled={publishLoading}>
                    {publishLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Globe className="mr-2 h-4 w-4" />}
                    Publish
                  </Button>
                  
                  <Button variant="outline" onClick={handleDownloadProject}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Editor Area */}
        {currentProject ? (
          <div className="flex-1 overflow-hidden">
            <ResizablePanelGroup direction="horizontal">
              {/* File Tree */}
              <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
                <FileTree
                  files={fileTree}
                  selectedFile={selectedFile}
                  onFileSelect={setSelectedFile}
                  onFileCreate={handleFileCreate}
                  onFileDelete={handleFileDelete}
                />
              </ResizablePanel>
              
              <ResizableHandle withHandle />
              
              {/* Code Editor */}
              <ResizablePanel defaultSize={40} minSize={30}>
                <div className="h-full flex flex-col bg-card">
                  <div className="p-3 border-b border-border flex items-center justify-between">
                    <span className="text-sm font-semibold">
                      {selectedFile || 'No file selected'}
                    </span>
                    <span className="text-xs text-muted-foreground uppercase">
                      {currentLanguage}
                    </span>
                  </div>
                  <Textarea
                    value={currentFileContent}
                    onChange={(e) => setCurrentFileContent(e.target.value)}
                    className="flex-1 font-mono text-sm border-0 rounded-none resize-none focus-visible:ring-0"
                    placeholder="Select a file to edit..."
                  />
                </div>
              </ResizablePanel>
              
              <ResizableHandle withHandle />
              
              {/* Live Preview */}
              <ResizablePanel defaultSize={40} minSize={30}>
                <LivePreview {...getPreviewContent()} />
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-4xl mx-auto space-y-8">
              {/* AI Generator */}
              <AIProjectGenerator onProjectCreated={loadProject} />

              {/* Or divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-background text-muted-foreground">or start from scratch</span>
                </div>
              </div>

              {/* Manual Project Creation */}
              <Card className="p-8 text-center">
                <Code className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Create Empty Project</h2>
                <p className="text-muted-foreground mb-6">
                  Start with a blank template and build your project manually
                </p>
                <Button size="lg" onClick={() => setShowNewProjectDialog(true)}>
                  <Plus className="mr-2 h-5 w-5" />
                  Create Blank Project
                </Button>
              </Card>

              {/* Existing Projects */}
              {projects.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Your Recent Projects</h3>
                  <div className="grid gap-4">
                    {projects.slice(0, 5).map(project => (
                      <Card
                        key={project.id}
                        className="p-4 cursor-pointer hover:border-primary transition-colors"
                        onClick={() => loadProject(project.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{project.name}</h4>
                            {project.description && (
                              <p className="text-sm text-muted-foreground">{project.description}</p>
                            )}
                          </div>
                          <FolderOpen className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {!currentProject && <Footer />}
    </div>
  );
};

export default CodeEditor;
