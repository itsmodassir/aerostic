import React, { useEffect, useMemo, useState } from "react";
import { Activity, GitBranch, RefreshCw, Server, ShieldCheck, Globe } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

interface HealthResponse {
  status: string;
  serverTime: string;
  functions: string[];
}

const useSEO = (title: string, description: string, path: string) => {
  useEffect(() => {
    document.title = title;

    const metaDescName = "description";
    let descEl = document.querySelector(`meta[name="${metaDescName}"]`) as HTMLMetaElement | null;
    if (!descEl) {
      descEl = document.createElement("meta");
      descEl.name = metaDescName;
      document.head.appendChild(descEl);
    }
    descEl.content = description;

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `${window.location.origin}${path}`;
  }, [title, description, path]);
};

const ProjectStatus: React.FC = () => {
  useSEO(
    "Project Status Dashboard | Aerostic",
    "Project status dashboard showing health checks, Supabase and CI setup.",
    "/project-status"
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);

  const supabaseLinks = useMemo(() => ({
    sql: `https://supabase.com/dashboard/project/tsyxndzqsadatwcbbdrv/sql/new`,
    functions: `https://supabase.com/dashboard/project/tsyxndzqsadatwcbbdrv/functions`,
    functionsLogs: (name: string) => `https://supabase.com/dashboard/project/tsyxndzqsadatwcbbdrv/functions/${name}/logs`,
    authUsers: `https://supabase.com/dashboard/project/tsyxndzqsadatwcbbdrv/auth/users`,
    storage: `https://supabase.com/dashboard/project/tsyxndzqsadatwcbbdrv/storage/buckets`,
  }), []);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke("project-health");
      if (error) throw error;
      setHealth(data as HealthResponse);
    } catch (e: any) {
      setError(e?.message || "Failed to fetch status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

  return (
    <>
      <header className="w-full border-b bg-background">
        <div className="mx-auto max-w-6xl px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Project Status Dashboard</h1>
            <p className="text-muted-foreground">Live overview of app health, backend, and deployment</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={fetchHealth} disabled={loading}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
            <a href={supabaseLinks.functions} target="_blank" rel="noreferrer">
              <Button variant="secondary"><Globe className="h-4 w-4" /> Supabase</Button>
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> App</CardTitle>
              <CardDescription>Runtime environment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Connectivity</span>
                <Badge variant={isOnline ? "secondary" : "destructive"}>{isOnline ? "Online" : "Offline"}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Environment</span>
                <Badge variant="outline">Browser</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Loaded</span>
                <Badge variant="outline">{new Date().toLocaleString()}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Server className="h-5 w-5" /> Backend</CardTitle>
              <CardDescription>Edge function health</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Status</span>
                <Badge variant={health?.status === "ok" ? "secondary" : "destructive"}>{health?.status ?? (loading ? "Loading..." : "Unknown")}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Server time</span>
                <Badge variant="outline">{health?.serverTime ? new Date(health.serverTime).toLocaleString() : "—"}</Badge>
              </div>
              {error && (
                <div className="text-sm text-destructive">{error}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> Authentication</CardTitle>
              <CardDescription>Supabase Auth</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Provider</span>
                <Badge variant="outline">Supabase</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Anon Key</span>
                <Badge variant="outline">Configured</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Users</span>
                <a href={supabaseLinks.authUsers} target="_blank" rel="noreferrer" className="underline">
                  View in Supabase
                </a>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><GitBranch className="h-5 w-5" /> Edge Functions</CardTitle>
              <CardDescription>Available functions and quick links</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Logs</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(health?.functions ?? ["gemini-chat","gemini-image","generate-blog-content","generate-code","generate-image","generate-website-content","verify-domain","project-health"]).map((fn) => (
                      <TableRow key={fn}>
                        <TableCell>{fn}</TableCell>
                        <TableCell>
                          <a href={supabaseLinks.functionsLogs(fn)} target="_blank" rel="noreferrer" className="underline">
                            Open logs
                          </a>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
};

export default ProjectStatus;
