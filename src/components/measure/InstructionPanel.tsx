import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  Ruler, 
  Eye, 
  CheckCircle,
  Info
} from "lucide-react";

interface InstructionPanelProps {
  currentStep?: 'setup' | 'calibration' | 'positioning' | 'measurement' | 'review';
}

export function InstructionPanel({ currentStep = 'setup' }: InstructionPanelProps) {
  const steps = [
    {
      id: 'setup',
      title: 'Camera Setup',
      icon: Camera,
      instructions: [
        "Position camera at comfortable distance",
        "Ensure good lighting",
        "Use stable surface or tripod",
        "Grant camera permissions"
      ]
    },
    {
      id: 'calibration',
      title: 'Scale Calibration',
      icon: Ruler,
      instructions: [
        "Place reference object (coin, ruler)",
        "Set scale using calibration tools",
        "Verify calibration accuracy",
        "Keep reference at same distance"
      ]
    },
    {
      id: 'positioning',
      title: 'Positioning',
      icon: Eye,
      instructions: [
        "Position parallel to camera",
        "Maintain consistent distance",
        "Ensure clear visibility",
        "Use on-screen guides"
      ]
    },
    {
      id: 'measurement',
      title: 'Measuring',
      icon: CheckCircle,
      instructions: [
        "Click two points for measurement",
        "Place points accurately",
        "Take multiple measurements",
        "Review and save results"
      ]
    }
  ];

  const currentStepData = steps.find(s => s.id === currentStep) || steps[0];
  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <Card className="gradient-card shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Info className="w-4 h-4" />
          Instructions
        </CardTitle>
        <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 text-xs w-fit">
          Step {currentStepIndex + 1} of {steps.length}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-primary">
          <currentStepData.icon className="w-4 h-4" />
          <h3 className="font-semibold text-sm">{currentStepData.title}</h3>
        </div>
        
        <ul className="space-y-1">
          {currentStepData.instructions.map((instruction, index) => (
            <li key={index} className="flex items-start gap-2 text-xs">
              <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
              <span>{instruction}</span>
            </li>
          ))}
        </ul>

        <div className="pt-2 border-t border-border/20">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{currentStepIndex + 1}/{steps.length}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div 
              className="bg-primary rounded-full h-1.5 transition-all duration-300"
              style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}