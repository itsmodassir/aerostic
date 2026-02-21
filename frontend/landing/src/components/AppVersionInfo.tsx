import { AppUpdatePrompt } from '@/components/AppUpdatePrompt';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Info } from 'lucide-react';

export const AppVersionInfo = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          App Settings
        </CardTitle>
        <CardDescription>
          Manage your app version and updates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
            <Info className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">About Updates</p>
              <p>
                The app automatically checks for updates every 30 minutes. 
                You can also manually check for updates using the button below.
              </p>
            </div>
          </div>
          
          <AppUpdatePrompt showVersionInfo={true} checkInterval={30} />
        </div>
      </CardContent>
    </Card>
  );
};

export default AppVersionInfo;