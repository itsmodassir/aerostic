
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
      icon: <FileText className="h-6 w-6 text-blue-600" />,
      color: "bg-blue-50 border-blue-200"
    },
    {
      title: "AI Prompts",
      value: imageCount,
      icon: <Lightbulb className="h-6 w-6 text-yellow-600" />,
      color: "bg-yellow-50 border-yellow-200"
    },
    {
      title: "Websites",
      value: websiteCount,
      icon: <Globe className="h-6 w-6 text-green-600" />,
      color: "bg-green-50 border-green-200"
    },
    {
      title: "Total Projects",
      value: blogCount + imageCount + websiteCount,
      icon: <TrendingUp className="h-6 w-6 text-purple-600" />,
      color: "bg-purple-50 border-purple-200"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className={`${stat.color} border-2 hover:shadow-lg transition-shadow`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <div className="p-3 rounded-full bg-white">
                {stat.icon}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
