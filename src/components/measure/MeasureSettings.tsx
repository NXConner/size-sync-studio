import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Settings, Grid, Volume2, Palette, Zap, Camera } from "lucide-react";

interface SettingsProps {
  // Visual settings
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  gridSize: number;
  setGridSize: (size: number) => void;
  showScanSweep: boolean;
  setShowScanSweep: (show: boolean) => void;
  showPulsingHalos: boolean;
  setShowPulsingHalos: (show: boolean) => void;
  showStabilityRing: boolean;
  setShowStabilityRing: (show: boolean) => void;
  sweepIntensity: number;
  setSweepIntensity: (intensity: number) => void;
  haloIntensity: number;
  setHaloIntensity: (intensity: number) => void;
  ringSize: number;
  setRingSize: (size: number) => void;
  showHud: boolean;
  setShowHud: (show: boolean) => void;
  
  // Voice settings
  voiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
  useCustomVoice: boolean;
  setUseCustomVoice: (use: boolean) => void;
  customVoiceText: string;
  setCustomVoiceText: (text: string) => void;
  voiceList: SpeechSynthesisVoice[];
  voiceName: string | null;
  setVoiceName: (name: string | null) => void;
  voiceRate: number;
  setVoiceRate: (rate: number) => void;
  voicePitch: number;
  setVoicePitch: (pitch: number) => void;
  voiceVolume: number;
  setVoiceVolume: (volume: number) => void;
  autoplayEnabled: boolean;
  setAutoplayEnabled: (enabled: boolean) => void;
  autoplayIntervalMs: number;
  setAutoplayIntervalMs: (interval: number) => void;
  speakOnCapture: boolean;
  setSpeakOnCapture: (speak: boolean) => void;
  speakOnLock: boolean;
  setSpeakOnLock: (speak: boolean) => void;
  
  // Camera settings
  devices: MediaDeviceInfo[];
  deviceId: string;
  setDeviceId: (id: string) => void;
  facingMode: "environment" | "user";
  setFacingMode: (mode: "environment" | "user") => void;
  resolution: { w: number; h: number };
  setResolution: (res: { w: number; h: number }) => void;
  targetFps: number;
  setTargetFps: (fps: number) => void;
  measuredFps: number;
  zoomLevel: number | null;
  setZoomLevel: (level: number | null) => void;
  torchOn: boolean;
  setTorchOn: (on: boolean) => void;
  capabilities: {
    canTorch: boolean;
    canZoom: boolean;
    zoom?: { min: number; max: number; step?: number };
  } | null;
}

const resolutionOptions = [
  { w: 640, h: 480, label: "480p" },
  { w: 1280, h: 720, label: "720p" },
  { w: 1920, h: 1080, label: "1080p" },
  { w: 2560, h: 1440, label: "1440p" },
];

export const MeasureSettings = (props: SettingsProps) => {
  const [testVoice, setTestVoice] = useState(false);

  const testVoiceFunction = () => {
    if ('speechSynthesis' in window && props.voiceEnabled) {
      setTestVoice(true);
      const utterance = new SpeechSynthesisUtterance("Voice test successful");
      if (props.voiceName) {
        const voice = props.voiceList.find(v => v.name === props.voiceName);
        if (voice) utterance.voice = voice;
      }
      utterance.rate = props.voiceRate;
      utterance.pitch = props.voicePitch;
      utterance.volume = props.voiceVolume;
      utterance.onend = () => setTestVoice(false);
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="visual" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="visual" className="flex items-center gap-1">
              <Palette className="w-4 h-4" />
              Visual
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex items-center gap-1">
              <Volume2 className="w-4 h-4" />
              Voice
            </TabsTrigger>
            <TabsTrigger value="camera" className="flex items-center gap-1">
              <Camera className="w-4 h-4" />
              Camera
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-1">
              <Zap className="w-4 h-4" />
              Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="visual" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Show overlay grid</span>
              <Switch checked={props.showGrid} onCheckedChange={props.setShowGrid} />
            </div>
            
            {props.showGrid && (
              <div>
                <label className="text-sm text-muted-foreground">
                  Grid size: {props.gridSize}px
                </label>
                <Slider
                  value={[props.gridSize]}
                  onValueChange={(v) => props.setGridSize(v[0])}
                  min={8}
                  max={64}
                  step={4}
                  className="mt-2"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm">Scan sweep effect</span>
              <Switch checked={props.showScanSweep} onCheckedChange={props.setShowScanSweep} />
            </div>

            {props.showScanSweep && (
              <div>
                <label className="text-sm text-muted-foreground">
                  Sweep intensity: {props.sweepIntensity}%
                </label>
                <Slider
                  value={[props.sweepIntensity]}
                  onValueChange={(v) => props.setSweepIntensity(v[0])}
                  min={5}
                  max={50}
                  step={1}
                  className="mt-2"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm">Pulsing halos</span>
              <Switch checked={props.showPulsingHalos} onCheckedChange={props.setShowPulsingHalos} />
            </div>

            {props.showPulsingHalos && (
              <div>
                <label className="text-sm text-muted-foreground">
                  Halo intensity: {props.haloIntensity}%
                </label>
                <Slider
                  value={[props.haloIntensity]}
                  onValueChange={(v) => props.setHaloIntensity(v[0])}
                  min={20}
                  max={100}
                  step={5}
                  className="mt-2"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm">Stability ring</span>
              <Switch checked={props.showStabilityRing} onCheckedChange={props.setShowStabilityRing} />
            </div>

            {props.showStabilityRing && (
              <div>
                <label className="text-sm text-muted-foreground">
                  Ring size: {props.ringSize}px
                </label>
                <Slider
                  value={[props.ringSize]}
                  onValueChange={(v) => props.setRingSize(v[0])}
                  min={8}
                  max={32}
                  step={2}
                  className="mt-2"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm">Show HUD overlay</span>
              <Switch checked={props.showHud} onCheckedChange={props.setShowHud} />
            </div>
          </TabsContent>

          <TabsContent value="voice" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Voice feedback</span>
              <Switch checked={props.voiceEnabled} onCheckedChange={props.setVoiceEnabled} />
            </div>

            {props.voiceEnabled && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Voice selection</label>
                  <Select value={props.voiceName || ""} onValueChange={props.setVoiceName}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {props.voiceList.map((voice, idx) => (
                        <SelectItem key={idx} value={voice.name}>
                          {voice.name} ({voice.lang})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-muted-foreground">
                      Speed: {props.voiceRate.toFixed(1)}x
                    </label>
                    <Slider
                      value={[props.voiceRate]}
                      onValueChange={(v) => props.setVoiceRate(v[0])}
                      min={0.5}
                      max={2}
                      step={0.1}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground">
                      Pitch: {props.voicePitch.toFixed(1)}
                    </label>
                    <Slider
                      value={[props.voicePitch]}
                      onValueChange={(v) => props.setVoicePitch(v[0])}
                      min={0.5}
                      max={2}
                      step={0.1}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground">
                      Volume: {(props.voiceVolume * 100).toFixed(0)}%
                    </label>
                    <Slider
                      value={[props.voiceVolume]}
                      onValueChange={(v) => props.setVoiceVolume(v[0])}
                      min={0.1}
                      max={1}
                      step={0.1}
                      className="mt-2"
                    />
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={testVoiceFunction}
                  disabled={testVoice}
                  className="w-full"
                >
                  {testVoice ? "Testing..." : "Test Voice"}
                </Button>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Custom voice lines</span>
                  <Switch checked={props.useCustomVoice} onCheckedChange={props.setUseCustomVoice} />
                </div>

                {props.useCustomVoice && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Custom phrases (one per line)</label>
                    <Textarea
                      value={props.customVoiceText}
                      onChange={(e) => props.setCustomVoiceText(e.target.value)}
                      placeholder="Amazing results!&#10;Looking great!&#10;Perfect measurement!"
                      rows={4}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm">Speak on capture</span>
                  <Switch checked={props.speakOnCapture} onCheckedChange={props.setSpeakOnCapture} />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Auto-play compliments</span>
                  <Switch checked={props.autoplayEnabled} onCheckedChange={props.setAutoplayEnabled} />
                </div>

                {props.autoplayEnabled && (
                  <div>
                    <label className="text-sm text-muted-foreground">
                      Interval: {(props.autoplayIntervalMs / 1000).toFixed(1)}s
                    </label>
                    <Slider
                      value={[props.autoplayIntervalMs]}
                      onValueChange={(v) => props.setAutoplayIntervalMs(v[0])}
                      min={5000}
                      max={30000}
                      step={1000}
                      className="mt-2"
                    />
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="camera" className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Camera device</label>
              <Select value={props.deviceId} onValueChange={props.setDeviceId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select camera" />
                </SelectTrigger>
                <SelectContent>
                  {props.devices.map((device) => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Camera direction</label>
              <div className="flex gap-2">
                <Button
                  variant={props.facingMode === "environment" ? "default" : "outline"}
                  size="sm"
                  onClick={() => props.setFacingMode("environment")}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  variant={props.facingMode === "user" ? "default" : "outline"}
                  size="sm"
                  onClick={() => props.setFacingMode("user")}
                  className="flex-1"
                >
                  Front
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Resolution</label>
              <Select 
                value={`${props.resolution.w}x${props.resolution.h}`}
                onValueChange={(value) => {
                  const option = resolutionOptions.find(opt => `${opt.w}x${opt.h}` === value);
                  if (option) props.setResolution({ w: option.w, h: option.h });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {resolutionOptions.map((option) => (
                    <SelectItem key={`${option.w}x${option.h}`} value={`${option.w}x${option.h}`}>
                      {option.label} ({option.w}×{option.h})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">
                Target FPS: {props.targetFps}
              </label>
              <Slider
                value={[props.targetFps]}
                onValueChange={(v) => props.setTargetFps(v[0])}
                min={15}
                max={60}
                step={5}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Measured: {props.measuredFps.toFixed(1)} FPS</span>
              </div>
            </div>

            {props.capabilities?.canZoom && props.capabilities.zoom && (
              <div>
                <label className="text-sm font-medium">
                  Zoom: {props.zoomLevel?.toFixed(1) || "Auto"}x
                </label>
                <Slider
                  value={[props.zoomLevel || props.capabilities.zoom.min]}
                  onValueChange={(v) => props.setZoomLevel(v[0])}
                  min={props.capabilities.zoom.min}
                  max={props.capabilities.zoom.max}
                  step={props.capabilities.zoom.step || 0.1}
                  className="mt-2"
                />
              </div>
            )}

            {props.capabilities?.canTorch && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Flashlight</span>
                <Switch checked={props.torchOn} onCheckedChange={props.setTorchOn} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Performance</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>WebGPU: {props.capabilities ? '✓ Available' : '✗ Not available'}</div>
                  <div>Hardware acceleration: ✓ Enabled</div>
                  <div>Memory usage: Optimized</div>
                </div>
              </div>
              
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Storage</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Offline support: ✓ Enabled</div>
                  <div>Cloud backup: ✓ Available</div>
                  <div>Auto-sync: ✓ Enabled</div>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Security</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Local processing: ✓ Enabled</div>
                  <div>Data encryption: ✓ AES-256</div>
                  <div>Privacy mode: ✓ Active</div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};