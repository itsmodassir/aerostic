import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, ChevronDown, ChevronUp, Download } from "lucide-react";
import { toast } from "sonner";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ExpandableCodeBlockProps {
  code: string;
  language: string;
}

const ExpandableCodeBlock = ({ code, language }: ExpandableCodeBlockProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const lines = code.split('\n');
  const shouldCollapse = lines.length > 15;
  const displayCode = shouldCollapse && !isExpanded 
    ? lines.slice(0, 10).join('\n') + '\n...'
    : code;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Code copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy code");
    }
  };

  const downloadCode = () => {
    const extension = getFileExtension(language);
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Code downloaded!");
  };

  const getFileExtension = (lang: string): string => {
    const extensions: Record<string, string> = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      html: 'html',
      css: 'css',
      json: 'json',
      bash: 'sh',
      sql: 'sql',
      jsx: 'jsx',
      tsx: 'tsx',
    };
    return extensions[lang] || 'txt';
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden bg-[#1e1e1e] dark:bg-[#0d0d0d] group/code">
      {/* Header */}
      <div className="px-3 py-2 bg-[#2d2d2d] dark:bg-[#1a1a1a] flex items-center justify-between">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          {language}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={downloadCode}
            className="h-7 px-2 text-gray-400 hover:text-white hover:bg-white/10 opacity-0 group-hover/code:opacity-100 transition-opacity"
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="h-7 px-2 text-gray-400 hover:text-white hover:bg-white/10"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* Code Content */}
      <div className="relative">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: 'transparent',
            fontSize: '13px',
            lineHeight: '1.6',
            maxHeight: isExpanded ? 'none' : '300px',
            overflow: 'hidden',
          } as any}
          showLineNumbers={lines.length > 5}
          wrapLines={true}
        >
          {displayCode}
        </SyntaxHighlighter>

        {/* Expand/Collapse Button */}
        {shouldCollapse && (
          <div className={`${
            !isExpanded 
              ? 'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#1e1e1e] dark:from-[#0d0d0d] to-transparent pt-8' 
              : ''
          }`}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full h-8 text-xs text-gray-400 hover:text-white hover:bg-white/10 rounded-none"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Collapse code
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Show all {lines.length} lines
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpandableCodeBlock;
