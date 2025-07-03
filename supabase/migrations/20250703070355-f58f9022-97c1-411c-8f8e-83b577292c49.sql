-- Remove unused indexes that have never been accessed
DROP INDEX IF EXISTS public.idx_blog_posts_user_id;
DROP INDEX IF EXISTS public.idx_chat_conversations_user_id;
DROP INDEX IF EXISTS public.idx_website_requests_user_id;