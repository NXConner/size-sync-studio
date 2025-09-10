import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Scan, Brain, Zap, Eye } from "lucide-react";
import { useMeasurementHaptics } from "@/hooks/useHaptics";
import { useToast } from "@/hooks/use-toast";
import { opencvWorker } from "@/lib/opencvWorkerClient";
import { webGPUML } from "@/lib/webGPUML";

interface DetectionProps {
  autoDetect: boolean;
  setAutoDetect: (auto: boolean) => void;
  autoCapture: boolean;
  setAutoCapture: (capture: boolean) => void;
  minConfidence: number;
  setMinConfidence: (confidence: number) => void;
  detectionIntervalMs: number;
  setDetectionIntervalMs: (interval: number) => void;
  stabilitySeconds: number;
  setStabilitySeconds: (seconds: number) => void;
  stabilityLenTolInches: number;
  setStabilityLenTolInches: (tolerance: number) => void;
  stabilityGirthTolInches: number;
  setStabilityGirthTolInches: (tolerance: number) => void;
  autoCaptureCooldownSec: number;
  setAutoCaptureCooldownSec: (cooldown: number) => void;
  confidence: number;
  qualityScore: number;
  curvatureDeg: number;
  autoStatus: string;
  stabilityProgress: number;
  isDetecting: boolean;
  setIsDetecting: (detecting: boolean) => void;
  onDetection: (result: any) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  containerRef: React.RefObject<HTMLDivElement>;
}

export const MeasureDetection = ({
  autoDetect,
  setAutoDetect,
  autoCapture,
  setAutoCapture,
  minConfidence,
  setMinConfidence,
  detectionIntervalMs,
  setDetectionIntervalMs,
  stabilitySeconds,
  setStabilitySeconds,
  stabilityLenTolInches,
  setStabilityLenTolInches,
  stabilityGirthTolInches,
  setStabilityGirthTolInches,
  autoCaptureCooldownSec,
  setAutoCaptureCooldownSec,
  confidence,
  qualityScore,
  curvatureDeg,
  autoStatus,
  stabilityProgress,
  isDetecting,
  setIsDetecting,
  onDetection,
  videoRef,
  containerRef
}: DetectionProps) => {
  const { successHaptic, errorHaptic } = useMeasurementHaptics();
  const { toast } = useToast();
  // Detection worker reference for cleanup if needed

  const runDetection = useCallback(async (useWebGPU: boolean = true) => {
    if (isDetecting) return;
    
    setIsDetecting(true);
    successHaptic();

    try {
      const video = videoRef.current;
      const container = containerRef.current;
      
      if (!video || !container) {
        throw new Error("Video or container not available");
      }

      // Create canvas for frame capture
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Could not get canvas context');
      
      ctx.drawImage(video, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      let result;
      
      if (useWebGPU) {
        // Use WebGPU-accelerated detection
        result = await webGPUML.detectFromImageData(imageData, { onProgress });
      } else {
        // Fallback to OpenCV worker
        result = await opencvWorker.detect({
          width: imageData.width,
          height: imageData.height,
          imageData: imageData.data
        });
      }

      if (result && result.confidence >= minConfidence) {
        onDetection(result);
        toast({
          title: "Detection Complete",
          description: `Confidence: ${(result.confidence * 100).toFixed(1)}%`,
        });
      } else {
        throw new Error(`Low confidence: ${((result?.confidence || 0) * 100).toFixed(1)}%`);
      }
    } catch (error) {
      console.warn("Detection failed:", error);
      toast({
        variant: "destructive", 
        title: "Detection Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred"
      });
    }
  };
        onDetection(result);
        toast({
          title: "Detection Complete",
          description: `Confidence: ${(result.confidence * 100).toFixed(1)}%`
        });
      } else {
        throw new Error(`Low confidence: ${((result?.confidence || 0) * 100).toFixed(1)}%`);
      }

    } catch (error: any) {
      errorHaptic();
      toast({
        title: "Detection Failed",
        description: error.message || "Detection algorithm failed",
        variant: "destructive"
      });
    } finally {
      setIsDetecting(false);
    }
  }, [isDetecting, minConfidence, onDetection, videoRef, containerRef, successHaptic, errorHaptic, toast, setIsDetecting]);

  const runManualDetection = () => {
    void runDetection(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable': return 'success';
      case 'detecting': return 'default';
      case 'stabilizing': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          AI Detection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={runManualDetection}
            disabled={isDetecting}
            className="flex-1 hover-scale"
            variant="default"
          >
            {isDetecting ? (
              <>
                <Scan className="w-4 h-4 mr-2 animate-spin" />
                Detecting...
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Detect Now
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm">Confidence</span>
              <Badge variant={confidence >= minConfidence ? "default" : "destructive"}>
                {(confidence * 100).toFixed(1)}%
              </Badge>
            </div>
            <Progress value={confidence * 100} className="h-2" />
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm">Quality</span>
              <Badge variant={qualityScore >= 0.7 ? "default" : "secondary"}>
                {(qualityScore * 100).toFixed(1)}%
              </Badge>
            </div>
            <Progress value={qualityScore * 100} className="h-2" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Auto-detect</span>
            <Switch checked={autoDetect} onCheckedChange={setAutoDetect} />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Auto-capture</span>
            <Switch checked={autoCapture} onCheckedChange={setAutoCapture} />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Status</span>
            <Badge variant={getStatusColor(autoStatus) as any}>
              {autoStatus}
            </Badge>
          </div>

          {autoCapture && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm">Stability</span>
                <span className="text-xs">{stabilityProgress.toFixed(0)}%</span>
              </div>
              <Progress value={stabilityProgress} className="h-2" />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">
              Confidence threshold: {(minConfidence * 100).toFixed(0)}%
            </label>
            <Slider
              value={[minConfidence]}
              onValueChange={(v) => setMinConfidence(v[0])}
              min={0.3}
              max={0.95}
              step={0.05}
              className="mt-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Detection interval: {detectionIntervalMs}ms
            </label>
            <Slider
              value={[detectionIntervalMs]}
              onValueChange={(v) => setDetectionIntervalMs(v[0])}
              min={300}
              max={2000}
              step={100}
              className="mt-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Stability window: {stabilitySeconds.toFixed(1)}s
            </label>
            <Slider
              value={[stabilitySeconds]}
              onValueChange={(v) => setStabilitySeconds(v[0])}
              min={0.5}
              max={5}
              step={0.1}
              className="mt-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Length tolerance: ±{stabilityLenTolInches.toFixed(2)}"
            </label>
            <Slider
              value={[stabilityLenTolInches]}
              onValueChange={(v) => setStabilityLenTolInches(v[0])}
              min={0.01}
              max={0.5}
              step={0.01}
              className="mt-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Girth tolerance: ±{stabilityGirthTolInches.toFixed(2)}"
            </label>
            <Slider
              value={[stabilityGirthTolInches]}
              onValueChange={(v) => setStabilityGirthTolInches(v[0])}
              min={0.01}
              max={0.5}
              step={0.01}
              className="mt-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Auto-capture cooldown: {autoCaptureCooldownSec}s
            </label>
            <Slider
              value={[autoCaptureCooldownSec]}
              onValueChange={(v) => setAutoCaptureCooldownSec(v[0])}
              min={5}
              max={60}
              step={5}
              className="mt-2"
            />
          </div>
        </div>

        {Math.abs(curvatureDeg) > 2 && (
          <div className="p-3 bg-warning/20 rounded-lg animate-fade-in">
            <p className="text-sm text-warning-foreground">
              <Zap className="w-4 h-4 inline mr-2" />
              Curvature detected: {curvatureDeg.toFixed(1)}°
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};