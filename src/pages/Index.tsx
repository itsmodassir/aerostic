
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Sparkles, FileText, Globe, Users, Zap, Target, ArrowRight, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen gradient-bg">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Create Amazing Content with{" "}
            <span className="text-primary">AI Power</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Generate professional blog posts, create stunning images, and chat with AI. 
            Let AI handle the heavy lifting while you focus on your ideas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link to="/dashboard">
                <Button size="lg" className="text-lg px-8 py-3">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/auth">
                  <Button size="lg" className="text-lg px-8 py-3">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Get Started Free
                  </Button>
                </Link>
                <Link to="/chat">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Try AI Chat
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Create Content
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful AI tools designed to help you create, publish, and manage your content effortlessly.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>AI Blog Writer</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Generate high-quality blog posts on any topic with customizable tone, length, and style.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>AI Chat Assistant</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Have intelligent conversations with our AI assistant powered by BlogCraft AI.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Image Generator</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Create stunning AI-generated images for your content with simple text prompts.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>User Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Manage all your content from one central dashboard with easy editing tools.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Instant Generation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Get professional content in seconds with our advanced AI integration.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Target className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>SEO Optimized</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Every piece of content is optimized for search engines to help you rank higher.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Content Creation?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of content creators who are using AI to scale their content creation and productivity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link to="/dashboard">
                <Button size="lg" className="text-lg px-8 py-3">
                  <Users className="mr-2 h-5 w-5" />
                  Open Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/auth">
                  <Button size="lg" className="text-lg px-8 py-3">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/chat">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Try AI Chat
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
