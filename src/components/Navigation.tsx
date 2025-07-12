
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Sparkles, User, LogOut, ChevronDown, MessageCircle, Home, FileText, Globe, Image, Zap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { toast } from "sonner";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem } from "@/components/ui/navigation-menu";
import { ThemeToggle } from "./ThemeToggle";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPagesOpen, setIsPagesOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  const mainPages = [
    { name: "Features", path: "/features" },
    { name: "Pricing", path: "/pricing" },
    { name: "Contact", path: "/contact" },
    { name: "FAQ", path: "/faq" },
    { name: "About", path: "/about" },
    { name: "Blog", path: "/blog" },
    { name: "Help Center", path: "/help" },
    { name: "Deploy", path: "/deploy" }
  ];

  const aiTools = [
    { name: "AI Chat", path: "/chat", icon: MessageCircle, description: "Chat with AI assistant" },
    { name: "Code Editor", path: "/code-editor", icon: FileText, description: "Write and compile code" },
    { name: "Blog Editor", path: "/blog-editor", icon: FileText, description: "AI-powered blog writing", protected: true },
    { name: "Website Builder", path: "/blog-builder", icon: Globe, description: "Build websites with AI", protected: true },
    { name: "Image Generator", path: "/image-generator", icon: Image, description: "Create AI images", protected: true }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/lovable-uploads/6b557ed3-c2c1-4bb1-9062-0253b3944514.png" alt="Aerostic AI" className="h-10 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavigationMenu>
              <NavigationMenuList>
                {/* Home Button */}
                <NavigationMenuItem>
                  <Link to="/landing" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 flex items-center transition-colors">
                    <Home className="h-4 w-4 mr-2" />
                    Home
                  </Link>
                </NavigationMenuItem>

                {/* Pages Dropdown */}
                <NavigationMenuItem>
                  <div className="relative">
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                      onClick={() => setIsPagesOpen(!isPagesOpen)}
                      aria-label={`${isPagesOpen ? 'Close' : 'Open'} pages menu`}
                      aria-expanded={isPagesOpen}
                      aria-haspopup="true"
                    >
                      <span>Pages</span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${isPagesOpen ? 'rotate-180' : ''}`} />
                    </Button>
                    {isPagesOpen && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                        {mainPages.map((page) => (
                          <Link
                            key={page.path}
                            to={page.path}
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            onClick={() => setIsPagesOpen(false)}
                          >
                            {page.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </NavigationMenuItem>

                {/* AI Tools Dropdown */}
                <NavigationMenuItem>
                  <div className="relative">
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                      onClick={() => setIsToolsOpen(!isToolsOpen)}
                      aria-label={`${isToolsOpen ? 'Close' : 'Open'} AI tools menu`}
                      aria-expanded={isToolsOpen}
                      aria-haspopup="true"
                    >
                      <Sparkles className="h-4 w-4 mr-1" />
                      <span>AI Tools</span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${isToolsOpen ? 'rotate-180' : ''}`} />
                    </Button>
                    {isToolsOpen && (
                      <div className="absolute top-full left-0 mt-1 w-72 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                        {aiTools.map((tool) => (
                          <Link
                            key={tool.path}
                            to={tool.path}
                            className="flex items-start px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            onClick={() => setIsToolsOpen(false)}
                          >
                            <tool.icon className="h-5 w-5 mr-3 mt-0.5 text-primary" />
                            <div>
                              <div className="font-medium">{tool.name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{tool.description}</div>
                              {tool.protected && !user && (
                                <div className="text-xs text-primary font-medium mt-1">Sign in required</div>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            
            <ThemeToggle />
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/dashboard">
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/auth">
                  <Button variant="outline">Sign In</Button>
                </Link>
                <Link to="/blog-editor">
                  <Button>Try Free</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={`${isOpen ? 'Close' : 'Open'} mobile navigation menu`}
              aria-expanded={isOpen}
              aria-controls="mobile-nav"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden" id="mobile-nav">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 transition-colors">
              {/* Home Button */}
              <Link
                to="/landing"
                className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>

              {/* Pages Section */}
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-between text-gray-700 dark:text-gray-300"
                  onClick={() => setIsPagesOpen(!isPagesOpen)}
                  aria-label={`${isPagesOpen ? 'Close' : 'Open'} pages section`}
                  aria-expanded={isPagesOpen}
                >
                  <span>Pages</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isPagesOpen ? 'rotate-180' : ''}`} />
                </Button>
                {isPagesOpen && (
                  <div className="pl-4 space-y-1">
                    {mainPages.map((page) => (
                      <Link
                        key={page.path}
                        to={page.path}
                        className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        {page.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Tools Section */}
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-between text-gray-700 dark:text-gray-300"
                  onClick={() => setIsToolsOpen(!isToolsOpen)}
                  aria-label={`${isToolsOpen ? 'Close' : 'Open'} AI tools section`}
                  aria-expanded={isToolsOpen}
                >
                  <div className="flex items-center">
                    <Sparkles className="h-4 w-4 mr-2" />
                    <span>AI Tools</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isToolsOpen ? 'rotate-180' : ''}`} />
                </Button>
                {isToolsOpen && (
                  <div className="pl-4 space-y-1">
                    {aiTools.map((tool) => (
                      <Link
                        key={tool.path}
                        to={tool.path}
                        className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <tool.icon className="h-4 w-4 mr-2" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{tool.name}</div>
                          {tool.protected && !user && (
                            <div className="text-xs text-primary">Sign in required</div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              
              {user ? (
                <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full">
                      <User className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" className="w-full" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <Link to="/auth" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full">Sign In</Button>
                  </Link>
                  <Link to="/chat" onClick={() => setIsOpen(false)}>
                    <Button className="w-full">Try AI Chat</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
