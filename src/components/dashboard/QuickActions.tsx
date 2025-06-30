
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
      icon: <Plus className="h-5 w-5" />,
      action: () => navigate('/blog-editor'),
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "AI Chat",
      description: "Get instant AI assistance",
      icon: <MessageSquare className="h-5 w-5" />,
      action: () => navigate('/chat'),
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      title: "Generate Images",
      description: "Create stunning visuals",
      icon: <Palette className="h-5 w-5" />,
      action: () => navigate('/image-generator'),
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      title: "Build Website",
      description: "Launch your online presence",
      icon: <Code className="h-5 w-5" />,
      action: () => navigate('/blog-builder'),
      color: "bg-orange-500 hover:bg-orange-600"
    }
  ];

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-2 border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action, index) => (
            <Button
              key={index}
              onClick={action.action}
              className={`${action.color} text-white p-6 h-auto flex flex-col items-center gap-2 hover:scale-105 transition-transform`}
            >
              {action.icon}
              <div className="text-center">
                <div className="font-semibold">{action.title}</div>
                <div className="text-xs opacity-90">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
