
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
      message: "Hi! I'm your SetMyBlog AI assistant. How can I help you today? You can ask me about features, pricing, or any other questions!"
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
      const prompt = `You are a helpful customer support chatbot for SetMyBlog AI, a blog writing and website building platform powered by AI. 
      
      Key information about SetMyBlog AI:
      - Uses Google Gemini AI for content generation
      - Offers AI blog writing, website building, SEO optimization
      - Has Free Trial, Creator ($19/month), and Professional ($49/month) plans
      - Features include unlimited AI posts, themes, scheduling, analytics, custom domains
      - 30-day money back guarantee, 99.9% uptime
      
      User question: "${userMessage}"
      
      Provide a helpful, friendly response. Keep it concise but informative. If you don't know something specific, suggest they contact support directly.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyAhDgajINy8ZYGV9oAHaaOPawlFBlZDS6A`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        setChatMessages(prev => [...prev, { 
          role: "bot", 
          message: data.candidates[0].content.parts[0].text 
        }]);
      } else {
        throw new Error("Failed to get response");
      }
    } catch (error) {
      console.error("Error sending chat message:", error);
      setChatMessages(prev => [...prev, { 
        role: "bot", 
        message: "I'm sorry, I'm having trouble responding right now. Please try again or contact our support team directly." 
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
              Have questions? We're here to help you succeed with SetMyBlog AI
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
                    <div>📧 Email: support@setmyblog.ai</div>
                    <div>💬 Live Chat: Available 9 AM - 6 PM EST</div>
                    <div>📞 Phone: +1 (555) 123-4567</div>
                    <div>⏰ Response Time: Within 24 hours</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Chatbot */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Chat with AI Assistant
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
                          <p className="text-sm">Typing...</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask me anything about SetMyBlog AI..."
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                    className="flex-1"
                  />
                  <Button onClick={sendChatMessage} disabled={isChatLoading || !chatInput.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                <p className="text-xs text-gray-500 mt-2">
                  Get instant answers to common questions about features, pricing, and more!
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
