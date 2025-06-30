
import { User, Crown, Sparkles } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

const DashboardHeader = () => {
  const { user } = useAuth();

  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center mb-4">
        <div className="relative">
          <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
            <User className="h-12 w-12 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 p-1 bg-yellow-500 rounded-full">
            <Crown className="h-4 w-4 text-white" />
          </div>
        </div>
      </div>
      
      <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
        Welcome Back!
      </h1>
      
      <div className="flex items-center justify-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-yellow-500" />
        <p className="text-xl text-gray-600">
          {user?.email ? `Hello, ${user.email.split('@')[0]}` : 'Your AI-Powered Dashboard'}
        </p>
        <Sparkles className="h-5 w-5 text-yellow-500" />
      </div>
      
      <p className="text-gray-500 max-w-2xl mx-auto">
        Manage your AI-generated content, create stunning websites, and explore powerful tools all in one place. 
        Your creative journey starts here.
      </p>
    </div>
  );
};

export default DashboardHeader;
