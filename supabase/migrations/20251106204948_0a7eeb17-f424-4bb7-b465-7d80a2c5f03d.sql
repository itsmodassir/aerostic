-- Add pinned column to conversations
ALTER TABLE public.chat_conversations 
ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMPTZ;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_chat_conversations_pinned 
ON public.chat_conversations(user_id, pinned DESC, pinned_at DESC NULLS LAST);