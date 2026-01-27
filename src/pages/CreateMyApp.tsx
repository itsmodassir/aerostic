import React, { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { Sparkles, Terminal, RefreshCw, Upload, Play, FileCode2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CreateMyApp: React.FC = () => {
  const [idea, setIdea] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [htmlPreview, setHtmlPreview] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [refineOpen, setRefineOpen] = useState(false);
  const [refineText, setRefineText] = useState("");

  const addLog = (line: string) => setLogs((l) => [...l, `${new Date().toLocaleTimeString()} • ${line}`]);

  useEffect(() => {
    // Basic SEO tags
    document.title = "Auto-Code Generator | Create My App";
    const desc = "Create My App with AI: generate code and see an instant preview.";
    const metaDesc = document.querySelector('meta[name="description"]') || document.createElement("meta");
    metaDesc.setAttribute("name", "description");
    metaDesc.setAttribute("content", desc);
    document.head.appendChild(metaDesc);

    const canonical = document.querySelector('link[rel="canonical"]') || document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    canonical.setAttribute("href", window.location.href);
    document.head.appendChild(canonical);
  }, []);

  const startProgress = () => {
    setProgress(10);
    setTimeout(() => setProgress(35), 300);
    setTimeout(() => setProgress(65), 900);
  };

  const generate = async (promptText: string) => {
    if (!promptText.trim()) {
      toast.error("Please describe your app idea first.");
      return;
    }

    try {
      setIsGenerating(true);
      setHtmlPreview("");
      setCode("");
      setLogs([]);
      addLog("Starting generation…");
      startProgress();

      const context = [
        "Return a SINGLE, self-contained HTML file.",
        "Must include: <head> with meta viewport, title, meta description; inline CSS using a clean, minimal style matching Aerostic's visual identity; and a <main> with a simple hero section and 2-3 feature cards.",
        "No external assets or images. Keep JS minimal. Include semantic HTML and accessible ARIA where appropriate.",
      ].join("\n");

      const { data, error } = await supabase.functions.invoke("generate-code", {
        body: {
          prompt: promptText,
          language: "html",
          context,
        },
      });

      if (error) throw error;
      const generated: string = data?.code || "";
      addLog("Code generated successfully.");
      setCode(generated);
      setHtmlPreview(generated);
      setProgress(95);
      setTimeout(() => setProgress(100), 300);
      toast.success("Preview ready");
    } catch (err: any) {
      console.error(err);
      addLog(`Error: ${err.message || "Failed to generate"}`);
      toast.error("Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const resetAll = () => {
    setIdea("");
    setHtmlPreview("");
    setCode("");
    setLogs([]);
    setProgress(0);
    toast.success("Reset complete");
  };

  const handlePush = () => {
    addLog("Preparing to push to GitHub…");
    toast.info("Use Lovable's GitHub button (top-right) to push changes.");
    window.open("https://docs.lovable.dev/integrations/github", "_blank");
  };

  const handleDeploy = () => {
    addLog("Deploying preview…");
    toast.info("Use the Publish button in Lovable to deploy your preview.");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <header className="pt-24 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Create My App</h1>
          <p className="text-muted-foreground">Auto-Code Generator — describe your idea, generate code, and see an instant preview.</p>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-5xl mx-auto grid md:grid-cols-5 gap-6">
          {/* Left column: wizard + actions */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><Sparkles className="h-5 w-5 mr-2 text-primary" /> Describe your app</CardTitle>
                <CardDescription>Keep it short. You can refine later.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  placeholder="Example: A minimal landing page for a task manager with hero, features, and a CTA."
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button onClick={() => generate(idea)} disabled={isGenerating}>
                    <Play className="h-4 w-4 mr-2" />
                    Generate
                  </Button>
                  <Dialog open={refineOpen} onOpenChange={setRefineOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <FileCode2 className="h-4 w-4 mr-2" /> Refine
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Refine requirements</DialogTitle>
                        <DialogDescription>Add more details and regenerate.</DialogDescription>
                      </DialogHeader>
                      <Textarea
                        placeholder="Add sections, tone, colors, layout preferences…"
                        value={refineText}
                        onChange={(e) => setRefineText(e.target.value)}
                      />
                      <DialogFooter>
                        <Button
                          onClick={() => {
                            const next = [idea, refineText].filter(Boolean).join("\n\nAdditional requirements:\n");
                            setRefineOpen(false);
                            generate(next);
                          }}
                        >
                          Generate Again
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button variant="secondary" onClick={resetAll} disabled={isGenerating}>
                    <RefreshCw className="h-4 w-4 mr-2" /> Reset
                  </Button>
                </div>
                <div className="space-y-2 mt-3">
                  <div className="text-sm text-muted-foreground">Progress</div>
                  <Progress value={progress} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><Terminal className="h-5 w-5 mr-2 text-primary" /> Activity & Logs</CardTitle>
                <CardDescription>Live updates during generation and deployment.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48 overflow-auto rounded-md border border-border bg-card text-sm p-3 space-y-1">
                  {logs.length === 0 ? (
                    <div className="text-muted-foreground">No activity yet.</div>
                  ) : (
                    logs.map((l, i) => (
                      <div key={i} className="font-mono whitespace-pre-wrap">{l}</div>
                    ))
                  )}
                </div>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" onClick={handlePush}>
                    <Upload className="h-4 w-4 mr-2" /> Push to GitHub
                  </Button>
                  <Button variant="outline" onClick={handleDeploy}>
                    <Sparkles className="h-4 w-4 mr-2" /> Deploy Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column: preview */}
          <div className="md:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
                <CardDescription>If your code is valid HTML, it will render here.</CardDescription>
              </CardHeader>
              <CardContent>
                {htmlPreview ? (
                  <iframe
                    title="Generated Preview"
                    className="w-full h-[520px] rounded-md border border-border bg-background"
                    sandbox="allow-scripts allow-same-origin"
                    srcDoc={htmlPreview}
                  />
                ) : (
                  <div className="h-[520px] rounded-md border border-dashed border-border flex items-center justify-center text-muted-foreground">
                    Your preview will appear here after generation.
                  </div>
                )}
                {code && (
                  <div className="mt-4">
                    <a
                      className="inline-flex items-center text-primary hover:underline"
                      href="/code-editor"
                      onClick={(e) => {
                        // no-op: route opens; could persist code via state mgmt if needed
                      }}
                    >
                      Open in Code Editor <ExternalLink className="h-3.5 w-3.5 ml-1" />
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateMyApp;
