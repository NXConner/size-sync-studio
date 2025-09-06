import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Ruler, Camera as CameraIcon, RefreshCw, Image as ImageIcon, Download, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import { Measurement } from "@/types";
import { saveMeasurement, savePhoto, getMeasurements, getPhoto } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { CalibrationCard } from "@/components/measure/CalibrationCard";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { getVoiceEnabled, setVoiceEnabled, playHumDetect, playCompliment } from "@/utils/audio";

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
  const confidenceRef = useRef<number>(0);
  const [minConfidence, setMinConfidence] = useState<number>(0.6);
  const [showHud, setShowHud] = useState<boolean>(true);
  const [snapEnabled, setSnapEnabled] = useState<boolean>(true);
  const [snapRadiusPx, setSnapRadiusPx] = useState<number>(18);
  const [retakeSuggested, setRetakeSuggested] = useState<boolean>(false);
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

  // Update the temporal edge map for snapping and stabilization
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

  useEffect(() => {
    if (devices.length && !deviceId) setDeviceId(devices[0].deviceId);
  }, [devices, deviceId]);

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
        ctx.strokeStyle = "#22d3ee";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
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

        // Base/Tip markers
        const drawMarker = (x: number, y: number, label: string) => {
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

      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);
  };

  // Start overlay loop once
  useEffect(() => {
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

      // Contour detection
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

      // Skin masking
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
        // Update temporal edge map for snapping/stabilization
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
      if (voiceEnabled) { try { await playCompliment(); } catch {} }
      toast({
        title: "Captured & Saved",
        description: `Δ Length ${trend(dL)}, Δ Girth ${trend(dG)}. ${recommendation}`,
      });
    } else {
      if (voiceEnabled) { try { await playCompliment(); } catch {} }
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
            setAutoStatus(stable ? "locked" : "stabilizing");
            const cooldownOk = now - lastAutoCaptureTsRef.current >= autoCaptureCooldownSec * 1000;
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
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="flex items-center gap-2">
                <Ruler className="w-5 h-5" /> Measure
              </CardTitle>
              <Tabs value={mode} onValueChange={(v) => setMode(v as "live" | "upload")}>
                <TabsList>
                  <TabsTrigger value="live">Live</TabsTrigger>
                  <TabsTrigger value="upload">Upload</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="flex gap-2">
              {mode === "live" && (
                <>
                  <select
                    value={deviceId}
                    onChange={(e) => setDeviceId(e.target.value)}
                    className="bg-card border border-border rounded-md px-2 py-1 text-sm max-w-[200px]"
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
                    className="bg-card border border-border rounded-md px-2 py-1 text-sm"
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
                    className="bg-card border border-border rounded-md px-2 py-1 text-sm"
                    title="Target FPS"
                  >
                    {[15, 24, 30, 60].map((f) => (
                      <option key={f} value={f}>{f} fps</option>
                    ))}
                  </select>
                </>
              )}
              <Button variant="outline" size="sm" onClick={() => setIsCalibrating(true)}>
                Calibrate
              </Button>
              <Button variant="outline" size="sm" onClick={clearPoints}>
                <RefreshCw className="w-4 h-4 mr-1" /> Reset
              </Button>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as "in" | "cm")}
                className="bg-card border border-border rounded-md px-2 py-1 text-sm"
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
                  className="w-48"
                />
              )}
            </div>
          </CardHeader>
          <CardContent>
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
                  <Button variant="outline" size="sm" title={capabilities ? (capabilities.canTorch ? "Back camera likely active" : "Front camera likely active") : "Flip camera"} onClick={() => setFacingMode((v) => (v === "environment" ? "user" : "environment"))}>
                    Flip
                  </Button>
                  <Button variant="outline" size="sm" onClick={toggleFreeze}>
                    {isFrozen ? "Unfreeze" : "Freeze"}
                  </Button>
                  {capabilities?.canTorch && (
                    <Button variant="outline" size="sm" onClick={() => setTorchOn((v) => !v)}>
                      {torchOn ? "Torch off" : "Torch on"}
                    </Button>
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
                <div className="absolute left-3 bottom-3 right-3 pointer-events-none select-none">
                  <div className="bg-black/50 rounded-md p-2 text-xs text-white flex items-center gap-3">
                    <span className="whitespace-nowrap">{autoStatus}</span>
                    <div className="flex-1">
                      <Progress value={Math.max(0, Math.min(100, Math.round(confidence * 100)))} />
                    </div>
                    <span className="whitespace-nowrap">{Math.max(0, Math.min(1, confidence)).toFixed(2)}</span>
                    <span className="opacity-70 whitespace-nowrap">min {minConfidence.toFixed(2)}</span>
                    {mode === "live" && (
                      <span className="opacity-70 whitespace-nowrap">{measuredFps} fps</span>
                    )}
                    {retakeSuggested && (
                      <span className="text-amber-300 whitespace-nowrap">Retake suggested</span>
                    )}
                  </div>
                </div>
              )}
            </div>
            {streamError && <p className="text-sm text-destructive mt-2">{streamError}</p>}
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
              {latestPrev && (
                <div className="text-xs text-muted-foreground">
                  Prev: L {latestPrev.length.toFixed(2)}", G {latestPrev.girth.toFixed(2)}"
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button onClick={capture} className="gap-2">
                  <CameraIcon className="w-4 h-4" /> Capture
                </Button>
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
                <span className="text-sm">Voice feedback</span>
                <Switch checked={voiceEnabled} onCheckedChange={setVoice} />
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
