-- Fix RLS performance issues by optimizing auth.uid() calls
-- Replace direct auth.uid() calls with (select auth.uid()) to prevent re-evaluation per row

-- Drop and recreate chat_conversations policies
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can create their own conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON public.chat_conversations;

CREATE POLICY "Users can view their own conversations" 
ON public.chat_conversations 
FOR SELECT 
USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create their own conversations" 
ON public.chat_conversations 
FOR INSERT 
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own conversations" 
ON public.chat_conversations 
FOR UPDATE 
USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own conversations" 
ON public.chat_conversations 
FOR DELETE 
USING ((select auth.uid()) = user_id);

-- Drop and recreate chat_messages policies
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can create messages in their conversations" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can update messages in their conversations" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can delete messages in their conversations" ON public.chat_messages;

CREATE POLICY "Users can view messages in their conversations" 
ON public.chat_messages 
FOR SELECT 
USING (conversation_id IN ( 
  SELECT chat_conversations.id
  FROM chat_conversations
  WHERE (chat_conversations.user_id = (select auth.uid()))
));

CREATE POLICY "Users can create messages in their conversations" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (conversation_id IN ( 
  SELECT chat_conversations.id
  FROM chat_conversations
  WHERE (chat_conversations.user_id = (select auth.uid()))
));

CREATE POLICY "Users can update messages in their conversations" 
ON public.chat_messages 
FOR UPDATE 
USING (conversation_id IN ( 
  SELECT chat_conversations.id
  FROM chat_conversations
  WHERE (chat_conversations.user_id = (select auth.uid()))
));

CREATE POLICY "Users can delete messages in their conversations" 
ON public.chat_messages 
FOR DELETE 
USING (conversation_id IN ( 
  SELECT chat_conversations.id
  FROM chat_conversations
  WHERE (chat_conversations.user_id = (select auth.uid()))
));

-- Drop and recreate website_requests policies
DROP POLICY IF EXISTS "Users can view their own website requests" ON public.website_requests;
DROP POLICY IF EXISTS "Users can create website requests" ON public.website_requests;
DROP POLICY IF EXISTS "Users can update their own website requests" ON public.website_requests;

CREATE POLICY "Users can view their own website requests" 
ON public.website_requests 
FOR SELECT 
USING (((select auth.uid()) = user_id) OR (user_id IS NULL));

CREATE POLICY "Users can create website requests" 
ON public.website_requests 
FOR INSERT 
WITH CHECK (((select auth.uid()) = user_id) OR (user_id IS NULL));

CREATE POLICY "Users can update their own website requests" 
ON public.website_requests 
FOR UPDATE 
USING (((select auth.uid()) = user_id) OR (user_id IS NULL));