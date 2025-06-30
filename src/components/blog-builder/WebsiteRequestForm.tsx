
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

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
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Request Custom Website
          </CardTitle>
          <p className="text-gray-600">
            Tell us about your custom website needs and we'll get back to you with a personalized solution.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="requestEmail">Email Address *</Label>
            <Input
              id="requestEmail"
              type="email"
              placeholder="your@email.com"
              value={requestEmail}
              onChange={(e) => setRequestEmail(e.target.value)}
              className="mt-2"
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
            />
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium mb-2">What to include in your request:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Type of business or website purpose</li>
              <li>• Specific features you need</li>
              <li>• Design style preferences</li>
              <li>• Target audience</li>
              <li>• Timeline and budget considerations</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <Button onClick={onSubmit} className="flex-1">
              <Send className="mr-2 h-4 w-4" />
              Submit Request
            </Button>
            <Button 
              variant="outline" 
              onClick={onBack}
              className="flex-1"
            >
              Back to Builder
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WebsiteRequestForm;
