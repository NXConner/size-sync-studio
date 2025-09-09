import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Mic, Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface PermissionStatus {
  camera: PermissionState | "unknown";
  microphone: PermissionState | "unknown";
}

export function PermissionChecker() {
  const [permissions, setPermissions] = useState<PermissionStatus>({
    camera: "unknown",
    microphone: "unknown"
  });
  const [isChecking, setIsChecking] = useState(false);

  // Check current permissions on mount
  useEffect(() => {
    checkCurrentPermissions();
  }, []);

  const checkCurrentPermissions = async () => {
    if (!navigator.permissions) {
      toast.error("Permission API not supported in this browser");
      return;
    }

    try {
      const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName });
      const micPermission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      
      setPermissions({
        camera: cameraPermission.state,
        microphone: micPermission.state
      });
    } catch (error) {
      console.warn("Could not check permissions:", error);
    }
  };

  const requestPermissions = async () => {
    setIsChecking(true);
    
    try {
      // Request camera and microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      // Stop the stream immediately - we just needed permission
      stream.getTracks().forEach(track => track.stop());
      
      // Re-check permissions after request
      await checkCurrentPermissions();
      
      toast.success("Permissions granted successfully!");
      
    } catch (error: any) {
      let message = "Permission denied";
      
      if (error.name === 'NotAllowedError') {
        message = "Camera/microphone access denied. Please check your browser settings.";
      } else if (error.name === 'NotFoundError') {
        message = "No camera or microphone found on this device.";
      } else if (error.name === 'NotSupportedError') {
        message = "Camera/microphone not supported in this browser.";
      } else if (error.name === 'NotReadableError') {
        message = "Camera/microphone is already in use by another application.";
      }
      
      toast.error(message);
      await checkCurrentPermissions();
    } finally {
      setIsChecking(false);
    }
  };

  const getPermissionIcon = (state: PermissionState | "unknown") => {
    switch (state) {
      case "granted":
        return <ShieldCheck className="w-3 h-3 text-green-500" />;
      case "denied":
        return <ShieldAlert className="w-3 h-3 text-red-500" />;
      case "prompt":
        return <Shield className="w-3 h-3 text-yellow-500" />;
      default:
        return <Shield className="w-3 h-3 text-muted-foreground" />;
    }
  };

  const getPermissionColor = (state: PermissionState | "unknown") => {
    switch (state) {
      case "granted":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "denied":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "prompt":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      default:
        return "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20";
    }
  };

  const hasRequiredPermissions = permissions.camera === "granted" && permissions.microphone === "granted";
  const hasAnyDenied = permissions.camera === "denied" || permissions.microphone === "denied";

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3">
      {/* Permission Status Badges */}
      <div className="flex items-center gap-2">
        <Badge className={`text-xs ${getPermissionColor(permissions.camera)}`}>
          <Camera className="w-3 h-3 mr-1" />
          {getPermissionIcon(permissions.camera)}
          <span className="ml-1 capitalize">
            {permissions.camera === "unknown" ? "Camera" : permissions.camera}
          </span>
        </Badge>
        
        <Badge className={`text-xs ${getPermissionColor(permissions.microphone)}`}>
          <Mic className="w-3 h-3 mr-1" />
          {getPermissionIcon(permissions.microphone)}
          <span className="ml-1 capitalize">
            {permissions.microphone === "unknown" ? "Mic" : permissions.microphone}
          </span>
        </Badge>
      </div>

      {/* Permission Request Button */}
      <Button
        onClick={requestPermissions}
        disabled={isChecking}
        variant={hasRequiredPermissions ? "outline" : hasAnyDenied ? "destructive" : "default"}
        size="sm"
        className="whitespace-nowrap"
      >
        <Shield className="w-4 h-4 mr-2" />
        {isChecking 
          ? "Checking..." 
          : hasRequiredPermissions 
            ? "Recheck Permissions" 
            : "Grant Permissions"
        }
      </Button>
    </div>
  );
}