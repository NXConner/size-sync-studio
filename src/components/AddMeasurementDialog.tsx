import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddMeasurementDialogProps {
  onAddMeasurement: (measurement: {
    type: string;
    value: number;
    unit: string;
    date: string;
  }) => void;
}

const measurementTypes = [
  { value: "weight", label: "Weight", units: ["kg", "lbs"] },
  { value: "chest", label: "Chest", units: ["cm", "in"] },
  { value: "waist", label: "Waist", units: ["cm", "in"] },
  { value: "hips", label: "Hips", units: ["cm", "in"] },
  { value: "bicep", label: "Bicep", units: ["cm", "in"] },
  { value: "thigh", label: "Thigh", units: ["cm", "in"] },
  { value: "neck", label: "Neck", units: ["cm", "in"] },
];

export const AddMeasurementDialog = ({ onAddMeasurement }: AddMeasurementDialogProps) => {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("");
  const { toast } = useToast();

  const selectedType = measurementTypes.find((t) => t.value === type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!type || !value || !unit) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const numericValue = parseFloat(value);
    if (isNaN(numericValue) || numericValue <= 0) {
      toast({
        title: "Invalid value",
        description: "Please enter a valid positive number",
        variant: "destructive",
      });
      return;
    }

    onAddMeasurement({
      type,
      value: numericValue,
      unit,
      date: new Date().toISOString(),
    });

    toast({
      title: "Measurement added!",
      description: `${selectedType?.label}: ${value} ${unit}`,
    });

    // Reset form
    setType("");
    setValue("");
    setUnit("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="hero" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Measurement
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Measurement</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Measurement Type</Label>
            <Select
              value={type}
              onValueChange={(value) => {
                setType(value);
                setUnit(""); // Reset unit when type changes
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select measurement type" />
              </SelectTrigger>
              <SelectContent>
                {measurementTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Value</Label>
            <Input
              id="value"
              type="number"
              step="0.1"
              placeholder="Enter measurement value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit">Unit</Label>
            <Select value={unit} onValueChange={setUnit} disabled={!selectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {selectedType?.units.map((unitOption) => (
                  <SelectItem key={unitOption} value={unitOption}>
                    {unitOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" variant="default" className="flex-1">
              Add Measurement
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
