
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
    <Card className="bg-white/80 backdrop-blur-sm border-2 border-white/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Portfolio Showcase
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => navigate('/features')}>
            View All Features
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolios.map((portfolio, index) => (
            <Card 
              key={index} 
              className={`${portfolio.color} border-2 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer`}
              onClick={() => navigate(portfolio.route)}
            >
              <CardHeader className="text-center pb-4">
                <div className="text-primary mb-3 flex justify-center">
                  {portfolio.icon}
                </div>
                <CardTitle className="text-lg">{portfolio.title}</CardTitle>
                <p className="text-sm text-gray-600">{portfolio.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {portfolio.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                      {feature}
                    </div>
                  ))}
                </div>
                <Button 
                  className="w-full mt-4" 
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(portfolio.route);
                  }}
                >
                  Try Now
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioShowcase;
