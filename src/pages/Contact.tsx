
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/Navigation";
import { MessageCircle, Mail, Send, Bot, User } from "lucide-react";
import { toast } from "sonner";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  
  const [chatMessages, setChatMessages] = useState([
    {
      role: "bot",
      message: "Hi! I'm your Aerostic AI assistant. I'm available 24/7 to help you with features, pricing, technical questions, and more!"
    }
  ]);
  
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Thank you! We'll get back to you within 24 hours.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = chatInput;
    setChatInput("");
    
    // Add user message
    setChatMessages(prev => [...prev, { role: "user", message: userMessage }]);
    setIsChatLoading(true);
    
    try {
      // Using a simulated AI response for now - you can replace this with your preferred AI API
      const responses = [
        "Aerostic AI offers three pricing plans: Free Trial (limited features), Creator ($19/month), and Professional ($49/month) with unlimited AI posts, themes, and analytics.",
        "Our AI blog writing uses advanced language models to generate high-quality content. You can customize tone, length, and topic to match your brand perfectly.",
        "Yes! Aerostic AI includes website building with multiple themes, custom domains, SEO optimization, and responsive design that works on all devices.",
        "We offer 24/7 support through this chat, email support, and comprehensive documentation. Our response time is typically within 2-4 hours.",
        "You can schedule posts, track analytics, manage multiple websites, and export your content anytime. All plans include unlimited revisions.",
        "Our AI supports 50+ languages and can generate content in various tones: professional, casual, friendly, technical, and more.",
        "Yes, we have a 30-day money-back guarantee and you can cancel anytime. No long-term contracts required.",
        "Aerostic AI integrates with popular platforms like WordPress, social media, and email marketing tools for seamless publishing."
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      // Select a relevant response or use a default
      let botResponse = responses[Math.floor(Math.random() * responses.length)];
      
      // Add some context-aware responses
      const lowercaseMessage = userMessage.toLowerCase();
      if (lowercaseMessage.includes('price') || lowercaseMessage.includes('cost') || lowercaseMessage.includes('plan')) {
        botResponse = "Aerostic AI offers three pricing plans: Free Trial (limited features), Creator ($19/month) with unlimited AI posts and basic themes, and Professional ($49/month) with advanced features, priority support, and custom domains. All plans include a 30-day money-back guarantee.";
      } else if (lowercaseMessage.includes('feature') || lowercaseMessage.includes('what can')) {
        botResponse = "Aerostic AI provides: AI-powered blog writing with customizable tone and length, website building with multiple themes, SEO optimization, content scheduling, analytics tracking, custom domains, and social media integration. You can manage multiple websites from one dashboard.";
      } else if (lowercaseMessage.includes('support') || lowercaseMessage.includes('help')) {
        botResponse = "We offer 24/7 support through this AI chat, email support (support@aerostic.ai), and comprehensive documentation. Our team typically responds within 2-4 hours during business hours and within 24 hours on weekends.";
      } else if (lowercaseMessage.includes('website') || lowercaseMessage.includes('build')) {
        botResponse = "Our AI website builder creates complete blog websites with professional themes, responsive design, SEO optimization, and fast loading speeds. You can customize colors, fonts, layouts, and add your own branding. All websites include analytics and social sharing.";
      }
      
      setChatMessages(prev => [...prev, { 
        role: "bot", 
        message: botResponse 
      }]);
      
    } catch (error) {
      console.error("Error in chat:", error);
      setChatMessages(prev => [...prev, { 
        role: "bot", 
        message: "Thank you for your question! I'm here to help with information about Aerostic AI. For specific technical issues, please contact our support team at support@aerostic.ai and we'll get back to you within 24 hours." 
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-600">
              Have questions? We're here to help you succeed with Aerostic AI
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Send us a Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                        className="mt-2"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Select 
                      value={formData.subject} 
                      onValueChange={(value) => setFormData({...formData, subject: value})}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Question</SelectItem>
                        <SelectItem value="technical">Technical Support</SelectItem>
                        <SelectItem value="billing">Billing & Pricing</SelectItem>
                        <SelectItem value="feature">Feature Request</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      placeholder="Tell us how we can help you..."
                      required
                      className="mt-2"
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </form>

                <div className="mt-8 pt-8 border-t">
                  <h3 className="font-semibold mb-4">Other Ways to Reach Us</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>📧 Email: support@aerostic.ai</div>
                    <div>💬 Live Chat: Available 24/7</div>
                    <div>📞 Phone: +1 (555) 123-4567</div>
                    <div>⏰ Response Time: Within 2-4 hours</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Chatbot */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  24/7 AI Assistant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 border rounded-lg p-4 overflow-y-auto mb-4 bg-gray-50">
                  {chatMessages.map((msg, index) => (
                    <div key={index} className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex items-start max-w-xs lg:max-w-md ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-primary text-white ml-2' : 'bg-gray-300 text-gray-700 mr-2'}`}>
                          {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                        </div>
                        <div className={`px-4 py-2 rounded-lg ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-white border'}`}>
                          <p className="text-sm">{msg.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="flex justify-start mb-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 text-gray-700 mr-2 flex items-center justify-center">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="px-4 py-2 rounded-lg bg-white border">
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask me anything about Aerostic AI..."
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                    className="flex-1"
                  />
                  <Button onClick={sendChatMessage} disabled={isChatLoading || !chatInput.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                <p className="text-xs text-gray-500 mt-2">
                  Get instant answers 24/7 about features, pricing, technical support, and more!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
