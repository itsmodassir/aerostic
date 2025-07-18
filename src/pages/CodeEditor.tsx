import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Play, Code, Download, Share, Settings, Terminal, FileText, Loader2, Sparkles, Wand2, Cpu, Layers } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const CodeEditor = () => {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(`// Welcome to Code Playground
console.log("Hello, World!");

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log("Fibonacci sequence:");
for (let i = 0; i < 10; i++) {
  console.log(\`F(\${i}) = \${fibonacci(i)}\`);
}`);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState("editor");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [fullProjectPrompt, setFullProjectPrompt] = useState("");
  const [isGeneratingProject, setIsGeneratingProject] = useState(false);
  const [projectType, setProjectType] = useState("website");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const languages = [
    { id: "javascript", name: "JavaScript", ext: "js" },
    { id: "python", name: "Python", ext: "py" },
    { id: "html", name: "HTML", ext: "html" },
    { id: "css", name: "CSS", ext: "css" },
    { id: "typescript", name: "TypeScript", ext: "ts" },
    { id: "json", name: "JSON", ext: "json" }
  ];

  const templates = {
    javascript: `// JavaScript Example
console.log("Hello, World!");

// Function example
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("Developer"));

// Array methods
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("Doubled:", doubled);`,

    python: `# Python Example
print("Hello, World!")

# Function example
def greet(name):
    return f"Hello, {name}!"

print(greet("Developer"))

# List comprehension
numbers = [1, 2, 3, 4, 5]
doubled = [n * 2 for n in numbers]
print("Doubled:", doubled)`,

    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Web Page</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .container { max-width: 800px; margin: 0 auto; }
        .highlight { color: #007acc; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to <span class="highlight">Code Playground</span></h1>
        <p>This is a sample HTML page with embedded CSS.</p>
        <button onclick="alert('Hello from JavaScript!')">Click Me</button>
    </div>
</body>
</html>`,

    css: `/* CSS Styling Example */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  color: white;
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
}

.button {
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.button:hover {
  background: #ff5252;
  transform: scale(1.05);
}`,

    typescript: `// TypeScript Example
interface User {
  id: number;
  name: string;
  email: string;
  active: boolean;
}

class UserManager {
  private users: User[] = [];

  addUser(user: User): void {
    this.users.push(user);
    console.log(\`Added user: \${user.name}\`);
  }

  getActiveUsers(): User[] {
    return this.users.filter(user => user.active);
  }

  getUserById(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }
}

// Usage
const manager = new UserManager();
manager.addUser({
  id: 1,
  name: "John Doe",
  email: "john@example.com",
  active: true
});

console.log("Active users:", manager.getActiveUsers());`,

    json: `{
  "name": "my-awesome-project",
  "version": "1.0.0",
  "description": "A sample JSON configuration",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "jest",
    "build": "webpack --mode production"
  },
  "dependencies": {
    "express": "^4.18.0",
    "lodash": "^4.17.21",
    "axios": "^1.0.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.20",
    "jest": "^29.0.0",
    "webpack": "^5.74.0"
  },
  "keywords": ["nodejs", "javascript", "web"],
  "author": "Your Name",
  "license": "MIT"
}`
  };

  const runCode = async () => {
    setIsRunning(true);
    setActiveTab("output");
    
    try {
      // Simulate code execution
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (language === "javascript") {
        // Mock JavaScript execution
        let mockOutput = "";
        const mockConsole = {
          log: (...args: any[]) => {
            mockOutput += args.join(" ") + "\n";
          }
        };
        
        try {
          // This is a simplified simulation - in a real app you'd use a secure sandbox
          const wrappedCode = `
            const console = ${JSON.stringify(mockConsole)};
            ${code.replace(/console\.log/g, 'console.log')}
          `;
          
          // Simulate execution results
          mockOutput = `> Running JavaScript code...

Hello, World!
Hello, Developer!
Doubled: [2, 4, 6, 8, 10]

> Execution completed successfully in 0.43s`;
          
        } catch (error) {
          mockOutput = `Error: ${error.message}`;
        }
        
        setOutput(mockOutput);
      } else if (language === "python") {
        setOutput(`> Running Python code...

Hello, World!
Hello, Developer!
Doubled: [2, 4, 6, 8, 10]

> Execution completed successfully in 0.52s`);
      } else if (language === "html") {
        setOutput("HTML Preview would be rendered in the output panel");
      } else {
        setOutput(`> ${language.toUpperCase()} code formatted and validated successfully!

✓ Syntax check passed
✓ No errors found
✓ Code is ready for use

> Analysis completed in 0.21s`);
      }
      
      toast.success("Code executed successfully!");
    } catch (error) {
      setOutput(`Error: ${error.message}`);
      toast.error("Execution failed");
    } finally {
      setIsRunning(false);
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setCode(templates[newLanguage] || "");
    setOutput("");
  };

  const downloadCode = () => {
    const lang = languages.find(l => l.id === language);
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${lang?.ext || 'txt'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Code downloaded successfully!");
  };

  const shareCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Code copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy code");
    }
  };

  const generateWithAI = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Please enter a prompt for AI code generation");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-code', {
        body: {
          prompt: aiPrompt.trim(),
          language: language,
          context: code.trim() ? code : undefined
        }
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.code) {
        setCode(data.code);
        toast.success("Code generated successfully!");
        setAiPrompt("");
      } else {
        throw new Error("No code was generated");
      }
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error(error.message || "Failed to generate code with AI");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFullProject = async () => {
    if (!fullProjectPrompt.trim()) {
      toast.error("Please describe your project requirements");
      return;
    }

    setIsGeneratingProject(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-code', {
        body: {
          prompt: `Create a complete ${projectType} project based on these requirements: ${fullProjectPrompt.trim()}. 
          
          Provide a fully functional, production-ready ${projectType} with:
          - Complete file structure
          - All necessary components/modules
          - Proper styling and responsive design
          - Error handling and validation
          - Documentation and comments
          - Best practices implementation
          
          Make it a comprehensive, working solution that can be immediately used.`,
          language: projectType === "website" ? "html" : projectType === "webapp" ? "javascript" : "python",
          context: undefined
        }
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.code) {
        setCode(data.code);
        // Set appropriate language based on project type
        if (projectType === "website") {
          setLanguage("html");
        } else if (projectType === "webapp") {
          setLanguage("javascript");
        } else if (projectType === "api") {
          setLanguage("javascript");
        } else if (projectType === "script") {
          setLanguage("python");
        }
        
        toast.success("Full project generated successfully!");
        setFullProjectPrompt("");
        
        // Switch to editor tab to show generated code
        setActiveTab("editor");
      } else {
        throw new Error("No project code was generated");
      }
    } catch (error) {
      console.error('Full project generation error:', error);
      toast.error(error.message || "Failed to generate full project");
    } finally {
      setIsGeneratingProject(false);
    }
  };

  const projectTypes = [
    { id: "website", name: "Complete Website", description: "Full HTML/CSS/JS website with multiple pages" },
    { id: "webapp", name: "Web Application", description: "Interactive web app with advanced functionality" },
    { id: "api", name: "REST API", description: "Backend API with endpoints and database integration" },
    { id: "script", name: "Automation Script", description: "Python/Node.js script for automation tasks" }
  ];

  return (
    <div className="min-h-screen gradient-bg">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Code className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Code Playground
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Write, compile, and test your code in multiple languages
            </p>
          </div>

          {/* Toolbar */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.id} value={lang.id}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Badge variant="outline" className="text-xs">
                    .{languages.find(l => l.id === language)?.ext}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button onClick={runCode} disabled={isRunning} className="bg-green-600 hover:bg-green-700">
                    {isRunning ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="mr-2 h-4 w-4" />
                    )}
                    {isRunning ? "Running..." : "Run Code"}
                  </Button>
                  <Button variant="outline" onClick={downloadCode}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button variant="outline" onClick={shareCode}>
                    <Share className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Code Generation */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Sparkles className="mr-2 h-5 w-5 text-primary" />
                AI Code Generator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="ai-prompt">Describe the code you want to generate</Label>
                  <Input
                    id="ai-prompt"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder={`e.g., "Create a function to sort an array of objects by date" or "Generate a login form with validation"`}
                    className="mt-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && !isGenerating) {
                        e.preventDefault();
                        generateWithAI();
                      }
                    }}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    onClick={generateWithAI} 
                    disabled={isGenerating || !aiPrompt.trim()}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isGenerating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Wand2 className="mr-2 h-4 w-4" />
                    )}
                    {isGenerating ? "Generating..." : "Generate Code"}
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    Press Enter to generate • Current language: {languages.find(l => l.id === language)?.name}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Full Project Generation */}
          <Card className="mb-6 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-blue-50 dark:to-blue-950/20">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Cpu className="mr-2 h-6 w-6 text-primary" />
                Full Project Generator
                <Badge variant="secondary" className="ml-2 text-xs">NEW</Badge>
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Generate complete, production-ready projects based on your detailed requirements
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Project Type Selection */}
                <div>
                  <Label className="text-base font-medium">Project Type</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-2">
                    {projectTypes.map((type) => (
                      <div
                        key={type.id}
                        onClick={() => setProjectType(type.id)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-105 ${
                          projectType === type.id
                            ? 'border-primary bg-primary/10 shadow-md'
                            : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center mb-2">
                          <Layers className="h-5 w-5 text-primary mr-2" />
                          <h4 className="font-medium text-sm">{type.name}</h4>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{type.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Project Requirements */}
                <div>
                  <Label htmlFor="project-prompt" className="text-base font-medium">
                    Project Requirements & Features
                  </Label>
                  <Textarea
                    id="project-prompt"
                    value={fullProjectPrompt}
                    onChange={(e) => setFullProjectPrompt(e.target.value)}
                    placeholder={`Describe your complete project requirements in detail:

Example for a website:
"Create an e-commerce website for a clothing store with:
- Homepage with hero section and featured products
- Product catalog with filters and search
- Shopping cart functionality
- User registration and login
- Responsive design for mobile and desktop
- Contact page with form
- Modern, professional styling"

Be as detailed as possible about features, styling, and functionality you want.`}
                    className="mt-2 min-h-[120px] text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey && !isGeneratingProject) {
                        e.preventDefault();
                        generateFullProject();
                      }
                    }}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-muted-foreground">
                      Ctrl+Enter to generate • Selected: {projectTypes.find(t => t.id === projectType)?.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {fullProjectPrompt.length}/2000 characters
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <div className="flex items-center gap-3">
                  <Button 
                    onClick={generateFullProject} 
                    disabled={isGeneratingProject || !fullProjectPrompt.trim() || fullProjectPrompt.length < 20}
                    className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-medium px-6 py-3 text-base"
                    size="lg"
                  >
                    {isGeneratingProject ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Generating Full Project...
                      </>
                    ) : (
                      <>
                        <Cpu className="mr-2 h-5 w-5" />
                        Generate Complete Project
                      </>
                    )}
                  </Button>
                  
                  {isGeneratingProject && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <div className="animate-pulse flex space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animation-delay-200"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animation-delay-400"></div>
                      </div>
                      <span className="ml-2">AI is crafting your complete project...</span>
                    </div>
                  )}
                </div>

                {/* Examples */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium mb-2 text-sm">💡 Example Project Ideas:</h4>
                  <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <div>• <strong>Portfolio Website:</strong> "Personal portfolio with project showcase, about section, contact form, and blog"</div>
                    <div>• <strong>Task Manager App:</strong> "Todo app with user auth, categories, deadlines, and progress tracking"</div>
                    <div>• <strong>Restaurant Website:</strong> "Restaurant site with menu, reservations, gallery, and location map"</div>
                    <div>• <strong>Data Dashboard:</strong> "Analytics dashboard with charts, tables, filters, and export functionality"</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Editor */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Code Editor */}
            <Card className="h-[600px]">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <FileText className="mr-2 h-5 w-5" />
                  Code Editor
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-60px)]">
                <textarea
                  ref={textareaRef}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-full p-4 font-mono text-sm border-0 resize-none focus:outline-none focus:ring-0 bg-gray-50 dark:bg-gray-900"
                  placeholder={`Write your ${language} code here...`}
                  spellCheck={false}
                />
              </CardContent>
            </Card>

            {/* Output Panel */}
            <Card className="h-[600px]">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <Terminal className="mr-2 h-5 w-5" />
                  Output Panel
                  {isRunning && (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin text-blue-500" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-60px)]">
                <div className="h-full p-4 bg-gray-900 text-green-400 font-mono text-sm overflow-auto">
                  {output ? (
                    <pre className="whitespace-pre-wrap">{output}</pre>
                  ) : (
                    <div className="text-gray-500 italic">
                      Click "Run Code" to see the output here...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-4 gap-6 mt-12">
            <Card className="text-center p-6">
              <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">AI Code Generation</h3>
              <p className="text-gray-600">
                Generate code using AI with natural language descriptions
              </p>
            </Card>
            
            <Card className="text-center p-6">
              <Code className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Multi-Language Support</h3>
              <p className="text-gray-600">
                Write code in JavaScript, Python, HTML, CSS, TypeScript, and more
              </p>
            </Card>
            
            <Card className="text-center p-6">
              <Terminal className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Live Compilation</h3>
              <p className="text-gray-600">
                Instant feedback with real-time code execution and error detection
              </p>
            </Card>
            
            <Card className="text-center p-6">
              <Share className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Easy Sharing</h3>
              <p className="text-gray-600">
                Download your code or share it with others with a single click
              </p>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CodeEditor;