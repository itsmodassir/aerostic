import { useState, useEffect } from "react";
import { Download, X, Smartphone, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      
      // Show the prompt after a delay
      setTimeout(() => {
        if (!localStorage.getItem('pwa-install-dismissed')) {
          setShowPrompt(true);
        }
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app was successfully installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      toast.success("App installed successfully! 🎉");
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        toast.info("To install on iOS: Tap Share button, then 'Add to Home Screen'");
      }
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        toast.success("Installing app...");
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('Install prompt error:', error);
      toast.error("Installation failed. Please try again.");
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 px-4 animate-slide-in-right">
      <div className="max-w-md mx-auto relative">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-3xl blur-lg opacity-50" />
        
        {/* Main card */}
        <div className="relative bg-background/95 backdrop-blur-xl border border-border/50 rounded-3xl p-5 shadow-2xl">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="absolute top-3 right-3 h-7 w-7 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              {isIOS ? (
                <Smartphone className="h-6 w-6 text-white" />
              ) : (
                <Download className="h-6 w-6 text-white" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground mb-1">
                Install Aimstors Solution AI
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                {isIOS 
                  ? "Add to your home screen for quick access"
                  : "Install our app for a better experience - works offline too!"}
              </p>

              {isIOS ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-2">
                  <span>Tap</span>
                  <div className="w-5 h-5 bg-primary/20 rounded flex items-center justify-center">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 14H4v-7h2v5h12v-5h2v7z"/>
                    </svg>
                  </div>
                  <span>then "Add to Home Screen"</span>
                </div>
              ) : (
                <Button
                  onClick={handleInstallClick}
                  className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Install Now
                </Button>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span>Works offline</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>Fast loading</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <span>No app store</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                <span>Auto updates</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
