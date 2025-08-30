import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, CheckCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Goal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  type: "weight_loss" | "weight_gain" | "measurement";
}

interface GoalCardProps {
  goal: Goal;
  onUpdateGoal?: (goalId: string) => void;
  onCompleteGoal?: (goalId: string) => void;
}

export const GoalCard = ({ goal, onUpdateGoal, onCompleteGoal }: GoalCardProps) => {
  const progress = Math.min((goal.current / goal.target) * 100, 100);
  const isCompleted = progress >= 100;
  const daysLeft = Math.ceil(
    (new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
  );

  const getStatusColor = () => {
    if (isCompleted) return "default";
    if (daysLeft < 7) return "destructive";
    return "secondary";
  };

  const getStatusText = () => {
    if (isCompleted) return "Completed";
    if (daysLeft < 0) return "Overdue";
    if (daysLeft === 0) return "Due today";
    return `${daysLeft} days left`;
  };

  return (
    <Card className="gradient-card shadow-card hover:shadow-primary transition-all duration-300 group">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
            {goal.title}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{goal.description}</p>
        </div>
        <Badge variant={getStatusColor()}>
          {isCompleted ? (
            <CheckCircle className="w-3 h-3 mr-1" />
          ) : (
            <Clock className="w-3 h-3 mr-1" />
          )}
          {getStatusText()}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {goal.current} / {goal.target} {goal.unit}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="text-xs text-muted-foreground text-right">
            {progress.toFixed(1)}% complete
          </div>
        </div>

        {!isCompleted && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateGoal?.(goal.id)}
              className="flex-1"
            >
              Update Progress
            </Button>
            {progress >= 100 && (
              <Button
                variant="accent"
                size="sm"
                onClick={() => onCompleteGoal?.(goal.id)}
                className="flex-1"
              >
                Mark Complete
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
