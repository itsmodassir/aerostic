
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Edit, Eye, Trash2, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BlogPost {
  id: string;
  title: string;
  tone: string;
  word_count: number;
  created_at: string;
}

interface BlogPostsSectionProps {
  blogPosts: BlogPost[];
  onPostDeleted: (postId: string) => void;
}

const BlogPostsSection = ({ blogPosts, onPostDeleted }: BlogPostsSectionProps) => {
  const navigate = useNavigate();

  const deletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      onPostDeleted(postId);
      toast.success('Blog post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete blog post');
    }
  };

  return (
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
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">{post.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {post.tone} • {post.word_count} words
                    </p>
                    <p className="text-sm text-gray-500">
                      Created: {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={() => navigate(`/blog-post/${post.id}`)}
                        className="cursor-pointer"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Post
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => navigate(`/blog-editor?edit=${post.id}`)}
                        className="cursor-pointer"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Post
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => deletePost(post.id)}
                        className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Post
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BlogPostsSection;
