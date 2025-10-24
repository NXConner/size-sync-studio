import { useEffect, useRef } from "react";

interface VisualFeedbackOverlayProps {
  containerRef: React.RefObject<HTMLDivElement>;
  measurementPoints: Array<{ x: number; y: number }>;
  isRecording?: boolean;
  detectedObjects?: Array<{ x: number; y: number; width: number; height: number; confidence: number }>;
  gridEnabled?: boolean;
  showCrosshairs?: boolean;
  isDetecting?: boolean;
  autoDetect?: boolean;
  confidence?: number;
  qualityScore?: number;
  autoStatus?: string;
  primaryObject?: { x: number; y: number; width: number; height: number; confidence: number } | null;
  showObjectFocus?: boolean;
  zoomLevel?: number;
  focusCenter?: { x: number; y: number } | null;
}

export function VisualFeedbackOverlay({
  containerRef,
  measurementPoints,
  isRecording = false,
  detectedObjects = [],
  gridEnabled = false,
  showCrosshairs = true,
  isDetecting = false,
  autoDetect = false,
  confidence = 0,
  qualityScore = 0,
  autoStatus = "idle",
  primaryObject,
  showObjectFocus = false,
  zoomLevel = 1,
  focusCenter
}: VisualFeedbackOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const needsRedrawRef = useRef<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const drawOnce = () => {
      needsRedrawRef.current = false;
      // Resize only when needed
      if (canvas.width !== container.clientWidth || canvas.height !== container.clientHeight) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "#ffffff";
      ctx.fillStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.font = "12px sans-serif";

      if (gridEnabled) {
        drawGrid(ctx, canvas.width, canvas.height);
      }

      if (showCrosshairs) {
        drawCrosshairs(ctx, canvas.width, canvas.height);
      }

      // Draw background blur effect if object focus is enabled
      if (showObjectFocus && primaryObject) {
        drawBackgroundBlur(ctx, canvas.width, canvas.height, primaryObject);
      }

      drawMeasurementPoints(ctx, measurementPoints);
      drawDetectedObjects(ctx, detectedObjects);

      // Draw primary object outline with enhanced focus
      if (primaryObject) {
        drawPrimaryObjectOutline(ctx, primaryObject, showObjectFocus);
      }

      if (isRecording) {
        drawRecordingIndicator(ctx, canvas.width);
      }

      if (isDetecting || autoDetect) {
        drawAIProcessingIndicator(ctx, canvas.width, canvas.height, isDetecting);
      }

      if (autoDetect) {
        drawAutoDetectStatus(ctx, canvas.width, autoStatus);
      }

      if (confidence > 0) {
        drawConfidenceIndicator(ctx, canvas.width, canvas.height, confidence);
      }

      if (qualityScore > 0) {
        drawQualityIndicator(ctx, canvas.width, canvas.height, qualityScore);
      }
    };

    const schedule = () => {
      if (needsRedrawRef.current) return;
      needsRedrawRef.current = true;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      animationRef.current = requestAnimationFrame(drawOnce);
    };

    // Redraw on prop changes
    schedule();

    // Redraw on resize
    const ro = new ResizeObserver(() => schedule());
    ro.observe(container);

    return () => {
      ro.disconnect();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      needsRedrawRef.current = false;
    };
  }, [containerRef, measurementPoints, isRecording, detectedObjects, gridEnabled, showCrosshairs, isDetecting, autoDetect, confidence, qualityScore, autoStatus, primaryObject, showObjectFocus, zoomLevel, focusCenter]);

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1;
    const gridSize = 50;

    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.restore();
  };

  const drawCrosshairs = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save();
    ctx.strokeStyle = "rgba(0, 255, 0, 0.5)";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    const centerX = width / 2;
    const centerY = height / 2;

    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    ctx.restore();
  };

  const drawMeasurementPoints = (ctx: CanvasRenderingContext2D, points: Array<{ x: number; y: number }>) => {
    if (points.length === 0) return;

    ctx.save();

    if (points.length >= 2) {
      ctx.strokeStyle = "#00ff00";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      ctx.lineTo(points[1].x, points[1].y);
      ctx.stroke();

      const dx = points[1].x - points[0].x;
      const dy = points[1].y - points[0].y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const midX = (points[0].x + points[1].x) / 2;
      const midY = (points[0].y + points[1].y) / 2;

      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(midX - 30, midY - 15, 60, 20);

      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText(`${distance.toFixed(0)}px`, midX, midY);
    }

    points.forEach((point, index) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = index === 0 ? "#00ff00" : "#ff0000";
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText((index + 1).toString(), point.x, point.y - 12);
    });

    ctx.restore();
  };

  const drawDetectedObjects = (ctx: CanvasRenderingContext2D, objects: Array<{ x: number; y: number; width: number; height: number; confidence: number }>) => {
    if (objects.length === 0) return;

    ctx.save();

    objects.forEach((obj) => {
      ctx.strokeStyle = `rgba(255, 255, 0, ${obj.confidence})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);

      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(obj.x, obj.y - 20, 60, 20);

      ctx.fillStyle = "#ffffff";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`${(obj.confidence * 100).toFixed(0)}%`, obj.x + 2, obj.y - 5);
    });

    ctx.restore();
  };

  const drawRecordingIndicator = (ctx: CanvasRenderingContext2D, width: number) => {
    ctx.save();

    const time = Date.now() / 1000;
    const alpha = (Math.sin(time * 4) + 1) / 2;

    ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`;
    ctx.beginPath();
    ctx.arc(width - 30, 30, 8, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = "#ff0000";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("REC", width - 45, 35);

    ctx.restore();
  };

  const drawAIProcessingIndicator = (ctx: CanvasRenderingContext2D, width: number, _height: number, isActive: boolean) => {
    ctx.save();

    const time = Date.now() / 1000;
    const baseX = width - 40;
    const baseY = 70;

    // Animated rotating rings
    for (let i = 0; i < 3; i++) {
      const angle = (time * 2 + i * (Math.PI * 2 / 3)) % (Math.PI * 2);
      const radius = 12 + i * 3;
      const alpha = isActive ? 0.6 - i * 0.15 : 0.2;

      ctx.strokeStyle = `rgba(0, 200, 255, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(baseX, baseY, radius, angle, angle + Math.PI);
      ctx.stroke();
    }

    // Center dot
    ctx.fillStyle = isActive ? "rgba(0, 200, 255, 0.8)" : "rgba(0, 200, 255, 0.3)";
    ctx.beginPath();
    ctx.arc(baseX, baseY, 4, 0, 2 * Math.PI);
    ctx.fill();

    // Label
    ctx.fillStyle = isActive ? "#00c8ff" : "rgba(0, 200, 255, 0.5)";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("AI", width - 55, 75);

    ctx.restore();
  };

  const drawAutoDetectStatus = (ctx: CanvasRenderingContext2D, width: number, status: string) => {
    ctx.save();

    const time = Date.now() / 1000;
    const baseX = width - 40;
    const baseY = 110;

    // Pulsing outer ring
    const pulseScale = 1 + Math.sin(time * 3) * 0.2;
    const isActive = status === "detecting" || status === "stable";

    ctx.strokeStyle = isActive ? `rgba(0, 255, 100, ${0.4 + Math.sin(time * 3) * 0.3})` : "rgba(100, 100, 100, 0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(baseX, baseY, 12 * pulseScale, 0, 2 * Math.PI);
    ctx.stroke();

    // Inner filled circle with status color
    let fillColor = "rgba(100, 100, 100, 0.5)";
    if (status === "detecting") fillColor = "rgba(255, 200, 0, 0.7)";
    if (status === "stable") fillColor = "rgba(0, 255, 100, 0.7)";
    if (status === "captured") fillColor = "rgba(0, 200, 255, 0.7)";

    ctx.fillStyle = fillColor;
    ctx.beginPath();
    ctx.arc(baseX, baseY, 8, 0, 2 * Math.PI);
    ctx.fill();

    // Scanning line animation
    if (isActive) {
      const scanY = baseY + Math.sin(time * 4) * 8;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(baseX - 10, scanY);
      ctx.lineTo(baseX + 10, scanY);
      ctx.stroke();
    }

    // Label
    ctx.fillStyle = isActive ? "#00ff64" : "rgba(100, 100, 100, 0.7)";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("AUTO", width - 55, 115);

    ctx.restore();
  };

  const drawConfidenceIndicator = (ctx: CanvasRenderingContext2D, width: number, height: number, conf: number) => {
    ctx.save();

    const barWidth = 120;
    const barHeight = 8;
    const x = width - barWidth - 20;
    const y = height - 60;

    // Background
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(x - 5, y - 5, barWidth + 10, barHeight + 20);

    // Label
    ctx.fillStyle = "#ffffff";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Confidence", x, y - 8);

    // Bar background
    ctx.fillStyle = "rgba(80, 80, 80, 0.5)";
    ctx.fillRect(x, y, barWidth, barHeight);

    // Confidence bar with gradient
    const confWidth = barWidth * Math.min(1, Math.max(0, conf));
    const gradient = ctx.createLinearGradient(x, 0, x + barWidth, 0);
    
    if (conf < 0.3) {
      gradient.addColorStop(0, "rgba(255, 50, 50, 0.8)");
      gradient.addColorStop(1, "rgba(255, 150, 50, 0.8)");
    } else if (conf < 0.7) {
      gradient.addColorStop(0, "rgba(255, 200, 50, 0.8)");
      gradient.addColorStop(1, "rgba(255, 255, 50, 0.8)");
    } else {
      gradient.addColorStop(0, "rgba(50, 255, 100, 0.8)");
      gradient.addColorStop(1, "rgba(0, 200, 100, 0.8)");
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, confWidth, barHeight);

    // Percentage text
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(`${Math.round(conf * 100)}%`, x + barWidth + 5, y + 7);

    ctx.restore();
  };

  const drawQualityIndicator = (ctx: CanvasRenderingContext2D, width: number, height: number, quality: number) => {
    ctx.save();

    const barWidth = 120;
    const barHeight = 8;
    const x = width - barWidth - 20;
    const y = height - 35;

    // Background
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(x - 5, y - 5, barWidth + 10, barHeight + 20);

    // Label
    ctx.fillStyle = "#ffffff";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Quality", x, y - 8);

    // Bar background
    ctx.fillStyle = "rgba(80, 80, 80, 0.5)";
    ctx.fillRect(x, y, barWidth, barHeight);

    // Quality bar with gradient
    const qualityWidth = barWidth * Math.min(1, Math.max(0, quality));
    const gradient = ctx.createLinearGradient(x, 0, x + barWidth, 0);
    
    if (quality < 0.4) {
      gradient.addColorStop(0, "rgba(255, 50, 50, 0.8)");
      gradient.addColorStop(1, "rgba(255, 150, 50, 0.8)");
    } else if (quality < 0.7) {
      gradient.addColorStop(0, "rgba(255, 180, 50, 0.8)");
      gradient.addColorStop(1, "rgba(200, 255, 50, 0.8)");
    } else {
      gradient.addColorStop(0, "rgba(100, 200, 255, 0.8)");
      gradient.addColorStop(1, "rgba(50, 150, 255, 0.8)");
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, qualityWidth, barHeight);

    // Percentage text
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(`${Math.round(quality * 100)}%`, x + barWidth + 5, y + 7);

    ctx.restore();
  };

  const drawBackgroundBlur = (ctx: CanvasRenderingContext2D, width: number, height: number, primaryObject: { x: number; y: number; width: number; height: number; confidence: number }) => {
    ctx.save();
    
    // Create a mask for the object area (clear area)
    ctx.globalCompositeOperation = 'source-over';
    
    // Draw dark overlay over entire canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(0, 0, width, height);
    
    // Clear the object area to show it clearly
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillRect(primaryObject.x, primaryObject.y, primaryObject.width, primaryObject.height);
    
    // Add subtle blur effect around the object
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    
    // Draw multiple layers for blur effect
    for (let i = 1; i <= 3; i++) {
      const offset = i * 2;
      ctx.fillRect(
        primaryObject.x - offset, 
        primaryObject.y - offset, 
        primaryObject.width + offset * 2, 
        primaryObject.height + offset * 2
      );
    }
    
    ctx.restore();
  };

  const drawPrimaryObjectOutline = (ctx: CanvasRenderingContext2D, primaryObject: { x: number; y: number; width: number; height: number; confidence: number }, isFocused: boolean) => {
    ctx.save();
    
    const time = Date.now() / 1000;
    const pulseScale = 1 + Math.sin(time * 3) * 0.1;
    
    // Outer glow effect
    if (isFocused) {
      ctx.strokeStyle = `rgba(0, 255, 255, ${0.3 + Math.sin(time * 4) * 0.2})`;
      ctx.lineWidth = 8;
      ctx.strokeRect(
        primaryObject.x - 4, 
        primaryObject.y - 4, 
        primaryObject.width + 8, 
        primaryObject.height + 8
      );
    }
    
    // Main outline with confidence-based color
    let outlineColor = '#ff0000'; // Red for low confidence
    if (primaryObject.confidence > 0.7) {
      outlineColor = '#00ff00'; // Green for high confidence
    } else if (primaryObject.confidence > 0.4) {
      outlineColor = '#ffff00'; // Yellow for medium confidence
    }
    
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = isFocused ? 4 : 2;
    ctx.strokeRect(primaryObject.x, primaryObject.y, primaryObject.width, primaryObject.height);
    
    // Corner markers for precise alignment
    const cornerSize = 12;
    ctx.fillStyle = outlineColor;
    
    // Top-left corner
    ctx.fillRect(primaryObject.x - 2, primaryObject.y - 2, cornerSize, 4);
    ctx.fillRect(primaryObject.x - 2, primaryObject.y - 2, 4, cornerSize);
    
    // Top-right corner
    ctx.fillRect(primaryObject.x + primaryObject.width - cornerSize + 2, primaryObject.y - 2, cornerSize, 4);
    ctx.fillRect(primaryObject.x + primaryObject.width - 2, primaryObject.y - 2, 4, cornerSize);
    
    // Bottom-left corner
    ctx.fillRect(primaryObject.x - 2, primaryObject.y + primaryObject.height - 2, cornerSize, 4);
    ctx.fillRect(primaryObject.x - 2, primaryObject.y + primaryObject.height - cornerSize + 2, 4, cornerSize);
    
    // Bottom-right corner
    ctx.fillRect(primaryObject.x + primaryObject.width - cornerSize + 2, primaryObject.y + primaryObject.height - 2, cornerSize, 4);
    ctx.fillRect(primaryObject.x + primaryObject.width - 2, primaryObject.y + primaryObject.height - cornerSize + 2, 4, cornerSize);
    
    // Center focus indicator
    if (isFocused) {
      const centerX = primaryObject.x + primaryObject.width / 2;
      const centerY = primaryObject.y + primaryObject.height / 2;
      
      // Pulsing center dot
      ctx.fillStyle = `rgba(0, 255, 255, ${0.6 + Math.sin(time * 6) * 0.4})`;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 6 * pulseScale, 0, 2 * Math.PI);
      ctx.fill();
      
      // Crosshairs
      ctx.strokeStyle = `rgba(0, 255, 255, ${0.8 + Math.sin(time * 4) * 0.2})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX - 15, centerY);
      ctx.lineTo(centerX + 15, centerY);
      ctx.moveTo(centerX, centerY - 15);
      ctx.lineTo(centerX, centerY + 15);
      ctx.stroke();
    }
    
    // Confidence label
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(primaryObject.x, primaryObject.y - 25, 80, 20);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Confidence: ${Math.round(primaryObject.confidence * 100)}%`, primaryObject.x + 5, primaryObject.y - 10);
    
    ctx.restore();
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10"
      style={{ mixBlendMode: 'difference' }}
    />
  );
}