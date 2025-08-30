import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MeasurementCardProps {
  title: string;
  value: number;
  unit: string;
  change?: number;
  target?: number;
  icon?: React.ReactNode;
}

export const MeasurementCard = ({
  title,
  value,
  unit,
  change,
  target,
  icon,
}: MeasurementCardProps) => {
  const getTrendIcon = () => {
    if (!change) return <Minus className="w-4 h-4" />;
    if (change > 0) return <TrendingUp className="w-4 h-4" />;
    return <TrendingDown className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (!change) return "text-muted-foreground";
    if (change > 0) return "text-success";
    return "text-destructive";
  };

  const getProgressPercentage = () => {
    if (!target || target === 0) return 0;
    return Math.min((value / target) * 100, 100);
  };

  return (
    <Card className="gradient-card shadow-card hover:shadow-primary transition-all duration-300 group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon && (
          <div className="text-primary group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-foreground">
            {value}
            <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>
          </div>
          {change !== undefined && (
            <Badge variant="secondary" className={`${getTrendColor()} gap-1`}>
              {getTrendIcon()}
              {Math.abs(change)}
              {unit}
            </Badge>
          )}
        </div>

        {target && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progress to goal</span>
              <span>
                {target}
                {unit}
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="gradient-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
