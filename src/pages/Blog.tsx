import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Calendar, 
  Clock, 
  User, 
  ArrowRight, 
  Tag,
  BookOpen,
  TrendingUp,
  Star,
  Share2,
  Heart,
  Eye
} from "lucide-react";
import { Link } from "react-router-dom";

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "AI & Technology", "Product Updates", "Tutorials", "Industry News", "Company"];

  const featuredArticle = {
    id: 1,
    title: "The Future of AI-Powered Content Creation: Transforming Digital Marketing",
    excerpt: "Discover how artificial intelligence is revolutionizing content creation and what it means for businesses, creators, and the future of digital marketing.",
    author: "AI Research Team",
    date: "2024-01-15",
    readTime: "8 min read",
    image: "/api/placeholder/800/400",
    category: "AI & Technology",
    featured: true,
    views: 12500,
    likes: 342
  };

  const articles = [
    {
      id: 2,
      title: "10 Tips for Writing Better AI Prompts",
      excerpt: "Learn the secrets to crafting effective prompts that get you better results from AI tools.",
      author: "Content Team",
      date: "2024-01-12",
      readTime: "5 min read",
      image: "/api/placeholder/400/250",
      category: "Tutorials",
      views: 8900,
      likes: 234
    },
    {
      id: 3,
      title: "Product Update: New AI Chat Features",
      excerpt: "We've added powerful new features to our AI chat assistant, including conversation memory and context awareness.",
      author: "Product Team",
      date: "2024-01-10",
      readTime: "3 min read",
      image: "/api/placeholder/400/250",
      category: "Product Updates",
      views: 6750,
      likes: 189
    },
    {
      id: 4,
      title: "How Small Businesses Are Using AI to Scale",
      excerpt: "Real-world case studies of how small businesses are leveraging AI tools to grow and compete with larger companies.",
      author: "Business Team",
      date: "2024-01-08",
      readTime: "7 min read",
      image: "/api/placeholder/400/250",
      category: "Industry News",
      views: 5420,
      likes: 156
    },
    {
      id: 5,
      title: "Building Your First Website with AI",
      excerpt: "A complete step-by-step guide to creating a professional website using our AI website builder.",
      author: "Tutorial Team",
      date: "2024-01-05",
      readTime: "12 min read",
      image: "/api/placeholder/400/250",
      category: "Tutorials",
      views: 9870,
      likes: 298
    },
    {
      id: 6,
      title: "The Science Behind Our AI Image Generator",
      excerpt: "Dive deep into the technology and research that powers our advanced AI image generation capabilities.",
      author: "AI Research Team",
      date: "2024-01-03",
      readTime: "10 min read",
      image: "/api/placeholder/400/250",
      category: "AI & Technology",
      views: 4320,
      likes: 123
    },
    {
      id: 7,
      title: "Meet the Team: Our Journey Building AI Tools",
      excerpt: "Get to know the people behind the platform and learn about our mission to democratize AI technology.",
      author: "Company",
      date: "2024-01-01",
      readTime: "6 min read",
      image: "/api/placeholder/400/250",
      category: "Company",
      views: 3890,
      likes: 98
    }
  ];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const popularTags = ["AI", "Content Creation", "Tutorials", "Product Updates", "Machine Learning", "Automation"];

  return (
    <div className="min-h-screen gradient-bg">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-6">
            <BookOpen className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Our{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Blog
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Insights, tutorials, and updates from the world of AI-powered content creation
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto mb-8">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-3 text-lg border-2 border-primary/20 focus:border-primary/40 rounded-xl"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Article */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 text-primary" />
              <span className="text-lg font-semibold text-foreground">Featured Article</span>
            </div>
          </div>
          
          <Card className="tech-card border-2 border-primary/20 hover:border-primary/40 hover:shadow-2xl transition-all duration-500 overflow-hidden group">
            <div className="md:flex">
              <div className="md:w-1/2">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <Badge variant="secondary" className="bg-primary text-white">
                      Featured
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="md:w-1/2 p-8">
                <div className="flex items-center gap-4 mb-4">
                  <Badge variant="outline" className="border-primary/30">
                    {featuredArticle.category}
                  </Badge>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {featuredArticle.views.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {featuredArticle.likes}
                    </div>
                  </div>
                </div>
                
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                  {featuredArticle.title}
                </h2>
                
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {featuredArticle.excerpt}
                </p>
                
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {featuredArticle.author}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(featuredArticle.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {featuredArticle.readTime}
                    </div>
                  </div>
                </div>
                
                <Button className="group-hover:scale-105 transition-transform">
                  Read Full Article
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-foreground">
              Latest Articles
            </h2>
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-5 w-5" />
              <span>{filteredArticles.length} articles found</span>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article, index) => (
              <Card 
                key={article.id} 
                className="tech-card border-2 border-primary/20 hover:border-primary/40 hover:shadow-xl transition-all duration-300 hover:scale-105 group overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent group-hover:from-black/50 transition-all"></div>
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-card/80 text-foreground">
                      {article.category}
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 right-4 flex items-center gap-2 text-white text-xs">
                    <Eye className="h-3 w-3" />
                    {article.views.toLocaleString()}
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-4 text-sm leading-relaxed line-clamp-3">
                    {article.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      {article.author}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      {article.readTime}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(article.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Heart className="h-3 w-3" />
                      {article.likes}
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-4 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all"
                  >
                    Read More
                    <ArrowRight className="h-3 w-3 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Sidebar Content */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Popular Tags */}
            <Card className="tech-card border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-primary" />
                  Popular Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="cursor-pointer hover:bg-primary hover:text-white transition-colors"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Newsletter Signup */}
            <Card className="tech-card border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardHeader>
                <CardTitle className="text-center">
                  📧 Stay Updated
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4 text-sm">
                  Get the latest articles and updates delivered to your inbox.
                </p>
                <div className="space-y-3">
                  <Input placeholder="Enter your email" type="email" />
                  <Button className="w-full">
                    Subscribe
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Share */}
            <Card className="tech-card border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-primary" />
                  Share Our Blog
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-4">
                  Help others discover our insights and tutorials.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Twitter
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    LinkedIn
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;