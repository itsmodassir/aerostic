-- Fix search path security issue for generate_verification_token function
CREATE OR REPLACE FUNCTION public.generate_verification_token()
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  RETURN 'verify-' || encode(gen_random_bytes(16), 'hex');
END;
$$;