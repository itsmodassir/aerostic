
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Plus, Edit, Eye, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Website {
  id: string;
  name: string;
  topic: string;
  theme: string;
  created_at: string;
}

interface WebsitesSectionProps {
  websites: Website[];
  onWebsiteDeleted: (websiteId: string) => void;
}

const WebsitesSection = ({ websites, onWebsiteDeleted }: WebsitesSectionProps) => {
  const navigate = useNavigate();

  const deleteWebsite = async (websiteId: string) => {
    try {
      const { error } = await supabase
        .from('websites')
        .delete()
        .eq('id', websiteId);

      if (error) throw error;

      onWebsiteDeleted(websiteId);
      toast.success('Website deleted successfully');
    } catch (error) {
      console.error('Error deleting website:', error);
      toast.error('Failed to delete website');
    }
  };

  return (
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
  );
};

export default WebsitesSection;
