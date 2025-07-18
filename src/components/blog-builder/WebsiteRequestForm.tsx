
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { toast } from "sonner";

interface WebsiteRequestFormProps {
  requestEmail: string;
  setRequestEmail: (value: string) => void;
  requestDetails: string;
  setRequestDetails: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}

const WebsiteRequestForm = ({
  requestEmail,
  setRequestEmail,
  requestDetails,
  setRequestDetails,
  onSubmit,
  onBack
}: WebsiteRequestFormProps) => {
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!requestEmail.trim() || !requestDetails.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const response = await fetch('https://formspree.io/f/xrbkjldd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: requestEmail,
          message: requestDetails,
        }),
      });

      if (response.ok) {
        toast.success("🎉 Website request submitted successfully! We'll contact you soon.");
        setRequestEmail("");
        setRequestDetails("");
        onSubmit();
      } else {
        throw new Error('Failed to submit form');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit request. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Request Custom Website
          </CardTitle>
          <p className="text-muted-foreground">
            Tell us about your custom website needs and we'll get back to you with a personalized solution.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div>
              <Label htmlFor="requestEmail">Email Address *</Label>
              <Input
                id="requestEmail"
                type="email"
                placeholder="your@email.com"
                value={requestEmail}
                onChange={(e) => setRequestEmail(e.target.value)}
                className="mt-2"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="requestDetails">Website Details *</Label>
              <Textarea
                id="requestDetails"
                placeholder="Describe your website needs: type of business, features required, design preferences, target audience, etc."
                value={requestDetails}
                onChange={(e) => setRequestDetails(e.target.value)}
                className="mt-2"
                rows={6}
                required
              />
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium mb-2">What to include in your request:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Type of business or website purpose</li>
                <li>• Specific features you need</li>
                <li>• Design style preferences</li>
                <li>• Target audience</li>
                <li>• Timeline and budget considerations</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="flex-1">
                <Send className="mr-2 h-4 w-4" />
                Submit Request
              </Button>
              <Button 
                type="button"
                variant="outline" 
                onClick={onBack}
                className="flex-1"
              >
                Back to Builder
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default WebsiteRequestForm;
