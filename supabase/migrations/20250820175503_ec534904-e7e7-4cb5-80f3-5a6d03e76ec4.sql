-- Fix security vulnerability in website_requests table
-- Remove access to anonymous requests (user_id IS NULL) from all policies
-- This prevents authenticated users from viewing email addresses of anonymous requests

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own website requests" ON public.website_requests;
DROP POLICY IF EXISTS "Users can create website requests" ON public.website_requests;
DROP POLICY IF EXISTS "Users can update their own website requests" ON public.website_requests;

-- Create secure policies that only allow access to own requests
CREATE POLICY "Users can view their own website requests" 
ON public.website_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own website requests" 
ON public.website_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own website requests" 
ON public.website_requests 
FOR UPDATE 
USING (auth.uid() = user_id);

-- For anonymous requests, create a separate policy that allows insertion only
-- Anonymous users can create requests but cannot read them back
CREATE POLICY "Allow anonymous request creation" 
ON public.website_requests 
FOR INSERT 
WITH CHECK (user_id IS NULL AND auth.uid() IS NULL);