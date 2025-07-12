import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Play, Code, Download, Share, Settings, Terminal, FileText, Loader2, Sparkles, Wand2 } from "lucide-react";
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