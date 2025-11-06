-- Create folders table for organizing conversations
CREATE TABLE IF NOT EXISTS public.chat_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366F1',
  icon TEXT DEFAULT 'folder',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add folder_id to conversations table
ALTER TABLE public.chat_conversations 
ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES public.chat_folders(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.chat_folders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for folders
CREATE POLICY "Users can view their own folders"
ON public.chat_folders FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own folders"
ON public.chat_folders FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own folders"
ON public.chat_folders FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own folders"
ON public.chat_folders FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for timestamps
CREATE TRIGGER update_chat_folders_updated_at
BEFORE UPDATE ON public.chat_folders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create default folder for existing users
INSERT INTO public.chat_folders (user_id, name, color, icon)
SELECT DISTINCT user_id, 'General', '#6366F1', 'folder'
FROM public.chat_conversations
WHERE user_id IS NOT NULL
ON CONFLICT DO NOTHING;