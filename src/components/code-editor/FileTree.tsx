import { useState } from "react";
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  language?: string;
}

interface FileTreeProps {
  files: FileNode[];
  selectedFile: string | null;
  onFileSelect: (path: string) => void;
  onFileCreate: (path: string, type: 'file' | 'folder') => void;
  onFileDelete: (path: string) => void;
}

export const FileTree = ({ files, selectedFile, onFileSelect, onFileCreate, onFileDelete }: FileTreeProps) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/']));
  const [creatingIn, setCreatingIn] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [newItemType, setNewItemType] = useState<'file' | 'folder'>('file');

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const handleCreate = () => {
    if (!newItemName.trim() || !creatingIn) return;
    
    const newPath = creatingIn === '/' ? `/${newItemName}` : `${creatingIn}/${newItemName}`;
    onFileCreate(newPath, newItemType);
    setCreatingIn(null);
    setNewItemName("");
  };

  const renderNode = (node: FileNode, depth: number = 0): JSX.Element => {
    const isExpanded = expandedFolders.has(node.path);
    const isSelected = selectedFile === node.path;

    return (
      <div key={node.path}>
        <div
          className={`flex items-center gap-2 py-1.5 px-2 hover:bg-muted cursor-pointer rounded ${
            isSelected ? 'bg-accent text-accent-foreground' : ''
          }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {node.type === 'folder' ? (
            <>
              <button onClick={() => toggleFolder(node.path)} className="p-0 hover:bg-transparent">
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              {isExpanded ? <FolderOpen className="h-4 w-4 text-primary" /> : <Folder className="h-4 w-4 text-primary" />}
              <span onClick={() => toggleFolder(node.path)} className="flex-1 text-sm">{node.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  setCreatingIn(node.path);
                  setNewItemType('file');
                }}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </>
          ) : (
            <>
              <div className="w-4" />
              <File className="h-4 w-4 text-muted-foreground" />
              <span onClick={() => onFileSelect(node.path)} className="flex-1 text-sm">{node.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onFileDelete(node.path);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
        
        {node.type === 'folder' && isExpanded && node.children && (
          <div>
            {node.children.map(child => renderNode(child, depth + 1))}
            {creatingIn === node.path && (
              <div className="flex items-center gap-2 py-1 px-2" style={{ paddingLeft: `${(depth + 1) * 12 + 8}px` }}>
                <Input
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder={`New ${newItemType} name`}
                  className="h-7 text-sm"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreate();
                    if (e.key === 'Escape') setCreatingIn(null);
                  }}
                  onBlur={handleCreate}
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-card border-r border-border">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <span className="text-sm font-semibold">Files</span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => {
              setCreatingIn('/');
              setNewItemType('file');
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {files.map(node => renderNode(node, 0))}
        {creatingIn === '/' && (
          <div className="flex items-center gap-2 py-1 px-2">
            <Input
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder={`New ${newItemType} name`}
              className="h-7 text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
                if (e.key === 'Escape') setCreatingIn(null);
              }}
              onBlur={handleCreate}
            />
          </div>
        )}
      </div>
    </div>
  );
};
