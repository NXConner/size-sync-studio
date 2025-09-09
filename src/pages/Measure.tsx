import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Ruler, Camera as CameraIcon, RefreshCw, Image as ImageIcon, Download, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Copy as CopyIcon, HelpCircle } from "lucide-react";
import { Measurement } from "@/types";
import { saveMeasurement, savePhoto, getMeasurements, getPhoto } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { CalibrationCard } from "@/components/measure/CalibrationCard";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { loadOpenCV } from "@/utils/opencv";
import {
  startCamera,
  stopStream,
  enumerateVideoDevices,
  applyZoom as applyZoomTrack,
  setTorch as setTorchTrack,
  applyFrameRate as applyFrameRateTrack,
  measureVideoFps,
} from "@/utils/camera";
import { getVoiceEnabled, setVoiceEnabled, playHumDetect, playCompliment, getUseCustomVoiceLines, setUseCustomVoiceLines, getCustomVoiceLines, setCustomVoiceLines, playCustomLine, getVoicesAsync, getVoiceName, setVoiceName, getVoiceRate, setVoiceRate, getVoicePitch, setVoicePitch, getVoiceVolume, setVoiceVolume, getAutoplayEnabled, setAutoplayEnabled, getAutoplayIntervalMs, setAutoplayIntervalMs, getSpeakOnCapture, setSpeakOnCapture, getSpeakOnLock, setSpeakOnLock, playComplimentWithContext, stopSpeaking } from "@/utils/audio";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { opencvWorker } from "@/lib/opencvWorkerClient";
import { segWorker } from "@/lib/segWorkerClient";

// Helper: convert cm <-> inches
const cmToIn = (cm: number) => cm / 2.54;
const inToCm = (inch: number) => inch * 2.54;

export default function Measure() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const overlayExportRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [unit, setUnit] = useState<"in" | "cm">("in");
  const [pixelsPerInch, setPixelsPerInch] = useState<number>(96); // default guess
  const [calibrationInches, setCalibrationInches] = useState<number>(1);
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [calibStart, setCalibStart] = useState<{ x: number; y: number } | null>(null);
  const [calibEnd, setCalibEnd] = useState<{ x: number; y: number } | null>(null);
  const [basePoint, setBasePoint] = useState<{ x: number; y: number } | null>(null);
  const [tipPoint, setTipPoint] = useState<{ x: number; y: number } | null>(null);
  const [girthPixels, setGirthPixels] = useState<number>(0);
  const [lengthDisplay, setLengthDisplay] = useState<string>("0.0");
  const [girthDisplay, setGirthDisplay] = useState<string>("0.0");
  const { toast } = useToast();
  const [prevPhotos, setPrevPhotos] = useState<Measurement[]>([]);
  const [selectedPrevId, setSelectedPrevId] = useState<string>("");
  const [prevOverlayUrl, setPrevOverlayUrl] = useState<string>("");
  const [overlayOpacity, setOverlayOpacity] = useState<number>(30); // percent
  const [showPrevOverlay, setShowPrevOverlay] = useState<boolean>(false);
  const [mode, setMode] = useState<"live" | "upload">("live");
  const [uploadedUrl, setUploadedUrl] = useState<string>("");
  const [uploadedBlob, setUploadedBlob] = useState<Blob | null>(null);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [voiceEnabled, setVoiceEnabledState] = useState<boolean>(getVoiceEnabled());
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [gridSize, setGridSize] = useState<number>(24);
  // Visual aids settings
  const [showScanSweep, setShowScanSweep] = useState<boolean>(true);
  const [showPulsingHalos, setShowPulsingHalos] = useState<boolean>(true);
  const [showStabilityRing, setShowStabilityRing] = useState<boolean>(true);
  const [sweepIntensity, setSweepIntensity] = useState<number>(15); // 0-30 alpha%
  const [haloIntensity, setHaloIntensity] = useState<number>(60); // 0-100
  const [ringSize, setRingSize] = useState<number>(16); // px radius
  const [dragging, setDragging] = useState<null | { type: "base" | "tip" | "calibStart" | "calibEnd" }>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [isFrozen, setIsFrozen] = useState<boolean>(false);
  const [frozenUrl, setFrozenUrl] = useState<string>("");
  const [autoDetect, setAutoDetect] = useState<boolean>(false);
  const [autoCapture, setAutoCapture] = useState<boolean>(false);
  const [stabilitySeconds, setStabilitySeconds] = useState<number>(1.5);
  const [stabilityLenTolInches, setStabilityLenTolInches] = useState<number>(0.05);
  const [stabilityGirthTolInches, setStabilityGirthTolInches] = useState<number>(0.1);
  const [autoCaptureCooldownSec, setAutoCaptureCooldownSec] = useState<number>(10);
  const [showMask, setShowMask] = useState<boolean>(false);
  const [maskUrl, setMaskUrl] = useState<string>("");
  const [maskGeom, setMaskGeom] = useState<{ offsetX: number; offsetY: number; drawW: number; drawH: number } | null>(null);
  const [maskOpacity, setMaskOpacity] = useState<number>(35);
  const [useMlSegmentation, setUseMlSegmentation] = useState<boolean>(false);
  const autoDetectRafRef = useRef<number | null>(null);
  const lastDetectTsRef = useRef<number>(0);
  const lastAutoCaptureTsRef = useRef<number>(0);
  const stabilityHistoryRef = useRef<Array<{ ts: number; len: number; girth: number }>>([]);
  const [autoStatus, setAutoStatus] = useState<string>("idle");
  const [detectionIntervalMs, setDetectionIntervalMs] = useState<number>(800);
  const [selectedHandle, setSelectedHandle] = useState<null | "base" | "tip">(null);
  const [nudgeStep, setNudgeStep] = useState<number>(1);
  const [isAutoCalibrating, setIsAutoCalibrating] = useState<boolean>(false);
  const [confidence, setConfidence] = useState<number>(0);
  const [qualityScore, setQualityScore] = useState<number>(0);
  const [curvatureDeg, setCurvatureDeg] = useState<number>(0);
  const confidenceRef = useRef<number>(0);
  const [minConfidence, setMinConfidence] = useState<number>(0.6);
  const [showHud, setShowHud] = useState<boolean>(true);
  const [stabilityProgress, setStabilityProgress] = useState<number>(0);
  const stabilityProgressRef = useRef<number>(0);
  const stableStartTsRef = useRef<number | null>(null);
  const [qualityDetail, setQualityDetail] = useState<{
    brightness: number;
    blurVar: number;
    sizeFraction: number;
    edgeProximity: number;
  } | null>(null);
  // Quality threshold controls (persisted via refs to avoid frequent deps)
  const minBrightnessRef = useRef<number>(70);
  const maxBrightnessRef = useRef<number>(210);
  const minBlurVarRef = useRef<number>(60);
  const minSizeFractionRef = useRef<number>(0.08);
  const maxSizeFractionRef = useRef<number>(0.45);
  const maxEdgeProximityRef = useRef<number>(0.2);
  const [snapEnabled, setSnapEnabled] = useState<boolean>(true);
  const [snapRadiusPx, setSnapRadiusPx] = useState<number>(18);
  const [retakeSuggested, setRetakeSuggested] = useState<boolean>(false);
  // Voice customization
  const [useCustomVoice, setUseCustomVoice] = useState<boolean>(getUseCustomVoiceLines());
  const [customVoiceText, setCustomVoiceText] = useState<string>(getCustomVoiceLines().join("\n"));
  const [voiceList, setVoiceList] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceName, setVoiceNameState] = useState<string | null>(getVoiceName());
  const [voiceRate, setVoiceRateState] = useState<number>(getVoiceRate());
  const [voicePitch, setVoicePitchState] = useState<number>(getVoicePitch());
  const [voiceVolume, setVoiceVolumeState] = useState<number>(getVoiceVolume());
  const [autoplayEnabled, setAutoplayEnabledState] = useState<boolean>(getAutoplayEnabled());
  const [autoplayIntervalMs, setAutoplayIntervalMsState] = useState<number>(getAutoplayIntervalMs());
  const autoplayTimerRef = useRef<number | null>(null);
  const [speakOnCapture, setSpeakOnCaptureState] = useState<boolean>(getSpeakOnCapture());
  const [speakOnLock, setSpeakOnLockState] = useState<boolean>(getSpeakOnLock());
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    try { return localStorage.getItem("measure.onboarded") !== "1"; } catch { return false; }
  });
  // Camera controls
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState<string>("");
  const [capabilities, setCapabilities] = useState<{
    canTorch: boolean;
    canZoom: boolean;
    zoom?: { min: number; max: number; step?: number };
  } | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number | null>(null);
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [targetFps, setTargetFps] = useState<number>(30);
  const [measuredFps, setMeasuredFps] = useState<number>(0);
  const [resolution, setResolution] = useState<{ w: number; h: number }>({ w: 1280, h: 720 });

  // Refs to avoid stale closures inside the RAF overlay loop
  const calibStartRef = useRef<{ x: number; y: number } | null>(null);
  const calibEndRef = useRef<{ x: number; y: number } | null>(null);
  const basePointRef = useRef<{ x: number; y: number } | null>(null);
  const tipPointRef = useRef<{ x: number; y: number } | null>(null);
  const girthPixelsRef = useRef<number>(0);
  const pixelsPerInchRef = useRef<number>(pixelsPerInch);
  const unitRef = useRef<"in" | "cm">(unit);
  const lengthDisplayRef = useRef<string>(lengthDisplay);
  const girthDisplayRef = useRef<string>(girthDisplay);

  const setVoice = (v: boolean) => {
    setVoiceEnabledState(v);
    setVoiceEnabled(v);
  };

  // Rolling edge buffer for multi-frame stabilization (live mode)
  const edgeBufferRef = useRef<Uint8ClampedArray[]>([]);
  const edgeBufferSizeRef = useRef<{ w: number; h: number } | null>(null);
  const lastEdgeImageRef = useRef<ImageData | null>(null);
  const trackRef = useRef<MediaStreamTrack | null>(null);

  // Snap helpers: find nearest strong edge pixel within radius
  const snapToEdgeIfAvailable = (x: number, y: number): { x: number; y: number } => {
    if (!snapEnabled) return { x, y };
    const img = lastEdgeImageRef.current;
    if (!img) return { x, y };
    const { width, height, data } = img;
    const r = Math.max(2, Math.min(60, snapRadiusPx));
    const xi = Math.round(x);
    const yi = Math.round(y);
    let bestDx = 0;
    let bestDy = 0;
    let bestDist2 = Number.POSITIVE_INFINITY;
    const thresh = 200; // edge intensity threshold
    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
    const x0 = clamp(xi - r, 0, width - 1);
    const x1 = clamp(xi + r, 0, width - 1);
    const y0 = clamp(yi - r, 0, height - 1);
    const y1 = clamp(yi + r, 0, height - 1);
    for (let yy = y0; yy <= y1; yy++) {
      const dy = yy - y;
      for (let xx = x0; xx <= x1; xx++) {
        const dx = xx - x;
        const dist2 = dx * dx + dy * dy;
        if (dist2 > r * r || dist2 >= bestDist2) continue;
        const idx = (yy * width + xx) * 4;
        const val = data[idx];
        if (val >= thresh) {
          bestDist2 = dist2;
          bestDx = dx;
          bestDy = dy;
        }
      }
    }
    if (bestDist2 < Number.POSITIVE_INFINITY) {
      return { x: x + bestDx, y: y + bestDy };
    }
    return { x, y };
  };

  // Update the temporal edge map for snapping and stabilization (cv Mat version)
  const updateEdgeOverlayFromMat = (
    cv: any,
    edges: any,
    processedW: number,
    processedH: number,
    offsetX: number,
    offsetY: number,
    drawW: number,
    drawH: number,
  ) => {
    const container = containerRef.current;
    if (!container) return;
    const outW = container.clientWidth;
    const outH = container.clientHeight;
    if (outW <= 0 || outH <= 0) return;

    const edgesCanvas = document.createElement("canvas");
    edgesCanvas.width = processedW;
    edgesCanvas.height = processedH;
    (cv as any).imshow(edgesCanvas, edges);

    const outCanvas = document.createElement("canvas");
    outCanvas.width = outW;
    outCanvas.height = outH;
    const octx = outCanvas.getContext("2d");
    if (!octx) return;
    octx.clearRect(0, 0, outW, outH);
    // black background
    octx.fillStyle = "#000";
    octx.fillRect(0, 0, outW, outH);
    // draw scaled edges into the same rectangle as the media
    octx.drawImage(edgesCanvas, 0, 0, processedW, processedH, offsetX, offsetY, drawW, drawH);
    const img = octx.getImageData(0, 0, outW, outH);

    // Maintain temporal buffer (max 4)
    if (!edgeBufferSizeRef.current || edgeBufferSizeRef.current.w !== outW || edgeBufferSizeRef.current.h !== outH) {
      edgeBufferRef.current = [];
      edgeBufferSizeRef.current = { w: outW, h: outH };
    }
    // store copy
    edgeBufferRef.current.push(new Uint8ClampedArray(img.data));
    if (edgeBufferRef.current.length > 4) edgeBufferRef.current.shift();

    // Combine via per-pixel max on the red channel
    const combined = octx.createImageData(outW, outH);
    const buf = combined.data;
    const bufs = edgeBufferRef.current;
    const n = bufs.length;
    for (let i = 0; i < buf.length; i += 4) {
      let maxR = 0;
      for (let k = 0; k < n; k++) {
        const r = bufs[k][i];
        if (r > maxR) maxR = r;
      }
      buf[i] = maxR; // R
      buf[i + 1] = maxR; // G
      buf[i + 2] = maxR; // B
      buf[i + 3] = maxR; // A
    }
    lastEdgeImageRef.current = combined;
  };

  // Update the temporal edge map from raw ImageData (worker result)
  const updateEdgeOverlayFromImageData = (
    edgeImage: ImageData,
    processedW: number,
    processedH: number,
    offsetX: number,
    offsetY: number,
    drawW: number,
    drawH: number,
  ) => {
    const container = containerRef.current;
    if (!container) return;
    const outW = container.clientWidth;
    const outH = container.clientHeight;
    if (outW <= 0 || outH <= 0) return;

    const edgesCanvas = document.createElement("canvas");
    edgesCanvas.width = processedW;
    edgesCanvas.height = processedH;
    const ectx = edgesCanvas.getContext("2d");
    if (!ectx) return;
    ectx.putImageData(edgeImage, 0, 0);

    const outCanvas = document.createElement("canvas");
    outCanvas.width = outW;
    outCanvas.height = outH;
    const octx = outCanvas.getContext("2d");
    if (!octx) return;
    octx.clearRect(0, 0, outW, outH);
    octx.fillStyle = "#000";
    octx.fillRect(0, 0, outW, outH);
    octx.drawImage(edgesCanvas, 0, 0, processedW, processedH, offsetX, offsetY, drawW, drawH);
    const img = octx.getImageData(0, 0, outW, outH);

    if (!edgeBufferSizeRef.current || edgeBufferSizeRef.current.w !== outW || edgeBufferSizeRef.current.h !== outH) {
      edgeBufferRef.current = [];
      edgeBufferSizeRef.current = { w: outW, h: outH };
    }
    edgeBufferRef.current.push(new Uint8ClampedArray(img.data));
    if (edgeBufferRef.current.length > 4) edgeBufferRef.current.shift();

    const combined = octx.createImageData(outW, outH);
    const buf = combined.data;
    const bufs = edgeBufferRef.current;
    const n = bufs.length;
    for (let i = 0; i < buf.length; i += 4) {
      let maxR = 0;
      for (let k = 0; k < n; k++) {
        const r = bufs[k][i];
        if (r > maxR) maxR = r;
      }
      buf[i] = maxR;
      buf[i + 1] = maxR;
      buf[i + 2] = maxR;
      buf[i + 3] = maxR;
    }
    lastEdgeImageRef.current = combined;
  };

  // Keep refs in sync with state for use inside RAF loop
  useEffect(() => {
    calibStartRef.current = calibStart;
  }, [calibStart]);
  useEffect(() => {
    calibEndRef.current = calibEnd;
  }, [calibEnd]);
  useEffect(() => {
    basePointRef.current = basePoint;
  }, [basePoint]);
  useEffect(() => {
    tipPointRef.current = tipPoint;
  }, [tipPoint]);
  useEffect(() => {
    girthPixelsRef.current = girthPixels;
  }, [girthPixels]);
  useEffect(() => {
    pixelsPerInchRef.current = pixelsPerInch;
  }, [pixelsPerInch]);
  useEffect(() => {
    unitRef.current = unit;
  }, [unit]);
  useEffect(() => {
    lengthDisplayRef.current = lengthDisplay;
  }, [lengthDisplay]);
  useEffect(() => {
    girthDisplayRef.current = girthDisplay;
  }, [girthDisplay]);
  useEffect(() => {
    confidenceRef.current = confidence;
  }, [confidence]);
  useEffect(() => {
    stabilityProgressRef.current = stabilityProgress;
  }, [stabilityProgress]);

  // Load previous photos once
  useEffect(() => {
    const withPhotos = getMeasurements().filter((m) => m.photoUrl);
    setPrevPhotos(withPhotos);
    if (withPhotos.length > 0) setSelectedPrevId(withPhotos[0].id);
  }, []);

  // Enumerate video devices and listen for device changes
  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      const list = await enumerateVideoDevices();
      if (!cancelled) setDevices(list);
    };
    refresh();
    const handler = () => { void refresh(); };
    try { navigator.mediaDevices.addEventListener("devicechange", handler as any); } catch {}
    return () => {
      cancelled = true;
      try { navigator.mediaDevices.removeEventListener("devicechange", handler as any); } catch {}
    };
  }, []);

  // Load saved camera preferences once
  useEffect(() => {
    try {
      const raw = localStorage.getItem("camera.prefs");
      if (!raw) return;
      const p = JSON.parse(raw);
      if (p && typeof p === "object") {
        if (p.facing === "user" || p.facing === "environment") setFacingMode(p.facing);
        if (typeof p.deviceId === "string") setDeviceId(p.deviceId);
        if (p.resolution && typeof p.resolution.w === "number" && typeof p.resolution.h === "number") setResolution({ w: p.resolution.w, h: p.resolution.h });
        if (typeof p.fps === "number") setTargetFps(p.fps);
        if (p.zoom != null && !Number.isNaN(Number(p.zoom))) setZoomLevel(Number(p.zoom));
        if (typeof p.torch === "boolean") setTorchOn(p.torch);
      }
    } catch {}
  }, []);

  // If the saved device is no longer present, clear it to allow facing-mode selection to choose back camera by default
  useEffect(() => {
    if (!devices.length) return;
    if (deviceId && !devices.some((d) => d.deviceId === deviceId)) {
      setDeviceId("");
    }
  }, [devices, deviceId]);

  // Persist camera preferences
  useEffect(() => {
    try {
      const prefs = {
        deviceId,
        facing: facingMode,
        resolution,
        fps: targetFps,
        zoom: zoomLevel,
        torch: torchOn,
      };
      localStorage.setItem("camera.prefs", JSON.stringify(prefs));
    } catch {}
  }, [deviceId, facingMode, resolution.w, resolution.h, targetFps, zoomLevel, torchOn]);

  // Load measurement UI preferences once
  useEffect(() => {
    try {
      const raw = localStorage.getItem("measure.prefs");
      if (!raw) return;
      const p = JSON.parse(raw);
      if (p && typeof p === "object") {
        if (typeof p.showGrid === "boolean") setShowGrid(p.showGrid);
        if (typeof p.gridSize === "number") setGridSize(p.gridSize);
        if (typeof p.showHud === "boolean") setShowHud(p.showHud);
        if (typeof p.autoDetect === "boolean") setAutoDetect(p.autoDetect);
        if (typeof p.autoCapture === "boolean") setAutoCapture(p.autoCapture);
        if (typeof p.minConfidence === "number") setMinConfidence(p.minConfidence);
        if (typeof p.detectionIntervalMs === "number") setDetectionIntervalMs(p.detectionIntervalMs);
        if (typeof p.stabilitySeconds === "number") setStabilitySeconds(p.stabilitySeconds);
        if (typeof p.stabilityLenTolInches === "number") setStabilityLenTolInches(p.stabilityLenTolInches);
        if (typeof p.stabilityGirthTolInches === "number") setStabilityGirthTolInches(p.stabilityGirthTolInches);
        if (typeof p.autoCaptureCooldownSec === "number") setAutoCaptureCooldownSec(p.autoCaptureCooldownSec);
        if (typeof p.showMask === "boolean") setShowMask(p.showMask);
        if (typeof p.maskOpacity === "number") setMaskOpacity(p.maskOpacity);
        if (typeof p.useMlSegmentation === "boolean") setUseMlSegmentation(p.useMlSegmentation);
        if (typeof p.showPrevOverlay === "boolean") setShowPrevOverlay(p.showPrevOverlay);
        if (typeof p.overlayOpacity === "number") setOverlayOpacity(p.overlayOpacity);
        if (typeof p.unit === "string" && (p.unit === "in" || p.unit === "cm")) setUnit(p.unit);
        if (typeof p.showScanSweep === "boolean") setShowScanSweep(p.showScanSweep);
        if (typeof p.showPulsingHalos === "boolean") setShowPulsingHalos(p.showPulsingHalos);
        if (typeof p.showStabilityRing === "boolean") setShowStabilityRing(p.showStabilityRing);
        if (typeof p.sweepIntensity === "number") setSweepIntensity(p.sweepIntensity);
        if (typeof p.haloIntensity === "number") setHaloIntensity(p.haloIntensity);
        if (typeof p.ringSize === "number") setRingSize(p.ringSize);
        if (p.quality && typeof p.quality === 'object') {
          const q = p.quality;
          if (typeof q.minBrightness === 'number') minBrightnessRef.current = q.minBrightness;
          if (typeof q.maxBrightness === 'number') maxBrightnessRef.current = q.maxBrightness;
          if (typeof q.minBlurVar === 'number') minBlurVarRef.current = q.minBlurVar;
          if (typeof q.minSizeFraction === 'number') minSizeFractionRef.current = q.minSizeFraction;
          if (typeof q.maxSizeFraction === 'number') maxSizeFractionRef.current = q.maxSizeFraction;
          if (typeof q.maxEdgeProximity === 'number') maxEdgeProximityRef.current = q.maxEdgeProximity;
        }
      }
    } catch {}
  }, []);

  // Persist measurement UI preferences
  useEffect(() => {
    try {
      const prefs = {
        showGrid,
        gridSize,
        showHud,
        autoDetect,
        autoCapture,
        minConfidence,
        detectionIntervalMs,
        stabilitySeconds,
        stabilityLenTolInches,
        stabilityGirthTolInches,
        autoCaptureCooldownSec,
        showMask,
        maskOpacity,
        useMlSegmentation,
        showPrevOverlay,
        overlayOpacity,
        unit,
        showScanSweep,
        showPulsingHalos,
        showStabilityRing,
        sweepIntensity,
        haloIntensity,
        ringSize,
        quality: {
          minBrightness: minBrightnessRef.current,
          maxBrightness: maxBrightnessRef.current,
          minBlurVar: minBlurVarRef.current,
          minSizeFraction: minSizeFractionRef.current,
          maxSizeFraction: maxSizeFractionRef.current,
          maxEdgeProximity: maxEdgeProximityRef.current,
        },
      };
      localStorage.setItem("measure.prefs", JSON.stringify(prefs));
    } catch {}
  }, [showGrid, gridSize, showHud, autoDetect, autoCapture, minConfidence, detectionIntervalMs, stabilitySeconds, stabilityLenTolInches, stabilityGirthTolInches, autoCaptureCooldownSec, showMask, maskOpacity, useMlSegmentation, showPrevOverlay, overlayOpacity, unit, showScanSweep, showPulsingHalos, showStabilityRing, sweepIntensity, haloIntensity, ringSize]);

  // Persist voice customization
  useEffect(() => {
    setUseCustomVoiceLines(useCustomVoice);
  }, [useCustomVoice]);
  useEffect(() => {
    const lines = customVoiceText
      .split(/\r?\n/g)
      .map((s) => s.replace(/\s+/g, " ").trim())
      .filter((s) => s.length > 0);
    setCustomVoiceLines(lines);
  }, [customVoiceText]);

  // Voice list init and persistence for TTS settings
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const list = await getVoicesAsync();
        if (!cancelled) setVoiceList(list);
      } catch {}
    };
    load();
    const handler = () => { void load(); };
    try { window.speechSynthesis.addEventListener("voiceschanged", handler as any); } catch {}
    return () => {
      cancelled = true;
      try { window.speechSynthesis.removeEventListener("voiceschanged", handler as any); } catch {}
    };
  }, []);
  useEffect(() => { setVoiceName(voiceName || ""); }, [voiceName]);
  useEffect(() => { setVoiceRate(voiceRate); }, [voiceRate]);
  useEffect(() => { setVoicePitch(voicePitch); }, [voicePitch]);
  useEffect(() => { setVoiceVolume(voiceVolume); }, [voiceVolume]);
  useEffect(() => { setAutoplayEnabled(autoplayEnabled); }, [autoplayEnabled]);
  useEffect(() => { setAutoplayIntervalMs(autoplayIntervalMs); }, [autoplayIntervalMs]);
  useEffect(() => { setSpeakOnCapture(speakOnCapture); }, [speakOnCapture]);
  useEffect(() => { setSpeakOnLock(speakOnLock); }, [speakOnLock]);
  useEffect(() => {
    if (!showOnboarding) {
      try { localStorage.setItem("measure.onboarded", "1"); } catch {}
    }
  }, [showOnboarding]);

  // Autoplay timer
  useEffect(() => {
    if (!voiceEnabled || !autoplayEnabled) {
      if (autoplayTimerRef.current) cancelInterval();
      return;
    }
    scheduleInterval();
    return () => cancelInterval();
    function scheduleInterval() {
      cancelInterval();
      autoplayTimerRef.current = window.setInterval(() => {
        void playCompliment();
      }, Math.max(1000, autoplayIntervalMs));
    }
    function cancelInterval() {
      if (autoplayTimerRef.current != null) {
        clearInterval(autoplayTimerRef.current);
        autoplayTimerRef.current = null;
      }
    }
  }, [voiceEnabled, autoplayEnabled, autoplayIntervalMs]);

  // Manage camera stream based on mode and selected options
  useEffect(() => {
    let cancelled = false;
    const start = async () => {
      try {
        // Stop previous stream if any
        const prev = videoRef.current?.srcObject as MediaStream | undefined;
        stopStream(prev);
        if (videoRef.current) videoRef.current.srcObject = null;
        trackRef.current = null;
        setCapabilities(null);

        const { stream, track, capabilities } = await startCamera({
          deviceId: deviceId || undefined,
          facingMode,
          width: resolution.w,
          height: resolution.h,
          frameRate: targetFps,
          preferExact: true,
        });
        if (cancelled) {
          stopStream(stream);
          return;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream as MediaStream;
          await videoRef.current.play();
        }
        trackRef.current = track;
        setCapabilities({ canTorch: capabilities.canTorch, canZoom: capabilities.canZoom, zoom: capabilities.zoom });
        // Initialize zoom level
        try {
          const s: any = track.getSettings ? track.getSettings() : {};
          if (s.zoom != null) setZoomLevel(Number(s.zoom));
          else if (capabilities.zoom) setZoomLevel((capabilities.zoom.min + capabilities.zoom.max) / 2);
        } catch {}
        // Apply target FPS if possible
        if (targetFps) { try { await applyFrameRateTrack(track, targetFps); } catch {} }
        // Measure actual FPS
        if (videoRef.current) {
          try {
            const fps = await measureVideoFps(videoRef.current, 800);
            if (!cancelled) setMeasuredFps(fps);
          } catch {}
        }
      } catch (err) {
        if (!cancelled) setStreamError("Camera access denied or not available.");
      }
    };
    if (mode === "live") {
      start();
    } else {
      // stop any active stream when switching away from live
      const stream = videoRef.current?.srcObject as MediaStream | undefined;
      stopStream(stream);
      if (videoRef.current) videoRef.current.srcObject = null;
      trackRef.current = null;
      setCapabilities(null);
      setMeasuredFps(0);
    }
    return () => {
      cancelled = true;
      if (mode !== "live") return;
      const stream = videoRef.current?.srcObject as MediaStream | undefined;
      stopStream(stream);
    };
  }, [mode, facingMode, deviceId, resolution.w, resolution.h, targetFps]);

  // Apply zoom changes
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (zoomLevel == null) return;
    const z = capabilities?.zoom;
    let level = zoomLevel;
    if (z) level = Math.max(z.min, Math.min(z.max, level));
    void applyZoomTrack(track, level);
  }, [zoomLevel, capabilities]);

  // Apply torch changes
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (!capabilities?.canTorch) return;
    void setTorchTrack(track, torchOn);
  }, [torchOn, capabilities]);

  // load selected previous overlay image
  useEffect(() => {
    let revokeUrl: string | null = null;
    const load = async () => {
      if (!selectedPrevId) {
        setPrevOverlayUrl("");
        return;
      }
      try {
        const blob = await getPhoto(selectedPrevId);
        if (blob) {
          const url = URL.createObjectURL(blob);
          revokeUrl = url;
          setPrevOverlayUrl(url);
        } else {
          setPrevOverlayUrl("");
        }
      } catch {
        setPrevOverlayUrl("");
      }
    };
    load();
    return () => {
      if (revokeUrl) URL.revokeObjectURL(revokeUrl);
    };
  }, [selectedPrevId]);

  // Draw overlay continuously for measurements
  const drawOverlayLoop = () => {
    const overlay = overlayRef.current;
    const container = containerRef.current;
    if (!overlay || !container) return;

    const ctx = overlay.getContext("2d");
    if (!ctx) return;

    const render = () => {
      // match overlay size to media container
      overlay.width = container.clientWidth;
      overlay.height = container.clientHeight;
      ctx.clearRect(0, 0, overlay.width, overlay.height);

      // Optional grid background
      if (showGrid) {
        ctx.save();
        ctx.strokeStyle = "rgba(148, 163, 184, 0.25)"; // slate-400 @ 25%
        ctx.lineWidth = 1;
        const step = Math.max(8, Math.min(80, gridSize));
        for (let x = 0; x < overlay.width; x += step) {
          ctx.beginPath();
          ctx.moveTo(x + 0.5, 0);
          ctx.lineTo(x + 0.5, overlay.height);
          ctx.stroke();
        }
        for (let y = 0; y < overlay.height; y += step) {
          ctx.beginPath();
          ctx.moveTo(0, y + 0.5);
          ctx.lineTo(overlay.width, y + 0.5);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Calibration line
      const cStart = calibStartRef.current;
      const cEnd = calibEndRef.current;
      if (cStart && cEnd) {
        // Animated dashed calibration line
        const t = performance.now() / 1000;
        ctx.strokeStyle = "#22d3ee";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.lineDashOffset = -((t * 120) % 12);
        ctx.beginPath();
        ctx.moveTo(cStart.x, cStart.y);
        ctx.lineTo(cEnd.x, cEnd.y);
        ctx.stroke();
        ctx.setLineDash([]);

        const dx = cEnd.x - cStart.x;
        const dy = cEnd.y - cStart.y;
        const pixels = Math.hypot(dx, dy);
        const ppi = pixels / calibrationInches;
        // show live ppi label
        ctx.fillStyle = "#22d3ee";
        ctx.font = "12px sans-serif";
        ctx.fillText(
          `${ppi.toFixed(1)} px/in`,
          (cStart.x + cEnd.x) / 2 + 8,
          (cStart.y + cEnd.y) / 2,
        );

        // Calibration hint text
        ctx.fillStyle = "rgba(34,211,238,0.9)";
        ctx.font = "13px sans-serif";
        ctx.fillText("Calibrating: click/drag two points of known distance", 12, 24);
      }

      // Base to tip length line + markers + tape ruler
      const bp = basePointRef.current;
      const tp = tipPointRef.current;
      if (bp && tp) {
        // Line
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(bp.x, bp.y);
        ctx.lineTo(tp.x, tp.y);
        ctx.stroke();

        const dx = tp.x - bp.x;
        const dy = tp.y - bp.y;
        const pixels = Math.hypot(dx, dy) || 1;
        const ux = dx / pixels;
        const uy = dy / pixels;
        const inches = pixels / (pixelsPerInchRef.current || 1);
        const cm = inToCm(inches);
        const useIn = unitRef.current === "in";
        const display = useIn ? inches : cm;
        const nextLen = display.toFixed(2);
        if (nextLen !== lengthDisplayRef.current) {
          lengthDisplayRef.current = nextLen;
          setLengthDisplay(nextLen);
        }

        // Base/Tip markers with pulsing halos
        const drawMarker = (x: number, y: number, label: string) => {
          const t = performance.now() / 1000;
          if (showPulsingHalos) {
            const pulse = (Math.sin(t * 2 * Math.PI) + 1) / 2; // 0..1
            const radius = 10 + pulse * 6;
            const alpha = (haloIntensity / 100) * (0.15 + 0.35 * pulse);
            ctx.save();
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(16,185,129,${Math.max(0, Math.min(1, alpha))})`;
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
          }

          ctx.fillStyle = "#10b981";
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = "#10b981";
          ctx.font = "12px sans-serif";
          ctx.fillText(label, x + 8, y - 8);
        };
        drawMarker(bp.x, bp.y, "Base");
        drawMarker(tp.x, tp.y, "Tip");

        // Tape ruler along the measured axis (tailor's tape style)
        const perpX = -uy;
        const perpY = ux;
        const total = pixels;
        // Base tick spacing: 0.5 inch in IN mode, 1 cm in CM mode
        const tickPx = unitRef.current === "in" ? (pixelsPerInchRef.current || 1) * 0.5 : ((pixelsPerInchRef.current || 1) / 2.54) * 1.0;
        let stepPx = 0;
        let index = 0;
        ctx.strokeStyle = "#94a3b8"; // slate-400 ticks
        ctx.fillStyle = "#94a3b8";
        ctx.lineWidth = 2;
        while (stepPx <= total + 0.5) {
          const isMajor = unitRef.current === "in" ? index % 2 === 0 : true; // label every inch in IN, every cm in CM
          const tickLen = isMajor ? 16 : 10;
          const cx = bp.x + ux * stepPx;
          const cy = bp.y + uy * stepPx;
          ctx.beginPath();
          ctx.moveTo(cx - perpX * tickLen, cy - perpY * tickLen);
          ctx.lineTo(cx + perpX * tickLen, cy + perpY * tickLen);
          ctx.stroke();
          if (isMajor) {
            ctx.font = "11px sans-serif";
            const labelVal = unitRef.current === "in" ? (index * 0.5) : index * 1;
            const label = unitRef.current === "in" ? String(Math.round(labelVal)) : String(Math.round(labelVal));
            ctx.fillText(label, cx + perpX * (tickLen + 6), cy + perpY * (tickLen + 6));
          }
          stepPx += tickPx;
          index += 1;
        }

        // Length label near tip
        ctx.fillStyle = "#10b981";
        ctx.font = "14px sans-serif";
        ctx.fillText(`${nextLen} ${unitRef.current}`, tp.x + 8, tp.y);

        // Angle label near mid
        const angleRad = Math.atan2(dy, dx);
        const angleDeg = ((angleRad * 180) / Math.PI + 360) % 360;
        const midX = (bp.x + tp.x) / 2;
        const midY = (bp.y + tp.y) / 2;
        ctx.fillStyle = "#0ea5e9"; // sky-500
        ctx.font = "12px sans-serif";
        ctx.fillText(`${angleDeg.toFixed(1)}°`, midX + 8, midY + 14);

        // Girth indicator: perpendicular at mid-shaft
        const currentGirth = girthPixelsRef.current || 0;
        if (currentGirth > 0) {
          const midX = (bp.x + tp.x) / 2;
          const midY = (bp.y + tp.y) / 2;
          const half = currentGirth / 2;
          const startX = midX - perpX * half;
          const startY = midY - perpY * half;
          const endX = midX + perpX * half;
          const endY = midY + perpY * half;
          ctx.strokeStyle = "#f59e0b";
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.stroke();

          const circumferenceInches = (currentGirth / (pixelsPerInchRef.current || 1)) * Math.PI;
          const circumferenceCm = inToCm(circumferenceInches);
          const gDisplay = unitRef.current === "in" ? circumferenceInches : circumferenceCm;
          const nextGirth = gDisplay.toFixed(2);
          if (nextGirth !== girthDisplayRef.current) {
            girthDisplayRef.current = nextGirth;
            setGirthDisplay(nextGirth);
          }
          ctx.fillStyle = "#f59e0b";
          ctx.font = "14px sans-serif";
          ctx.fillText(`${nextGirth} ${unitRef.current}`, endX + 8, endY);
        }
      }

      // Live scanning sweep when auto-detect is enabled
      if (autoDetect && mode === "live" && showScanSweep) {
        const t = performance.now() / 1000;
        const bandW = Math.max(24, Math.floor(overlay.width * 0.12));
        const xCenter = ((t * 160) % (overlay.width + bandW)) - bandW / 2;
        const grad = ctx.createLinearGradient(xCenter - bandW / 2, 0, xCenter + bandW / 2, 0);
        const alpha = Math.max(0, Math.min(0.4, sweepIntensity / 100));
        grad.addColorStop(0, `rgba(59,130,246,0.0)`);
        grad.addColorStop(0.5, `rgba(59,130,246,${alpha})`);
        grad.addColorStop(1, `rgba(59,130,246,0.0)`);
        ctx.fillStyle = grad as any;
        ctx.fillRect(0, 0, overlay.width, overlay.height);
      }

      // Stability progress ring near tip or top-left
      if (autoDetect && mode === "live" && showStabilityRing) {
        const progress = Math.max(0, Math.min(1, stabilityProgressRef.current || 0));
        const cx = tipPointRef.current?.x ?? 28;
        const cy = tipPointRef.current?.y ?? 28;
        const r = Math.max(8, Math.min(40, ringSize));
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(148,163,184,0.5)";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
        ctx.strokeStyle = progress >= 1 ? "#f59e0b" : "#22d3ee";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);
  };

  // Start overlay loop once
  useEffect(() => {
    // Warm worker (non-blocking)
    try { void opencvWorker.load(); } catch {}
    drawOverlayLoop();
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      if (uploadedUrl) URL.revokeObjectURL(uploadedUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOverlayClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    const snapped = snapToEdgeIfAvailable(x, y);
    x = snapped.x; y = snapped.y;

    if (isCalibrating) {
      if (!calibStart) {
        setCalibStart({ x, y });
        setCalibEnd(null);
      } else if (!calibEnd) {
        const end = { x, y };
        setCalibEnd(end);
        const dx = end.x - calibStart.x;
        const dy = end.y - calibStart.y;
        const pixels = Math.hypot(dx, dy);
        const ppi = pixels / calibrationInches;
        if (ppi > 0) setPixelsPerInch(ppi);
        setIsCalibrating(false);
      }
      return;
    }

    // Set base then tip
    if (!basePoint) {
      setBasePoint({ x, y });
      setSelectedHandle("base");
    } else {
      setTipPoint({ x, y });
      setSelectedHandle("tip");
    }
  };

  const handleOverlayMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const hitRadius = 14;
    const hit = (pt: { x: number; y: number } | null) =>
      pt && Math.hypot(pt.x - x, pt.y - y) <= hitRadius;
    if (isCalibrating) {
      // Allow dragging calibration endpoints while calibrating
      if (hit(calibStart)) {
        setDragging({ type: "calibStart" });
        return;
      }
      if (hit(calibEnd)) {
        setDragging({ type: "calibEnd" });
        return;
      }
    } else {
      if (hit(basePoint)) {
        setDragging({ type: "base" });
        return;
      }
      if (hit(tipPoint)) {
        setDragging({ type: "tip" });
        return;
      }
    }
  };

  const handleOverlayMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    const snapped = snapToEdgeIfAvailable(x, y);
    x = snapped.x; y = snapped.y;
    if (dragging.type === "base") setBasePoint({ x, y });
    if (dragging.type === "tip") setTipPoint({ x, y });
    if (dragging.type === "calibStart") setCalibStart({ x, y });
    if (dragging.type === "calibEnd") setCalibEnd({ x, y });
  };

  const handleOverlayMouseUp = () => {
    setDragging(null);
  };

  // Keyboard nudge controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const overlay = overlayRef.current;
      if (!overlay) return;
      if (e.key.toLowerCase() === "d") {
        e.preventDefault();
        void detectFromLive();
        return;
      }
      if (e.key.toLowerCase() === "c") {
        e.preventDefault();
        void capture();
        return;
      }
      if (e.key.toLowerCase() === "f") {
        e.preventDefault();
        toggleFreeze();
        return;
      }
      if (e.key.toLowerCase() === "s") {
        setSnapEnabled((v) => !v);
        return;
      }
      if (!selectedHandle) return;
      const step = (e.shiftKey ? 5 : 1) * (nudgeStep || 1);
      const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
      const move = (dx: number, dy: number) => {
        if (selectedHandle === "base" && basePoint) {
          const nx = clamp(basePoint.x + dx, 0, overlay.width);
          const ny = clamp(basePoint.y + dy, 0, overlay.height);
          const snapped = snapToEdgeIfAvailable(nx, ny);
          setBasePoint({ x: snapped.x, y: snapped.y });
        }
        if (selectedHandle === "tip" && tipPoint) {
          const nx = clamp(tipPoint.x + dx, 0, overlay.width);
          const ny = clamp(tipPoint.y + dy, 0, overlay.height);
          const snapped = snapToEdgeIfAvailable(nx, ny);
          setTipPoint({ x: snapped.x, y: snapped.y });
        }
      };
      if (e.key === "ArrowUp") { e.preventDefault(); move(0, -step); }
      if (e.key === "ArrowDown") { e.preventDefault(); move(0, step); }
      if (e.key === "ArrowLeft") { e.preventDefault(); move(-step, 0); }
      if (e.key === "ArrowRight") { e.preventDefault(); move(step, 0); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedHandle, nudgeStep, basePoint, tipPoint]);

  // Auto-calibration via credit card detection
  const autoCalibrateCommon = (
    cv: any,
    src: any,
    w: number,
    h: number,
    mapToOverlay: (ix: number, iy: number) => { x: number; y: number },
  ) => {
    const gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
    const blur = new cv.Mat();
    cv.GaussianBlur(gray, blur, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);
    const edges = new cv.Mat();
    cv.Canny(blur, edges, 50, 150);
    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    let best = {
      area: 0,
      ratioDiff: Number.POSITIVE_INFINITY,
      pts: [] as Array<{ x: number; y: number }>,
      longPx: 0,
    };
    const targetRatio = 85.6 / 53.98; // ~1.585

    for (let i = 0; i < contours.size(); i++) {
      const cnt = contours.get(i);
      const peri = cv.arcLength(cnt, true);
      const approx = new cv.Mat();
      cv.approxPolyDP(cnt, approx, 0.02 * peri, true);
      if (approx.rows === 4) {
        const pts: Array<{ x: number; y: number }> = [];
        for (let j = 0; j < 4; j++) {
          const p = approx.int32Ptr(j);
          pts.push({ x: p[0], y: p[1] });
        }
        // compute side lengths
        const d = (a: any, b: any) => Math.hypot(a.x - b.x, a.y - b.y);
        const sides = [d(pts[0], pts[1]), d(pts[1], pts[2]), d(pts[2], pts[3]), d(pts[3], pts[0])];
        const long = Math.max(...sides);
        const short = Math.min(...sides);
        const ratio = long / (short || 1);
        const ratioDiff = Math.abs(ratio - targetRatio);
        const area = cv.contourArea(cnt, false);
        if (area > w * h * 0.005 && ratioDiff < 0.35) {
          if (area > best.area || (Math.abs(ratioDiff - best.ratioDiff) < 0.05 && area > best.area)) {
            best = { area, ratioDiff, pts, longPx: long };
          }
        }
      }
      approx.delete();
      cnt.delete();
    }
    contours.delete();
    hierarchy.delete();
    edges.delete();
    blur.delete();
    gray.delete();

    if (best.area <= 0 || best.pts.length !== 4) {
      throw new Error("Card not found");
    }

    const inchesLong = 85.6 / 25.4; // 3.370 in
    const computedPpi = best.longPx / inchesLong;
    if (computedPpi <= 0 || !isFinite(computedPpi)) throw new Error("Invalid calibration");
    setPixelsPerInch(computedPpi);

    // set calibration line along longest edge mapped to overlay for user feedback
    const dpt = (a: any, b: any) => Math.hypot(a.x - b.x, a.y - b.y);
    let aIdx = 0, bIdx = 1; let longLen = 0;
    for (let k = 0; k < 4; k++) {
      const n = (k + 1) % 4;
      const L = dpt(best.pts[k], best.pts[n]);
      if (L > longLen) { longLen = L; aIdx = k; bIdx = n; }
    }
    const a = mapToOverlay(best.pts[aIdx].x, best.pts[aIdx].y);
    const b = mapToOverlay(best.pts[bIdx].x, best.pts[bIdx].y);
    setCalibStart(a);
    setCalibEnd(b);
    setIsCalibrating(false);
  };

  // Prefer previous base point to decide which endpoint is base
  const chooseBaseAndTip = (
    a: { x: number; y: number },
    b: { x: number; y: number },
  ): { base: { x: number; y: number }; tip: { x: number; y: number } } => {
    const prevBase = basePointRef.current;
    if (prevBase) {
      const da = Math.hypot(a.x - prevBase.x, a.y - prevBase.y);
      const db = Math.hypot(b.x - prevBase.x, b.y - prevBase.y);
      return da <= db ? { base: a, tip: b } : { base: b, tip: a };
    }
    return a.x <= b.x ? { base: a, tip: b } : { base: b, tip: a };
  };

  // Lightweight smoothing helpers for live updates
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const smoothPoint = (
    prev: { x: number; y: number } | null,
    next: { x: number; y: number },
    alpha: number,
  ) => (prev ? { x: lerp(prev.x, next.x, alpha), y: lerp(prev.y, next.y, alpha) } : next);

  const autoCalibrateFromImage = async () => {
    if (mode !== "upload") {
      toast({ title: "Switch to Upload", description: "Use an uploaded image for this calibration.", variant: "destructive" });
      return;
    }
    if (!uploadedUrl) {
      toast({ title: "No image", description: "Upload an image first.", variant: "destructive" });
      return;
    }
    setIsAutoCalibrating(true);
    try {
      const cv = await loadOpenCV();
      const imgEl = new Image();
      await new Promise<void>((resolve, reject) => {
        imgEl.onload = () => resolve();
        imgEl.onerror = () => reject(new Error("Failed to load image"));
        imgEl.src = uploadedUrl;
      });
      const w = imgEl.naturalWidth;
      const h = imgEl.naturalHeight;
      const procCanvas = document.createElement("canvas");
      procCanvas.width = w;
      procCanvas.height = h;
      const pctx = procCanvas.getContext("2d");
      if (!pctx) throw new Error("Canvas context unavailable");
      pctx.drawImage(imgEl, 0, 0, w, h);
      const src = cv.imread(procCanvas);
      const container = containerRef.current;
      if (!container) throw new Error("Container missing");
      const containerW = container.clientWidth;
      const containerH = container.clientHeight;
      const scale = Math.min(containerW / w, containerH / h);
      const drawW = w * scale;
      const drawH = h * scale;
      const offsetX = (containerW - drawW) / 2;
      const offsetY = (containerH - drawH) / 2;
      const mapToOverlay = (ix: number, iy: number) => ({ x: offsetX + ix * scale, y: offsetY + iy * scale });
      autoCalibrateCommon(cv, src, w, h, mapToOverlay);
      src.delete();
      toast({ title: "Calibration updated", description: "Detected credit card scale applied." });
    } catch (err: any) {
      toast({ title: "Auto-calibration failed", description: err?.message || String(err), variant: "destructive" });
    } finally {
      setIsAutoCalibrating(false);
    }
  };

  const autoCalibrateFromLive = async () => {
    if (mode !== "live") {
      toast({ title: "Switch to Live", description: "Use the camera for this calibration.", variant: "destructive" });
      return;
    }
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      toast({ title: "Camera not ready", description: "Wait for the camera stream to start.", variant: "destructive" });
      return;
    }
    setIsAutoCalibrating(true);
    try {
      const cv = await loadOpenCV();
      const w = video.videoWidth;
      const h = video.videoHeight;
      const procCanvas = document.createElement("canvas");
      procCanvas.width = w;
      procCanvas.height = h;
      const pctx = procCanvas.getContext("2d");
      if (!pctx) throw new Error("Canvas context unavailable");
      pctx.drawImage(video, 0, 0, w, h);
      const src = cv.imread(procCanvas);
      const container = containerRef.current;
      if (!container) throw new Error("Container missing");
      const containerW = container.clientWidth;
      const containerH = container.clientHeight;
      const scale = Math.min(containerW / w, containerH / h);
      const drawW = w * scale;
      const drawH = h * scale;
      const offsetX = (containerW - drawW) / 2;
      const offsetY = (containerH - drawH) / 2;
      const mapToOverlay = (ix: number, iy: number) => ({ x: offsetX + ix * scale, y: offsetY + iy * scale });
      autoCalibrateCommon(cv, src, w, h, mapToOverlay);
      src.delete();
      toast({ title: "Calibration updated", description: "Detected credit card scale applied." });
    } catch (err: any) {
      toast({ title: "Auto-calibration failed", description: err?.message || String(err), variant: "destructive" });
    } finally {
      setIsAutoCalibrating(false);
    }
  };

  const detectFromImage = async () => {
    if (mode !== "upload") {
      toast({
        title: "Switch to Upload",
        description: "Auto-detect works on uploaded images.",
        variant: "destructive",
      });
      return;
    }
    if (!uploadedUrl) {
      toast({ title: "No image", description: "Upload an image first.", variant: "destructive" });
      return;
    }
    setIsDetecting(true);
    try {
      const cv = await loadOpenCV();
      // Create an offscreen image to measure intrinsic size
      const imgEl = new Image();
      await new Promise<void>((resolve, reject) => {
        imgEl.onload = () => resolve();
        imgEl.onerror = () => reject(new Error("Failed to load image"));
        imgEl.src = uploadedUrl;
      });
      const w = imgEl.naturalWidth;
      const h = imgEl.naturalHeight;

      // Draw to hidden canvas for processing
      const procCanvas = document.createElement("canvas");
      procCanvas.width = w;
      procCanvas.height = h;
      const pctx = procCanvas.getContext("2d");
      if (!pctx) throw new Error("Canvas context unavailable");
      pctx.drawImage(imgEl, 0, 0, w, h);

      const src = cv.imread(procCanvas);
      const rgba = new cv.Mat();
      cv.cvtColor(src, rgba, cv.COLOR_RGBA2RGB);
      const hsv = new cv.Mat();
      const ycrcb = new cv.Mat();
      cv.cvtColor(rgba, hsv, cv.COLOR_RGB2HSV);
      cv.cvtColor(rgba, ycrcb, cv.COLOR_RGB2YCrCb);
      try {
        if (typeof (cv as any).createCLAHE === "function") {
          const channels = new cv.MatVector();
          cv.split(ycrcb, channels);
          const y = channels.get(0);
          const cr = channels.get(1);
          const cb = channels.get(2);
          const clahe = (cv as any).createCLAHE(2.0, new cv.Size(8, 8));
          const yEq = new cv.Mat();
          clahe.apply(y, yEq);
          const merged = new cv.Mat();
          const mv = new cv.MatVector();
          mv.push_back(yEq); mv.push_back(cr); mv.push_back(cb);
          cv.merge(mv, merged);
          merged.copyTo(ycrcb);
          y.delete(); cr.delete(); cb.delete(); yEq.delete(); merged.delete(); mv.delete(); channels.delete();
        }
      } catch {}

      // Skin masking in YCrCb and HSV, then combine
      const mask1 = new cv.Mat();
      const mask2 = new cv.Mat();
      const mask = new cv.Mat();
      const low1 = new cv.Mat(h, w, cv.CV_8UC3, [0, 133, 77]);
      const high1 = new cv.Mat(h, w, cv.CV_8UC3, [255, 173, 127]);
      cv.inRange(ycrcb, low1, high1, mask1);
      const low2 = new cv.Mat(h, w, cv.CV_8UC3, [0, Math.round(0.23 * 255), 50]);
      const high2 = new cv.Mat(h, w, cv.CV_8UC3, [50, Math.round(0.68 * 255), 255]);
      cv.inRange(hsv, low2, high2, mask2);
      cv.bitwise_or(mask1, mask2, mask);

      // Morphology to clean up
      const kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(7, 7));
      try {
        const tmp = new cv.Mat();
        cv.bilateralFilter(rgba, tmp, 5, 75, 75, cv.BORDER_DEFAULT);
        tmp.delete();
      } catch {}
      cv.morphologyEx(mask, mask, cv.MORPH_CLOSE, kernel);
      cv.morphologyEx(mask, mask, cv.MORPH_OPEN, kernel);

      // Contour detection (worker-first)
      const contours = new cv.MatVector();
      const hierarchy = new cv.Mat();
      cv.findContours(mask, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
      let bestIdx = -1;
      let bestArea = 0;
      for (let i = 0; i < contours.size(); i++) {
        const cnt = contours.get(i);
        const area = cv.contourArea(cnt, false);
        if (area > bestArea) {
          bestArea = area;
          bestIdx = i;
        }
        cnt.delete();
      }
      // We deleted contours during iteration; need to refind to access the best
      contours.delete();
      hierarchy.delete();
      const contours2 = new cv.MatVector();
      const hierarchy2 = new cv.Mat();
      cv.findContours(mask, contours2, hierarchy2, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

      let axisUx = 1,
        axisUy = 0;
      let end1: { x: number; y: number } | null = null;
      let end2: { x: number; y: number } | null = null;
      let bestCnt: any = null;

      if (bestIdx >= 0) {
        const cnt = contours2.get(bestIdx);
        const moments = cv.moments(cnt, false);
        const cx = moments.m00 !== 0 ? moments.m10 / moments.m00 : w / 2;
        const cy = moments.m00 !== 0 ? moments.m01 / moments.m00 : h / 2;
        const angle = 0.5 * Math.atan2(2 * moments.mu11, moments.mu20 - moments.mu02);
        axisUx = Math.cos(angle);
        axisUy = Math.sin(angle);
        // project all contour points to find extremes
        let minS = Number.POSITIVE_INFINITY;
        let maxS = Number.NEGATIVE_INFINITY;
        let minPt = { x: cx, y: cy };
        let maxPt = { x: cx, y: cy };
        const data = cnt.data32S;
        for (let i = 0; i < data.length; i += 2) {
          const x = data[i];
          const y = data[i + 1];
          const s = (x - cx) * axisUx + (y - cy) * axisUy;
          if (s < minS) {
            minS = s;
            minPt = { x, y };
          }
          if (s > maxS) {
            maxS = s;
            maxPt = { x, y };
          }
        }
        end1 = minPt;
        end2 = maxPt;
        bestCnt = cnt;
      }

      // Fallback using Hough if contour failed
      if (!end1 || !end2) {
        const gray = new cv.Mat();
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
        const blurred = new cv.Mat();
        cv.GaussianBlur(gray, blurred, new cv.Size(9, 9), 0, 0, cv.BORDER_DEFAULT);
        const edges = new cv.Mat();
        cv.Canny(blurred, edges, 50, 150);
        const lines = new cv.Mat();
        cv.HoughLinesP(edges, lines, 1, Math.PI / 180, 80, 0.2 * Math.min(w, h), 20);
        let bestLineLen = 0;
        for (let i = 0; i < lines.rows; i++) {
          const p = lines.int32Ptr(i);
          const x1 = p[0],
            y1 = p[1],
            x2 = p[2],
            y2 = p[3];
          const len = Math.hypot(x2 - x1, y2 - y1);
          if (len > bestLineLen) {
            bestLineLen = len;
            end1 = { x: x1, y: y1 };
            end2 = { x: x2, y: y2 };
            axisUx = (x2 - x1) / (len || 1);
            axisUy = (y2 - y1) / (len || 1);
          }
        }
        gray.delete();
        blurred.delete();
        edges.delete();
        lines.delete();
      }

      // Try worker detect path to compute endpoints, widths, confidence
      try {
        const frameCtx = procCanvas.getContext("2d");
        if (frameCtx) {
          const frame = frameCtx.getImageData(0, 0, w, h);
          const det = await opencvWorker.detect({ width: w, height: h, imageData: frame.data });
          if (det && det.end1 && det.end2) {
            const container = containerRef.current;
            if (!container) throw new Error("Container missing");
            const containerW = container.clientWidth;
            const containerH = container.clientHeight;
            const scale = Math.min(containerW / w, containerH / h);
            const drawW = w * scale;
            const drawH = h * scale;
            const offsetX = (containerW - drawW) / 2;
            const offsetY = (containerH - drawH) / 2;
            const mapPoint = (ix: number, iy: number) => ({ x: offsetX + ix * scale, y: offsetY + iy * scale });
            const p1 = mapPoint(det.end1.x, det.end1.y);
            const p2 = mapPoint(det.end2.x, det.end2.y);
            const chosen = chooseBaseAndTip(p1, p2);
            const conf = det.confidence || 0;
            setConfidence(conf);
            try {
              if ((det as any).quality && typeof (det as any).quality.score === 'number') {
                setQualityScore((det as any).quality.score);
                const q = (det as any).quality;
                if (q && typeof q === 'object') {
                  setQualityDetail({
                    brightness: Number(q.brightness) || 0,
                    blurVar: Number(q.blurVar) || 0,
                    sizeFraction: Number(q.sizeFraction) || 0,
                    edgeProximity: Number(q.edgeProximity) || 0,
                  });
                }
              }
              if (typeof (det as any).curvatureDeg === 'number') {
                setCurvatureDeg((det as any).curvatureDeg);
              }
            } catch {}
            if (conf >= minConfidence) {
              const alpha = 1.0;
              const smBase = smoothPoint(basePointRef.current, chosen.base, alpha);
              const smTip = smoothPoint(tipPointRef.current, chosen.tip, alpha);
              setBasePoint(smBase);
              setTipPoint(smTip);
              if (Array.isArray(det.widths) && det.widths.length) {
                const sorted = [...det.widths].sort((a, b) => a - b);
                const median = sorted[Math.floor(sorted.length / 2)] * scale;
                setGirthPixels(median);
              }
            } else {
              setRetakeSuggested(true);
            }
            // Mask overlay export
            try {
              const maskCanvas = document.createElement("canvas");
              maskCanvas.width = w;
              maskCanvas.height = h;
              const mctx = maskCanvas.getContext('2d');
              if (mctx) {
                const arr = det.maskImage instanceof Uint8ClampedArray ? det.maskImage : new Uint8ClampedArray(det.maskImage);
                const img = new ImageData(new Uint8ClampedArray(arr), w, h);
                mctx.putImageData(img, 0, 0);
                const url = maskCanvas.toDataURL("image/png");
                setMaskUrl(url);
                setMaskGeom({ offsetX, offsetY, drawW, drawH });
              }
            } catch {}
          }
        }
      } catch {}

      // Map endpoints and compute girth by multi-slice sampling
      const container = containerRef.current;
      if (end1 && end2 && container) {
        const containerW = container.clientWidth;
        const containerH = container.clientHeight;
        const scale = Math.min(containerW / w, containerH / h);
        const drawW = w * scale;
        const drawH = h * scale;
        const offsetX = (containerW - drawW) / 2;
        const offsetY = (containerH - drawH) / 2;
        const mapPoint = (ix: number, iy: number) => ({
          x: offsetX + ix * scale,
          y: offsetY + iy * scale,
        });

        const p1 = mapPoint(end1.x, end1.y);
        const p2 = mapPoint(end2.x, end2.y);
        const chosen = chooseBaseAndTip(p1, p2);

        // Build binary mask Mat for sampling if not already
        const maskForSample = mask;
        const perpUx = -axisUy; // perpendicular unit
        const perpUy = axisUx;
        // sample positions along axis between ends
        const totalLen = Math.hypot(end2.x - end1.x, end2.y - end1.y) || 1;
        const centerX = (end1.x + end2.x) / 2;
        const centerY = (end1.y + end2.y) / 2;
        const ts = [-0.2, -0.1, -0.05, 0, 0.05, 0.1, 0.2]; // around mid
        const widths: number[] = [];
        const maxScan = Math.floor(Math.min(w, h) * 0.25);
        const isInside = (x: number, y: number) => {
          const ix = Math.round(x);
          const iy = Math.round(y);
          if (ix < 0 || iy < 0 || ix >= w || iy >= h) return false;
          return maskForSample.ucharPtr(iy, ix)[0] > 0;
        };
        for (const t of ts) {
          const px = centerX + t * totalLen * axisUx;
          const py = centerY + t * totalLen * axisUy;
          let left = 0,
            right = 0;
          for (let s = 0; s < maxScan; s++) {
            if (!isInside(px - s * perpUx, py - s * perpUy)) {
              left = s;
              break;
            }
          }
          for (let s = 0; s < maxScan; s++) {
            if (!isInside(px + s * perpUx, py + s * perpUy)) {
              right = s;
              break;
            }
          }
          const width = left + right;
          if (width > 0) widths.push(width);
        }
        // Confidence metrics and apply
        let elongation = 0;
        let solidity = 1;
        const lengthPx = Math.hypot(end2.x - end1.x, end2.y - end1.y) || 1;
        if (widths.length) {
          widths.sort((a, b) => a - b);
          const medianW = widths[Math.floor(widths.length / 2)];
          elongation = lengthPx / Math.max(1, medianW);
        }
        try {
          if (bestCnt) {
            const hull = new cv.Mat();
            cv.convexHull(bestCnt, hull, false, true);
            const area = cv.contourArea(bestCnt, false);
            const hullArea = Math.max(1, cv.contourArea(hull, false));
            solidity = Math.min(1, area / hullArea);
            hull.delete();
          }
        } catch {}
        const areaFraction = bestArea / (w * h);
        let confidence = 0;
        confidence += Math.min(1, (elongation || 0) / 3) * 0.45;
        confidence += Math.min(1, areaFraction / 0.2) * 0.25;
        confidence += Math.min(1, solidity) * 0.30;
        setConfidence(confidence);
        setQualityScore(0);
        setCurvatureDeg(0);
        if (confidence >= minConfidence) {
          const alpha = 1.0; // single image: snap
          const smBase = smoothPoint(basePointRef.current, chosen.base, alpha);
          const smTip = smoothPoint(tipPointRef.current, chosen.tip, alpha);
          setBasePoint(smBase);
          setTipPoint(smTip);
          if (widths.length) {
            const median = widths[Math.floor(widths.length / 2)] * scale;
            setGirthPixels(median);
          }
        } else {
          toast({ title: "Low confidence", description: `Score ${confidence.toFixed(2)} below threshold ${minConfidence.toFixed(2)}.`, variant: "destructive" });
          setRetakeSuggested(true);
        }

        // Mask preview export
        try {
          const maskCanvas = document.createElement("canvas");
          maskCanvas.width = w;
          maskCanvas.height = h;
          (cv as any).imshow(maskCanvas, mask);
          const url = maskCanvas.toDataURL("image/png");
          setMaskUrl(url);
          setMaskGeom({ offsetX, offsetY, drawW, drawH });
        } catch {}
      }

      // Edge overlay via worker for uploaded image
      try {
        const container = containerRef.current;
        if (container) {
          const containerW = container.clientWidth;
          const containerH = container.clientHeight;
          const scale = Math.min(containerW / w, containerH / h);
          const drawW = w * scale;
          const drawH = h * scale;
          const offsetX = (containerW - drawW) / 2;
          const offsetY = (containerH - drawH) / 2;
          const pctx2 = procCanvas.getContext("2d");
          if (pctx2) {
            const frame = pctx2.getImageData(0, 0, w, h);
            const result = await opencvWorker.edges({ width: w, height: h, imageData: frame.data });
            const typed = (result && (result as any).imageData && (result as any).imageData.BYTES_PER_ELEMENT)
              ? (result as any).imageData as Uint8ClampedArray
              : new Uint8ClampedArray((result as any).imageData);
            const edgeImage = new ImageData(typed, (result as any).width || w, (result as any).height || h);
            updateEdgeOverlayFromImageData(edgeImage, w, h, offsetX, offsetY, drawW, drawH);
          }
        }
      } catch {}

      // Cleanup
      src.delete();
      rgba.delete();
      hsv.delete();
      ycrcb.delete();
      mask1.delete();
      mask2.delete();
      mask.delete();
      kernel.delete();
      if (bestCnt) bestCnt.delete();
      contours2.delete();
      hierarchy2.delete();
      if (voiceEnabled) {
        try { await playHumDetect(); } catch {}
      }
      toast({ title: "Auto-detect complete", description: "Review and adjust points if needed." });
    } catch (err: any) {
      toast({
        title: "Detection failed",
        description: err?.message || String(err),
        variant: "destructive",
      });
    } finally {
      setIsDetecting(false);
    }
  };

  const detectFromLive = async (opts?: { silent?: boolean }) => {
    const silent = !!opts?.silent;
    if (mode !== "live") {
      if (!silent) toast({ title: "Switch to Live", description: "Use the camera to auto-detect.", variant: "destructive" });
      return;
    }
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      if (!silent) toast({ title: "Camera not ready", description: "Wait for the camera stream to start.", variant: "destructive" });
      return;
    }
    setIsDetecting(true);
    try {
      const cv = await loadOpenCV();
      const w0 = video.videoWidth;
      const h0 = video.videoHeight;
      const targetMax = 640;
      const scaleDown = Math.min(1, targetMax / Math.max(w0, h0));
      const w = Math.max(1, Math.round(w0 * scaleDown));
      const h = Math.max(1, Math.round(h0 * scaleDown));

      // Draw current frame to processing canvas
      const procCanvas = document.createElement("canvas");
      procCanvas.width = w;
      procCanvas.height = h;
      const pctx = procCanvas.getContext("2d");
      if (!pctx) throw new Error("Canvas context unavailable");
      pctx.drawImage(video, 0, 0, w, h);

      const src = cv.imread(procCanvas);
      const rgba = new cv.Mat();
      cv.cvtColor(src, rgba, cv.COLOR_RGBA2RGB);
      const hsv = new cv.Mat();
      const ycrcb = new cv.Mat();
      cv.cvtColor(rgba, hsv, cv.COLOR_RGB2HSV);
      cv.cvtColor(rgba, ycrcb, cv.COLOR_RGB2YCrCb);
      try {
        if (typeof (cv as any).createCLAHE === "function") {
          const channels = new cv.MatVector();
          cv.split(ycrcb, channels);
          const y = channels.get(0);
          const cr = channels.get(1);
          const cb = channels.get(2);
          const clahe = (cv as any).createCLAHE(2.0, new cv.Size(8, 8));
          const yEq = new cv.Mat();
          clahe.apply(y, yEq);
          const merged = new cv.Mat();
          const mv = new cv.MatVector();
          mv.push_back(yEq); mv.push_back(cr); mv.push_back(cb);
          cv.merge(mv, merged);
          merged.copyTo(ycrcb);
          y.delete(); cr.delete(); cb.delete(); yEq.delete(); merged.delete(); mv.delete(); channels.delete();
        }
      } catch {}

      // Skin masking (classical) or ML segmentation
      const mask1 = new cv.Mat();
      const mask2 = new cv.Mat();
      const mask = new cv.Mat();
      let usedMl = false;
      if (useMlSegmentation) {
        try {
          const frame = pctx.getImageData(0, 0, w, h);
          const seg = await segWorker.segment({ width: w, height: h, imageData: frame.data });
          if (seg && seg.mask && seg.mask.length === w * h) {
            const maskMat = new cv.Mat(h, w, cv.CV_8UC1);
            maskMat.data.set(seg.mask);
            maskMat.copyTo(mask);
            maskMat.delete();
            usedMl = true;
          }
        } catch {}
      }
      if (!usedMl) {
        const low1 = new cv.Mat(h, w, cv.CV_8UC3, [0, 133, 77]);
        const high1 = new cv.Mat(h, w, cv.CV_8UC3, [255, 173, 127]);
        cv.inRange(ycrcb, low1, high1, mask1);
        const low2 = new cv.Mat(h, w, cv.CV_8UC3, [0, Math.round(0.23 * 255), 50]);
        const high2 = new cv.Mat(h, w, cv.CV_8UC3, [50, Math.round(0.68 * 255), 255]);
        cv.inRange(hsv, low2, high2, mask2);
        cv.bitwise_or(mask1, mask2, mask);
      }

      // Morphology
      const kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(7, 7));
      try {
        const tmp = new cv.Mat();
        cv.bilateralFilter(rgba, tmp, 5, 75, 75, cv.BORDER_DEFAULT);
        tmp.delete();
      } catch {}
      cv.morphologyEx(mask, mask, cv.MORPH_CLOSE, kernel);
      cv.morphologyEx(mask, mask, cv.MORPH_OPEN, kernel);

      // Contours to find main axis
      const contours = new cv.MatVector();
      const hierarchy = new cv.Mat();
      cv.findContours(mask, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
      let bestIdx = -1;
      let bestArea = 0;
      for (let i = 0; i < contours.size(); i++) {
        const cnt = contours.get(i);
        const area = cv.contourArea(cnt, false);
        if (area > bestArea) {
          bestArea = area;
          bestIdx = i;
        }
        cnt.delete();
      }
      contours.delete();
      hierarchy.delete();
      const contours2 = new cv.MatVector();
      const hierarchy2 = new cv.Mat();
      cv.findContours(mask, contours2, hierarchy2, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

      let axisUx = 1, axisUy = 0;
      let end1: { x: number; y: number } | null = null;
      let end2: { x: number; y: number } | null = null;
      let bestCnt: any = null;
      if (bestIdx >= 0) {
        const cnt = contours2.get(bestIdx);
        const moments = cv.moments(cnt, false);
        const cx = moments.m00 !== 0 ? moments.m10 / moments.m00 : w / 2;
        const cy = moments.m00 !== 0 ? moments.m01 / moments.m00 : h / 2;
        const angle = 0.5 * Math.atan2(2 * moments.mu11, moments.mu20 - moments.mu02);
        axisUx = Math.cos(angle);
        axisUy = Math.sin(angle);
        let minS = Number.POSITIVE_INFINITY;
        let maxS = Number.NEGATIVE_INFINITY;
        let minPt = { x: cx, y: cy };
        let maxPt = { x: cx, y: cy };
        const data = cnt.data32S;
        for (let i = 0; i < data.length; i += 2) {
          const x = data[i];
          const y = data[i + 1];
          const s = (x - cx) * axisUx + (y - cy) * axisUy;
          if (s < minS) { minS = s; minPt = { x, y }; }
          if (s > maxS) { maxS = s; maxPt = { x, y }; }
        }
        end1 = minPt; end2 = maxPt;
        bestCnt = cnt;
      }

      // Fallback Hough
      if (!end1 || !end2) {
        const gray = new cv.Mat();
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
        const blurred = new cv.Mat();
        cv.GaussianBlur(gray, blurred, new cv.Size(9, 9), 0, 0, cv.BORDER_DEFAULT);
        const edges = new cv.Mat();
        cv.Canny(blurred, edges, 50, 150);
        const lines = new cv.Mat();
        cv.HoughLinesP(edges, lines, 1, Math.PI / 180, 80, 0.2 * Math.min(w, h), 20);
        let bestLineLen = 0;
        for (let i = 0; i < lines.rows; i++) {
          const p = lines.int32Ptr(i);
          const x1 = p[0], y1 = p[1], x2 = p[2], y2 = p[3];
          const len = Math.hypot(x2 - x1, y2 - y1);
          if (len > bestLineLen) {
            bestLineLen = len;
            end1 = { x: x1, y: y1 };
            end2 = { x: x2, y: y2 };
            axisUx = (x2 - x1) / (len || 1);
            axisUy = (y2 - y1) / (len || 1);
          }
        }
        gray.delete(); blurred.delete(); edges.delete(); lines.delete();
      }

      // Map endpoints to overlay space and estimate girth
      const container = containerRef.current;
      if (end1 && end2 && container) {
        const containerW = container.clientWidth;
        const containerH = container.clientHeight;
        const invScale = 1 / (scaleDown || 1);
        const wOrig = w * invScale; const hOrig = h * invScale;
        const scale = Math.min(containerW / wOrig, containerH / hOrig);
        const drawW = w * scale;
        const drawH = h * scale;
        const offsetX = (containerW - drawW) / 2;
        const offsetY = (containerH - drawH) / 2;
        const mapPoint = (ix: number, iy: number) => ({ x: offsetX + (ix * invScale) * scale, y: offsetY + (iy * invScale) * scale });
        const p1 = mapPoint(end1.x, end1.y);
        const p2 = mapPoint(end2.x, end2.y);
        const chosen = chooseBaseAndTip(p1, p2);

        const maskForSample = mask;
        const perpUx = -axisUy;
        const perpUy = axisUx;
        const totalLen = Math.hypot(end2.x - end1.x, end2.y - end1.y) || 1;
        const centerX = (end1.x + end2.x) / 2;
        const centerY = (end1.y + end2.y) / 2;
        const ts = [-0.2, -0.1, -0.05, 0, 0.05, 0.1, 0.2];
        const widths: number[] = [];
        const maxScan = Math.floor(Math.min(w, h) * 0.25);
        const isInside = (x: number, y: number) => {
          const ix = Math.round(x);
          const iy = Math.round(y);
          if (ix < 0 || iy < 0 || ix >= w || iy >= h) return false;
          return maskForSample.ucharPtr(iy, ix)[0] > 0;
        };
        for (const t of ts) {
          const px = centerX + t * totalLen * axisUx;
          const py = centerY + t * totalLen * axisUy;
          let left = 0, right = 0;
          for (let s = 0; s < maxScan; s++) { if (!isInside(px - s * perpUx, py - s * perpUy)) { left = s; break; } }
          for (let s = 0; s < maxScan; s++) { if (!isInside(px + s * perpUx, py + s * perpUy)) { right = s; break; } }
          const width = left + right;
          if (width > 0) widths.push(width);
        }
        // Confidence + smoothing
        let elongation = 0;
        let solidity = 1;
        const lengthPx = Math.hypot(end2.x - end1.x, end2.y - end1.y) || 1;
        if (widths.length) {
          widths.sort((a, b) => a - b);
          const medianW = widths[Math.floor(widths.length / 2)];
          elongation = lengthPx / Math.max(1, medianW);
        }
        try {
          if (bestCnt) {
            const hull = new cv.Mat();
            cv.convexHull(bestCnt, hull, false, true);
            const area = cv.contourArea(bestCnt, false);
            const hullArea = Math.max(1, cv.contourArea(hull, false));
            solidity = Math.min(1, area / hullArea);
            hull.delete();
          }
        } catch {}
        const areaFraction = bestArea / (w * h);
        let confidence = 0;
        confidence += Math.min(1, (elongation || 0) / 3) * 0.45;
        confidence += Math.min(1, areaFraction / 0.2) * 0.25;
        confidence += Math.min(1, solidity) * 0.30;

        setConfidence(confidence);
        // Update temporal edge map for snapping/stabilization via worker (fallback to main thread on failure)
        try {
          const ctx2 = procCanvas.getContext("2d");
          if (ctx2) {
            const frame = ctx2.getImageData(0, 0, w, h);
            const result = await opencvWorker.edges({ width: w, height: h, imageData: frame.data });
            const typed = (result && (result as any).imageData && (result as any).imageData.BYTES_PER_ELEMENT)
              ? (result as any).imageData as Uint8ClampedArray
              : new Uint8ClampedArray((result as any).imageData);
            const edgeImage = new ImageData(typed, (result as any).width || w, (result as any).height || h);
            updateEdgeOverlayFromImageData(edgeImage, w, h, offsetX, offsetY, drawW, drawH);
          }
        } catch {
          try {
            const edgesForOverlay = new cv.Mat();
            const grayTmp = new cv.Mat();
            cv.cvtColor(src, grayTmp, cv.COLOR_RGBA2GRAY);
            const blurredTmp = new cv.Mat();
            cv.GaussianBlur(grayTmp, blurredTmp, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);
            cv.Canny(blurredTmp, edgesForOverlay, 50, 150);
            updateEdgeOverlayFromMat(
              cv,
              edgesForOverlay,
              w,
              h,
              offsetX,
              offsetY,
              drawW,
              drawH,
            );
            edgesForOverlay.delete();
            grayTmp.delete();
            blurredTmp.delete();
          } catch {}
        }
        if (confidence >= minConfidence) {
          const alpha = 0.35;
          const smBase = smoothPoint(basePointRef.current, chosen.base, alpha);
          const smTip = smoothPoint(tipPointRef.current, chosen.tip, alpha);
          setBasePoint(smBase);
          setTipPoint(smTip);
          if (widths.length) {
            const median = widths[Math.floor(widths.length / 2)] * (scale * invScale);
            const smG = lerp(girthPixelsRef.current || 0, median, alpha);
            setGirthPixels(smG);
          }
          setAutoStatus(`detect: ${confidence.toFixed(2)}`);
        } else {
          setAutoStatus(`weak: ${confidence.toFixed(2)}`);
        }

        // Mask preview export
        try {
          const maskCanvas = document.createElement("canvas");
          maskCanvas.width = w;
          maskCanvas.height = h;
          (cv as any).imshow(maskCanvas, mask);
          const url = maskCanvas.toDataURL("image/png");
          setMaskUrl(url);
          setMaskGeom({ offsetX, offsetY, drawW, drawH });
        } catch {}
      }

      // Cleanup
      src.delete(); rgba.delete(); hsv.delete(); ycrcb.delete();
      mask1.delete(); mask2.delete(); mask.delete(); kernel.delete();
      if (bestCnt) bestCnt.delete();
      contours2.delete(); hierarchy2.delete();
      if (!silent && voiceEnabled) {
        try { await playHumDetect(); } catch {}
      }
      if (!silent) toast({ title: "Auto-detect complete", description: "Review and adjust points if needed." });
    } catch (err: any) {
      if (!silent) toast({ title: "Detection failed", description: err?.message || String(err), variant: "destructive" });
    } finally {
      setIsDetecting(false);
    }
  };

  const clearPoints = () => {
    setBasePoint(null);
    setTipPoint(null);
  };

  const capture = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let photoBlob: Blob | null = null;
    if (mode === "live") {
      const video = videoRef.current;
      if (!video) return;
      // draw current frame to canvas
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      photoBlob = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b as Blob), "image/jpeg", 0.9),
      );
    } else {
      if (!uploadedBlob) {
        toast({
          title: "No image uploaded",
          description: "Please upload an image first.",
          variant: "destructive",
        });
        return;
      }
      photoBlob = uploadedBlob;
    }

    // create measurement entity
    const inches = parseFloat(lengthDisplay);
    const girth = parseFloat(girthDisplay);
    const measurement: Measurement = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      length: unit === "in" ? inches : cmToIn(inches),
      girth: unit === "in" ? girth : cmToIn(girth),
      notes: "Auto-captured",
      photoUrl: "indexeddb://photo",
    };

    saveMeasurement(measurement);
    if (photoBlob) {
      await savePhoto(measurement.id, photoBlob);
    }

    // Compare to latest previous
    const prev = latestPrev;
    if (prev) {
      const dL = measurement.length - prev.length;
      const dG = measurement.girth - prev.girth;
      const trend = (v: number) => (v > 0 ? `+${v.toFixed(2)}"` : `${v.toFixed(2)}"`);
      let recommendation = "Keep consistent lighting and angle.";
      if (dL < -0.1 || dG < -0.1)
        recommendation =
          "Slight decrease detected. Recheck calibration and ensure full erection for consistency.";
      if (dG > 0.25)
        recommendation =
          "Significant girth increase. Consider longer rest intervals and monitor for edema.";
      if (dL > 0.25)
        recommendation = "Great length gain. Maintain current protocol; avoid overtraining.";
      if (voiceEnabled) {
        try {
          if (speakOnCapture) {
            await playComplimentWithContext({
              length_in: measurement.length,
              length_cm: inToCm(measurement.length),
              girth_in: measurement.girth,
              girth_cm: inToCm(measurement.girth),
              confidence,
            });
          } else {
            await playCompliment();
          }
        } catch {}
      }
      toast({
        title: "Captured & Saved",
        description: `Δ Length ${trend(dL)}, Δ Girth ${trend(dG)}. ${recommendation}`,
      });
    } else {
      if (voiceEnabled) {
        try {
          if (speakOnCapture) {
            await playComplimentWithContext({
              length_in: measurement.length,
              length_cm: inToCm(measurement.length),
              girth_in: measurement.girth,
              girth_cm: inToCm(measurement.girth),
              confidence,
            });
          } else {
            await playCompliment();
          }
        } catch {}
      }
      toast({ title: "Captured & Saved", description: "First measurement stored." });
    }
  };

  const toggleFreeze = () => {
    if (isFrozen) {
      setIsFrozen(false);
      if (frozenUrl) URL.revokeObjectURL(frozenUrl);
      setFrozenUrl("");
      return;
    }
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob((b) => {
      if (!b) return;
      const url = URL.createObjectURL(b);
      setFrozenUrl(url);
      setIsFrozen(true);
    }, "image/png");
  };

  // Continuous auto-detect for live video with stability-based auto-capture
  useEffect(() => {
    if (!autoDetect || mode !== "live" || isFrozen) {
      if (autoDetectRafRef.current) cancelAnimationFrame(autoDetectRafRef.current);
      autoDetectRafRef.current = null;
      setAutoStatus("idle");
      setRetakeSuggested(false);
      return;
    }
    const loop = async () => {
      const now = performance.now();
      if (!isDetecting && now - lastDetectTsRef.current > detectionIntervalMs) {
        lastDetectTsRef.current = now;
        try {
          await detectFromLive({ silent: true });
          // Update stability history after a detect pass
          const len = parseFloat(lengthDisplayRef.current || "0") || 0;
          const girth = parseFloat(girthDisplayRef.current || "0") || 0;
          const hist = stabilityHistoryRef.current;
          const cutoff = now - stabilitySeconds * 1000;
          hist.push({ ts: now, len, girth });
          while (hist.length && hist[0].ts < cutoff) hist.shift();
          if (hist.length >= 3) {
            const lenVals = hist.map((h) => h.len);
            const girVals = hist.map((h) => h.girth);
            const lenRange = Math.max(...lenVals) - Math.min(...lenVals);
            const girRange = Math.max(...girVals) - Math.min(...girVals);
            const stable = lenRange <= stabilityLenTolInches && girRange <= stabilityGirthTolInches && (confidenceRef.current || 0) >= minConfidence;
            const prevStatus = autoStatus;
            const nextStatus = stable ? "locked" : "stabilizing";
            if (nextStatus !== prevStatus) {
              setAutoStatus(nextStatus);
              if (stable && voiceEnabled && speakOnLock) {
                try {
                  const lenIn = parseFloat(lengthDisplayRef.current || "0") || 0;
                  const girIn = parseFloat(girthDisplayRef.current || "0") || 0;
                  await playComplimentWithContext({
                    length_in: lenIn,
                    length_cm: inToCm(lenIn),
                    girth_in: girIn,
                    girth_cm: inToCm(girIn),
                    confidence: confidenceRef.current || 0,
                  });
                } catch {}
              }
            } else {
              setAutoStatus(nextStatus);
            }
            const cooldownOk = now - lastAutoCaptureTsRef.current >= autoCaptureCooldownSec * 1000;
            // Update stability progress timing
            if (stable) {
              if (stableStartTsRef.current == null) stableStartTsRef.current = now;
              const elapsed = (now - (stableStartTsRef.current || now)) / (stabilitySeconds * 1000);
              const prog = Math.max(0, Math.min(1, elapsed));
              setStabilityProgress(prog);
            } else {
              stableStartTsRef.current = null;
              setStabilityProgress(0);
            }
            if (stable && autoCapture && cooldownOk) {
              try { await capture(); } catch {}
              lastAutoCaptureTsRef.current = now;
              setAutoStatus("captured");
            }
            // Suggest retake when confidence is low or instability persists
            setRetakeSuggested(!stable || (confidenceRef.current || 0) < minConfidence);
          } else {
            setAutoStatus("scanning");
            setRetakeSuggested(false);
          }
        } catch {}
      }
      autoDetectRafRef.current = requestAnimationFrame(loop);
    };
    autoDetectRafRef.current = requestAnimationFrame(loop);
    return () => {
      if (autoDetectRafRef.current) cancelAnimationFrame(autoDetectRafRef.current);
      autoDetectRafRef.current = null;
    };
  }, [autoDetect, mode, isFrozen, isDetecting, detectionIntervalMs, autoCapture, stabilitySeconds, stabilityLenTolInches, stabilityGirthTolInches, autoCaptureCooldownSec]);

  const exportOverlayPNG = async () => {
    const overlay = overlayRef.current;
    const exportCanvas = overlayExportRef.current;
    if (!overlay || !exportCanvas) return;
    // ensure sizes are synced
    exportCanvas.width = overlay.width;
    exportCanvas.height = overlay.height;
    const ctx = exportCanvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, exportCanvas.width, exportCanvas.height);
    ctx.drawImage(overlay, 0, 0);
    const blob: Blob = await new Promise((resolve) =>
      exportCanvas.toBlob((b) => resolve(b as Blob), "image/png"),
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `overlay_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // Load previous to suggest overlay easing
  const latestPrev = (() => {
    const list = getMeasurements();
    if (!list.length) return null;
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  })();

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <CardTitle className="flex items-center gap-2 flex-shrink-0">
                  <Ruler className="w-5 h-5" /> Measure
                </CardTitle>
                <Tabs value={mode} onValueChange={(v) => setMode(v as "live" | "upload")} className="flex-shrink-0">
                  <TabsList>
                    <TabsTrigger value="live">Live</TabsTrigger>
                    <TabsTrigger value="upload">Upload</TabsTrigger>
                  </TabsList>
                </Tabs>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="ml-1 flex-shrink-0" title="Help (shortcuts)">
                      <HelpCircle className="w-5 h-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Shortcuts & Tips</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 text-sm">
                      <div><Badge variant="outline">D</Badge> Auto-detect</div>
                      <div><Badge variant="outline">C</Badge> Capture</div>
                      <div><Badge variant="outline">F</Badge> Freeze / Unfreeze</div>
                      <div><Badge variant="outline">S</Badge> Toggle Snap-to-edge</div>
                      <div>Arrows: Nudge selected handle; Shift = faster</div>
                      <div>Click two points to calibrate or measure manually.</div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex gap-2 overflow-x-auto min-w-0 max-w-full pb-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                <div className="flex gap-2 flex-nowrap min-w-max">
                  {mode === "live" && (
                    <>
                      <select
                        value={deviceId}
                        onChange={(e) => setDeviceId(e.target.value)}
                        className="bg-card border border-border rounded-md px-2 py-1 text-sm min-w-[140px] flex-shrink-0"
                        title="Camera device"
                      >
                        {devices.length === 0 && <option value="">No cameras</option>}
                        {devices.map((d) => (
                          <option key={d.deviceId} value={d.deviceId}>
                            {d.label || `Camera ${d.deviceId.slice(0, 4)}`}
                          </option>
                        ))}
                      </select>
                      <select
                        value={`${resolution.w}x${resolution.h}`}
                        onChange={(e) => {
                          const [w, h] = e.target.value.split("x").map((n) => parseInt(n, 10));
                          setResolution({ w, h });
                        }}
                        className="bg-card border border-border rounded-md px-2 py-1 text-sm min-w-[100px] flex-shrink-0"
                        title="Resolution"
                      >
                        {[
                          [640, 480],
                          [1280, 720],
                          [1920, 1080],
                        ].map(([w, h]) => (
                          <option key={`${w}x${h}`} value={`${w}x${h}`}>{w}x{h}</option>
                        ))}
                      </select>
                      <select
                        value={String(targetFps)}
                        onChange={(e) => setTargetFps(parseInt(e.target.value, 10))}
                        className="bg-card border border-border rounded-md px-2 py-1 text-sm min-w-[80px] flex-shrink-0"
                        title="Target FPS"
                      >
                        {[15, 24, 30, 60].map((f) => (
                          <option key={f} value={f}>{f} fps</option>
                        ))}
                      </select>
                    </>
                  )}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setIsCalibrating(true)} className="flex-shrink-0">
                        Calibrate
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Click two points of a known distance</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={clearPoints} className="flex-shrink-0">
                        <RefreshCw className="w-4 h-4 mr-1" /> Reset
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Clear measurement points</TooltipContent>
                  </Tooltip>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as "in" | "cm")}
                    className="bg-card border border-border rounded-md px-2 py-1 text-sm min-w-[60px] flex-shrink-0"
                  >
                    <option value="in">in</option>
                    <option value="cm">cm</option>
                  </select>
                  {mode === "upload" && (
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (uploadedUrl) URL.revokeObjectURL(uploadedUrl);
                        const url = URL.createObjectURL(file);
                        setUploadedUrl(url);
                        setUploadedBlob(file);
                      }}
                      className="w-48 flex-shrink-0"
                    />
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {showOnboarding && (
              <div className="mb-3">
                <Alert>
                  <AlertDescription>
                    Tip: Calibrate first for accurate units. For Live, use good lighting and contrast.
                    You can enable Voice Coach to auto-speak on capture and lock.
                    <Button variant="link" className="pl-2" onClick={() => setShowOnboarding(false)}>Got it</Button>
                  </AlertDescription>
                </Alert>
              </div>
            )}
            <div className="relative w-full" ref={containerRef}>
              {mode === "live" ? (
                isFrozen && frozenUrl ? (
                  <img
                    src={frozenUrl}
                    alt="Frozen frame"
                    className="w-full max-h-[70vh] rounded-lg bg-black object-contain"
                  />
                ) : (
                  <video
                    ref={videoRef}
                    className="w-full max-h-[70vh] rounded-lg bg-black"
                    playsInline
                    muted
                  />
                )
              ) : uploadedUrl ? (
                <img
                  src={uploadedUrl}
                  alt="Uploaded"
                  className="w-full max-h-[70vh] rounded-lg bg-black object-contain"
                />
              ) : (
                <div className="w-full max-h-[70vh] h-[50vh] rounded-lg bg-black/60 flex items-center justify-center text-sm text-muted-foreground">
                  Upload an image to begin measurement
                </div>
              )}
              {showMask && maskUrl && maskGeom && (
                <img
                  src={maskUrl}
                  alt="Mask"
                  className="absolute pointer-events-none"
                  style={{
                    left: maskGeom.offsetX,
                    top: maskGeom.offsetY,
                    width: maskGeom.drawW,
                    height: maskGeom.drawH,
                    opacity: maskOpacity / 100,
                  }}
                />
              )}
              {showPrevOverlay && prevOverlayUrl && (
                <img
                  src={prevOverlayUrl}
                  alt="Previous overlay"
                  className="absolute left-0 top-0 w-full h-full object-cover pointer-events-none"
                  style={{ opacity: overlayOpacity / 100 }}
                />
              )}
              <canvas
                ref={overlayRef}
                className="absolute left-0 top-0 w-full h-full cursor-crosshair"
                onClick={handleOverlayClick}
                onMouseDown={handleOverlayMouseDown}
                onMouseMove={handleOverlayMouseMove}
                onMouseUp={handleOverlayMouseUp}
              />
              {mode === "upload" && uploadedUrl && (
                <div className="absolute right-3 bottom-3 flex gap-2">
                  <Button size="sm" onClick={detectFromImage} disabled={isDetecting}>
                    {isDetecting ? "Detecting…" : "Auto-detect"}
                  </Button>
                </div>
              )}
              {mode === "live" && (
                <div className="absolute right-3 bottom-3 flex gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" title={capabilities ? (capabilities.canTorch ? "Back camera likely active" : "Front camera likely active") : "Flip camera"} onClick={() => setFacingMode((v) => (v === "environment" ? "user" : "environment"))}>
                        Flip
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Switch front/back camera</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={toggleFreeze}>
                        {isFrozen ? "Unfreeze" : "Freeze"}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Freeze the current frame</TooltipContent>
                  </Tooltip>
                  {capabilities?.canTorch && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setTorchOn((v) => !v)}>
                          {torchOn ? "Torch off" : "Torch on"}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Toggle device torch</TooltipContent>
                    </Tooltip>
                  )}
                  {capabilities?.canZoom && capabilities.zoom && (
                    <div className="flex items-center gap-2 bg-black/40 rounded px-2 py-1">
                      <span className="text-white text-xs">Zoom</span>
                      <input
                        type="range"
                        min={capabilities.zoom.min}
                        max={capabilities.zoom.max}
                        step={capabilities.zoom.step ?? 0.1}
                        value={zoomLevel ?? capabilities.zoom.min}
                        onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                      />
                    </div>
                  )}
                  <Button size="sm" onClick={() => detectFromLive()} disabled={isDetecting || isFrozen}>
                    {isDetecting ? "Detecting…" : "Auto-detect"}
                  </Button>
                </div>
              )}
              {showHud && (
                <div
                  className="absolute left-3 right-3 pointer-events-none select-none"
                  aria-live="polite"
                  aria-atomic="true"
                  style={{ bottom: `calc(${mode === "live" ? 88 : (mode === "upload" && uploadedUrl ? 64 : 12)}px + env(safe-area-inset-bottom))` }}
                >
                  <div className="bg-black/50 rounded-md p-2 text-xs text-white flex items-center gap-3">
                    <span className={`whitespace-nowrap ${autoStatus.includes('detect') ? 'text-sky-300' : autoStatus === 'locked' ? 'text-emerald-300' : autoStatus === 'captured' ? 'text-amber-300' : autoStatus.includes('weak') ? 'text-rose-300' : 'text-slate-300'}`}>{autoStatus}</span>
                    <div className="flex-1">
                      <Progress value={Math.max(0, Math.min(100, Math.round(confidence * 100)))} />
                    </div>
                    <div className="hidden md:flex items-center gap-2">
                      <span className="opacity-80">Quality</span>
                      <Progress value={Math.max(0, Math.min(100, Math.round(qualityScore * 100)))} />
                    </div>
                    {curvatureDeg > 0 && (
                      <span className="ml-2 opacity-90">Curv ≈ {curvatureDeg.toFixed(1)}°</span>
                    )}
                    <span className="whitespace-nowrap">{Math.max(0, Math.min(1, confidence)).toFixed(2)}</span>
                    <span className="opacity-70 whitespace-nowrap">min {minConfidence.toFixed(2)}</span>
                    {mode === "live" && (
                      <span className="opacity-70 whitespace-nowrap">{measuredFps} fps</span>
                    )}
                    {retakeSuggested && (
                      <span className="text-amber-300 whitespace-nowrap">Retake suggested</span>
                    )}
                    {/* Quality hints */}
                    {qualityDetail && (
                      <span className="hidden md:block opacity-90 whitespace-nowrap">
                        {(() => {
                          const hints: string[] = [];
                          const q = qualityDetail;
                          if (q.brightness < minBrightnessRef.current) hints.push('Brighten scene');
                          if (q.brightness > maxBrightnessRef.current) hints.push('Reduce exposure');
                          if (q.blurVar < minBlurVarRef.current) hints.push('Hold steadier');
                          if (q.sizeFraction < minSizeFractionRef.current) hints.push('Move closer');
                          if (q.sizeFraction > maxSizeFractionRef.current) hints.push('Move back');
                          if (q.edgeProximity > maxEdgeProximityRef.current) hints.push('Center subject');
                          return hints.slice(0, 2).join(' · ');
                        })()}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
            {streamError && (
              <div className="mt-2">
                <Alert variant="destructive">
                  <AlertDescription>
                    {streamError}. Please allow camera permissions or switch to Upload mode.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <CalibrationCard
            calibrationInches={calibrationInches}
            onChangeCalibrationInches={(val) => setCalibrationInches(val)}
            onStartCalibrating={() => setIsCalibrating(true)}
            pixelsPerInch={pixelsPerInch}
          />

          <Card>
            <CardHeader>
              <CardTitle>Girth</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground">
                Drag to match on-screen width at mid-shaft; we estimate circumference.
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Snap to edge (S)</span>
                <Switch checked={snapEnabled} onCheckedChange={setSnapEnabled} />
              </div>
              <div className="pt-2 space-y-2">
                <label className="text-xs text-muted-foreground">Snap radius: {snapRadiusPx}px</label>
                <Slider value={[snapRadiusPx]} min={4} max={60} step={1} onValueChange={(v) => setSnapRadiusPx(v[0])} />
              </div>
              <Slider
                value={[girthPixels]}
                min={0}
                max={600}
                step={1}
                onValueChange={(v) => setGirthPixels(v[0])}
              />
              <div className="text-sm">
                Girth:{" "}
                <span className="font-semibold">
                  {girthDisplay} {unit}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Readouts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">
                Length:{" "}
                <span className="font-semibold">
                  {lengthDisplay} {unit}
                </span>
              </div>
              <div className="text-sm">Unit scale: {pixelsPerInch.toFixed(1)} px/in</div>
              <div className="text-sm">Grid: {showGrid ? `on (${gridSize}px)` : "off"}</div>
              <div className="flex items-center gap-2 pt-1">
                <Switch checked={showGrid} onCheckedChange={setShowGrid} />
                <span className="text-sm">Show grid</span>
              </div>
              {showGrid && (
                <div className="pt-2">
                  <label className="text-xs text-muted-foreground">Grid size: {gridSize}px</label>
                  <Slider value={[gridSize]} min={8} max={80} step={1} onValueChange={(v) => setGridSize(v[0])} />
                </div>
              )}
              <div className="flex items-center gap-2 pt-2">
                <Switch checked={showScanSweep} onCheckedChange={setShowScanSweep} />
                <span className="text-sm">Scan sweep</span>
              </div>
              {showScanSweep && (
                <div className="pt-2">
                  <label className="text-xs text-muted-foreground">Sweep intensity: {sweepIntensity}%</label>
                  <Slider value={[sweepIntensity]} min={0} max={40} step={1} onValueChange={(v) => setSweepIntensity(v[0])} />
                </div>
              )}
              <div className="flex items-center gap-2 pt-2">
                <Switch checked={showPulsingHalos} onCheckedChange={setShowPulsingHalos} />
                <span className="text-sm">Pulsing halos</span>
              </div>
              {showPulsingHalos && (
                <div className="pt-2">
                  <label className="text-xs text-muted-foreground">Halo intensity: {haloIntensity}%</label>
                  <Slider value={[haloIntensity]} min={0} max={100} step={1} onValueChange={(v) => setHaloIntensity(v[0])} />
                </div>
              )}
              <div className="flex items-center gap-2 pt-2">
                <Switch checked={showStabilityRing} onCheckedChange={setShowStabilityRing} />
                <span className="text-sm">Stability ring</span>
              </div>
              {showStabilityRing && (
                <div className="pt-2">
                  <label className="text-xs text-muted-foreground">Ring size: {ringSize}px</label>
                  <Slider value={[ringSize]} min={8} max={40} step={1} onValueChange={(v) => setRingSize(v[0])} />
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button onClick={capture} className="gap-2">
                  <CameraIcon className="w-4 h-4" /> Capture
                </Button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" className="gap-2" onClick={async () => {
                      const len = `${lengthDisplay} ${unit}`;
                      const gir = `${girthDisplay} ${unit}`;
                      const scale = `${pixelsPerInch.toFixed(1)} px/in`;
                      const text = `Length: ${len}\nGirth: ${gir}\nScale: ${scale}`;
                      try {
                        await navigator.clipboard.writeText(text);
                        toast({ title: "Copied", description: "Readouts copied to clipboard" });
                      } catch {
                        toast({ title: "Copy failed", description: "Clipboard not available", variant: "destructive" });
                      }
                    }}>
                      <CopyIcon className="w-4 h-4" /> Copy values
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy length, girth, and scale</TooltipContent>
                </Tooltip>
              </div>
              {latestPrev && (
                <div className="text-xs text-muted-foreground">
                  Prev: L {latestPrev.length.toFixed(2)}", G {latestPrev.girth.toFixed(2)}"
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Experimental</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm font-medium">Quality thresholds</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Min brightness: {Math.round(minBrightnessRef.current)}</label>
                  <Slider value={[minBrightnessRef.current]} min={0} max={255} step={1} onValueChange={(arr) => { minBrightnessRef.current = arr[0]; }} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Max brightness: {Math.round(maxBrightnessRef.current)}</label>
                  <Slider value={[maxBrightnessRef.current]} min={0} max={255} step={1} onValueChange={(arr) => { maxBrightnessRef.current = arr[0]; }} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Min blur variance: {Math.round(minBlurVarRef.current)}</label>
                  <Slider value={[minBlurVarRef.current]} min={0} max={400} step={1} onValueChange={(arr) => { minBlurVarRef.current = arr[0]; }} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Min size fraction: {minSizeFractionRef.current.toFixed(2)}</label>
                  <Slider value={[Math.round(minSizeFractionRef.current * 100)]} min={1} max={60} step={1} onValueChange={(arr) => { minSizeFractionRef.current = arr[0] / 100; }} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Max size fraction: {maxSizeFractionRef.current.toFixed(2)}</label>
                  <Slider value={[Math.round(maxSizeFractionRef.current * 100)]} min={10} max={90} step={1} onValueChange={(arr) => { maxSizeFractionRef.current = arr[0] / 100; }} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Max edge proximity: {Math.round(maxEdgeProximityRef.current * 100)}%</label>
                  <Slider value={[Math.round(maxEdgeProximityRef.current * 100)]} min={0} max={60} step={1} onValueChange={(arr) => { maxEdgeProximityRef.current = arr[0] / 100; }} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Use ML segmentation (ONNXRuntime) [experimental]</span>
                <Switch checked={useMlSegmentation} onCheckedChange={setUseMlSegmentation} />
              </div>
              <div className="text-xs text-muted-foreground">
                When enabled, segmentation runs in a web worker. If no model is available, it falls back to classical masking.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">Voice Coach</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Enable voice</span>
                <Switch checked={voiceEnabled} onCheckedChange={setVoice} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Use custom lines</span>
                <Switch checked={useCustomVoice} onCheckedChange={setUseCustomVoice} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Voice</label>
                  <Select value={voiceName ?? "system-default"} onValueChange={(v) => setVoiceNameState(v === "system-default" ? null : v)}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="System default" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system-default">System default</SelectItem>
                      {voiceList.map((v) => (
                        <SelectItem key={v.name} value={v.name}>{v.name} ({v.lang})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Rate: {voiceRate.toFixed(2)}</label>
                  <Slider value={[voiceRate]} min={0.5} max={2.0} step={0.01} onValueChange={(arr) => setVoiceRateState(arr[0])} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Pitch: {voicePitch.toFixed(2)}</label>
                  <Slider value={[voicePitch]} min={0} max={2} step={0.01} onValueChange={(arr) => setVoicePitchState(arr[0])} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Volume: {Math.round(voiceVolume * 100)}%</label>
                  <Slider value={[voiceVolume]} min={0} max={1} step={0.01} onValueChange={(arr) => setVoiceVolumeState(arr[0])} />
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <Button variant="outline" size="sm" onClick={() => {
                  setVoiceNameState("");
                  setVoiceRateState(1.0);
                  setVoicePitchState(1.0);
                  setVoiceVolumeState(1.0);
                  setUseCustomVoice(false);
                  setCustomVoiceText("");
                  setAutoplayEnabledState(false);
                }}>Reset voice defaults</Button>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Custom lines (one per line)</label>
                <div className="flex items-center gap-2">
                  <Select onValueChange={(v) => {
                    if (v === "concise") {
                      setCustomVoiceText([
                        "Length {length_in} in, girth {girth_in} in.",
                        "Confidence {confidence}.",
                      ].join("\n"));
                    } else if (v === "metric") {
                      setCustomVoiceText([
                        "Length {length_cm} cm, girth {girth_cm} cm.",
                        "Confidence {confidence}.",
                      ].join("\n"));
                    } else if (v === "clear") {
                      setCustomVoiceText("");
                    }
                  }}>
                    <SelectTrigger className="w-[220px]"><SelectValue placeholder="Load preset" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="concise">Concise (inches)</SelectItem>
                      <SelectItem value="metric">Metric (cm)</SelectItem>
                      <SelectItem value="clear">Clear</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  value={customVoiceText}
                  onChange={(e) => setCustomVoiceText(e.target.value)}
                  placeholder={"Enter phrases, one per line"}
                  className="min-h-[120px]"
                />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { const arr = getCustomVoiceLines(); if (arr.length) void playCustomLine(arr[Math.floor(Math.random()*arr.length)]); }} disabled={!voiceEnabled}>
                    Test custom line
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { void playCompliment(); }} disabled={!voiceEnabled}>
                    Test compliment
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { const lenIn = parseFloat(lengthDisplayRef.current || "0") || 0; const girIn = parseFloat(girthDisplayRef.current || "0") || 0; void playComplimentWithContext({ length_in: lenIn, length_cm: inToCm(lenIn), girth_in: girIn, girth_cm: inToCm(girIn), confidence: confidenceRef.current || 0 }); }} disabled={!voiceEnabled}>
                    Test with values
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => stopSpeaking()} disabled={!voiceEnabled}>
                    Stop voice
                  </Button>
                </div>
                <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                  <span>Placeholders:</span>
                  {["{length_in}", "{length_cm}", "{girth_in}", "{girth_cm}", "{confidence}"].map((ph) => (
                    <Badge key={ph} variant="secondary" className="cursor-pointer" onClick={() => {
                      const token = ph;
                      setCustomVoiceText((prev) => prev ? (prev.endsWith("\n") ? prev + token : prev + " " + token) : token);
                    }}>{ph}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Speak on capture</span>
                <Switch checked={speakOnCapture} onCheckedChange={setSpeakOnCaptureState} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Speak when detection locks</span>
                <Switch checked={speakOnLock} onCheckedChange={setSpeakOnLockState} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Auto-play compliments</span>
                <Switch checked={autoplayEnabled} onCheckedChange={setAutoplayEnabledState} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Auto-play interval: {Math.round(autoplayIntervalMs / 1000)}s</label>
                <Slider value={[autoplayIntervalMs]} min={1000} max={60000} step={500} onValueChange={(arr) => setAutoplayIntervalMsState(arr[0])} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Overlay Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Selected handle</span>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Button size="sm" variant={selectedHandle === "base" ? "default" : "outline"} onClick={() => setSelectedHandle("base")}>Base</Button>
                  <Button size="sm" variant={selectedHandle === "tip" ? "default" : "outline"} onClick={() => setSelectedHandle("tip")}>Tip</Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Nudge step: {nudgeStep}px (Shift = x5)</label>
                <Slider value={[nudgeStep]} min={1} max={10} step={1} onValueChange={(v) => setNudgeStep(v[0])} />
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div></div>
                  <Button variant="outline" size="sm" onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp" }))}><ArrowUp className="w-4 h-4" /></Button>
                  <div></div>
                  <Button variant="outline" size="sm" onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }))}><ArrowLeft className="w-4 h-4" /></Button>
                  <div></div>
                  <Button variant="outline" size="sm" onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }))}><ArrowRight className="w-4 h-4" /></Button>
                  <div></div>
                  <Button variant="outline" size="sm" onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }))}><ArrowDown className="w-4 h-4" /></Button>
                  <div></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Show HUD</span>
                <Switch checked={showHud} onCheckedChange={setShowHud} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Live auto-detect</span>
                <Switch checked={autoDetect} onCheckedChange={setAutoDetect} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Auto-capture when stable</span>
                <Switch checked={autoCapture} onCheckedChange={setAutoCapture} />
              </div>
              <div className="text-xs text-muted-foreground">
                Status: {autoStatus}
              </div>
              <div className="pt-2 space-y-2">
                <label className="text-xs text-muted-foreground">Minimum confidence: {minConfidence.toFixed(2)}</label>
                <Slider value={[minConfidence]} min={0.3} max={0.9} step={0.01} onValueChange={(v) => setMinConfidence(v[0])} />
              </div>
              <div className="pt-2 space-y-2">
                <label className="text-xs text-muted-foreground">Detection interval: {Math.round(detectionIntervalMs)} ms</label>
                <Slider value={[detectionIntervalMs]} min={300} max={2000} step={50} onValueChange={(v) => setDetectionIntervalMs(v[0])} />
              </div>
              <div className="pt-2 space-y-2">
                <label className="text-xs text-muted-foreground">Stability window: {stabilitySeconds.toFixed(1)} s</label>
                <Slider value={[stabilitySeconds]} min={0.5} max={5} step={0.1} onValueChange={(v) => setStabilitySeconds(v[0])} />
              </div>
              <div className="pt-2 space-y-2">
                <label className="text-xs text-muted-foreground">Length tolerance: {stabilityLenTolInches.toFixed(2)} in</label>
                <Slider value={[stabilityLenTolInches]} min={0.01} max={0.5} step={0.01} onValueChange={(v) => setStabilityLenTolInches(v[0])} />
              </div>
              <div className="pt-2 space-y-2">
                <label className="text-xs text-muted-foreground">Girth tolerance: {stabilityGirthTolInches.toFixed(2)} in</label>
                <Slider value={[stabilityGirthTolInches]} min={0.05} max={1.0} step={0.01} onValueChange={(v) => setStabilityGirthTolInches(v[0])} />
              </div>
              <div className="pt-2 space-y-2">
                <label className="text-xs text-muted-foreground">Auto-capture cooldown: {autoCaptureCooldownSec}s</label>
                <Slider value={[autoCaptureCooldownSec]} min={5} max={60} step={1} onValueChange={(v) => setAutoCaptureCooldownSec(v[0])} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Show mask preview</span>
                <Switch checked={showMask} onCheckedChange={setShowMask} />
              </div>
              {showMask && (
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Mask opacity: {maskOpacity}%</label>
                  <Slider value={[maskOpacity]} min={0} max={100} step={1} onValueChange={(v) => setMaskOpacity(v[0])} />
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm">Show previous photo</span>
                <Switch checked={showPrevOverlay} onCheckedChange={setShowPrevOverlay} />
              </div>
              <div className="pt-2 space-y-2">
                <div className="text-sm font-medium">Auto-calibration</div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={autoCalibrateFromLive} disabled={isAutoCalibrating || mode !== "live"}>
                    {isAutoCalibrating && mode === "live" ? "Calibrating…" : "From live"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={autoCalibrateFromImage} disabled={isAutoCalibrating || mode !== "upload"}>
                    {isAutoCalibrating && mode === "upload" ? "Calibrating…" : "From image"}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Previous photo</label>
                <select
                  value={selectedPrevId}
                  onChange={(e) => setSelectedPrevId(e.target.value)}
                  className="w-full bg-card border border-border rounded-md px-2 py-2 text-sm"
                >
                  {prevPhotos.length === 0 && <option value="">None</option>}
                  {prevPhotos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {new Date(p.date).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">
                  Overlay opacity: {overlayOpacity}%
                </label>
                <Slider
                  value={[overlayOpacity]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(v) => setOverlayOpacity(v[0])}
                />
              </div>
              <div>
                <Button variant="outline" className="gap-2" onClick={exportOverlayPNG}>
                  <Download className="w-4 h-4" /> Export overlay PNG
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />
      <canvas ref={overlayExportRef} className="hidden" />
    </div>
  );
}
