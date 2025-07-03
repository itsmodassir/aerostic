-- Remove unused indexes that have never been accessed
DROP INDEX IF EXISTS public.idx_blog_posts_user_id;
DROP INDEX IF EXISTS public.idx_chat_conversations_user_id;
DROP INDEX IF EXISTS public.idx_website_requests_user_id;

-- Analyze table usage to ensure we're not missing anything critical
-- Check for any tables with no data that might be unnecessary
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_rows
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY live_rows DESC;