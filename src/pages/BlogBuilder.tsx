
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { Globe, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import WebsitePortfolio from "@/components/blog-builder/WebsitePortfolio";
import ProgressSteps from "@/components/blog-builder/ProgressSteps";
import BasicInfoStep from "@/components/blog-builder/BasicInfoStep";
import DesignStep from "@/components/blog-builder/DesignStep";
import PreviewStep from "@/components/blog-builder/PreviewStep";
import WebsiteRequestForm from "@/components/blog-builder/WebsiteRequestForm";
import BenefitsSection from "@/components/blog-builder/BenefitsSection";

const BlogBuilder = () => {
  const [step, setStep] = useState(1);
  const [blogName, setBlogName] = useState("");
  const [blogTopic, setBlogTopic] = useState("");
  const [blogDescription, setBlogDescription] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("modern");
  const [domainName, setDomainName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestDetails, setRequestDetails] = useState("");
  const [requestEmail, setRequestEmail] = useState("");
  const [generatedContent, setGeneratedContent] = useState({
    title: "",
    tagline: "",
    aboutContent: "",
    firstPost: ""
  });
  const { user } = useAuth();

  const generateBlogContent = async () => {
    if (!blogName.trim() || !blogTopic.trim()) {
      toast.error("Please fill in blog name and topic");
      return;
    }

    if (!user) {
      toast.error("Please sign in to generate website content");
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log('Generating blog content for:', blogName, blogTopic);

      const { data, error } = await supabase.functions.invoke('generate-website-content', {
        body: {
          blogName,
          blogTopic,
          blogDescription,
          selectedTheme
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to generate website content');
      }

      if (data) {
        setGeneratedContent(data);
        setStep(3);
        toast.success("🎉 Blog content generated successfully!");
      } else {
        throw new Error("No content received from API");
      }
    } catch (error) {
      console.error("Error generating blog content:", error);
      toast.error(`Failed to generate blog content: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const buildWebsite = async () => {
    try {
      const { error } = await supabase
        .from('websites')
        .insert({
          user_id: user.id,
          name: blogName,
          topic: blogTopic,
          description: blogDescription,
          theme: selectedTheme,
          domain_name: domainName,
          generated_content: generatedContent
        });

      if (error) {
        console.error('Database error:', error);
        toast.error('Failed to save website');
      } else {
        toast.success("🚀 Website built successfully!");
      }
    } catch (error) {
      console.error('Error saving website:', error);
      toast.error('Failed to save website');
    }
  };

  const submitWebsiteRequest = async () => {
    if (!requestDetails.trim() || !requestEmail.trim()) {
      toast.error("Please fill in all request fields");
      return;
    }

    try {
      const { error } = await supabase
        .from('website_requests')
        .insert({
          user_id: user?.id || null,
          email: requestEmail,
          details: requestDetails,
          status: 'pending'
        });

      if (error) {
        console.error('Database error:', error);
        toast.error('Failed to submit request');
      } else {
        toast.success("🎉 Website request submitted successfully! We'll contact you soon.");
        setShowRequestForm(false);
        setRequestDetails("");
        setRequestEmail("");
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit request');
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!blogName.trim() || !blogTopic.trim()) {
        toast.error("Please fill in the required fields");
        return;
      }
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  if (showRequestForm) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen gradient-bg">
          <Navigation />
          
          <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
            <WebsiteRequestForm
              requestEmail={requestEmail}
              setRequestEmail={setRequestEmail}
              requestDetails={requestDetails}
              setRequestDetails={setRequestDetails}
              onSubmit={submitWebsiteRequest}
              onBack={() => setShowRequestForm(false)}
            />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen gradient-bg">
        <Navigation />
        
        <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                AI Website Builder
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                Create your complete website in 3 simple steps
              </p>
              <div className="flex justify-center gap-4">
                <Button 
                  onClick={() => setShowRequestForm(true)}
                  variant="outline"
                  className="bg-white"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Request Custom Website
                </Button>
              </div>
            </div>

            <WebsitePortfolio />
            <ProgressSteps currentStep={step} />

            {/* Step Content */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {step === 1 && "Step 1: Basic Information"}
                  {step === 2 && "Step 2: Choose Your Design"}
                  {step === 3 && "Step 3: Preview & Launch"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {step === 2 && (
                  <DesignStep
                    selectedTheme={selectedTheme}
                    setSelectedTheme={setSelectedTheme}
                    isGenerating={isGenerating}
                    onGenerateContent={generateBlogContent}
                  />
                )}

                {step === 3 && (
                  <PreviewStep
                    generatedContent={generatedContent}
                    blogName={blogName}
                    onBuildWebsite={buildWebsite}
                    onEditContent={() => setStep(2)}
                  />
                )}

                {/* Navigation Buttons */}
                {step < 3 && (
                  <div className="flex justify-between mt-8">
                    <Button 
                      variant="outline" 
                      onClick={prevStep}
                      disabled={step === 1}
                    >
                      Previous
                    </Button>
                    <Button onClick={nextStep}>
                      Next
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <BenefitsSection />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default BlogBuilder;
