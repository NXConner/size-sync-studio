import { useEffect, useRef } from "react";

type VisualFeedbackOverlayProps = {
  isDetecting: boolean;
  confidence: number;
  qualityScore: number;
  isCalibrating: boolean;
  autoStatus: string;
  showScanSweep: boolean;
  showStabilityRing: boolean;
  showPulsingHalos: boolean;
  basePoint: { x: number; y: number } | null;
  tipPoint: { x: number; y: number } | null;
  calibStart: { x: number; y: number } | null;
  calibEnd: { x: number; y: number } | null;
  canvasWidth: number;
  canvasHeight: number;
};

export function VisualFeedbackOverlay({
  isDetecting,
  confidence,
  qualityScore,
  isCalibrating,
  autoStatus,
  showScanSweep,
  showStabilityRing,
  showPulsingHalos,
  basePoint,
  tipPoint,
  calibStart,
  calibEnd,
  canvasWidth,
  canvasHeight,
}: VisualFeedbackOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const animate = (timestamp: number) => {
      timeRef.current = timestamp;
      draw();
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [canvasWidth, canvasHeight, isDetecting, confidence, qualityScore, isCalibrating, autoStatus, showScanSweep, showStabilityRing, showPulsingHalos, basePoint, tipPoint, calibStart, calibEnd]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const time = timeRef.current * 0.001; // Convert to seconds

    // Scanning sweep effect
    if (isDetecting && showScanSweep) {
      drawScanSweep(ctx, time);
    }

    // Stability ring around measurement points
    if (showStabilityRing && (basePoint || tipPoint)) {
      drawStabilityRings(ctx, time);
    }

    // Pulsing halos for active points
    if (showPulsingHalos) {
      drawPulsingHalos(ctx, time);
    }

    // Calibration visual feedback
    if (isCalibrating && calibStart && calibEnd) {
      drawCalibrationFeedback(ctx, time);
    }

    // Detection confidence visualization
    if (isDetecting) {
      drawConfidenceIndicator(ctx);
    }
  };

  const drawScanSweep = (ctx: CanvasRenderingContext2D, time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const sweepWidth = canvas.width * 0.1;
    const sweepSpeed = 2; // Sweeps per second
    const sweepProgress = (time * sweepSpeed) % 1;
    const sweepX = sweepProgress * (canvas.width + sweepWidth) - sweepWidth;

    // Create gradient for sweep
    const gradient = ctx.createLinearGradient(sweepX, 0, sweepX + sweepWidth, 0);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0)');
    gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.3)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(sweepX, 0, sweepWidth, canvas.height);
  };

  const drawStabilityRings = (ctx: CanvasRenderingContext2D, time: number) => {
    const pulseSpeed = 1.5; // Pulses per second
    const pulsePhase = (time * pulseSpeed) % (Math.PI * 2);
    const ringRadius = 20 + Math.sin(pulsePhase) * 10;
    
    const stabilityColor = confidence > 0.7 ? '#10b981' : confidence > 0.4 ? '#f59e0b' : '#ef4444';

    [basePoint, tipPoint].forEach(point => {
      if (!point) return;

      ctx.strokeStyle = stabilityColor;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.6 + Math.sin(pulsePhase) * 0.3;
      
      ctx.beginPath();
      ctx.arc(point.x, point.y, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
      
      // Inner solid circle
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = stabilityColor;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1;
  };

  const drawPulsingHalos = (ctx: CanvasRenderingContext2D, time: number) => {
    const haloSpeed = 2; // Pulses per second
    const haloPhase = (time * haloSpeed) % (Math.PI * 2);
    
    [
      { point: basePoint, color: '#3b82f6' },
      { point: tipPoint, color: '#8b5cf6' },
      { point: calibStart, color: '#f59e0b' },
      { point: calibEnd, color: '#f59e0b' }
    ].forEach(({ point, color }) => {
      if (!point) return;

      const haloRadius = 15 + Math.sin(haloPhase) * 5;
      const haloAlpha = 0.3 + Math.sin(haloPhase) * 0.2;

      // Outer halo
      const gradient = ctx.createRadialGradient(
        point.x, point.y, 0,
        point.x, point.y, haloRadius
      );
      gradient.addColorStop(0, `${color}${Math.round(haloAlpha * 255).toString(16).padStart(2, '0')}`);
      gradient.addColorStop(1, `${color}00`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(point.x, point.y, haloRadius, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const drawCalibrationFeedback = (ctx: CanvasRenderingContext2D, time: number) => {
    if (!calibStart || !calibEnd) return;

    // Animated dashed line
    const dashLength = 10;
    const gapLength = 5;
    const dashSpeed = 50; // pixels per second
    const dashOffset = (time * dashSpeed) % (dashLength + gapLength);

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.setLineDash([dashLength, gapLength]);
    ctx.lineDashOffset = -dashOffset;
    
    ctx.beginPath();
    ctx.moveTo(calibStart.x, calibStart.y);
    ctx.lineTo(calibEnd.x, calibEnd.y);
    ctx.stroke();
    
    ctx.setLineDash([]); // Reset dash

    // Distance label
    const midX = (calibStart.x + calibEnd.x) / 2;
    const midY = (calibStart.y + calibEnd.y) / 2;
    const distance = Math.sqrt(
      Math.pow(calibEnd.x - calibStart.x, 2) + 
      Math.pow(calibEnd.y - calibStart.y, 2)
    );

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(midX - 30, midY - 15, 60, 20);
    
    ctx.fillStyle = '#fff';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${distance.toFixed(0)}px`, midX, midY + 3);
  };

  const drawConfidenceIndicator = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Corner confidence indicator
    const indicatorSize = 60;
    const x = canvas.width - indicatorSize - 10;
    const y = 10;

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x, y, indicatorSize, 30);

    // Confidence bar
    const confidenceWidth = (indicatorSize - 10) * confidence;
    const confidenceColor = confidence > 0.7 ? '#10b981' : confidence > 0.4 ? '#f59e0b' : '#ef4444';
    
    ctx.fillStyle = confidenceColor;
    ctx.fillRect(x + 5, y + 20, confidenceWidth, 8);

    // Text
    ctx.fillStyle = '#fff';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${Math.round(confidence * 100)}%`, x + 5, y + 15);
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 10 }}
    />
  );
}