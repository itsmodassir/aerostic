import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DomainVerificationRequest {
  websiteId: string;
  domainName: string;
  verificationType: 'dns_txt' | 'dns_a' | 'ssl';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { websiteId, domainName, verificationType }: DomainVerificationRequest = await req.json()

    console.log('Verifying domain:', domainName, 'for website:', websiteId);

    // Validate domain format
    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
    if (!domainRegex.test(domainName)) {
      throw new Error('Invalid domain format');
    }

    // Check if user owns the website
    const { data: website, error: websiteError } = await supabaseClient
      .from('websites')
      .select('id, user_id')
      .eq('id', websiteId)
      .single();

    if (websiteError || !website) {
      throw new Error('Website not found or access denied');
    }

    // Generate verification token
    const verificationToken = `verify-${crypto.randomUUID().replace(/-/g, '').substring(0, 32)}`;
    
    let verificationValue = '';
    let verificationResult = false;

    switch (verificationType) {
      case 'dns_txt':
        verificationValue = `${domainName} TXT ${verificationToken}`;
        verificationResult = await verifyDNSTXT(domainName, verificationToken);
        break;
      case 'dns_a':
        verificationValue = 'Point A record to our server IP';
        verificationResult = await verifyDNSA(domainName);
        break;
      case 'ssl':
        verificationResult = await verifySSL(domainName);
        break;
    }

    // Save verification record
    const { error: verificationError } = await supabaseClient
      .from('domain_verifications')
      .insert({
        website_id: websiteId,
        domain_name: domainName,
        verification_type: verificationType,
        verification_token: verificationToken,
        verification_value: verificationValue,
        status: verificationResult ? 'verified' : 'pending',
        verified_at: verificationResult ? new Date().toISOString() : null
      });

    if (verificationError) {
      console.error('Error saving verification:', verificationError);
      throw new Error('Failed to save verification record');
    }

    // Update website domain status if verification successful
    if (verificationResult) {
      const updateData: any = {
        domain_name: domainName,
        domain_status: 'verified',
        domain_verified_at: new Date().toISOString()
      };

      if (verificationType === 'dns_a') {
        updateData.dns_configured = true;
      } else if (verificationType === 'ssl') {
        updateData.ssl_enabled = true;
      }

      await supabaseClient
        .from('websites')
        .update(updateData)
        .eq('id', websiteId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        verified: verificationResult,
        verificationToken,
        verificationValue,
        message: verificationResult ? 
          'Domain verification successful!' : 
          'Domain verification initiated. Please complete the DNS setup.'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Domain verification error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to verify domain',
        success: false 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})

async function verifyDNSTXT(domain: string, token: string): Promise<boolean> {
  try {
    // Use Google DNS-over-HTTPS API for TXT record verification
    const response = await fetch(`https://dns.google/resolve?name=${domain}&type=TXT`);
    const data = await response.json();
    
    if (data.Answer) {
      for (const record of data.Answer) {
        if (record.data && record.data.includes(token)) {
          return true;
        }
      }
    }
    return false;
  } catch (error) {
    console.error('DNS TXT verification failed:', error);
    return false;
  }
}

async function verifyDNSA(domain: string): Promise<boolean> {
  try {
    // Use Google DNS-over-HTTPS API for A record verification
    const response = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
    const data = await response.json();
    
    // Check if domain resolves to any IP (basic verification)
    return data.Answer && data.Answer.length > 0;
  } catch (error) {
    console.error('DNS A verification failed:', error);
    return false;
  }
}

async function verifySSL(domain: string): Promise<boolean> {
  try {
    // Simple SSL check by attempting HTTPS connection
    const response = await fetch(`https://${domain}`, {
      method: 'HEAD',
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    return response.ok;
  } catch (error) {
    console.error('SSL verification failed:', error);
    return false;
  }
}