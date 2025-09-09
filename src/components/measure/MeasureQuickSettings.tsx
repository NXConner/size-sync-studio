import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { 
  Settings, 
  Camera, 
  Grid3X3, 
  Volume2, 
  VolumeX, 
  Ruler, 
  Zap,
  Eye,
  Video,
  Check
} from 'lucide-react';

interface MeasureQuickSettingsProps {
  // Unit settings
  unit: 'in' | 'cm';
  setUnit: (unit: 'in' | 'cm') => void;
  
  // Camera settings (live mode only)
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
  
  // Visual settings
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
  
  // Voice settings
  voiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
  
  // Auto features
  autoDetect: boolean;
  setAutoDetect: (enabled: boolean) => void;
  autoCapture: boolean;
  setAutoCapture: (enabled: boolean) => void;
}

const resolutionOptions = [
  { w: 640, h: 480, label: '480p' },
  { w: 1280, h: 720, label: '720p' },
  { w: 1920, h: 1080, label: '1080p' },
  { w: 2560, h: 1440, label: '1440p' },
];

const fpsOptions = [15, 24, 30, 60];

export function MeasureQuickSettings(props: MeasureQuickSettingsProps) {
  const currentResolution = resolutionOptions.find(
    r => r.w === props.resolution.w && r.h === props.resolution.h
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Quick Settings
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 bg-background/95 backdrop-blur-sm border shadow-lg z-50">
        {/* Units */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-2">
            <Ruler className="w-4 h-4" />
            Measurement Unit
          </DropdownMenuLabel>
          <div className="px-2 py-1">
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={props.unit === 'in' ? 'default' : 'outline'}
                onClick={() => props.setUnit('in')}
                className="flex-1"
              >
                Inches
              </Button>
              <Button
                size="sm"
                variant={props.unit === 'cm' ? 'default' : 'outline'}
                onClick={() => props.setUnit('cm')}
                className="flex-1"
              >
                Centimeters
              </Button>
            </div>
          </div>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Camera Settings (Live Mode Only) */}
        {props.mode === 'live' && (
          <>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Camera Settings
              </DropdownMenuLabel>
              
              {/* Camera Device */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Video className="w-4 h-4" />
                  Camera Device
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="bg-background/95 backdrop-blur-sm">
                    {props.devices.map((device) => (
                      <DropdownMenuItem
                        key={device.deviceId}
                        onClick={() => props.setDeviceId(device.deviceId)}
                        className="flex items-center justify-between"
                      >
                        <span className="truncate">
                          {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                        </span>
                        {props.deviceId === device.deviceId && (
                          <Check className="w-4 h-4" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              {/* Resolution */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Eye className="w-4 h-4" />
                  Resolution ({currentResolution?.label || 'Custom'})
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="bg-background/95 backdrop-blur-sm">
                    {resolutionOptions.map((option) => (
                      <DropdownMenuItem
                        key={`${option.w}x${option.h}`}
                        onClick={() => props.setResolution({ w: option.w, h: option.h })}
                        className="flex items-center justify-between"
                      >
                        <span>{option.label} ({option.w}×{option.h})</span>
                        {props.resolution.w === option.w && props.resolution.h === option.h && (
                          <Check className="w-4 h-4" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              {/* FPS */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Zap className="w-4 h-4" />
                  Frame Rate ({props.targetFps} FPS)
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="bg-background/95 backdrop-blur-sm">
                    {fpsOptions.map((fps) => (
                      <DropdownMenuItem
                        key={fps}
                        onClick={() => props.setTargetFps(fps)}
                        className="flex items-center justify-between"
                      >
                        <span>{fps} FPS</span>
                        {props.targetFps === fps && (
                          <Check className="w-4 h-4" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              {/* Camera Direction */}
              <div className="px-2 py-1">
                <div className="text-sm text-muted-foreground mb-2">Camera Direction</div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant={props.facingMode === 'environment' ? 'default' : 'outline'}
                    onClick={() => props.setFacingMode('environment')}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    size="sm"
                    variant={props.facingMode === 'user' ? 'default' : 'outline'}
                    onClick={() => props.setFacingMode('user')}
                    className="flex-1"
                  >
                    Front
                  </Button>
                </div>
              </div>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />
          </>
        )}

        {/* Visual Effects */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Visual Effects
          </DropdownMenuLabel>
          
          <DropdownMenuItem className="flex items-center justify-between" onSelect={(e) => e.preventDefault()}>
            <div className="flex items-center gap-2">
              <Grid3X3 className="w-4 h-4" />
              <span>Grid Overlay</span>
            </div>
            <Switch
              checked={props.showGrid}
              onCheckedChange={props.setShowGrid}
            />
          </DropdownMenuItem>

          <DropdownMenuItem className="flex items-center justify-between" onSelect={(e) => e.preventDefault()}>
            <span>Scan Sweep</span>
            <Switch
              checked={props.showScanSweep}
              onCheckedChange={props.setShowScanSweep}
            />
          </DropdownMenuItem>

          <DropdownMenuItem className="flex items-center justify-between" onSelect={(e) => e.preventDefault()}>
            <span>Pulsing Halos</span>
            <Switch
              checked={props.showPulsingHalos}
              onCheckedChange={props.setShowPulsingHalos}
            />
          </DropdownMenuItem>

          <DropdownMenuItem className="flex items-center justify-between" onSelect={(e) => e.preventDefault()}>
            <span>Stability Ring</span>
            <Switch
              checked={props.showStabilityRing}
              onCheckedChange={props.setShowStabilityRing}
            />
          </DropdownMenuItem>

          <DropdownMenuItem className="flex items-center justify-between" onSelect={(e) => e.preventDefault()}>
            <span>HUD Display</span>
            <Switch
              checked={props.showHud}
              onCheckedChange={props.setShowHud}
            />
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Voice & Auto Features */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Smart Features
          </DropdownMenuLabel>

          <DropdownMenuItem className="flex items-center justify-between" onSelect={(e) => e.preventDefault()}>
            <div className="flex items-center gap-2">
              {props.voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>Voice Feedback</span>
            </div>
            <Switch
              checked={props.voiceEnabled}
              onCheckedChange={props.setVoiceEnabled}
            />
          </DropdownMenuItem>

          <DropdownMenuItem className="flex items-center justify-between" onSelect={(e) => e.preventDefault()}>
            <span>Auto Detect</span>
            <Switch
              checked={props.autoDetect}
              onCheckedChange={props.setAutoDetect}
            />
          </DropdownMenuItem>

          <DropdownMenuItem className="flex items-center justify-between" onSelect={(e) => e.preventDefault()}>
            <span>Auto Capture</span>
            <Switch
              checked={props.autoCapture}
              onCheckedChange={props.setAutoCapture}
            />
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}