
import { User, Crown, Sparkles } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

const DashboardHeader = () => {
  const { user } = useAuth();

  return (
    <div className="text-center mb-12 relative">
      {/* Enhanced background with better contrast */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
      </div>
      
      {/* Enhanced avatar section */}
      <div className="flex items-center justify-center mb-8">
        <div className="relative group">
          {/* Main avatar container */}
          <div className="relative">
            <div className="p-8 bg-gradient-to-br from-primary via-primary to-accent rounded-full shadow-2xl">
              <User className="h-20 w-20 text-white drop-shadow-lg" />
            </div>
            {/* Crown badge */}
            <div className="absolute -top-3 -right-3 p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-xl">
              <Crown className="h-7 w-7 text-white drop-shadow-sm" />
            </div>
          </div>
          
          {/* Animated rings */}
          <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-spin" style={{ animationDuration: '10s' }}></div>
          <div className="absolute inset-2 rounded-full border-2 border-accent/20 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}></div>
          
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 blur-xl scale-150 opacity-60"></div>
        </div>
      </div>
      
      {/* Enhanced title with better visibility */}
      <div className="relative z-10 mb-8">
        <h1 className="text-6xl md:text-7xl font-bold mb-4 relative">
          <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent drop-shadow-sm">
            Welcome Back
          </span>
          <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-2xl -z-10 rounded-lg"></div>
        </h1>
        
        <div className="text-3xl font-bold mb-2">
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            ✨ Creator Dashboard ✨
          </span>
        </div>
      </div>
      
      {/* User info with better contrast */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <div className="p-2 bg-primary/10 rounded-full">
          <Sparkles className="h-6 w-6 text-primary animate-pulse" />
        </div>
        <div className="px-6 py-3 bg-card/80 backdrop-blur-sm rounded-full border border-primary/20 shadow-lg">
          <p className="text-xl font-semibold text-foreground">
            {user?.email ? `Hello, ${user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1)}!` : 'AI-Powered Dashboard'}
          </p>
        </div>
        <div className="p-2 bg-accent/10 rounded-full">
          <Sparkles className="h-6 w-6 text-accent animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
      </div>
      
      {/* Enhanced description card */}
      <div className="max-w-4xl mx-auto">
        <div className="p-8 bg-card/90 backdrop-blur-sm rounded-3xl border-2 border-primary/20 shadow-2xl relative overflow-hidden">
          {/* Card background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="text-2xl">🚀</div>
              <h2 className="text-2xl font-bold text-foreground">Command Center Active</h2>
              <div className="text-2xl">⚡</div>
            </div>
            
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Manage your AI-generated content, create stunning websites, and explore powerful tools all in one place. 
              <span className="font-semibold text-primary"> Your creative journey is powered by cutting-edge technology.</span>
            </p>
            
            {/* Status indicators */}
            <div className="flex items-center justify-center gap-6 mt-6">
              <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-600">System Online</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-full">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <span className="text-sm font-medium text-blue-600">AI Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
