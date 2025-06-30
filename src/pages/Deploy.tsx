
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Rocket, 
  Globe, 
  Shield, 
  Zap, 
  CheckCircle, 
  ArrowRight,
  Cloud,
  Server,
  Monitor
} from "lucide-react";

const Deploy = () => {
  const deploymentOptions = [
    {
      title: "BlogCraft Cloud",
      description: "Deploy instantly with zero configuration. Perfect for getting started quickly.",
      icon: <Cloud className="h-8 w-8" />,
      features: ["One-click deployment", "Auto-scaling", "SSL certificates", "CDN included"],
      price: "Free tier available",
      recommended: true
    },
    {
      title: "Custom Domain",
      description: "Connect your own domain for a professional presence.",
      icon: <Globe className="h-8 w-8" />,
      features: ["Custom domain setup", "DNS management", "SSL certificates", "Email forwarding"],
      price: "Starting at $5/month",
      recommended: false
    },
    {
      title: "Enterprise",
      description: "Full control with dedicated infrastructure and support.",
      icon: <Server className="h-8 w-8" />,
      features: ["Dedicated servers", "24/7 support", "Custom integrations", "SLA guarantee"],
      price: "Contact sales",
      recommended: false
    }
  ];

  const deploymentSteps = [
    {
      step: "1",
      title: "Build Your App",
      description: "Complete your application development with all features you need."
    },
    {
      step: "2",
      title: "Connect Database",
      description: "Ensure your Supabase database is properly configured and secured."
    },
    {
      step: "3",
      title: "Configure Settings",
      description: "Set up environment variables, API keys, and deployment preferences."
    },
    {
      step: "4",
      title: "Deploy & Launch",
      description: "Click deploy and your app will be live in minutes with global CDN."
    }
  ];

  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      <Navigation />
      
      <div className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <Rocket className="h-16 w-16 text-primary mx-auto mb-6" />
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Deploy Your App
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Launch your BlogCraft AI application to the world with our powerful deployment platform. 
              Choose from multiple hosting options to fit your needs.
            </p>
          </div>

          {/* Deployment Options */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {deploymentOptions.map((option, index) => (
              <Card key={index} className={`relative ${option.recommended ? 'border-primary shadow-lg' : ''}`}>
                {option.recommended && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                    Recommended
                  </Badge>
                )}
                <CardHeader className="text-center pb-4">
                  <div className="text-primary mb-4">
                    {option.icon}
                  </div>
                  <CardTitle className="text-xl mb-2">{option.title}</CardTitle>
                  <p className="text-gray-600 text-sm">{option.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-6">
                    {option.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-primary mb-4">{option.price}</p>
                    <Button 
                      className="w-full" 
                      variant={option.recommended ? "default" : "outline"}
                    >
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Deployment Process */}
          <Card className="mb-16">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Deployment Process</CardTitle>
              <p className="text-center text-gray-600">Follow these simple steps to deploy your application</p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-8">
                {deploymentSteps.map((step, index) => (
                  <div key={index} className="text-center">
                    <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                      {step.step}
                    </div>
                    <h3 className="font-semibold mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <div className="text-center p-6 bg-white/50 rounded-lg">
              <Zap className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Lightning Fast</h3>
              <p className="text-sm text-gray-600">Global CDN ensures fast loading times worldwide</p>
            </div>
            <div className="text-center p-6 bg-white/50 rounded-lg">
              <Shield className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Secure by Default</h3>
              <p className="text-sm text-gray-600">SSL certificates and security headers included</p>
            </div>
            <div className="text-center p-6 bg-white/50 rounded-lg">
              <Monitor className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Real-time Monitoring</h3>
              <p className="text-sm text-gray-600">Track performance, uptime, and user analytics</p>
            </div>
            <div className="text-center p-6 bg-white/50 rounded-lg">
              <Globe className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Global Scale</h3>
              <p className="text-sm text-gray-600">Automatically scales to handle traffic spikes</p>
            </div>
          </div>

          {/* CTA */}
          <Card className="bg-gradient-to-r from-primary to-blue-600 text-white">
            <CardContent className="text-center py-12">
              <Rocket className="h-12 w-12 mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">Ready to Launch?</h2>
              <p className="text-xl mb-8 opacity-90">
                Deploy your application in just a few clicks and start reaching users worldwide.
              </p>
              <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100">
                Start Deployment
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Deploy;
