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

// Helper: convert cm <-> inches
const cmToIn = (cm: number) => cm / 2.54;
const inToCm = (inch: number) => inch * 2.54;

export default function Measure() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const overlayExportRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
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

  // Load previous photos once
  useEffect(() => {
    const withPhotos = getMeasurements().filter(m => m.photoUrl);
    setPrevPhotos(withPhotos);
    if (withPhotos.length > 0) setSelectedPrevId(withPhotos[0].id);
  }, []);

  // Manage camera stream based on mode
  useEffect(() => {
    let cancelled = false;
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
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
      if (!selectedPrevId) { setPrevOverlayUrl(""); return; }
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
    return () => { if (revokeUrl) URL.revokeObjectURL(revokeUrl); };
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
        ctx.fillText(`${ppi.toFixed(1)} px/in`, (calibStart.x + calibEnd.x) / 2 + 8, (calibStart.y + calibEnd.y) / 2);
      }

      // Base to tip length line
      if (basePoint && tipPoint) {
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(basePoint.x, basePoint.y);
        ctx.lineTo(tipPoint.x, tipPoint.y);
        ctx.stroke();

        const dx = tipPoint.x - basePoint.x;
        const dy = tipPoint.y - basePoint.y;
        const pixels = Math.hypot(dx, dy);
        const inches = pixels / pixelsPerInch;
        const cm = inToCm(inches);
        const display = unit === "in" ? inches : cm;
        setLengthDisplay(display.toFixed(2));

        // Label
        ctx.fillStyle = "#10b981";
        ctx.font = "14px sans-serif";
        ctx.fillText(`${display.toFixed(2)} ${unit}`, tipPoint.x + 8, tipPoint.y);
      }

      // Girth indicator: a short horizontal marker; user drags to match width
      if (girthPixels > 0 && basePoint) {
        const y = basePoint.y + 24; // draw near base
        const startX = basePoint.x - girthPixels / 2;
        const endX = basePoint.x + girthPixels / 2;
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
        ctx.stroke();

        const circumferenceInches = (girthPixels / pixelsPerInch) * Math.PI; // approximate circle from width
        const circumferenceCm = inToCm(circumferenceInches);
        const display = unit === "in" ? circumferenceInches : circumferenceCm;
        setGirthDisplay(display.toFixed(2));
        ctx.fillStyle = "#f59e0b";
        ctx.font = "14px sans-serif";
        ctx.fillText(`${display.toFixed(2)} ${unit}`, endX + 8, y);
      }

      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  };

  // Start overlay loop once
  useEffect(() => {
    drawOverlayLoop();
    // cleanup uploaded image URL
    return () => {
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
      photoBlob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b as Blob), "image/jpeg", 0.9));
    } else {
      if (!uploadedBlob) {
        toast({ title: "No image uploaded", description: "Please upload an image first.", variant: "destructive" });
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
    await savePhoto(measurement.id, photoBlob);

    // Compare to latest previous
    const prev = latestPrev;
    if (prev) {
      const dL = measurement.length - prev.length;
      const dG = measurement.girth - prev.girth;
      const trend = (v: number) => (v > 0 ? `+${v.toFixed(2)}"` : `${v.toFixed(2)}"`);
      let recommendation = "Keep consistent lighting and angle.";
      if (dL < -0.1 || dG < -0.1) recommendation = "Slight decrease detected. Recheck calibration and ensure full erection for consistency.";
      if (dG > 0.25) recommendation = "Significant girth increase. Consider longer rest intervals and monitor for edema.";
      if (dL > 0.25) recommendation = "Great length gain. Maintain current protocol; avoid overtraining.";
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
    const blob: Blob = await new Promise((resolve) => exportCanvas.toBlob((b) => resolve(b as Blob), "image/png"));
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
              <CardTitle className="flex items-center gap-2"><Ruler className="w-5 h-5" /> Measure</CardTitle>
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
                <video ref={videoRef} className="w-full max-h-[70vh] rounded-lg bg-black" playsInline muted />
              ) : uploadedUrl ? (
                <img src={uploadedUrl} alt="Uploaded" className="w-full max-h-[70vh] rounded-lg bg-black object-contain" />
              ) : (
                <div className="w-full max-h-[70vh] h-[50vh] rounded-lg bg-black/60 flex items-center justify-center text-sm text-muted-foreground">
                  Upload an image to begin measurement
                </div>
              )}
              {showPrevOverlay && prevOverlayUrl && (
                <img src={prevOverlayUrl} alt="Previous overlay" className="absolute left-0 top-0 w-full h-full object-cover pointer-events-none" style={{ opacity: overlayOpacity / 100 }} />
              )}
              <canvas ref={overlayRef} className="absolute left-0 top-0 w-full h-full cursor-crosshair" onClick={handleOverlayClick} />
            </div>
            {streamError && (
              <p className="text-sm text-destructive mt-2">{streamError}</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Calibration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground">Draw a line on the overlay that equals the known real-world length, then enter that length.</div>
              <div className="flex items-center gap-2">
                <Input type="number" step="0.1" value={calibrationInches} onChange={(e) => setCalibrationInches(parseFloat(e.target.value) || 1)} />
                <span className="text-sm">in</span>
                <Button size="sm" onClick={() => setIsCalibrating(true)}>Start</Button>
              </div>
              <div className="text-xs">Current scale: {pixelsPerInch.toFixed(1)} px/in</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Girth</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground">Drag to match on-screen width at mid-shaft; we estimate circumference.</div>
              <Slider value={[girthPixels]} min={0} max={600} step={1} onValueChange={(v) => setGirthPixels(v[0])} />
              <div className="text-sm">Girth: <span className="font-semibold">{girthDisplay} {unit}</span></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Readouts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">Length: <span className="font-semibold">{lengthDisplay} {unit}</span></div>
              <div className="text-sm">Unit scale: {pixelsPerInch.toFixed(1)} px/in</div>
              {latestPrev && (
                <div className="text-xs text-muted-foreground">Prev: L {latestPrev.length.toFixed(2)}", G {latestPrev.girth.toFixed(2)}"</div>
              )}
              <div className="flex gap-2 pt-2">
                <Button onClick={capture} className="gap-2"><CameraIcon className="w-4 h-4" /> Capture</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Overlay Tools</CardTitle>
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
                  {prevPhotos.map(p => (
                    <option key={p.id} value={p.id}>{new Date(p.date).toLocaleString()}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Overlay opacity: {overlayOpacity}%</label>
                <Slider value={[overlayOpacity]} min={0} max={100} step={1} onValueChange={(v) => setOverlayOpacity(v[0])} />
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

function exportOverlayPNG(this: any) {
  // This will be replaced during render binding; placeholder to satisfy TS
}

