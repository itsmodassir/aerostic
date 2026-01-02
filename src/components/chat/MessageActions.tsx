import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Copy, 
  RefreshCw, 
  ThumbsUp, 
  ThumbsDown, 
  Check,
  MoreHorizontal,
  Share2
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MessageActionsProps {
  content: string;
  messageId: string;
  onRegenerate?: () => void;
  showRegenerate?: boolean;
}

const MessageActions = ({ 
  content, 
  messageId, 
  onRegenerate, 
  showRegenerate = true 
}: MessageActionsProps) => {
  const [copied, setCopied] = useState(false);
  const [reaction, setReaction] = useState<'up' | 'down' | null>(null);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy text");
    }
  };

  const handleReaction = (type: 'up' | 'down') => {
    if (reaction === type) {
      setReaction(null);
      return;
    }
    setReaction(type);
    toast.success(type === 'up' ? "Thanks for the feedback!" : "We'll improve our responses");
  };

  const shareResponse = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI Response',
          text: content.slice(0, 200) + '...',
        });
      } catch (err) {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-2">
      {/* Copy button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={copyToClipboard}
        className="h-7 w-7 p-0 rounded-full hover:bg-muted"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-green-500" />
        ) : (
          <Copy className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </Button>

      {/* Regenerate button */}
      {showRegenerate && onRegenerate && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRegenerate}
          className="h-7 w-7 p-0 rounded-full hover:bg-muted"
          title="Regenerate response"
        >
          <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      )}

      {/* Thumbs up */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleReaction('up')}
        className={`h-7 w-7 p-0 rounded-full hover:bg-muted ${
          reaction === 'up' ? 'text-green-500' : 'text-muted-foreground'
        }`}
      >
        <ThumbsUp className={`h-3.5 w-3.5 ${reaction === 'up' ? 'fill-current' : ''}`} />
      </Button>

      {/* Thumbs down */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleReaction('down')}
        className={`h-7 w-7 p-0 rounded-full hover:bg-muted ${
          reaction === 'down' ? 'text-red-500' : 'text-muted-foreground'
        }`}
      >
        <ThumbsDown className={`h-3.5 w-3.5 ${reaction === 'down' ? 'fill-current' : ''}`} />
      </Button>

      {/* More options */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 rounded-full hover:bg-muted"
          >
            <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-40">
          <DropdownMenuItem onClick={shareResponse}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default MessageActions;
