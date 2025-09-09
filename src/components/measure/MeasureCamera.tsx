import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMeasurementHaptics } from "@/hooks/useHaptics";
import { 
  startCamera, 
  stopStream, 
  enumerateVideoDevices,
  applyZoom as applyZoomTrack,
  setTorch as setTorchTrack,
  applyFrameRate as applyFrameRateTrack,
  type CameraStartOptions
} from "@/utils/camera";

interface MeasureCameraProps {
  mode: "live" | "upload";
  uploadedUrl: string;
  frozenUrl: string;
  isFrozen: boolean;
  maskUrl?: string;
  maskGeom?: { offsetX: number; offsetY: number; drawW: number; drawH: number };
  maskOpacity?: number;
  showPrevOverlay?: boolean;
  prevOverlayUrl?: string;
  overlayOpacity?: number;
  deviceId: string;
  facingMode: "environment" | "user";
  resolution: { w: number; h: number };
  targetFps: number;
  zoomLevel: number | null;
  torchOn: boolean;
  capabilities: {
    canTorch: boolean;
    canZoom: boolean;
    zoom?: { min: number; max: number; step?: number };
  } | null;
  streamError: string | null;
  onStreamError: (error: string | null) => void;
  onVideoReady?: (video: HTMLVideoElement) => void;
  onCameraChange?: (devices: MediaDeviceInfo[]) => void;
  children?: React.ReactNode;
}

export interface MeasureCameraRef {
  getVideoElement: () => HTMLVideoElement | null;
  captureFrame: () => HTMLCanvasElement | null;
  toggleFreeze: () => void;
}

export const MeasureCamera = forwardRef<MeasureCameraRef, MeasureCameraProps>(({
  mode,
  uploadedUrl,
  frozenUrl,
  isFrozen,
  maskUrl,
  maskGeom,
  maskOpacity = 35,
  showPrevOverlay,
  prevOverlayUrl,
  overlayOpacity = 30,
  deviceId,
  facingMode,
  resolution,
  targetFps,
  zoomLevel,
  torchOn,
  capabilities,
  streamError,
  onStreamError,
  onVideoReady,
  onCameraChange,
  children
}, ref) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const trackRef = useRef<MediaStreamTrack | null>(null);
  const { toast } = useToast();
  const { errorHaptic } = useMeasurementHaptics();

  useImperativeHandle(ref, () => ({
    getVideoElement: () => videoRef.current,
    captureFrame: () => {
      const video = videoRef.current;
      if (!video || !video.videoWidth || !video.videoHeight) return null;
      
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas;
    },
    toggleFreeze: () => {
      // Freeze functionality will be handled by parent component
    }
  }));

  // Initialize camera when mode changes to live
  useEffect(() => {
    if (mode !== "live") {
      if (streamRef.current) {
        stopStream(streamRef.current);
        streamRef.current = null;
        trackRef.current = null;
      }
      return;
    }

    let cancelled = false;

    const initCamera = async () => {
      try {
        onStreamError(null);
        
        const constraints: CameraStartOptions = {
          deviceId: deviceId || undefined,
          facingMode: deviceId ? undefined : facingMode,
          width: resolution.w,
          height: resolution.h,
          frameRate: targetFps,
        };

        const result = await startCamera(constraints);
        const stream = result.stream;
        
        if (cancelled) {
          stopStream(stream);
          return;
        }

        const video = videoRef.current;
        if (!video) {
          stopStream(stream);
          return;
        }

        video.srcObject = stream;
        streamRef.current = stream;
        trackRef.current = result.track;

        // Get capabilities after stream is established
        if (trackRef.current) {
          // Update parent component with capabilities if needed
        }

        // Notify parent that video is ready
        video.onloadedmetadata = () => {
          onVideoReady?.(video);
        };

        await video.play();
        
      } catch (error: any) {
        if (cancelled) return;
        
        console.error("Camera initialization failed:", error);
        errorHaptic();
        
        let message = "Camera access failed";
        if (error.name === "NotAllowedError") {
          message = "Camera permission denied. Please allow camera access.";
        } else if (error.name === "NotFoundError") {
          message = "No camera found on this device.";
        } else if (error.name === "NotSupportedError") {
          message = "Camera not supported in this browser.";
        } else if (error.name === "OverconstrainedError") {
          message = "Camera settings not supported. Try different resolution.";
        }
        
        onStreamError(message);
        toast({
          title: "Camera Error",
          description: message,
          variant: "destructive"
        });
      }
    };

    initCamera();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        stopStream(streamRef.current);
        streamRef.current = null;
        trackRef.current = null;
      }
    };
  }, [mode, deviceId, facingMode, resolution.w, resolution.h, targetFps, onStreamError, onVideoReady, toast, errorHaptic]);

  // Apply zoom when it changes
  useEffect(() => {
    const track = trackRef.current;
    if (!track || zoomLevel == null || !capabilities?.canZoom) return;

    applyZoomTrack(track, zoomLevel).catch(error => {
      console.warn("Zoom failed:", error);
    });
  }, [zoomLevel, capabilities]);

  // Apply torch when it changes
  useEffect(() => {
    const track = trackRef.current;
    if (!track || !capabilities?.canTorch) return;

    setTorchTrack(track, torchOn).catch(error => {
      console.warn("Torch failed:", error);
    });
  }, [torchOn, capabilities]);

  // Update frame rate
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    applyFrameRateTrack(track, targetFps).catch(error => {
      console.warn("Frame rate change failed:", error);
    });
  }, [targetFps]);

  // Enumerate devices for parent component
  useEffect(() => {
    const updateDevices = async () => {
      try {
        const devices = await enumerateVideoDevices();
        onCameraChange?.(devices);
      } catch (error) {
        console.warn("Failed to enumerate devices:", error);
      }
    };

    updateDevices();
    
    const handler = () => { void updateDevices(); };
    navigator.mediaDevices?.addEventListener?.("devicechange", handler);
    
    return () => {
      navigator.mediaDevices?.removeEventListener?.("devicechange", handler);
    };
  }, [onCameraChange]);

  if (streamError) {
    return (
      <div className="w-full max-h-[70vh] h-[50vh] rounded-lg bg-destructive/20 border-2 border-destructive/50 flex flex-col items-center justify-center text-destructive animate-fade-in">
        <div className="text-lg font-medium mb-2">Camera Error</div>
        <div className="text-sm text-center max-w-md px-4">{streamError}</div>
      </div>
    );
  }

  return (
    <div className="relative w-full animate-fade-in">
      {mode === "live" ? (
        isFrozen && frozenUrl ? (
          <img
            src={frozenUrl}
            alt="Frozen frame"
            className="w-full max-h-[70vh] rounded-lg bg-black object-contain animate-scale-in"
          />
        ) : (
          <video
            ref={videoRef}
            className="w-full max-h-[70vh] rounded-lg bg-black animate-scale-in"
            playsInline
            muted
            style={{
              transform: facingMode === "user" ? "scaleX(-1)" : "none"
            }}
          />
        )
      ) : uploadedUrl ? (
        <img
          src={uploadedUrl}
          alt="Uploaded"
          className="w-full max-h-[70vh] rounded-lg bg-black object-contain animate-scale-in"
        />
      ) : (
        <div className="w-full max-h-[70vh] h-[50vh] rounded-lg bg-muted/20 border-2 border-dashed border-muted-foreground/30 flex items-center justify-center text-muted-foreground animate-fade-in">
          <div className="text-center">
            <div className="text-lg font-medium mb-2">Upload Image</div>
            <div className="text-sm">Select an image file to begin measurement</div>
          </div>
        </div>
      )}
      
      {/* Mask Overlay */}
      {maskUrl && maskGeom && (
        <img
          src={maskUrl}
          alt="Detection mask"
          className="absolute pointer-events-none animate-fade-in"
          style={{
            left: maskGeom.offsetX,
            top: maskGeom.offsetY,
            width: maskGeom.drawW,
            height: maskGeom.drawH,
            opacity: maskOpacity / 100,
            mixBlendMode: 'multiply'
          }}
        />
      )}
      
      {/* Previous Photo Overlay */}
      {showPrevOverlay && prevOverlayUrl && (
        <img
          src={prevOverlayUrl}
          alt="Previous measurement overlay"
          className="absolute left-0 top-0 w-full h-full object-cover pointer-events-none animate-fade-in"
          style={{ 
            opacity: overlayOpacity / 100,
            mixBlendMode: 'overlay'
          }}
        />
      )}
      
      {/* Children (overlay canvas, visual feedback, etc.) */}
      {children}
    </div>
  );
});

MeasureCamera.displayName = 'MeasureCamera';