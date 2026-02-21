
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Briefcase, 
  Store, 
  Camera, 
  Code, 
  Heart, 
  Plane,
  FileText,
  MessageSquare,
  Palette,
  Star,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const PortfolioShowcase = () => {
  const navigate = useNavigate();

  const portfolios = [
    {
      title: "AI Blog Editor",
      description: "Create professional blog posts with AI assistance, multiple tones, and custom word counts",
      icon: <FileText className="h-8 w-8" />,
      features: ["AI-powered writing", "Multiple tones", "SEO optimization", "Image integration"],
      color: "bg-blue-50 border-blue-200",
      route: "/blog-editor"
    },
    {
      title: "AI Chat Assistant",
      description: "Get instant help and answers from our advanced AI chatbot for any question",
      icon: <MessageSquare className="h-8 w-8" />,
      features: ["Real-time chat", "Context awareness", "Multi-topic support", "24/7 availability"],
      color: "bg-green-50 border-green-200",
      route: "/chat"
    },
    {
      title: "AI Image Generator",
      description: "Generate stunning images and advanced prompts using cutting-edge AI technology",
      icon: <Palette className="h-8 w-8" />,
      features: ["Custom prompts", "Multiple styles", "High quality", "Instant generation"],
      color: "bg-purple-50 border-purple-200",
      route: "/image-generator"
    },
    {
      title: "Website Builder",
      description: "Build complete websites with AI-generated content and professional designs",
      icon: <Code className="h-8 w-8" />,
      features: ["AI content", "Responsive design", "Custom themes", "Easy deployment"],
      color: "bg-orange-50 border-orange-200",
      route: "/blog-builder"
    },
    {
      title: "Business Portfolio",
      description: "Professional websites for companies and entrepreneurs with complete business solutions",
      icon: <Briefcase className="h-8 w-8" />,
      features: ["Company profiles", "Service showcases", "Contact forms", "Team sections"],
      color: "bg-indigo-50 border-indigo-200",
      route: "/blog-builder"
    },
    {
      title: "E-commerce Store",
      description: "Online stores with product catalogs, shopping features, and payment integration",
      icon: <Store className="h-8 w-8" />,
      features: ["Product galleries", "Shopping cart", "Payment systems", "Inventory management"],
      color: "bg-pink-50 border-pink-200",
      route: "/blog-builder"
    }
  ];

  return (
    <Card className="tech-card border-2 border-primary/20 relative overflow-hidden">
      {/* Animated tech background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
      </div>
      
      <CardHeader className="relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-gradient-to-r from-primary to-accent rounded-lg tech-glow pulse-glow">
              <Star className="h-6 w-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              🌟 Portfolio Showcase
            </span>
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/features')}
            className="border-primary/30 hover:border-primary/50 hover:bg-primary/10 transition-all duration-300"
          >
            View All Features
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {portfolios.map((portfolio, index) => (
            <Card 
              key={index} 
              className="tech-card border-2 border-primary/20 hover:border-primary/40 hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer group relative overflow-hidden shimmer-effect"
              onClick={() => navigate(portfolio.route)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Dynamic background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 group-hover:from-primary/10 group-hover:to-accent/10 transition-all duration-300"></div>
              
              <CardHeader className="text-center pb-6 relative z-10">
                <div className="relative mx-auto w-fit">
                  <div className="p-4 bg-gradient-to-br from-primary to-accent rounded-2xl tech-glow group-hover:scale-110 transition-transform duration-300">
                    <div className="text-white">
                      {portfolio.icon}
                    </div>
                  </div>
                  {/* Floating ring */}
                  <div className="absolute inset-0 rounded-2xl border-2 border-primary/30 group-hover:border-primary/60 transition-colors duration-300 animate-spin" style={{ animationDuration: '10s' }}></div>
                </div>
                <CardTitle className="text-xl mt-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {portfolio.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground leading-relaxed">{portfolio.description}</p>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-3 mb-6">
                  {portfolio.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center text-sm group-hover:text-primary transition-colors duration-300">
                      <div className="w-2 h-2 bg-gradient-to-r from-primary to-accent rounded-full mr-3 group-hover:scale-125 transition-transform duration-300" />
                      <span className="font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white border-0 tech-glow group-hover:scale-105 transition-all duration-300" 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(portfolio.route);
                  }}
                >
                  Launch Now 🚀
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
              
              {/* Tech corner decoration */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/20 to-transparent rounded-bl-full"></div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioShowcase;
