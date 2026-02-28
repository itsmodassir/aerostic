import { useEffect, useState } from 'react';
import { useAppUpdates } from '@/hooks/useAppUpdates';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Download, AlertCircle, CheckCircle } from 'lucide-react';

interface AppUpdatePromptProps {
  checkInterval?: number;
  forceUpdate?: boolean;
  storeUrl?: string;
  showVersionInfo?: boolean;
}

export const AppUpdatePrompt = ({
  checkInterval = 60,
  forceUpdate = false,
  storeUrl,
  showVersionInfo = false
}: AppUpdatePromptProps) => {
  const { version, checkForUpdates, openAppStore, getDeviceInfo } = useAppUpdates({
    checkInterval,
    forceUpdate,
    storeUrl
  });

  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const loadDeviceInfo = async () => {
      const info = await getDeviceInfo();
      setDeviceInfo(info);
    };
    loadDeviceInfo();
  }, [getDeviceInfo]);

  useEffect(() => {
    if (version.updateAvailable && !dismissed) {
      setShowUpdateDialog(true);
    }
  }, [version.updateAvailable, dismissed]);

  const handleUpdate = async () => {
    await openAppStore();
    setShowUpdateDialog(false);
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowUpdateDialog(false);
  };

  const handleCheckForUpdates = async () => {
    setDismissed(false);
    await checkForUpdates();
  };

  if (showVersionInfo) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            App Information
          </CardTitle>
          <CardDescription>
            Current version and update status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Current Version:</span>
            <Badge variant="outline">{version.current}</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Latest Version:</span>
            <Badge variant="outline">{version.latest}</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Update Available:</span>
            {version.updateAvailable ? (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Yes
              </Badge>
            ) : (
              <Badge variant="default" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Up to date
              </Badge>
            )}
          </div>

          {deviceInfo && (
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Platform:</span>
                <Badge variant="secondary">{deviceInfo.platform}</Badge>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-medium">OS Version:</span>
                <Badge variant="secondary">{deviceInfo.osVersion}</Badge>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button 
              onClick={handleCheckForUpdates}
              disabled={version.isLoading}
              className="flex-1"
            >
              {version.isLoading ? 'Checking...' : 'Check for Updates'}
            </Button>
            
            {version.updateAvailable && (
              <Button 
                onClick={handleUpdate}
                variant="default"
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Update
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <AlertDialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Update Available
          </AlertDialogTitle>
          <AlertDialogDescription>
            A new version of Aimstors Solution AI is available. 
            {forceUpdate 
              ? ' This update is required to continue using the app.' 
              : ' Update now to get the latest features and improvements.'
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Current:</span>
              <Badge variant="outline">{version.current}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Latest:</span>
              <Badge variant="default">{version.latest}</Badge>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          {!forceUpdate && (
            <AlertDialogCancel onClick={handleDismiss}>
              Later
            </AlertDialogCancel>
          )}
          <AlertDialogAction onClick={handleUpdate}>
            Update Now
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AppUpdatePrompt;