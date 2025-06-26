
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileText, Globe, User, Plus, Edit, Eye, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [blogPosts, setBlogPosts] = useState([]);
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const [postsResponse, websitesResponse] = await Promise.all([
        supabase
          .from('blog_posts')
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

  const deletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      setBlogPosts(posts => posts.filter(post => post.id !== postId));
      toast.success('Blog post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete blog post');
    }
  };

  const deleteWebsite = async (websiteId: string) => {
    try {
      const { error } = await supabase
        .from('websites')
        .delete()
        .eq('id', websiteId);

      if (error) throw error;

      setWebsites(sites => sites.filter(site => site.id !== websiteId));
      toast.success('Website deleted successfully');
    } catch (error) {
      console.error('Error deleting website:', error);
      toast.error('Failed to delete website');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex flex-col">
        <Navigation />
        <div className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your dashboard...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      <Navigation />
      
      <div className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <User className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Your Dashboard
            </h1>
            <p className="text-xl text-gray-600">
              Manage your blog posts and websites
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Blog Posts Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Blog Posts ({blogPosts.length})
                  </CardTitle>
                  <Button onClick={() => navigate('/blog-editor')} size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    New Post
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {blogPosts.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No blog posts yet. Create your first one!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {blogPosts.map((post) => (
                      <div key={post.id} className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-2">{post.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {post.tone} • {post.word_count} words
                        </p>
                        <p className="text-sm text-gray-500 mb-3">
                          Created: {new Date(post.created_at).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/blog-post/${post.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/blog-editor?edit=${post.id}`)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => deletePost(post.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Websites Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Websites ({websites.length})
                  </CardTitle>
                  <Button onClick={() => navigate('/blog-builder')} size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    New Website
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {websites.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No websites yet. Build your first one!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {websites.map((website) => (
                      <div key={website.id} className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-2">{website.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Topic: {website.topic}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          Theme: {website.theme}
                        </p>
                        <p className="text-sm text-gray-500 mb-3">
                          Created: {new Date(website.created_at).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/website/${website.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/blog-builder?edit=${website.id}`)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => deleteWebsite(website.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
