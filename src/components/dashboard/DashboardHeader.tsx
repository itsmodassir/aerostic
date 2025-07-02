
import { User, Crown, Sparkles } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

const DashboardHeader = () => {
  const { user } = useAuth();

  return (
    <div className="text-center mb-8 relative">
      {/* Tech background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="flex items-center justify-center mb-6">
        <div className="relative group">
          <div className="p-6 tech-gradient rounded-full pulse-glow shimmer-effect">
            <User className="h-16 w-16 text-white relative z-10" />
          </div>
          <div className="absolute -top-2 -right-2 p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full tech-glow">
            <Crown className="h-6 w-6 text-white" />
          </div>
          {/* Rotating ring */}
          <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-spin" style={{ animationDuration: '8s' }}></div>
        </div>
      </div>
      
      <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-4 relative">
        Welcome Back, Creator!
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 blur-lg -z-10"></div>
      </h1>
      
      <div className="flex items-center justify-center gap-3 mb-6">
        <Sparkles className="h-6 w-6 text-primary animate-pulse" />
        <p className="text-2xl font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {user?.email ? `${user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1)}` : 'AI-Powered Dashboard'}
        </p>
        <Sparkles className="h-6 w-6 text-primary animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>
      
      <div className="max-w-3xl mx-auto p-6 tech-card rounded-2xl border border-primary/20">
        <p className="text-lg text-muted-foreground leading-relaxed">
          🚀 <strong>Command Center Active</strong> - Manage your AI-generated content, create stunning websites, 
          and explore powerful tools all in one place. Your creative journey is powered by cutting-edge technology.
        </p>
      </div>
    </div>
  );
};

export default DashboardHeader;
