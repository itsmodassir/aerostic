
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Users, Target, Zap, Heart, Globe, Shield, Clock, TrendingUp, Lightbulb, Code, Image, MessageCircle, Edit, Palette, Brain, Settings } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      <Navigation />
      
      <div className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              About Aerostic AI
            </h1>
            <p className="text-xl text-gray-600">
              Empowering creators with AI-powered content generation
            </p>
          </div>

          <div className="prose prose-lg max-w-none mb-12">
            <p className="text-gray-700 leading-relaxed mb-6">
              Aerostic AI is a revolutionary platform that combines the power of artificial intelligence 
              with intuitive design to help content creators, bloggers, and businesses build their online 
              presence effortlessly. Our mission is to democratize content creation and make professional 
              blogging accessible to everyone.
            </p>
            
            <p className="text-gray-700 leading-relaxed mb-6">
              Founded in 2025, we recognized that creating quality content consistently was one of the biggest 
              challenges facing digital creators. Whether you're a solo entrepreneur, small business owner, 
              or content creator, the time and expertise required to produce engaging blogs, websites, and 
              digital content can be overwhelming. That's where Aerostic AI comes in.
            </p>
            
            <p className="text-gray-700 leading-relaxed">
              Our platform leverages cutting-edge AI technology to transform simple ideas into professional, 
              engaging content. From blog posts to complete websites, we handle the heavy lifting so you can 
              focus on what matters most - connecting with your audience and growing your business.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <Target className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Our Mission</h3>
              <p className="text-gray-600">
                To empower individuals and businesses to create compelling, professional content 
                without the barriers of technical complexity or creative blocks.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <Zap className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Our Vision</h3>
              <p className="text-gray-600">
                A world where anyone can build a powerful online presence, share their ideas, 
                and connect with their audience through AI-assisted content creation.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-sm mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Our Complete AI Toolkit
            </h2>
            <p className="text-gray-600 text-center mb-8 max-w-3xl mx-auto">
              Aerostic AI offers a comprehensive suite of AI-powered tools designed to transform how you create, 
              manage, and publish content. Each tool is built with cutting-edge artificial intelligence to deliver 
              professional results in seconds.
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
                <div className="bg-blue-500 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Edit className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-3 text-gray-900">AI Blog Editor</h3>
                <p className="text-gray-700 mb-4 text-sm leading-relaxed">
                  Our flagship tool that generates complete, high-quality blog posts from simple prompts. 
                  Customize tone, length, target audience, and topic to create content that perfectly matches your brand voice.
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Custom tone and style settings</li>
                  <li>• SEO-optimized content generation</li>
                  <li>• Multiple word count options</li>
                  <li>• Real-time editing and refinement</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-100">
                <div className="bg-green-500 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-3 text-gray-900">AI Website Builder</h3>
                <p className="text-gray-700 mb-4 text-sm leading-relaxed">
                  Transform ideas into complete, professional websites with AI-generated content, layouts, and themes. 
                  Perfect for bloggers, businesses, and personal portfolios.
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• AI-generated website content</li>
                  <li>• Professional responsive themes</li>
                  <li>• Custom domain integration</li>
                  <li>• One-click deployment</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-6 border border-purple-100">
                <div className="bg-purple-500 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Image className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-3 text-gray-900">AI Image Generator</h3>
                <p className="text-gray-700 mb-4 text-sm leading-relaxed">
                  Create stunning, custom visuals for your content using advanced AI image generation. 
                  Generate blog headers, social media graphics, and promotional images instantly.
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Multiple art styles and formats</li>
                  <li>• High-resolution output options</li>
                  <li>• Custom prompt optimization</li>
                  <li>• Brand-consistent imagery</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-6 border border-orange-100">
                <div className="bg-orange-500 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-3 text-gray-900">AI Chat Assistant</h3>
                <p className="text-gray-700 mb-4 text-sm leading-relaxed">
                  Get instant help with content strategy, editing suggestions, and creative ideas. 
                  Our AI assistant provides personalized guidance for all your content creation needs.
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Real-time content consultation</li>
                  <li>• Editing and improvement suggestions</li>
                  <li>• Creative brainstorming partner</li>
                  <li>• Multi-conversation management</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-lg p-6 border border-cyan-100">
                <div className="bg-cyan-500 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Code className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-3 text-gray-900">AI Code Editor</h3>
                <p className="text-gray-700 mb-4 text-sm leading-relaxed">
                  Advanced code generation and editing with AI assistance. Generate, optimize, and debug code 
                  across multiple programming languages with intelligent suggestions.
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Multi-language code generation</li>
                  <li>• Intelligent code completion</li>
                  <li>• Error detection and fixes</li>
                  <li>• Code optimization suggestions</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg p-6 border border-pink-100">
                <div className="bg-pink-500 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-3 text-gray-900">Smart Dashboard</h3>
                <p className="text-gray-700 mb-4 text-sm leading-relaxed">
                  Centralized hub for managing all your AI-generated content. Track performance, organize projects, 
                  and get insights into your content strategy with intelligent analytics.
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Content performance analytics</li>
                  <li>• Project organization tools</li>
                  <li>• AI usage insights</li>
                  <li>• Cross-platform integration</li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6 text-center">
              <Brain className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Powered by Advanced AI</h3>
              <p className="text-gray-700 max-w-2xl mx-auto">
                All our tools are powered by state-of-the-art artificial intelligence models, including GPT-4, 
                DALL-E, and custom-trained models optimized for content creation. We continuously update our AI 
                to deliver the latest in machine learning capabilities.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-sm mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              What We Offer
            </h2>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">AI Blog Editor</h3>
                <p className="text-sm text-gray-600">
                  Generate high-quality blog posts with customizable tone, length, and topics. Our AI understands 
                  your brand voice and creates content that resonates with your audience.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Website Builder</h3>
                <p className="text-sm text-gray-600">
                  Create complete blog websites with AI-generated content and professional themes. 
                  Deploy instantly with custom domains and SSL certificates.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">User Dashboard</h3>
                <p className="text-sm text-gray-600">
                  Manage all your content, track performance, and organize your digital assets 
                  with comprehensive analytics and insights.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Image className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">AI Image Generator</h3>
                <p className="text-sm text-gray-600">
                  Create stunning, custom images for your content with our advanced AI image generation. 
                  Perfect visuals for every blog post and website.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">AI Chat Assistant</h3>
                <p className="text-sm text-gray-600">
                  Get instant help with content ideas, editing suggestions, and creative guidance 
                  from our intelligent chat assistant.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Code className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Code Editor</h3>
                <p className="text-sm text-gray-600">
                  Advanced code editor with AI assistance for developers. Generate, edit, and 
                  optimize code across multiple programming languages.
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <Shield className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Security & Privacy</h3>
              <p className="text-gray-600 mb-4">
                Your data security is our top priority. We use enterprise-grade encryption 
                and never share your content with third parties.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• End-to-end encryption for all data</li>
                <li>• GDPR compliant data handling</li>
                <li>• Secure cloud infrastructure</li>
                <li>• Regular security audits</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <Clock className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Lightning Fast</h3>
              <p className="text-gray-600 mb-4">
                Generate professional content in seconds, not hours. Our optimized AI 
                models deliver quality results at unprecedented speed.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Blog posts in under 30 seconds</li>
                <li>• Real-time content generation</li>
                <li>• Instant website deployment</li>
                <li>• Live preview and editing</li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Why Choose Aerostic AI?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-primary mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Proven Results</h4>
                <p className="text-sm text-gray-600">
                  10,000+ creators trust us with their content needs
                </p>
              </div>
              
              <div className="text-center">
                <Lightbulb className="h-12 w-12 text-primary mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Innovation</h4>
                <p className="text-sm text-gray-600">
                  Cutting-edge AI technology that evolves with your needs
                </p>
              </div>
              
              <div className="text-center">
                <Users className="h-12 w-12 text-primary mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Community</h4>
                <p className="text-sm text-gray-600">
                  Active community of creators sharing tips and success stories
                </p>
              </div>
              
              <div className="text-center">
                <Heart className="h-12 w-12 text-primary mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Support</h4>
                <p className="text-sm text-gray-600">
                  24/7 customer support and comprehensive documentation
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-sm mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Our Technology
            </h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                Aerostic AI is built on state-of-the-art machine learning models and cloud infrastructure. 
                Our AI systems are trained on diverse, high-quality datasets to ensure accurate, relevant, 
                and engaging content generation across various industries and topics.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mt-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Natural Language Processing</h4>
                  <p className="text-sm text-gray-600">
                    Advanced NLP models that understand context, tone, and intent to create 
                    human-like content that connects with your audience.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Computer Vision</h4>
                  <p className="text-sm text-gray-600">
                    Sophisticated image generation and processing capabilities that create 
                    visually stunning content tailored to your brand and message.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Cloud Infrastructure</h4>
                  <p className="text-sm text-gray-600">
                    Scalable, secure cloud architecture ensuring 99.9% uptime and 
                    lightning-fast response times for all your content needs.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-gray-600 mb-6">
              Join thousands of creators who are already using Aerostic AI to build their online presence.
            </p>
            <Link 
              to="/auth" 
              className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Start Creating Today
            </Link>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default About;
