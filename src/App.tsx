
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import MobileOptimizations from "@/components/MobileOptimizations";
import AppUpdatePrompt from "@/components/AppUpdatePrompt";
import { useState } from "react";
import Index from "./pages/Index";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import BlogEditor from "./pages/BlogEditor";
import BlogBuilder from "./pages/BlogBuilder";
import ImageGenerator from "./pages/ImageGenerator";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import BlogPost from "./pages/BlogPost";
import NotFound from "./pages/NotFound";
import Chat from "./pages/Chat";
import Deploy from "./pages/Deploy";
import HelpCenter from "./pages/HelpCenter";
import Blog from "./pages/Blog";
import PromptGenerator from "./pages/PromptGenerator";
import CodeEditor from "./pages/CodeEditor";

function App() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="aerostic-theme">
        <div className="min-h-screen bg-background text-foreground">
          <AuthProvider>
            <TooltipProvider>
              <MobileOptimizations />
              <AppUpdatePrompt checkInterval={30} />
              <Toaster />
              <Sonner />
              <BrowserRouter>
              <Routes>
                <Route path="/" element={<Chat />} />
                <Route path="/landing" element={<Index />} />
                <Route path="/features" element={<Features />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/about" element={<About />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/help" element={<HelpCenter />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/deploy" element={<Deploy />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/blog-post/:id" element={<BlogPost />} />
                <Route path="/blog-editor" element={
                  <ProtectedRoute>
                    <BlogEditor />
                  </ProtectedRoute>
                } />
                <Route path="/blog-builder" element={
                  <ProtectedRoute>
                    <BlogBuilder />
                  </ProtectedRoute>
                } />
                <Route path="/image-generator" element={
                  <ProtectedRoute>
                    <ImageGenerator />
                  </ProtectedRoute>
                } />
                <Route path="/chat" element={<Chat />} />
                <Route path="/prompt-generator" element={<PromptGenerator />} />
                <Route path="/code-editor" element={<CodeEditor />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
