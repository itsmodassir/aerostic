import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  MessageCircle, 
  FileText, 
  Palette, 
  Globe, 
  User, 
  Settings, 
  CreditCard, 
  Shield, 
  HelpCircle,
  ChevronRight,
  Book,
  Video,
  Users,
  Mail,
  Phone,
  Clock
} from "lucide-react";
import { Link } from "react-router-dom";

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      title: "Getting Started",
      icon: <Book className="h-8 w-8" />,
      description: "Learn the basics of our platform",
      articles: [
        "How to create your first account",
        "Setting up your profile",
        "Understanding the dashboard",
        "Quick start guide"
      ],
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "AI Blog Editor",
      icon: <FileText className="h-8 w-8" />,
      description: "Master AI-powered content creation",
      articles: [
        "Creating your first blog post",
        "Using AI tone settings",
        "Optimizing content for SEO",
        "Exporting and publishing"
      ],
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "AI Chat Assistant",
      icon: <MessageCircle className="h-8 w-8" />,
      description: "Get the most from AI conversations",
      articles: [
        "Starting a new conversation",
        "Managing chat history",
        "Best practices for prompts",
        "Understanding AI responses"
      ],
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Image Generator",
      icon: <Palette className="h-8 w-8" />,
      description: "Create stunning visuals with AI",
      articles: [
        "Writing effective image prompts",
        "Understanding style options",
        "Downloading and using images",
        "Prompt generator features"
      ],
      color: "from-orange-500 to-red-500"
    },
    {
      title: "Website Builder",
      icon: <Globe className="h-8 w-8" />,
      description: "Build complete websites easily",
      articles: [
        "Choosing the right template",
        "Customizing your design",
        "Adding content and pages",
        "Publishing your website"
      ],
      color: "from-indigo-500 to-purple-500"
    },
    {
      title: "Account & Billing",
      icon: <CreditCard className="h-8 w-8" />,
      description: "Manage your account and payments",
      articles: [
        "Upgrading your plan",
        "Understanding billing cycles",
        "Managing payment methods",
        "Downloading invoices"
      ],
      color: "from-emerald-500 to-teal-500"
    }
  ];

  const popularArticles = [
    "How to write better AI prompts",
    "Understanding usage limits",
    "Connecting custom domains",
    "Exporting your content",
    "Privacy and data security",
    "Mobile app features"
  ];

  const supportOptions = [
    {
      title: "Live Chat",
      description: "Get instant help from our team",
      icon: <MessageCircle className="h-6 w-6" />,
      action: "Start Chat",
      available: "24/7 Available",
      color: "bg-blue-500"
    },
    {
      title: "Email Support",
      description: "Send us your questions anytime",
      icon: <Mail className="h-6 w-6" />,
      action: "Send Email",
      available: "Response in 2-4 hours",
      color: "bg-green-500"
    },
    {
      title: "Video Tutorials",
      description: "Watch step-by-step guides",
      icon: <Video className="h-6 w-6" />,
      action: "Watch Now",
      available: "50+ Videos",
      color: "bg-purple-500"
    },
    {
      title: "Community",
      description: "Connect with other users",
      icon: <Users className="h-6 w-6" />,
      action: "Join Community",
      available: "5,000+ Members",
      color: "bg-orange-500"
    }
  ];

  const filteredCategories = categories.filter(category =>
    category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.articles.some(article => 
      article.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen gradient-bg">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-6">
              <HelpCircle className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              How can we{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                help you?
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Find answers, get support, and learn how to make the most of our AI-powered platform
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto mb-12">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Search for help articles, features, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-4 text-lg border-2 border-primary/20 focus:border-primary/40 rounded-xl"
            />
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
            📚 Popular Articles
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
            {popularArticles.map((article, index) => (
              <Card 
                key={index} 
                className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-2 border-primary/10 hover:border-primary/30"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground font-medium">{article}</span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Help Categories */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
            🗂️ Browse by Category
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCategories.map((category, index) => (
              <Card 
                key={index} 
                className="tech-card border-2 border-primary/20 hover:border-primary/40 hover:shadow-2xl transition-all duration-500 hover:scale-105 group relative overflow-hidden"
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
                
                <CardHeader className="relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${category.color} text-white group-hover:scale-110 transition-transform duration-300`}>
                      {category.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl text-foreground group-hover:text-primary transition-colors">
                        {category.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="relative z-10">
                  <div className="space-y-3">
                    {category.articles.map((article, articleIndex) => (
                      <div 
                        key={articleIndex} 
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer group/item"
                      >
                        <div className="w-2 h-2 bg-primary rounded-full group-hover/item:scale-125 transition-transform"></div>
                        <span className="text-sm text-muted-foreground group-hover/item:text-foreground transition-colors">
                          {article}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto opacity-0 group-hover/item:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full mt-6 border-primary/30 hover:border-primary/50 hover:bg-primary/10"
                  >
                    View All Articles
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Support Options */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
            🚀 Get Support
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportOptions.map((option, index) => (
              <Card 
                key={index} 
                className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 border-primary/20 hover:border-primary/40"
              >
                <CardContent className="p-8">
                  <div className={`inline-flex items-center justify-center p-4 ${option.color} rounded-full mb-6`}>
                    <div className="text-white">
                      {option.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {option.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {option.description}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
                    <Clock className="h-4 w-4" />
                    {option.available}
                  </div>
                  <Button className="w-full">
                    {option.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="tech-card border-2 border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-foreground mb-2">
                🔗 Quick Links
              </CardTitle>
              <p className="text-muted-foreground">
                Access important pages and resources
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link to="/faq" className="block">
                  <div className="p-4 rounded-lg border border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all">
                    <HelpCircle className="h-6 w-6 text-primary mb-2" />
                    <div className="font-medium text-foreground">FAQ</div>
                    <div className="text-sm text-muted-foreground">Common questions</div>
                  </div>
                </Link>
                <Link to="/contact" className="block">
                  <div className="p-4 rounded-lg border border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all">
                    <Mail className="h-6 w-6 text-primary mb-2" />
                    <div className="font-medium text-foreground">Contact</div>
                    <div className="text-sm text-muted-foreground">Get in touch</div>
                  </div>
                </Link>
                <Link to="/privacy" className="block">
                  <div className="p-4 rounded-lg border border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all">
                    <Shield className="h-6 w-6 text-primary mb-2" />
                    <div className="font-medium text-foreground">Privacy</div>
                    <div className="text-sm text-muted-foreground">Privacy policy</div>
                  </div>
                </Link>
                <Link to="/terms" className="block">
                  <div className="p-4 rounded-lg border border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all">
                    <FileText className="h-6 w-6 text-primary mb-2" />
                    <div className="font-medium text-foreground">Terms</div>
                    <div className="text-sm text-muted-foreground">Terms of service</div>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Still Need Help */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="tech-card border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="p-12">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4">
                  <MessageCircle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Still need help?
                </h3>
                <p className="text-muted-foreground mb-8">
                  Our friendly support team is here to help you succeed. Get personalized assistance for your specific needs.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8 py-3">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Start Live Chat
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                  <Mail className="mr-2 h-5 w-5" />
                  Send Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HelpCenter;