import { useState } from "react";
import { Plus, FolderPlus, Edit2, Trash2, Folder, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useChatFolders } from "@/hooks/useChatFolders";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FolderManagerProps {
  onSelectFolder: (folderId: string | null) => void;
  selectedFolderId: string | null;
}

const FOLDER_COLORS = [
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Purple', value: '#A855F7' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Orange', value: '#F59E0B' },
];

export const FolderManager = ({ onSelectFolder, selectedFolderId }: FolderManagerProps) => {
  const { folders, loading, createFolder, deleteFolder } = useChatFolders();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedColor, setSelectedColor] = useState(FOLDER_COLORS[0].value);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    await createFolder(newFolderName, selectedColor);
    setNewFolderName("");
    setSelectedColor(FOLDER_COLORS[0].value);
    setIsCreateOpen(false);
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (confirm("Delete this folder? Conversations will be moved to 'All Chats'.")) {
      await deleteFolder(folderId);
      if (selectedFolderId === folderId) {
        onSelectFolder(null);
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-2 mb-3">
        <h3 className="text-sm font-semibold text-muted-foreground">Folders</h3>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Folder Name</label>
                <Input
                  placeholder="e.g., Work, Personal, Projects"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Color</label>
                <div className="grid grid-cols-6 gap-2">
                  {FOLDER_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setSelectedColor(color.value)}
                      className={`w-10 h-10 rounded-lg transition-all ${
                        selectedColor === color.value ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
              <Button onClick={handleCreateFolder} className="w-full">
                <FolderPlus className="h-4 w-4 mr-2" />
                Create Folder
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* All Chats */}
      <Button
        variant="ghost"
        className={`w-full justify-start ${!selectedFolderId ? 'bg-muted' : ''}`}
        onClick={() => onSelectFolder(null)}
      >
        <FolderOpen className="h-4 w-4 mr-2" />
        All Chats
      </Button>

      {/* Folder List */}
      <ScrollArea className="h-[200px]">
        {loading ? (
          <div className="text-sm text-muted-foreground px-2">Loading folders...</div>
        ) : folders.length === 0 ? (
          <div className="text-sm text-muted-foreground px-2 py-4 text-center">
            No folders yet
          </div>
        ) : (
          folders.map((folder) => (
            <div
              key={folder.id}
              className={`group flex items-center justify-between px-2 py-2 rounded-lg hover:bg-muted transition-colors ${
                selectedFolderId === folder.id ? 'bg-muted' : ''
              }`}
            >
              <button
                onClick={() => onSelectFolder(folder.id)}
                className="flex items-center flex-1 min-w-0"
              >
                <Folder
                  className="h-4 w-4 mr-2 flex-shrink-0"
                  style={{ color: folder.color }}
                />
                <span className="text-sm truncate">{folder.name}</span>
              </button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteFolder(folder.id);
                }}
              >
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            </div>
          ))
        )}
      </ScrollArea>
    </div>
  );
};
