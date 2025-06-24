
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { ArrowRight, Sparkles, Zap, Globe, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen gradient-bg">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <Sparkles className="h-16 w-16 text-primary mx-auto mb-6" />
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
              Start Your AI Blog Instantly –{" "}
              <span className="text-primary">No Writing Needed!</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Let AI craft your blog posts, manage your site, and even build your entire blog from scratch – all in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link to="/blog-editor">
                  Start Writing with AI <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                <Link to="/blog-builder">
                  Build My Blog with AI <Globe className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need to Succeed Online
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-4">AI-Powered Writing</h3>
                <p className="text-gray-600">
                  Generate professional blog posts instantly using Google Gemini AI. Choose your tone and style.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-4">Complete Website Builder</h3>
                <p className="text-gray-600">
                  Build your entire blog website in 3 steps. Choose themes, customize, and go live instantly.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-4">Built-in Analytics</h3>
                <p className="text-gray-600">
                  Track your blog's performance with detailed analytics and SEO optimization tools.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Your AI-Powered Blog?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of creators who trust SetMyBlog AI to power their online presence.
          </p>
          <Button asChild size="lg" className="text-lg px-8 py-6">
            <Link to="/blog-editor">
              Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="h-8 w-8 text-primary mr-2" />
            <span className="text-xl font-bold">SetMyBlog AI</span>
          </div>
          <p className="text-gray-400 mb-6">
            The smartest way to create and manage your blog with AI assistance.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="/features" className="text-gray-400 hover:text-white transition-colors">Features</Link>
            <Link to="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link>
            <Link to="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link>
            <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-gray-400 text-sm">
            © 2024 SetMyBlog AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
