
import { User } from "lucide-react";

const DashboardHeader = () => {
  return (
    <div className="text-center mb-12">
      <User className="h-12 w-12 text-primary mx-auto mb-4" />
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Your Dashboard
      </h1>
      <p className="text-xl text-gray-600">
        Manage your blog posts and websites
      </p>
    </div>
  );
};

export default DashboardHeader;
