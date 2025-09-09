import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Ruler, CreditCard, CheckCircle, AlertCircle, Zap } from "lucide-react";
import { useState, useEffect } from "react";

type EnhancedCalibrationCardProps = {
  calibrationInches: number;
  onChangeCalibrationInches: (val: number) => void;
  onStartCalibrating: () => void;
  onAutoCalibrate?: () => void;
  pixelsPerInch: number;
  isCalibrating?: boolean;
  isAutoCalibrating?: boolean;
  calibrationProgress?: number;
  calibrationStatus?: string;
  hasCalibrationLine?: boolean;
};

export function EnhancedCalibrationCard({
  calibrationInches,
  onChangeCalibrationInches,
  onStartCalibrating,
  onAutoCalibrate,
  pixelsPerInch,
  isCalibrating = false,
  isAutoCalibrating = false,
  calibrationProgress = 0,
  calibrationStatus = "Ready",
  hasCalibrationLine = false,
}: EnhancedCalibrationCardProps) {
  const [pulseAnimation, setPulseAnimation] = useState(false);

  useEffect(() => {
    if (isCalibrating || isAutoCalibrating) {
      setPulseAnimation(true);
      const timer = setTimeout(() => setPulseAnimation(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCalibrating, isAutoCalibrating]);

  const getStatusColor = () => {
    if (isCalibrating || isAutoCalibrating) return "bg-blue-500/20 border-blue-500";
    if (hasCalibrationLine) return "bg-green-500/20 border-green-500";
    return "bg-orange-500/20 border-orange-500";
  };

  const getStatusIcon = () => {
    if (isCalibrating || isAutoCalibrating) return <Zap className="w-4 h-4 text-blue-500" />;
    if (hasCalibrationLine) return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <AlertCircle className="w-4 h-4 text-orange-500" />;
  };

  const getStatusText = () => {
    if (isAutoCalibrating) return "Auto-detecting credit card...";
    if (isCalibrating) return "Click two points of known distance";
    if (hasCalibrationLine) return "Calibrated - ready to measure";
    return "Calibration required for accurate measurements";
  };

  return (
    <Card className={`transition-all duration-300 ${pulseAnimation ? 'ring-2 ring-primary/50 animate-pulse' : ''}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ruler className="w-5 h-5" />
          Calibration
          <Badge variant={hasCalibrationLine ? "default" : "secondary"}>
            {hasCalibrationLine ? "Active" : "Inactive"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status indicator */}
        <Alert className={`border ${getStatusColor()}`}>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <AlertDescription className="flex-1">
              {getStatusText()}
            </AlertDescription>
          </div>
          {(isCalibrating || isAutoCalibrating) && (
            <div className="mt-2">
              <Progress value={calibrationProgress} className="h-2" />
              {calibrationStatus && (
                <div className="text-xs text-muted-foreground mt-1">{calibrationStatus}</div>
              )}
            </div>
          )}
        </Alert>

        {/* Reference distance input */}
        <div className="space-y-3">
          <div className="text-sm font-medium">Reference Distance</div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              step="0.1"
              value={calibrationInches}
              onChange={(e) => onChangeCalibrationInches(parseFloat(e.target.value) || 1)}
              className="flex-1"
              disabled={isCalibrating || isAutoCalibrating}
            />
            <span className="text-sm text-muted-foreground min-w-[24px]">in</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Standard credit card = 3.375", ruler markings, or any known distance
          </div>
        </div>

        {/* Calibration buttons */}
        <div className="flex gap-2">
          <Button 
            size="sm" 
            onClick={onStartCalibrating}
            disabled={isCalibrating || isAutoCalibrating}
            className="flex-1"
          >
            <Ruler className="w-4 h-4 mr-2" />
            Manual
          </Button>
          {onAutoCalibrate && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onAutoCalibrate}
              disabled={isCalibrating || isAutoCalibrating}
              className="flex-1"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Auto (Card)
            </Button>
          )}
        </div>

        {/* Current scale display */}
        <div className="p-3 rounded-lg bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Current Scale</div>
            <div className="text-sm">
              <span className="font-mono">{pixelsPerInch.toFixed(1)}</span>
              <span className="text-muted-foreground ml-1">px/in</span>
            </div>
          </div>
          {hasCalibrationLine && (
            <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Calibration active - measurements are scaled
            </div>
          )}
        </div>

        {/* Quick reference */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="font-medium">Quick Reference:</div>
          <div>• Credit card: 3.375" × 2.125"</div>
          <div>• US Quarter: 0.955" diameter</div>
          <div>• Standard ruler: Use inch markings</div>
        </div>
      </CardContent>
    </Card>
  );
}