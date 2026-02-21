
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Palette } from "lucide-react";

interface StyleSectionProps {
  style: string;
  setStyle: (value: string) => void;
  mood: string;
  setMood: (value: string) => void;
  styles: Array<{ id: string; name: string }>;
  moods: Array<{ id: string; name: string }>;
}

const StyleSection = ({ style, setStyle, mood, setMood, styles, moods }: StyleSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Style & Aesthetics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-base font-medium">Style</Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {styles.map((styleOption) => (
                  <SelectItem key={styleOption.id} value={styleOption.id}>
                    {styleOption.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-base font-medium">Mood</Label>
            <Select value={mood} onValueChange={setMood}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {moods.map((moodOption) => (
                  <SelectItem key={moodOption.id} value={moodOption.id}>
                    {moodOption.name}
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

export default StyleSection;
