-- Create indexes for all unindexed foreign keys to improve query performance

-- Index for blog_posts.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_blog_posts_user_id ON public.blog_posts(user_id);

-- Index for chat_conversations.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON public.chat_conversations(user_id);

-- Index for chat_messages.conversation_id foreign key
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);

-- Index for generated_images.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_generated_images_user_id ON public.generated_images(user_id);

-- Index for website_requests.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_website_requests_user_id ON public.website_requests(user_id);

-- Index for websites.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_websites_user_id ON public.websites(user_id);