-- Add domain status and verification fields to websites table
ALTER TABLE public.websites 
ADD COLUMN domain_status TEXT DEFAULT 'pending',
ADD COLUMN domain_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN ssl_enabled BOOLEAN DEFAULT false,
ADD COLUMN dns_configured BOOLEAN DEFAULT false,
ADD COLUMN verification_token TEXT;

-- Create domain verification table for tracking verification steps
CREATE TABLE public.domain_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  website_id UUID NOT NULL REFERENCES public.websites(id) ON DELETE CASCADE,
  domain_name TEXT NOT NULL,
  verification_type TEXT NOT NULL, -- 'dns_txt', 'dns_a', 'ssl'
  verification_token TEXT NOT NULL,
  verification_value TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'verified', 'failed'
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on domain_verifications
ALTER TABLE public.domain_verifications ENABLE ROW LEVEL SECURITY;

-- Create policies for domain_verifications
CREATE POLICY "Users can view their own domain verifications" 
ON public.domain_verifications 
FOR SELECT 
USING (website_id IN (
  SELECT websites.id 
  FROM websites 
  WHERE websites.user_id = (select auth.uid())
));

CREATE POLICY "Users can create domain verifications for their websites" 
ON public.domain_verifications 
FOR INSERT 
WITH CHECK (website_id IN (
  SELECT websites.id 
  FROM websites 
  WHERE websites.user_id = (select auth.uid())
));

CREATE POLICY "Users can update their own domain verifications" 
ON public.domain_verifications 
FOR UPDATE 
USING (website_id IN (
  SELECT websites.id 
  FROM websites 
  WHERE websites.user_id = (select auth.uid())
));

-- Create function to generate verification tokens
CREATE OR REPLACE FUNCTION public.generate_verification_token()
RETURNS TEXT AS $$
BEGIN
  RETURN 'verify-' || encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate verification tokens
CREATE OR REPLACE FUNCTION public.handle_domain_verification_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.verification_token IS NULL THEN
    NEW.verification_token = public.generate_verification_token();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_generate_verification_token
  BEFORE INSERT ON public.domain_verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_domain_verification_insert();