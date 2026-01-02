import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Wand2, 
  Image, 
  Code, 
  FileText, 
  Globe, 
  Sparkles,
  X
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

const ToolsMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  const tools = [
    { 
      name: "Image Generator", 
      icon: Image, 
      path: "/image-generator", 
      protected: true,
      description: "Create AI images",
      color: "from-pink-500 to-rose-500"
    },
    { 
      name: "Code Editor", 
      icon: Code, 
      path: "/code-editor", 
      protected: false,
      description: "Build with AI",
      color: "from-blue-500 to-cyan-500"
    },
    { 
      name: "Auto-Code", 
      icon: Sparkles, 
      path: "/create-app", 
      protected: false,
      description: "Generate projects",
      color: "from-purple-500 to-violet-500"
    },
    { 
      name: "Blog Editor", 
      icon: FileText, 
      path: "/blog-editor", 
      protected: true,
      description: "Write AI content",
      color: "from-green-500 to-emerald-500"
    },
    { 
      name: "Website Builder", 
      icon: Globe, 
      path: "/blog-builder", 
      protected: true,
      description: "Create websites",
      color: "from-orange-500 to-amber-500"
    },
  ];

  return (
    <div className="fixed bottom-24 right-4 z-50">
      {/* Tools Panel */}
      <div 
        className={`absolute bottom-14 right-0 transition-all duration-300 ${
          isOpen 
            ? 'opacity-100 translate-y-0 pointer-events-auto' 
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-xl p-3 min-w-[200px]">
          <div className="space-y-1">
            {tools.map((tool) => {
              const isDisabled = tool.protected && !user;
              
              return (
                <Link
                  key={tool.path}
                  to={isDisabled ? "/auth" : tool.path}
                  onClick={() => setIsOpen(false)}
                >
                  <div 
                    className={`flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 group ${
                      isDisabled 
                        ? 'opacity-50 hover:opacity-70' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center shadow-sm`}>
                      <tool.icon className="h-4.5 w-4.5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {tool.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {isDisabled ? "Sign in required" : tool.description}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-12 w-12 rounded-full shadow-lg transition-all duration-300 ${
          isOpen 
            ? 'bg-muted hover:bg-muted/80 rotate-45' 
            : 'bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70'
        }`}
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Wand2 className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
};

export default ToolsMenu;
