import { useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, Zap, Target } from "lucide-react";
import { useMeasurementHaptics } from "@/hooks/useHaptics";
import { useToast } from "@/hooks/use-toast";

interface AutomationProps {
  autoDetect: boolean;
  autoCapture: boolean;
  stabilitySeconds: number;
  stabilityLenTolInches: number;
  stabilityGirthTolInches: number;
  autoCaptureCooldownSec: number;
  detectionIntervalMs: number;
  minConfidence: number;
  autoStatus: string;
  setAutoStatus: (status: string) => void;
  stabilityProgress: number;
  setStabilityProgress: (progress: number) => void;
  onDetection: () => Promise<void>;
  onCapture: () => Promise<void>;
  lengthDisplay: string;
  girthDisplay: string;
  confidence: number;
}

interface MeasurementHistory {
  timestamp: number;
  length: number;
  girth: number;
  confidence: number;
}

export const MeasureAutomation = ({
  autoDetect,
  autoCapture,
  stabilitySeconds,
  stabilityLenTolInches,
  stabilityGirthTolInches,
  autoCaptureCooldownSec,
  detectionIntervalMs,
  minConfidence,
  autoStatus,
  setAutoStatus,
  stabilityProgress,
  setStabilityProgress,
  onDetection,
  onCapture,
  lengthDisplay,
  girthDisplay,
  confidence
}: AutomationProps) => {
  const { successHaptic, errorHaptic, warningHaptic } = useMeasurementHaptics();
  const { toast } = useToast();
  
  const autoDetectRafRef = useRef<number | null>(null);
  const lastDetectTsRef = useRef<number>(0);
  const lastAutoCaptureTsRef = useRef<number>(0);
  const stabilityHistoryRef = useRef<MeasurementHistory[]>([]);
  const stableStartTsRef = useRef<number | null>(null);
  const automationStateRef = useRef({ 
    isRunning: false, 
    isPaused: false,
    detectionCount: 0,
    successfulCaptures: 0 
  });

  const addMeasurementToHistory = useCallback((length: number, girth: number, confidence: number) => {
    const measurement: MeasurementHistory = {
      timestamp: Date.now(),
      length,
      girth,
      confidence
    };
    
    stabilityHistoryRef.current.push(measurement);
    
    // Keep only measurements within the stability window
    const cutoffTime = Date.now() - stabilitySeconds * 1000;
    stabilityHistoryRef.current = stabilityHistoryRef.current.filter(
      m => m.timestamp > cutoffTime
    );
  }, [stabilitySeconds]);

  const isStable = useCallback(() => {
    const history = stabilityHistoryRef.current;
    if (history.length < 3) return false;
    
    // Check if we have enough measurements within the stability window
    const requiredMeasurements = Math.max(3, Math.floor(stabilitySeconds * 2));
    if (history.length < requiredMeasurements) return false;
    
    // Calculate variance in recent measurements
    const recentMeasurements = history.slice(-requiredMeasurements);
    
    const avgLength = recentMeasurements.reduce((sum, m) => sum + m.length, 0) / recentMeasurements.length;
    const avgGirth = recentMeasurements.reduce((sum, m) => sum + m.girth, 0) / recentMeasurements.length;
    
    // Check if all recent measurements are within tolerance
    return recentMeasurements.every(m => {
      const lengthDiff = Math.abs(m.length - avgLength);
      const girthDiff = Math.abs(m.girth - avgGirth);
      return lengthDiff <= stabilityLenTolInches && girthDiff <= stabilityGirthTolInches;
    });
  }, [stabilitySeconds, stabilityLenTolInches, stabilityGirthTolInches]);

  const updateStabilityProgress = useCallback(() => {
    if (!autoCapture) {
      setStabilityProgress(0);
      stableStartTsRef.current = null;
      return;
    }

    const stable = isStable();
    const now = Date.now();
    
    if (stable) {
      if (!stableStartTsRef.current) {
        stableStartTsRef.current = now;
        setAutoStatus("stabilizing");
        warningHaptic();
      }
      
      const stableDuration = (now - stableStartTsRef.current) / 1000;
      const progress = Math.min(100, (stableDuration / stabilitySeconds) * 100);
      setStabilityProgress(progress);
      
      if (stableDuration >= stabilitySeconds) {
        setAutoStatus("stable");
        return true; // Ready for capture
      }
    } else {
      stableStartTsRef.current = null;
      setStabilityProgress(0);
      if (automationStateRef.current.isRunning) {
        setAutoStatus("detecting");
      }
    }
    
    return false;
  }, [autoCapture, isStable, stabilitySeconds, setStabilityProgress, setAutoStatus, warningHaptic]);

  const runAutomation = useCallback(async () => {
    if (!automationStateRef.current.isRunning || automationStateRef.current.isPaused) return;
    
    const now = Date.now();
    
    // Check if enough time has passed for next detection
    if (now - lastDetectTsRef.current < detectionIntervalMs) {
      autoDetectRafRef.current = requestAnimationFrame(runAutomation);
      return;
    }
    
    try {
      // Run detection
      await onDetection();
      automationStateRef.current.detectionCount++;
      lastDetectTsRef.current = now;
      
      // Add current measurement to history if we have valid data
      if (confidence >= minConfidence) {
        const currentLength = parseFloat(lengthDisplay) || 0;
        const currentGirth = parseFloat(girthDisplay) || 0;
        addMeasurementToHistory(currentLength, currentGirth, confidence);
        
        // Check for stability and auto-capture
        if (autoCapture) {
          const readyForCapture = updateStabilityProgress();
          
          if (readyForCapture && now - lastAutoCaptureTsRef.current > autoCaptureCooldownSec * 1000) {
            try {
              await onCapture();
              automationStateRef.current.successfulCaptures++;
              lastAutoCaptureTsRef.current = now;
              setAutoStatus("captured");
              successHaptic();
              
              toast({
                title: "Auto-capture Complete!",
                description: `Measurement saved (${automationStateRef.current.successfulCaptures} total)`
              });
              
              // Reset stability tracking
              stableStartTsRef.current = null;
              setStabilityProgress(0);
              stabilityHistoryRef.current = [];
              
            } catch (error) {
              errorHaptic();
              setAutoStatus("error");
            }
          }
        }
      } else {
        setAutoStatus("low confidence");
      }
      
    } catch (error) {
      console.warn("Auto-detection failed:", error);
      setAutoStatus("detection failed");
    }
    
    // Schedule next iteration
    autoDetectRafRef.current = requestAnimationFrame(runAutomation);
  }, [
    onDetection, onCapture, detectionIntervalMs, minConfidence, 
    autoCapture, autoCaptureCooldownSec, lengthDisplay, girthDisplay,
    confidence, addMeasurementToHistory, updateStabilityProgress,
    successHaptic, errorHaptic, toast, setAutoStatus, setStabilityProgress
  ]);

  const startAutomation = useCallback(() => {
    automationStateRef.current.isRunning = true;
    automationStateRef.current.isPaused = false;
    setAutoStatus("starting");
    successHaptic();
    runAutomation();
  }, [runAutomation, setAutoStatus, successHaptic]);

  const stopAutomation = useCallback(() => {
    automationStateRef.current.isRunning = false;
    automationStateRef.current.isPaused = false;
    if (autoDetectRafRef.current) {
      cancelAnimationFrame(autoDetectRafRef.current);
      autoDetectRafRef.current = null;
    }
    setAutoStatus("stopped");
    setStabilityProgress(0);
    stableStartTsRef.current = null;
    errorHaptic();
  }, [setAutoStatus, setStabilityProgress, errorHaptic]);

  const pauseAutomation = useCallback(() => {
    automationStateRef.current.isPaused = !automationStateRef.current.isPaused;
    if (automationStateRef.current.isPaused) {
      setAutoStatus("paused");
      warningHaptic();
    } else {
      setAutoStatus("resuming");
      runAutomation();
    }
  }, [setAutoStatus, warningHaptic, runAutomation]);

  const resetStats = useCallback(() => {
    automationStateRef.current.detectionCount = 0;
    automationStateRef.current.successfulCaptures = 0;
    stabilityHistoryRef.current = [];
    stableStartTsRef.current = null;
    setStabilityProgress(0);
    warningHaptic();
  }, [setStabilityProgress, warningHaptic]);

  // Auto-start when enabled
  useEffect(() => {
    if (autoDetect && !automationStateRef.current.isRunning) {
      startAutomation();
    } else if (!autoDetect && automationStateRef.current.isRunning) {
      stopAutomation();
    }
  }, [autoDetect, startAutomation, stopAutomation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoDetectRafRef.current) {
        cancelAnimationFrame(autoDetectRafRef.current);
      }
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable':
      case 'captured':
        return 'success';
      case 'detecting':
      case 'starting':
      case 'resuming':
        return 'default';
      case 'stabilizing':
      case 'paused':
        return 'secondary';
      case 'error':
      case 'detection failed':
      case 'low confidence':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Automation Control
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={automationStateRef.current.isRunning ? stopAutomation : startAutomation}
            variant={automationStateRef.current.isRunning ? "destructive" : "default"}
            className="flex-1 hover-scale"
          >
            {automationStateRef.current.isRunning ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start
              </>
            )}
          </Button>
          
          {automationStateRef.current.isRunning && (
            <Button
              onClick={pauseAutomation}
              variant="outline"
              size="sm"
            >
              {automationStateRef.current.isPaused ? "Resume" : "Pause"}
            </Button>
          )}
          
          <Button
            onClick={resetStats}
            variant="outline"
            size="sm"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {automationStateRef.current.detectionCount}
            </div>
            <div className="text-sm text-muted-foreground">Detections</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {automationStateRef.current.successfulCaptures}
            </div>
            <div className="text-sm text-muted-foreground">Captures</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Status</span>
            <Badge variant={getStatusColor(autoStatus) as any}>
              {autoStatus}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Confidence</span>
            <Badge variant={confidence >= minConfidence ? "default" : "destructive"}>
              {(confidence * 100).toFixed(1)}%
            </Badge>
          </div>
        </div>

        {autoCapture && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Stability</span>
              <span className="text-xs">{stabilityProgress.toFixed(0)}%</span>
            </div>
            <Progress value={stabilityProgress} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {stabilityHistoryRef.current.length} measurements in buffer
            </div>
          </div>
        )}

        <div className="p-3 bg-muted/20 rounded-lg space-y-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            <span className="text-sm font-medium">Quick Stats</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>Interval: {detectionIntervalMs}ms</div>
            <div>Min confidence: {(minConfidence * 100).toFixed(0)}%</div>
            <div>Stability window: {stabilitySeconds}s</div>
            <div>Cooldown: {autoCaptureCooldownSec}s</div>
          </div>
        </div>

        {automationStateRef.current.isRunning && (
          <div className="text-xs text-muted-foreground text-center animate-pulse">
            Automation running...
          </div>
        )}
      </CardContent>
    </Card>
  );
};
