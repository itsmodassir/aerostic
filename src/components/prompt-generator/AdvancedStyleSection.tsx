
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brush } from "lucide-react";

interface AdvancedStyleSectionProps {
  artMovement: string;
  setArtMovement: (value: string) => void;
  colorPalette: string;
  setColorPalette: (value: string) => void;
  textures: string;
  setTextures: (value: string) => void;
  artMovements: Array<{ id: string; name: string }>;
  colorPalettes: Array<{ id: string; name: string }>;
  textureOptions: Array<{ id: string; name: string }>;
}

const AdvancedStyleSection = ({
  artMovement,
  setArtMovement,
  colorPalette,
  setColorPalette,
  textures,
  setTextures,
  artMovements,
  colorPalettes,
  textureOptions
}: AdvancedStyleSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brush className="h-5 w-5" />
          Advanced Styling
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label className="text-base font-medium">Art Movement/Style</Label>
            <Select value={artMovement} onValueChange={setArtMovement}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {artMovements.map((movement) => (
                  <SelectItem key={movement.id} value={movement.id}>
                    {movement.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-base font-medium">Color Palette</Label>
              <Select value={colorPalette} onValueChange={setColorPalette}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colorPalettes.map((palette) => (
                    <SelectItem key={palette.id} value={palette.id}>
                      {palette.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-base font-medium">Textures</Label>
              <Select value={textures} onValueChange={setTextures}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {textureOptions.map((texture) => (
                    <SelectItem key={texture.id} value={texture.id}>
                      {texture.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedStyleSection;
