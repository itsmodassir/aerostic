-- Fix search path security issue for handle_domain_verification_insert function
CREATE OR REPLACE FUNCTION public.handle_domain_verification_insert()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  IF NEW.verification_token IS NULL THEN
    NEW.verification_token = public.generate_verification_token();
  END IF;
  RETURN NEW;
END;
$$;