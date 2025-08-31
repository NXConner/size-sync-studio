import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Ruler, Camera as CameraIcon, RefreshCw, Image as ImageIcon, Download } from "lucide-react";
import { Measurement } from "@/types";
import { saveMeasurement, savePhoto, getMeasurements, getPhoto } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { loadOpenCV } from "@/utils/opencv";

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

  // Load previous photos once
  useEffect(() => {
    const withPhotos = getMeasurements().filter((m) => m.photoUrl);
    setPrevPhotos(withPhotos);
    if (withPhotos.length > 0) setSelectedPrevId(withPhotos[0].id);
  }, []);

  // Manage camera stream based on mode
  useEffect(() => {
    let cancelled = false;
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (videoRef.current && !cancelled) {
          videoRef.current.srcObject = stream as MediaStream;
          await videoRef.current.play();
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
      stream?.getTracks().forEach((t) => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    }
    return () => {
      cancelled = true;
      if (mode !== "live") return;
      const stream = videoRef.current?.srcObject as MediaStream | undefined;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [mode]);

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

      // Calibration line
      if (calibStart && calibEnd) {
        ctx.strokeStyle = "#22d3ee";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(calibStart.x, calibStart.y);
        ctx.lineTo(calibEnd.x, calibEnd.y);
        ctx.stroke();
        ctx.setLineDash([]);

        const dx = calibEnd.x - calibStart.x;
        const dy = calibEnd.y - calibStart.y;
        const pixels = Math.hypot(dx, dy);
        const ppi = pixels / calibrationInches;
        // show live ppi label
        ctx.fillStyle = "#22d3ee";
        ctx.font = "12px sans-serif";
        ctx.fillText(
          `${ppi.toFixed(1)} px/in`,
          (calibStart.x + calibEnd.x) / 2 + 8,
          (calibStart.y + calibEnd.y) / 2,
        );
      }

      // Base to tip length line + markers + tape ruler
      if (basePoint && tipPoint) {
        // Line
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(basePoint.x, basePoint.y);
        ctx.lineTo(tipPoint.x, tipPoint.y);
        ctx.stroke();

        const dx = tipPoint.x - basePoint.x;
        const dy = tipPoint.y - basePoint.y;
        const pixels = Math.hypot(dx, dy) || 1;
        const ux = dx / pixels;
        const uy = dy / pixels;
        const inches = pixels / pixelsPerInch;
        const cm = inToCm(inches);
        const display = unit === "in" ? inches : cm;
        setLengthDisplay(display.toFixed(2));

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
        drawMarker(basePoint.x, basePoint.y, "Base");
        drawMarker(tipPoint.x, tipPoint.y, "Tip");

        // Tape ruler along the measured axis (tailor's tape style)
        const perpX = -uy;
        const perpY = ux;
        const total = pixels;
        // Base tick spacing: 0.5 inch in IN mode, 1 cm in CM mode
        const tickPx = unit === "in" ? pixelsPerInch * 0.5 : (pixelsPerInch / 2.54) * 1.0;
        let stepPx = 0;
        let index = 0;
        ctx.strokeStyle = "#94a3b8"; // slate-400 ticks
        ctx.fillStyle = "#94a3b8";
        ctx.lineWidth = 2;
        while (stepPx <= total + 0.5) {
          const isMajor = unit === "in" ? index % 2 === 0 : true; // label every inch in IN, every cm in CM
          const tickLen = isMajor ? 16 : 10;
          const cx = basePoint.x + ux * stepPx;
          const cy = basePoint.y + uy * stepPx;
          ctx.beginPath();
          ctx.moveTo(cx - perpX * tickLen, cy - perpY * tickLen);
          ctx.lineTo(cx + perpX * tickLen, cy + perpY * tickLen);
          ctx.stroke();
          if (isMajor) {
            ctx.font = "11px sans-serif";
            const labelVal = unit === "in" ? (index * 0.5) : index * 1;
            const label = unit === "in" ? String(Math.round(labelVal)) : String(Math.round(labelVal));
            ctx.fillText(label, cx + perpX * (tickLen + 6), cy + perpY * (tickLen + 6));
          }
          stepPx += tickPx;
          index += 1;
        }

        // Length label near tip
        ctx.fillStyle = "#10b981";
        ctx.font = "14px sans-serif";
        ctx.fillText(`${display.toFixed(2)} ${unit}`, tipPoint.x + 8, tipPoint.y);

        // Girth indicator: perpendicular at mid-shaft
        if (girthPixels > 0) {
          const midX = (basePoint.x + tipPoint.x) / 2;
          const midY = (basePoint.y + tipPoint.y) / 2;
          const half = girthPixels / 2;
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

          const circumferenceInches = (girthPixels / pixelsPerInch) * Math.PI;
          const circumferenceCm = inToCm(circumferenceInches);
          const gDisplay = unit === "in" ? circumferenceInches : circumferenceCm;
          setGirthDisplay(gDisplay.toFixed(2));
          ctx.fillStyle = "#f59e0b";
          ctx.font = "14px sans-serif";
          ctx.fillText(`${gDisplay.toFixed(2)} ${unit}`, endX + 8, endY);
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
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

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
    } else {
      setTipPoint({ x, y });
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
        cnt.delete();
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
        // Choose base as the endpoint with smaller x (heuristic) to stabilize
        const base = end1.x <= end2.x ? p1 : p2;
        const tip = base === p1 ? p2 : p1;
        setBasePoint(base);
        setTipPoint(tip);

        // Build binary mask Mat for sampling if not already
        const maskForSample = mask;
        const perpUx = -axisUy; // perpendicular unit
        const perpUy = axisUx;
        // sample positions along axis between ends
        const totalLen = Math.hypot(end2.x - end1.x, end2.y - end1.y) || 1;
        const centerX = (end1.x + end2.x) / 2;
        const centerY = (end1.y + end2.y) / 2;
        const ts = [-0.1, -0.05, 0, 0.05, 0.1]; // around mid
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
        if (widths.length) {
          // median to reduce outliers
          widths.sort((a, b) => a - b);
          const median = widths[Math.floor(widths.length / 2)] * scale;
          setGirthPixels(median);
        }
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
      contours2.delete();
      hierarchy2.delete();
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

  const detectFromLive = async () => {
    if (mode !== "live") {
      toast({ title: "Switch to Live", description: "Use the camera to auto-detect.", variant: "destructive" });
      return;
    }
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      toast({ title: "Camera not ready", description: "Wait for the camera stream to start.", variant: "destructive" });
      return;
    }
    setIsDetecting(true);
    try {
      const cv = await loadOpenCV();
      const w = video.videoWidth;
      const h = video.videoHeight;

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
        cnt.delete();
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
        const scale = Math.min(containerW / w, containerH / h);
        const drawW = w * scale;
        const drawH = h * scale;
        const offsetX = (containerW - drawW) / 2;
        const offsetY = (containerH - drawH) / 2;
        const mapPoint = (ix: number, iy: number) => ({ x: offsetX + ix * scale, y: offsetY + iy * scale });
        const p1 = mapPoint(end1.x, end1.y);
        const p2 = mapPoint(end2.x, end2.y);
        const base = end1.x <= end2.x ? p1 : p2;
        const tip = base === p1 ? p2 : p1;
        setBasePoint(base);
        setTipPoint(tip);

        const maskForSample = mask;
        const perpUx = -axisUy;
        const perpUy = axisUx;
        const totalLen = Math.hypot(end2.x - end1.x, end2.y - end1.y) || 1;
        const centerX = (end1.x + end2.x) / 2;
        const centerY = (end1.y + end2.y) / 2;
        const ts = [-0.1, -0.05, 0, 0.05, 0.1];
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
        if (widths.length) {
          widths.sort((a, b) => a - b);
          const median = widths[Math.floor(widths.length / 2)] * scale;
          setGirthPixels(median);
        }
      }

      // Cleanup
      src.delete(); rgba.delete(); hsv.delete(); ycrcb.delete();
      mask1.delete(); mask2.delete(); mask.delete(); kernel.delete();
      contours2.delete(); hierarchy2.delete();
      toast({ title: "Auto-detect complete", description: "Review and adjust points if needed." });
    } catch (err: any) {
      toast({ title: "Detection failed", description: err?.message || String(err), variant: "destructive" });
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
      toast({
        title: "Captured & Saved",
        description: `Δ Length ${trend(dL)}, Δ Girth ${trend(dG)}. ${recommendation}`,
      });
    } else {
      toast({ title: "Captured & Saved", description: "First measurement stored." });
    }
  };

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
                <video
                  ref={videoRef}
                  className="w-full max-h-[70vh] rounded-lg bg-black"
                  playsInline
                  muted
                />
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
                  <Button size="sm" onClick={detectFromLive} disabled={isDetecting}>
                    {isDetecting ? "Detecting…" : "Auto-detect"}
                  </Button>
                </div>
              )}
            </div>
            {streamError && <p className="text-sm text-destructive mt-2">{streamError}</p>}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Calibration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground">
                Draw a line on the overlay that equals the known real-world length, then enter that
                length.
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.1"
                  value={calibrationInches}
                  onChange={(e) => setCalibrationInches(parseFloat(e.target.value) || 1)}
                />
                <span className="text-sm">in</span>
                <Button size="sm" onClick={() => setIsCalibrating(true)}>
                  Start
                </Button>
              </div>
              <div className="text-xs">Current scale: {pixelsPerInch.toFixed(1)} px/in</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Girth</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground">
                Drag to match on-screen width at mid-shaft; we estimate circumference.
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
                <span className="text-sm">Show previous photo</span>
                <Switch checked={showPrevOverlay} onCheckedChange={setShowPrevOverlay} />
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
