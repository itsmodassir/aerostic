
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Palette, Code, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: "New Blog Post",
      description: "Create engaging content with AI",
      icon: <Plus className="h-6 w-6" />,
      action: () => navigate('/blog-editor'),
      gradient: "from-blue-500 to-cyan-500",
      emoji: "📝"
    },
    {
      title: "AI Chat",
      description: "Get instant AI assistance",
      icon: <MessageSquare className="h-6 w-6" />,
      action: () => navigate('/chat'),
      gradient: "from-green-500 to-emerald-500",
      emoji: "🤖"
    },
    {
      title: "Generate Images",
      description: "Create stunning visuals",
      icon: <Palette className="h-6 w-6" />,
      action: () => navigate('/image-generator'),
      gradient: "from-purple-500 to-pink-500",
      emoji: "🎨"
    },
    {
      title: "Build Website",
      description: "Launch your online presence",
      icon: <Code className="h-6 w-6" />,
      action: () => navigate('/blog-builder'),
      gradient: "from-orange-500 to-red-500",
      emoji: "🚀"
    }
  ];

  return (
    <Card className="tech-card border-2 border-primary/20 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 animate-pulse"></div>
      
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="p-2 bg-gradient-to-r from-primary to-accent rounded-lg tech-glow">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            ⚡ Quick Actions
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {actions.map((action, index) => (
            <div
              key={index}
              onClick={action.action}
              className="group cursor-pointer transform hover:scale-110 transition-all duration-300"
            >
              <div className={`relative p-8 rounded-2xl bg-gradient-to-br ${action.gradient} text-white tech-glow hover:shadow-2xl transition-all duration-300 shimmer-effect`}>
                {/* Tech pattern overlay */}
                <div className="absolute inset-0 bg-black/10 rounded-2xl"></div>
                
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <div className="text-3xl">{action.emoji}</div>
                  <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                    {action.icon}
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg mb-1">{action.title}</div>
                    <div className="text-sm opacity-90">{action.description}</div>
                  </div>
                </div>
                
                {/* Hover effect */}
                <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
