
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

const Dashboard = () => {
  const { user } = useAuth();
  const [blogPosts, setBlogPosts] = useState([]);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const [postsResponse, imagesResponse] = await Promise.all([
        supabase
          .from('blog_posts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('generated_images' as any)
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

  if (loading) {
    return <DashboardLoading />;
  }

  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      <Navigation />
      
      <div className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <DashboardHeader />

          <div className="grid lg:grid-cols-2 gap-8">
            <BlogPostsSection 
              blogPosts={blogPosts} 
              onPostDeleted={handlePostDeleted}
            />
            <ImagesSection 
              images={generatedImages} 
              onImageDeleted={handleImageDeleted}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
