
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";

interface EnvironmentSectionProps {
  environment: string;
  setEnvironment: (value: string) => void;
  timeOfDay: string;
  setTimeOfDay: (value: string) => void;
  weather: string;
  setWeather: (value: string) => void;
  environments: Array<{ id: string; name: string }>;
  timeOptions: Array<{ id: string; name: string }>;
  weatherOptions: Array<{ id: string; name: string }>;
}

const EnvironmentSection = ({
  environment,
  setEnvironment,
  timeOfDay,
  setTimeOfDay,
  weather,
  setWeather,
  environments,
  timeOptions,
  weatherOptions
}: EnvironmentSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Environment & Atmosphere
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-base font-medium">Environment</Label>
          <Select value={environment} onValueChange={setEnvironment}>
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {environments.map((env) => (
                <SelectItem key={env.id} value={env.id}>
                  {env.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-base font-medium">Time of Day</Label>
            <Select value={timeOfDay} onValueChange={setTimeOfDay}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((time) => (
                  <SelectItem key={time.id} value={time.id}>
                    {time.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-base font-medium">Weather</Label>
            <Select value={weather} onValueChange={setWeather}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {weatherOptions.map((weatherOption) => (
                  <SelectItem key={weatherOption.id} value={weatherOption.id}>
                    {weatherOption.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnvironmentSection;
