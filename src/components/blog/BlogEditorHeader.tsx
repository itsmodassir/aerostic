
import { Sparkles } from "lucide-react";

const BlogEditorHeader = () => {
  return (
    <div className="text-center mb-12">
      <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        AI Blog Editor
      </h1>
      <p className="text-xl text-gray-600">
        Create professional blog posts in seconds with BlogCraft AI
      </p>
    </div>
  );
};

export default BlogEditorHeader;
