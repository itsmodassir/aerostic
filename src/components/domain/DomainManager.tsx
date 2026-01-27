import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { toast } from "sonner";
import { Globe, Shield, CheckCircle, AlertCircle, Clock, Copy } from "lucide-react";

interface DomainManagerProps {
  websiteId: string;
  currentDomain?: string;
  onDomainVerified?: (domain: string) => void;
}

interface DomainVerification {
  id: string;
  verification_type: string;
  verification_token: string;
  verification_value: string;
  status: string;
  verified_at: string | null;
}

export const DomainManager = ({ websiteId, currentDomain, onDomainVerified }: DomainManagerProps) => {
  const [domain, setDomain] = useState(currentDomain || "");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifications, setVerifications] = useState<DomainVerification[]>([]);
  const [domainStatus, setDomainStatus] = useState<string>("pending");
  const { user } = useAuth();

  useEffect(() => {
    if (websiteId) {
      fetchDomainStatus();
      fetchVerifications();
    }
  }, [websiteId]);

  const fetchDomainStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('websites')
        .select('domain_name, domain_status, ssl_enabled, dns_configured')
        .eq('id', websiteId)
        .single();

      if (error) throw error;
      
      if (data) {
        setDomain(data.domain_name || "");
        setDomainStatus(data.domain_status || "pending");
      }
    } catch (error) {
      console.error('Error fetching domain status:', error);
    }
  };

  const fetchVerifications = async () => {
    try {
      const { data, error } = await supabase
        .from('domain_verifications')
        .select('*')
        .eq('website_id', websiteId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVerifications(data || []);
    } catch (error) {
      console.error('Error fetching verifications:', error);
    }
  };

  const startVerification = async (verificationType: 'dns_txt' | 'dns_a' | 'ssl') => {
    if (!domain.trim()) {
      toast.error("Please enter a domain name");
      return;
    }

    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-domain', {
        body: {
          websiteId,
          domainName: domain,
          verificationType
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success(data.message);
        fetchDomainStatus();
        fetchVerifications();
        
        if (data.verified && onDomainVerified) {
          onDomainVerified(domain);
        }
      } else {
        toast.error(data.error || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Failed to start verification');
    } finally {
      setIsVerifying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Domain Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="domain">Domain Name</Label>
          <div className="flex gap-2">
            <Input
              id="domain"
              placeholder="example.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="flex-1"
            />
            {getStatusBadge(domainStatus)}
          </div>
        </div>

        <Tabs defaultValue="dns" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dns">DNS Setup</TabsTrigger>
            <TabsTrigger value="ssl">SSL Certificate</TabsTrigger>
            <TabsTrigger value="status">Verification Status</TabsTrigger>
          </TabsList>

          <TabsContent value="dns" className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Configure your domain's DNS settings to point to our servers.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Step 1: Add TXT Record for Verification</h4>
                <Button
                  onClick={() => startVerification('dns_txt')}
                  disabled={isVerifying || !domain}
                  className="w-full"
                >
                  {isVerifying ? "Verifying..." : "Start TXT Verification"}
                </Button>
              </div>

              <div>
                <h4 className="font-medium mb-2">Step 2: Configure A Record</h4>
                <div className="bg-gray-50 p-3 rounded-md space-y-2">
                  <p className="text-sm">Add these DNS records at your domain registrar:</p>
                  <div className="flex items-center justify-between p-2 bg-white rounded border">
                    <code className="text-xs">@ A 192.168.1.100</code>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard("@ A 192.168.1.100")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={() => startVerification('dns_a')}
                  disabled={isVerifying || !domain}
                  className="w-full mt-2"
                  variant="outline"
                >
                  Verify A Record
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ssl" className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                SSL certificates are automatically provisioned once DNS is configured correctly.
              </AlertDescription>
            </Alert>

            <Button
              onClick={() => startVerification('ssl')}
              disabled={isVerifying || !domain}
              className="w-full"
            >
              {isVerifying ? "Checking..." : "Check SSL Certificate"}
            </Button>
          </TabsContent>

          <TabsContent value="status" className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-medium">Verification History</h4>
              {verifications.length === 0 ? (
                <p className="text-sm text-gray-500">No verifications started yet.</p>
              ) : (
                verifications.map((verification) => (
                  <div key={verification.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium capitalize">
                        {verification.verification_type.replace('_', ' ')} Verification
                      </span>
                      {getStatusBadge(verification.status)}
                    </div>
                    {verification.verification_value && (
                      <div className="text-xs text-gray-600 mt-1">
                        <strong>Setup:</strong> {verification.verification_value}
                      </div>
                    )}
                    {verification.verification_token && verification.verification_type === 'dns_txt' && (
                      <div className="flex items-center justify-between mt-2 p-2 bg-gray-50 rounded">
                        <code className="text-xs">TXT: {verification.verification_token}</code>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => copyToClipboard(verification.verification_token)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};