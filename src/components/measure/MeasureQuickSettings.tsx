import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Grid3X3, 
  Target, 
  Volume2, 
  Camera, 
  Flashlight,
  Eye
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface QuickSettingsProps {
  gridEnabled: boolean;
  onGridToggle: (enabled: boolean) => void;
  crosshairsEnabled: boolean;
  onCrosshairsToggle: (enabled: boolean) => void;
  voiceEnabled: boolean;
  onVoiceToggle: (enabled: boolean) => void;
  flashEnabled: boolean;
  onFlashToggle: (enabled: boolean) => void;
  zoomLevel: number;
  onZoomChange: (zoom: number) => void;
  canZoom?: boolean;
  canFlash?: boolean;
  detectionEnabled: boolean;
  onDetectionToggle: (enabled: boolean) => void;
}

export function MeasureQuickSettings({
  gridEnabled,
  onGridToggle,
  crosshairsEnabled,
  onCrosshairsToggle,
  voiceEnabled,
  onVoiceToggle,
  flashEnabled,
  onFlashToggle,
  zoomLevel,
  onZoomChange,
  canZoom = false,
  canFlash = false,
  detectionEnabled,
  onDetectionToggle
}: QuickSettingsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="gradient-card shadow-card">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer pb-2">
            <CardTitle className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Quick Settings
              </div>
              <div className="flex items-center gap-1">
                {gridEnabled && <Badge variant="outline" className="text-xs">Grid</Badge>}
                {crosshairsEnabled && <Badge variant="outline" className="text-xs">Cross</Badge>}
                {voiceEnabled && <Badge variant="outline" className="text-xs">Voice</Badge>}
                {flashEnabled && <Badge variant="outline" className="text-xs">Flash</Badge>}
                {detectionEnabled && <Badge variant="outline" className="text-xs">AI</Badge>}
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-3 pt-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Grid3X3 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Grid Overlay</span>
              </div>
              <Switch
                checked={gridEnabled}
                onCheckedChange={onGridToggle}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Crosshairs</span>
              </div>
              <Switch
                checked={crosshairsEnabled}
                onCheckedChange={onCrosshairsToggle}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">AI Detection</span>
              </div>
              <Switch
                checked={detectionEnabled}
                onCheckedChange={onDetectionToggle}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Voice Feedback</span>
              </div>
              <Switch
                checked={voiceEnabled}
                onCheckedChange={onVoiceToggle}
              />
            </div>

            {canFlash && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flashlight className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Flash/Torch</span>
                </div>
                <Switch
                  checked={flashEnabled}
                  onCheckedChange={onFlashToggle}
                />
              </div>
            )}

            {canZoom && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Zoom</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {zoomLevel.toFixed(1)}x
                  </Badge>
                </div>
                <Slider
                  value={[zoomLevel]}
                  onValueChange={([value]) => onZoomChange(value)}
                  min={1}
                  max={5}
                  step={0.1}
                  className="w-full"
                />
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}