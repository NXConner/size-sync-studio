import { useEffect, useRef } from "react";

interface VisualFeedbackOverlayProps {
  containerRef: React.RefObject<HTMLDivElement>;
  measurementPoints: Array<{ x: number; y: number }>;
  isRecording?: boolean;
  detectedObjects?: Array<{ x: number; y: number; width: number; height: number; confidence: number }>;
  gridEnabled?: boolean;
  showCrosshairs?: boolean;
}

export function VisualFeedbackOverlay({
  containerRef,
  measurementPoints,
  isRecording = false,
  detectedObjects = [],
  gridEnabled = false,
  showCrosshairs = true
}: VisualFeedbackOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (canvas.width !== container.clientWidth || canvas.height !== container.clientHeight) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }

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

      drawMeasurementPoints(ctx, measurementPoints);
      drawDetectedObjects(ctx, detectedObjects);

      if (isRecording) {
        drawRecordingIndicator(ctx, canvas.width);
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [containerRef, measurementPoints, isRecording, detectedObjects, gridEnabled, showCrosshairs]);

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

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10"
      style={{ mixBlendMode: 'difference' }}
    />
  );
}