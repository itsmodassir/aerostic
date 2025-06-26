
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Users, Target, Zap, Heart } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      <Navigation />
      
      <div className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              About SetMyBlog AI
            </h1>
            <p className="text-xl text-gray-600">
              Empowering creators with AI-powered content generation
            </p>
          </div>

          <div className="prose prose-lg max-w-none mb-12">
            <p className="text-gray-700 leading-relaxed">
              SetMyBlog AI is a revolutionary platform that combines the power of artificial intelligence 
              with intuitive design to help content creators, bloggers, and businesses build their online 
              presence effortlessly. Our mission is to democratize content creation and make professional 
              blogging accessible to everyone.
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
              What We Offer
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">AI Blog Editor</h3>
                <p className="text-sm text-gray-600">
                  Generate high-quality blog posts with customizable tone, length, and topics
                </p>
              </div>

              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Website Builder</h3>
                <p className="text-sm text-gray-600">
                  Create complete blog websites with AI-generated content and professional themes
                </p>
              </div>

              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">User Dashboard</h3>
                <p className="text-sm text-gray-600">
                  Manage all your content, track performance, and organize your digital assets
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-gray-600 mb-6">
              Join thousands of creators who are already using SetMyBlog AI to build their online presence.
            </p>
            <a 
              href="/auth" 
              className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Start Creating Today
            </a>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default About;
