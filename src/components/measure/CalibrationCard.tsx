import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CalibrationCardProps = {
  calibrationInches: number;
  onChangeCalibrationInches: (val: number) => void;
  onStartCalibrating: () => void;
  pixelsPerInch: number;
};

export function CalibrationCard({
  calibrationInches,
  onChangeCalibrationInches,
  onStartCalibrating,
  pixelsPerInch,
}: CalibrationCardProps) {
  return (
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
            onChange={(e) => onChangeCalibrationInches(parseFloat(e.target.value) || 1)}
          />
          <span className="text-sm">in</span>
          <Button size="sm" onClick={onStartCalibrating}>
            Start
          </Button>
        </div>
        <div className="text-xs">Current scale: {pixelsPerInch.toFixed(1)} px/in</div>
      </CardContent>
    </Card>
  );
}

