
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { Check, Star, Zap } from "lucide-react";

const Pricing = () => {
  const plans = [
    {
      name: "Free Trial",
      price: "$0",
      period: "7 days",
      description: "Perfect for trying out SetMyBlog AI",
      features: [
        "5 AI-generated blog posts",
        "Basic blog themes",
        "Standard writing tones",
        "Basic analytics",
        "Community support"
      ],
      limitations: [
        "SetMyBlog.ai subdomain only",
        "Limited customization"
      ],
      cta: "Start Free Trial",
      popular: false
    },
    {
      name: "Creator",
      price: "$19",
      period: "month",
      description: "Ideal for individual bloggers and content creators",
      features: [
        "Unlimited AI blog posts",
        "All premium themes",
        "Advanced writing tones",
        "SEO optimization tools",
        "Post scheduling",
        "Analytics dashboard",
        "Email support",
        "Custom branding"
      ],
      limitations: [],
      cta: "Get Started",
      popular: true
    },
    {
      name: "Professional",
      price: "$49",
      period: "month",
      description: "Perfect for businesses and professional bloggers",
      features: [
        "Everything in Creator",
        "Custom domain connection",
        "Advanced SEO tools",
        "Google Search Console integration",
        "Priority support",
        "Team collaboration (3 users)",
        "Advanced analytics",
        "White-label options"
      ],
      limitations: [],
      cta: "Go Professional",
      popular: false
    }
  ];

  const addOns = [
    {
      name: "Custom Domain",
      price: "$10/month",
      description: "Connect your own domain name (yoursite.com)"
    },
    {
      name: "SEO Booster",
      price: "$15/month", 
      description: "Advanced SEO analysis and optimization tools"
    },
    {
      name: "Content Scheduler Pro",
      price: "$8/month",
      description: "Advanced scheduling with social media integration"
    },
    {
      name: "Priority Support",
      price: "$20/month",
      description: "24/7 priority support with dedicated account manager"
    }
  ];

  return (
    <div className="min-h-screen gradient-bg">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the perfect plan for your blogging needs. All plans include AI-powered content generation and professional themes.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'ring-2 ring-primary shadow-lg scale-105' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-primary">{plan.price}</span>
                    <span className="text-gray-600">/{plan.period}</span>
                  </div>
                  <p className="text-gray-600 mt-2">{plan.description}</p>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                    {plan.limitations.map((limitation, limitIndex) => (
                      <li key={limitIndex} className="flex items-start text-gray-500">
                        <span className="text-sm">• {limitation}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add-ons Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">Add-ons & Extras</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {addOns.map((addon, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <CardTitle className="text-lg">{addon.name}</CardTitle>
                    <div className="text-2xl font-bold text-primary">{addon.price}</div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{addon.description}</p>
                    <Button variant="outline" size="sm" className="w-full">
                      Add to Plan
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white/70 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-2">Can I change plans anytime?</h3>
                <p className="text-gray-600 text-sm">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Is there a setup fee?</h3>
                <p className="text-gray-600 text-sm">No setup fees ever. You only pay the monthly or yearly subscription fee.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
                <p className="text-gray-600 text-sm">We accept all major credit cards, PayPal, and bank transfers for yearly plans.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
                <p className="text-gray-600 text-sm">Yes, we offer a 30-day money-back guarantee for all paid plans.</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your AI Blog?</h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of creators using SetMyBlog AI to build their online presence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8">
                <Zap className="mr-2 h-5 w-5" />
                Start Free Trial
              </Button>
              <Button variant="outline" size="lg" className="px-8">
                View All Features
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
