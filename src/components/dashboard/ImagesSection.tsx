
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image, Plus, Download, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GeneratedImage {
  id: string;
  prompt: string;
  style: string;
  size: string;
  quality: string;
  image_url: string;
  created_at: string;
}

interface ImagesSectionProps {
  images: GeneratedImage[];
  onImageDeleted: (imageId: string) => void;
}

const ImagesSection = ({ images, onImageDeleted }: ImagesSectionProps) => {
  const navigate = useNavigate();

  const deleteImage = async (imageId: string) => {
    try {
      const { error } = await supabase
        .from('generated_images' as any)
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      onImageDeleted(imageId);
      toast.success('Image deleted successfully');
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  const downloadImage = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${prompt.substring(0, 30)}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Image downloaded successfully!");
    } catch (error) {
      console.error("Error downloading image:", error);
      toast.error("Failed to download image");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Generated Images ({images.length})
          </CardTitle>
          <Button onClick={() => navigate('/image-generator')} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Generate Image
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {images.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No images generated yet. Create your first one!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {images.map((image) => (
              <div key={image.id} className="border rounded-lg p-4">
                <div className="aspect-square mb-3 overflow-hidden rounded-lg">
                  <img
                    src={image.image_url}
                    alt={image.prompt}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-medium mb-2 text-sm line-clamp-2">{image.prompt}</h3>
                <p className="text-xs text-gray-600 mb-2">
                  Style: {image.style} | Size: {image.size}
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  Created: {new Date(image.created_at).toLocaleDateString()}
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => downloadImage(image.image_url, image.prompt)}
                    className="flex-1"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => deleteImage(image.id)}
                  >
                    <Trash2 className="h-3 w-3" />
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

export default ImagesSection;
