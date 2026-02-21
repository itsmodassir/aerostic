
import { useState } from "react";
import Navigation from "@/components/Navigation";
import BlogEditorHeader from "@/components/blog/BlogEditorHeader";
import BlogEditorForm from "@/components/blog/BlogEditorForm";
import BlogEditorOutput from "@/components/blog/BlogEditorOutput";
import BlogEditorFeatures from "@/components/blog/BlogEditorFeatures";

const BlogEditor = () => {
  const [generatedPost, setGeneratedPost] = useState("");
  const [topic, setTopic] = useState("");

  const handleGenerate = (content: string) => {
    setGeneratedPost(content);
  };

  return (
    <div className="min-h-screen gradient-bg">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <BlogEditorHeader />

          <div className="grid lg:grid-cols-2 gap-8">
            <BlogEditorForm onGenerate={handleGenerate} />
            <BlogEditorOutput generatedPost={generatedPost} topic={topic} />
          </div>

          <BlogEditorFeatures />
        </div>
      </div>
    </div>
  );
};

export default BlogEditor;
