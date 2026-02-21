
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Footer from "@/components/Footer";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLoading from "@/components/dashboard/DashboardLoading";
import BlogPostsSection from "@/components/dashboard/BlogPostsSection";
import ImagesSection from "@/components/dashboard/ImagesSection";
import WebsitesSection from "@/components/dashboard/WebsitesSection";
import PortfolioShowcase from "@/components/dashboard/PortfolioShowcase";
import QuickActions from "@/components/dashboard/QuickActions";
import DashboardStats from "@/components/dashboard/DashboardStats";

const Dashboard = () => {
  const { user } = useAuth();
  const [blogPosts, setBlogPosts] = useState([]);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const [postsResponse, imagesResponse, websitesResponse] = await Promise.all([
        supabase
          .from('blog_posts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('generated_images' as any)
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('websites')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      ]);

      if (postsResponse.error) {
        console.error('Error fetching blog posts:', postsResponse.error);
      } else {
        setBlogPosts(postsResponse.data || []);
      }

      if (imagesResponse.error) {
        console.error('Error fetching generated images:', imagesResponse.error);
      } else {
        setGeneratedImages(imagesResponse.data || []);
      }

      if (websitesResponse.error) {
        console.error('Error fetching websites:', websitesResponse.error);
      } else {
        setWebsites(websitesResponse.data || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load your content');
    } finally {
      setLoading(false);
    }
  };

  const handlePostDeleted = (postId: string) => {
    setBlogPosts(posts => posts.filter(post => post.id !== postId));
  };

  const handleImageDeleted = (imageId: string) => {
    setGeneratedImages(images => images.filter(image => image.id !== imageId));
  };

  const handleWebsiteDeleted = (websiteId: string) => {
    setWebsites(sites => sites.filter(site => site.id !== websiteId));
  };

  if (loading) {
    return <DashboardLoading />;
  }

  return (
    <div className="min-h-screen gradient-bg grid-pattern flex flex-col relative overflow-hidden">
      {/* Floating tech elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-xl float-animation"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-accent/10 rounded-full blur-xl float-animation" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-40 left-1/4 w-20 h-20 bg-secondary/10 rounded-full blur-xl float-animation" style={{ animationDelay: '4s' }}></div>
      </div>
      
      <Navigation />
      
      <div className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto space-y-8">
          <DashboardHeader />
          
          <div className="transform hover:scale-[1.01] transition-transform duration-300">
            <DashboardStats 
              blogCount={blogPosts.length}
              imageCount={generatedImages.length}
              websiteCount={websites.length}
            />
          </div>

          <div className="transform hover:scale-[1.005] transition-transform duration-300">
            <QuickActions />
          </div>

          <div className="transform hover:scale-[1.005] transition-transform duration-300">
            <PortfolioShowcase />
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="transform hover:scale-105 transition-transform duration-300">
              <BlogPostsSection 
                blogPosts={blogPosts} 
                onPostDeleted={handlePostDeleted}
              />
            </div>
            <div className="transform hover:scale-105 transition-transform duration-300">
              <ImagesSection 
                images={generatedImages} 
                onImageDeleted={handleImageDeleted}
              />
            </div>
            <div className="transform hover:scale-105 transition-transform duration-300">
              <WebsitesSection 
                websites={websites} 
                onWebsiteDeleted={handleWebsiteDeleted}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
