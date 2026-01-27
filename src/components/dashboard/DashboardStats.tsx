
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Lightbulb, Globe, TrendingUp } from "lucide-react";

interface DashboardStatsProps {
  blogCount: number;
  imageCount: number;
  websiteCount: number;
}

const DashboardStats = ({ blogCount, imageCount, websiteCount }: DashboardStatsProps) => {
  const stats = [
    {
      title: "Blog Posts",
      value: blogCount,
      icon: <FileText className="h-8 w-8 text-primary" />,
      gradient: "from-blue-500 to-cyan-500",
      delay: "0s"
    },
    {
      title: "AI Images",
      value: imageCount,
      icon: <Lightbulb className="h-8 w-8 text-primary" />,
      gradient: "from-yellow-500 to-orange-500",
      delay: "0.1s"
    },
    {
      title: "Websites",
      value: websiteCount,
      icon: <Globe className="h-8 w-8 text-primary" />,
      gradient: "from-green-500 to-emerald-500",
      delay: "0.2s"
    },
    {
      title: "Total Projects",
      value: blogCount + imageCount + websiteCount,
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      gradient: "from-purple-500 to-pink-500",
      delay: "0.3s"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card 
          key={index} 
          className="tech-card border-2 border-primary/20 hover:border-primary/40 hover:scale-105 transition-all duration-300 shimmer-effect group relative overflow-hidden"
          style={{ animationDelay: stat.delay }}
        >
          {/* Background gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
          
          <CardContent className="p-8 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">{stat.title}</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <div className="mt-2 h-1 w-12 bg-gradient-to-r from-primary to-accent rounded-full"></div>
              </div>
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.gradient} tech-glow group-hover:scale-110 transition-transform duration-300`}>
                {stat.icon}
              </div>
            </div>
            
            {/* Tech pattern overlay */}
            <div className="absolute bottom-0 right-0 w-20 h-20 opacity-10">
              <div className="absolute inset-0 bg-gradient-to-tl from-primary/20 to-transparent rounded-tl-full"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
