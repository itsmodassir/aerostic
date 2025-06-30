
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Store, Camera, Code, Heart, Plane } from "lucide-react";

const WebsitePortfolio = () => {
  const websitePortfolio = [
    {
      title: "Business Portfolio",
      description: "Professional websites for companies and entrepreneurs",
      icon: <Briefcase className="h-8 w-8" />,
      features: ["Company profiles", "Service showcases", "Contact forms", "Team sections"],
      color: "bg-blue-50 border-blue-200"
    },
    {
      title: "E-commerce Store",
      description: "Online stores with product catalogs and shopping features",
      icon: <Store className="h-8 w-8" />,
      features: ["Product galleries", "Shopping cart", "Payment integration", "Inventory management"],
      color: "bg-green-50 border-green-200"
    },
    {
      title: "Photography Portfolio",
      description: "Stunning galleries for photographers and artists",
      icon: <Camera className="h-8 w-8" />,
      features: ["Image galleries", "Portfolio showcases", "Client booking", "Print services"],
      color: "bg-purple-50 border-purple-200"
    },
    {
      title: "Tech Startup",
      description: "Modern websites for technology companies",
      icon: <Code className="h-8 w-8" />,
      features: ["Product demos", "API documentation", "Developer resources", "Pricing pages"],
      color: "bg-gray-50 border-gray-200"
    },
    {
      title: "Wedding & Events",
      description: "Beautiful websites for special occasions",
      icon: <Heart className="h-8 w-8" />,
      features: ["Event details", "RSVP forms", "Photo galleries", "Guest information"],
      color: "bg-pink-50 border-pink-200"
    },
    {
      title: "Travel & Tourism",
      description: "Inspiring websites for travel businesses",
      icon: <Plane className="h-8 w-8" />,
      features: ["Destination guides", "Booking systems", "Travel packages", "Customer reviews"],
      color: "bg-yellow-50 border-yellow-200"
    }
  ];

  return (
    <div className="mb-16">
      <h2 className="text-2xl font-bold text-center mb-8">Website Portfolio</h2>
      <p className="text-center text-gray-600 mb-8">
        Explore the different types of websites we can create for you
      </p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {websitePortfolio.map((website, index) => (
          <Card key={index} className={`${website.color} border-2 hover:shadow-lg transition-shadow`}>
            <CardHeader className="text-center pb-4">
              <div className="text-primary mb-3">
                {website.icon}
              </div>
              <CardTitle className="text-lg">{website.title}</CardTitle>
              <p className="text-sm text-gray-600">{website.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {website.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                    {feature}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WebsitePortfolio;
