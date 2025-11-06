import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { toast } from "sonner";

interface Folder {
  id: string;
  name: string;
  color: string;
  icon: string;
  created_at: string;
}

export const useChatFolders = () => {
  const { user } = useAuth();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFolders = async () => {
    if (!user) {
      setFolders([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('chat_folders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setFolders(data || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
      toast.error("Failed to load folders");
    } finally {
      setLoading(false);
    }
  };

  const createFolder = async (name: string, color: string = '#6366F1', icon: string = 'folder') => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('chat_folders')
        .insert([{ user_id: user.id, name, color, icon }])
        .select()
        .single();

      if (error) throw error;
      
      setFolders([...folders, data]);
      toast.success("Folder created!");
      return data;
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error("Failed to create folder");
      return null;
    }
  };

  const updateFolder = async (folderId: string, updates: Partial<Folder>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('chat_folders')
        .update(updates)
        .eq('id', folderId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setFolders(folders.map(f => f.id === folderId ? { ...f, ...updates } : f));
      toast.success("Folder updated!");
    } catch (error) {
      console.error('Error updating folder:', error);
      toast.error("Failed to update folder");
    }
  };

  const deleteFolder = async (folderId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('chat_folders')
        .delete()
        .eq('id', folderId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setFolders(folders.filter(f => f.id !== folderId));
      toast.success("Folder deleted!");
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast.error("Failed to delete folder");
    }
  };

  const moveConversationToFolder = async (conversationId: string, folderId: string | null) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('chat_conversations')
        .update({ folder_id: folderId })
        .eq('id', conversationId)
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success(folderId ? "Moved to folder!" : "Removed from folder!");
    } catch (error) {
      console.error('Error moving conversation:', error);
      toast.error("Failed to move conversation");
    }
  };

  useEffect(() => {
    fetchFolders();
  }, [user]);

  return {
    folders,
    loading,
    createFolder,
    updateFolder,
    deleteFolder,
    moveConversationToFolder,
    refetchFolders: fetchFolders
  };
};
