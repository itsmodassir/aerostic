
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera } from "lucide-react";

interface TechnicalSectionProps {
  lighting: string;
  setLighting: (value: string) => void;
  composition: string;
  setComposition: (value: string) => void;
  cameraAngle: string;
  setCameraAngle: (value: string) => void;
  details: string;
  setDetails: (value: string) => void;
  lightingOptions: Array<{ id: string; name: string }>;
  compositions: Array<{ id: string; name: string }>;
  cameraAngles: Array<{ id: string; name: string }>;
  detailLevels: Array<{ id: string; name: string }>;
}

const TechnicalSection = ({
  lighting,
  setLighting,
  composition,
  setComposition,
  cameraAngle,
  setCameraAngle,
  details,
  setDetails,
  lightingOptions,
  compositions,
  cameraAngles,
  detailLevels
}: TechnicalSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Technical & Camera Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-base font-medium">Lighting</Label>
            <Select value={lighting} onValueChange={setLighting}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {lightingOptions.map((lightingOption) => (
                  <SelectItem key={lightingOption.id} value={lightingOption.id}>
                    {lightingOption.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-base font-medium">Composition</Label>
            <Select value={composition} onValueChange={setComposition}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {compositions.map((compositionOption) => (
                  <SelectItem key={compositionOption.id} value={compositionOption.id}>
                    {compositionOption.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-base font-medium">Camera Angle</Label>
            <Select value={cameraAngle} onValueChange={setCameraAngle}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cameraAngles.map((angle) => (
                  <SelectItem key={angle.id} value={angle.id}>
                    {angle.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-base font-medium">Detail Level</Label>
            <Select value={details} onValueChange={setDetails}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {detailLevels.map((detailOption) => (
                  <SelectItem key={detailOption.id} value={detailOption.id}>
                    {detailOption.name}
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

export default TechnicalSection;
