import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Ruler, Target, CheckCircle, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CalibrationCardProps {
  pixelsPerInch: number;
  onCalibrationChange: (ppi: number) => void;
  unit: "in" | "cm";
}

const COMMON_OBJECTS = [
  { name: "US Quarter", size: 0.955, unit: "in" },
  { name: "US Penny", size: 0.75, unit: "in" },
  { name: "Credit Card (length)", size: 3.375, unit: "in" },
  { name: "Credit Card (width)", size: 2.125, unit: "in" },
  { name: "AA Battery", size: 2.0, unit: "in" },
  { name: "Euro Coin (1€)", size: 23.25, unit: "mm" },
  { name: "Euro Coin (2€)", size: 25.75, unit: "mm" },
  { name: "Business Card", size: 89, unit: "mm" }
];

export function EnhancedCalibrationCard({ pixelsPerInch, onCalibrationChange, unit }: CalibrationCardProps) {
  const [selectedObject, setSelectedObject] = useState<string>("");
  const [customSize, setCustomSize] = useState<string>("");
  const [pixelMeasurement, setPixelMeasurement] = useState<string>("");
  const [calibrationStatus, setCalibrationStatus] = useState<"pending" | "good" | "poor">("pending");

  const cmToIn = (cm: number) => cm / 2.54;
  const inToCm = (inch: number) => inch * 2.54;

  useEffect(() => {
    if (pixelsPerInch < 50) {
      setCalibrationStatus("poor");
    } else if (pixelsPerInch >= 50 && pixelsPerInch <= 200) {
      setCalibrationStatus("good");
    } else {
      setCalibrationStatus("poor");
    }
  }, [pixelsPerInch]);

  const handleObjectSelection = (objectName: string) => {
    setSelectedObject(objectName);
    const obj = COMMON_OBJECTS.find(o => o.name === objectName);
    if (obj) {
      let size = obj.size;
      if (obj.unit === "mm" && unit === "in") {
        size = size / 25.4;
      } else if (obj.unit === "in" && unit === "cm") {
        size = inToCm(size);
      } else if (obj.unit === "mm" && unit === "cm") {
        size = size / 10;
      }
      setCustomSize(size.toFixed(3));
    }
  };

  const handleManualCalibration = () => {
    const sizeInUnit = parseFloat(customSize);
    const pixelSize = parseFloat(pixelMeasurement);
    
    if (sizeInUnit > 0 && pixelSize > 0) {
      let ppi: number;
      if (unit === "in") {
        ppi = pixelSize / sizeInUnit;
      } else {
        ppi = pixelSize / cmToIn(sizeInUnit);
      }
      onCalibrationChange(ppi);
    }
  };

  const getStatusIcon = () => {
    switch (calibrationStatus) {
      case "good":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "poor":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Target className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (calibrationStatus) {
      case "good":
        return "bg-green-500/20 text-green-500 border-green-500/30";
      case "poor":
        return "bg-red-500/20 text-red-500 border-red-500/30";
      default:
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
    }
  };

  return (
    <Card className="gradient-card shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Ruler className="w-5 h-5" />
          Calibration
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={getStatusColor()}>
            {getStatusIcon()}
            <span className="ml-1 text-xs">
              {calibrationStatus === "good" ? "Good" : calibrationStatus === "poor" ? "Poor" : "Needed"}
            </span>
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {pixelsPerInch.toFixed(1)} PPI
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCalibrationChange(96)}
            className="text-xs"
          >
            Standard (96)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCalibrationChange(150)}
            className="text-xs"
          >
            Mobile (150)
          </Button>
        </div>

        <div className="space-y-2">
          <Select value={selectedObject} onValueChange={handleObjectSelection}>
            <SelectTrigger className="text-xs h-8">
              <SelectValue placeholder="Reference object" />
            </SelectTrigger>
            <SelectContent>
              {COMMON_OBJECTS.map((obj) => (
                <SelectItem key={obj.name} value={obj.name} className="text-xs">
                  {obj.name} ({obj.size} {obj.unit})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            step="0.001"
            value={customSize}
            onChange={(e) => setCustomSize(e.target.value)}
            placeholder={`Size (${unit})`}
            className="text-xs h-8"
          />
          <Input
            type="number"
            value={pixelMeasurement}
            onChange={(e) => setPixelMeasurement(e.target.value)}
            placeholder="Pixels"
            className="text-xs h-8"
          />
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleManualCalibration}
          disabled={!customSize || !pixelMeasurement}
          className="w-full text-xs"
        >
          Apply Calibration
        </Button>
      </CardContent>
    </Card>
  );
}