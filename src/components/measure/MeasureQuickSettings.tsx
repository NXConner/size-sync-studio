import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface MeasureQuickSettingsProps {
  unit: 'in' | 'cm';
  setUnit: (unit: 'in' | 'cm') => void;
  mode: 'live' | 'upload';
  devices: MediaDeviceInfo[];
  deviceId: string;
  setDeviceId: (id: string) => void;
  resolution: { w: number; h: number };
  setResolution: (res: { w: number; h: number }) => void;
  targetFps: number;
  setTargetFps: (fps: number) => void;
  facingMode: 'environment' | 'user';
  setFacingMode: (mode: 'environment' | 'user') => void;
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  showScanSweep: boolean;
  setShowScanSweep: (show: boolean) => void;
  showPulsingHalos: boolean;
  setShowPulsingHalos: (show: boolean) => void;
  showStabilityRing: boolean;
  setShowStabilityRing: (show: boolean) => void;
  showHud: boolean;
  setShowHud: (show: boolean) => void;
  voiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
  autoDetect: boolean;
  setAutoDetect: (enabled: boolean) => void;
  autoCapture: boolean;
  setAutoCapture: (enabled: boolean) => void;
}

export function MeasureQuickSettings(props: MeasureQuickSettingsProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Unit Toggle */}
      <div className="flex gap-1">
        <Button
          size="sm"
          variant={props.unit === 'in' ? 'default' : 'outline'}
          onClick={() => props.setUnit('in')}
        >
          in
        </Button>
        <Button
          size="sm"
          variant={props.unit === 'cm' ? 'default' : 'outline'}
          onClick={() => props.setUnit('cm')}
        >
          cm
        </Button>
      </div>

      {/* Quick toggles */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground">Grid:</span>
        <Switch
          checked={props.showGrid}
          onCheckedChange={props.setShowGrid}
        />
      </div>

      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground">Voice:</span>
        <Switch
          checked={props.voiceEnabled}
          onCheckedChange={props.setVoiceEnabled}
        />
      </div>
    </div>
  );
}