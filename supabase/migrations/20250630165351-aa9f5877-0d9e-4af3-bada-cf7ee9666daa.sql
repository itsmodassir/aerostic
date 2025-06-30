
-- Create a table for website requests
CREATE TABLE public.website_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  email TEXT NOT NULL,
  details TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.website_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for website_requests
CREATE POLICY "Users can view their own website requests" ON public.website_requests
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create website requests" ON public.website_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own website requests" ON public.website_requests
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);
