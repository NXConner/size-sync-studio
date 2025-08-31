import { SessionPreset } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Gauge, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SessionPresetCardProps {
  preset: SessionPreset;
  onStart: (presetId: string) => void;
}

const difficultyColors = {
  beginner: "bg-success/20 text-success border-success/30",
  intermediate: "bg-warning/20 text-warning border-warning/30",
  advanced: "bg-destructive/20 text-destructive border-destructive/30",
};

const categoryColors = {
  length: "bg-primary/20 text-primary border-primary/30",
  girth: "bg-secondary/20 text-secondary border-secondary/30",
  both: "bg-accent/20 text-accent border-accent/30",
  testicles: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

export function SessionPresetCard({ preset, onStart }: SessionPresetCardProps) {
  return (
    <Card className="gradient-card shadow-card hover:shadow-glow transition-all duration-300 group cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg text-foreground group-hover:text-primary transition-colors">
              {preset.name}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {preset.description}
            </CardDescription>
          </div>
          <Badge variant="outline" className={cn("ml-2", difficultyColors[preset.difficulty])}>
            {preset.difficulty}
          </Badge>
        </div>

        <div className="flex gap-2 mt-3">
          <Badge variant="outline" className={cn(categoryColors[preset.category])}>
            {preset.category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{preset.duration} min</span>
          </div>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Gauge className="w-4 h-4" />
            <span>Pressure level {preset.pressure}</span>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          Rest at minutes: {preset.restPeriods.join(", ")}
        </div>

        {preset.warnings.length > 0 && (
          <div className="flex items-start space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
            <div className="text-xs text-destructive-foreground">
              <p className="font-medium mb-1">Safety Warning:</p>
              <p>{preset.warnings[0]}</p>
            </div>
          </div>
        )}

        <Button
          onClick={() => onStart(preset.id)}
          className="w-full gradient-primary hover:shadow-primary shadow-lg transition-all duration-200"
        >
          Start Session
        </Button>
      </CardContent>
    </Card>
  );
}
