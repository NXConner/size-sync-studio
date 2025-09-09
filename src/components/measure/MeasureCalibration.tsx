import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Ruler, Target } from "lucide-react";
import { useMeasurementHaptics } from "@/hooks/useHaptics";

interface CalibrationProps {
  unit: "in" | "cm";
  setUnit: (unit: "in" | "cm") => void;
  pixelsPerInch: number;
  setPixelsPerInch: (ppi: number) => void;
  calibrationInches: number;
  setCalibrationInches: (inches: number) => void;
  isCalibrating: boolean;
  setIsCalibrating: (calibrating: boolean) => void;
  calibStart: { x: number; y: number } | null;
  setCalibStart: (point: { x: number; y: number } | null) => void;
  calibEnd: { x: number; y: number } | null;
  setCalibEnd: (point: { x: number; y: number } | null) => void;
  isAutoCalibrating: boolean;
  setIsAutoCalibrating: (auto: boolean) => void;
  snapEnabled: boolean;
  snapRadiusPx: number;
  setSnapRadiusPx: (radius: number) => void;
}

export const MeasureCalibration = ({
  unit,
  setUnit,
  pixelsPerInch,
  setPixelsPerInch,
  calibrationInches,
  setCalibrationInches,
  isCalibrating,
  setIsCalibrating,
  calibStart,
  setCalibStart,
  calibEnd,
  setCalibEnd,
  isAutoCalibrating,
  setIsAutoCalibrating,
  snapEnabled,
  snapRadiusPx,
  setSnapRadiusPx
}: CalibrationProps) => {
  const { successHaptic, errorHaptic } = useMeasurementHaptics();

  const startCalibration = () => {
    setCalibStart(null);
    setCalibEnd(null);
    setIsCalibrating(true);
    successHaptic();
  };

  const finishCalibration = () => {
    if (calibStart && calibEnd) {
      const dx = calibEnd.x - calibStart.x;
      const dy = calibEnd.y - calibStart.y;
      const pixelDistance = Math.hypot(dx, dy);
      if (pixelDistance > 0) {
        const newPpi = pixelDistance / calibrationInches;
        setPixelsPerInch(newPpi);
        setIsCalibrating(false);
        successHaptic();
      } else {
        errorHaptic();
      }
    } else {
      errorHaptic();
    }
  };

  const cancelCalibration = () => {
    setIsCalibrating(false);
    setCalibStart(null);
    setCalibEnd(null);
    errorHaptic();
  };

  const autoCalibrate = async () => {
    setIsAutoCalibrating(true);
    try {
      // Auto-calibration logic would go here
      // For now, use a standard phone screen estimation
      const screenWidthMm = window.screen.width * (25.4 / 96); // Rough estimation
      const estimatedPPI = window.screen.width / (screenWidthMm / 25.4);
      setPixelsPerInch(estimatedPPI);
      successHaptic();
    } catch (error) {
      errorHaptic();
    } finally {
      setIsAutoCalibrating(false);
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ruler className="w-5 h-5" />
          Calibration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Unit</span>
          <div className="flex gap-2">
            <Button
              variant={unit === "in" ? "default" : "outline"}
              size="sm"
              onClick={() => setUnit("in")}
            >
              Inches
            </Button>
            <Button
              variant={unit === "cm" ? "default" : "outline"}
              size="sm"
              onClick={() => setUnit("cm")}
            >
              CM
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Pixels per inch: {pixelsPerInch.toFixed(1)}
          </label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={pixelsPerInch.toFixed(1)}
              onChange={(e) => setPixelsPerInch(Number(e.target.value))}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={autoCalibrate}
              disabled={isAutoCalibrating}
            >
              {isAutoCalibrating ? "..." : "Auto"}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Reference length: {calibrationInches} {unit}
          </label>
          <Slider
            value={[calibrationInches]}
            onValueChange={(v) => setCalibrationInches(v[0])}
            min={0.5}
            max={12}
            step={0.1}
            className="w-full"
          />
        </div>

        <div className="flex gap-2">
          {isCalibrating ? (
            <>
              <Button
                variant="default"
                size="sm"
                onClick={finishCalibration}
                disabled={!calibStart || !calibEnd}
                className="flex-1"
              >
                <Target className="w-4 h-4 mr-2" />
                Confirm
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={cancelCalibration}
                className="flex-1"
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={startCalibration}
              className="w-full"
            >
              <Ruler className="w-4 h-4 mr-2" />
              Manual Calibrate
            </Button>
          )}
        </div>

        {isCalibrating && (
          <div className="p-3 bg-accent/20 rounded-lg animate-fade-in">
            <p className="text-sm text-muted-foreground">
              {!calibStart
                ? "Tap to set the first point"
                : !calibEnd
                ? "Tap to set the second point"
                : "Ready to confirm calibration"}
            </p>
            {calibStart && calibEnd && (
              <Badge variant="secondary" className="mt-2">
                Distance: {Math.hypot(calibEnd.x - calibStart.x, calibEnd.y - calibStart.y).toFixed(1)}px
              </Badge>
            )}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Edge snapping</span>
            <Badge variant={snapEnabled ? "default" : "secondary"}>
              {snapEnabled ? "ON" : "OFF"}
            </Badge>
          </div>
          {snapEnabled && (
            <div>
              <label className="text-xs text-muted-foreground">
                Snap radius: {snapRadiusPx}px
              </label>
              <Slider
                value={[snapRadiusPx]}
                onValueChange={(v) => setSnapRadiusPx(v[0])}
                min={5}
                max={50}
                step={1}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};