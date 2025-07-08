
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { 
  Sparkles, 
  Zap, 
  Globe, 
  Search, 
  Calendar, 
  BarChart3, 
  Settings,
  Palette,
  Shield,
  Clock
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Sparkles,
      title: "Smart Blog Writing with Google Gemini AI",
      description: "Generate high-quality, engaging blog posts using Google's advanced Gemini AI. Just provide a topic or keywords, and watch as AI crafts compelling content tailored to your audience.",
      badge: "AI-Powered"
    },
    {
      icon: Globe,
      title: "Fully Customizable AI Website Builder",
      description: "Build your complete blog website in minutes. Choose from professional themes, customize colors, layouts, and branding to match your vision perfectly.",
      badge: "Website Builder"
    },
    {
      icon: Search,
      title: "SEO-Optimized Content Generation",
      description: "Every blog post is automatically optimized for search engines. AI analyzes your content and suggests improvements for better rankings and visibility.",
      badge: "SEO Ready"
    },
    {
      icon: Zap,
      title: "Auto-Publish and Manage Blog Posts",
      description: "Seamlessly publish your AI-generated content directly to your blog. Edit, update, and manage all your posts from one intuitive dashboard.",
      badge: "Automation"
    },
    {
      icon: Calendar,
      title: "Schedule Future Posts",
      description: "Plan your content strategy by scheduling posts for future publication. Maintain consistent posting schedules without manual intervention.",
      badge: "Scheduling"
    },
    {
      icon: BarChart3,
      title: "Built-in Analytics for Views and Engagement",
      description: "Track your blog's performance with detailed analytics. Monitor page views, engagement rates, popular content, and audience behavior.",
      badge: "Analytics"
    },
    {
      icon: Settings,
      title: "Google Search Console Integration",
      description: "Connect directly with Google Search Console to monitor your site's search performance and optimize for better visibility.",
      badge: "Integration"
    },
    {
      icon: Palette,
      title: "Multiple Writing Tones and Styles",
      description: "Choose from various writing tones - Professional, Friendly, Casual, or let AI adapt to your unique voice and style preferences.",
      badge: "Customization"
    },
    {
      icon: Shield,
      title: "Secure and Reliable Hosting",
      description: "Your blog is hosted on secure, reliable infrastructure with automatic backups and 99.9% uptime guarantee.",
      badge: "Security"
    },
    {
      icon: Clock,
      title: "Real-time Content Generation",
      description: "Generate blog posts in real-time. See your content come to life as AI writes, formats, and optimizes your posts instantly.",
      badge: "Real-time"
    }
  ];

  return (
    <div className="min-h-screen gradient-bg">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Powerful Features for Modern Bloggers
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to create, manage, and grow your blog with the power of AI. 
              From content generation to analytics, we've got you covered.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <feature.icon className="h-10 w-10 text-primary" />
                    <Badge variant="secondary">{feature.badge}</Badge>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 text-center">
            <div className="bg-white/70 rounded-2xl p-8 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-4">Ready to Experience These Features?</h2>
              <p className="text-gray-600 mb-6">
                Start your free trial today and see how Aerostic AI can transform your blogging experience.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/blog-editor" 
                  className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Try AI Editor
                </a>
                <a 
                  href="/blog-builder" 
                  className="inline-flex items-center justify-center px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors"
                >
                  Build Your Blog
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
