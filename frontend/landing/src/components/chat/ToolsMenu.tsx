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
  X,
  Zap
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
      gradient: "from-pink-500 to-rose-500"
    },
    { 
      name: "Code Editor", 
      icon: Code, 
      path: "/code-editor", 
      protected: false,
      description: "Build with AI",
      gradient: "from-blue-500 to-cyan-500"
    },
    { 
      name: "Auto-Code", 
      icon: Zap, 
      path: "/create-app", 
      protected: false,
      description: "Generate projects",
      gradient: "from-amber-500 to-orange-500"
    },
    { 
      name: "Blog Editor", 
      icon: FileText, 
      path: "/blog-editor", 
      protected: true,
      description: "Write AI content",
      gradient: "from-green-500 to-emerald-500"
    },
    { 
      name: "Website Builder", 
      icon: Globe, 
      path: "/blog-builder", 
      protected: true,
      description: "Create websites",
      gradient: "from-purple-500 to-violet-500"
    },
  ];

  return (
    <div className="fixed bottom-28 right-4 z-50">
      {/* Tools Panel */}
      <div 
        className={`absolute bottom-16 right-0 transition-all duration-300 ${
          isOpen 
            ? 'opacity-100 translate-y-0 pointer-events-auto' 
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="glass-bubble rounded-2xl p-2 min-w-[220px] shadow-2xl">
          <div className="p-2 border-b border-border/30 mb-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI Tools</p>
          </div>
          <div className="space-y-1">
            {tools.map((tool, index) => {
              const isDisabled = tool.protected && !user;
              
              return (
                <Link
                  key={tool.path}
                  to={isDisabled ? "/auth" : tool.path}
                  onClick={() => setIsOpen(false)}
                  className="block"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div 
                    className={`flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 group message-slide-in ${
                      isDisabled 
                        ? 'opacity-50 hover:opacity-70' 
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                      <tool.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
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

      {/* Toggle Button with pulse effect */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-14 w-14 rounded-2xl shadow-xl transition-all duration-300 ${
          isOpen 
            ? 'bg-muted hover:bg-muted/80 rotate-45' 
            : 'bg-gradient-to-br from-primary via-purple-500 to-cyan-500 hover:opacity-90 fab-pulse'
        }`}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Wand2 className="h-6 w-6 text-white" />
        )}
      </Button>
    </div>
  );
};

export default ToolsMenu;
