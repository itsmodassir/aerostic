
-- Create generated_images table for storing AI-generated images
CREATE TABLE public.generated_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  prompt TEXT NOT NULL,
  style TEXT NOT NULL,
  size TEXT NOT NULL,
  quality TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for generated_images
CREATE POLICY "Users can view their own generated images" ON public.generated_images
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own generated images" ON public.generated_images
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generated images" ON public.generated_images
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generated images" ON public.generated_images
  FOR DELETE USING (auth.uid() = user_id);
