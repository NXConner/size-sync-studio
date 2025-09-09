import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Heart, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  Brain,
  Zap,
  Target,
  Calendar,
  BarChart3
} from "lucide-react";
import { Measurement } from "@/types";
import { getMeasurements } from "@/utils/storage";

interface HealthMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  recommendation: string;
}

interface HealthGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  unit: string;
  deadline: Date;
  status: 'on-track' | 'behind' | 'achieved';
}

interface HealthInsight {
  id: string;
  type: 'positive' | 'neutral' | 'warning';
  title: string;
  description: string;
  actionable: boolean;
  action?: string;
}

export const HealthInsights = () => {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [healthScore, setHealthScore] = useState(0);
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [goals, setGoals] = useState<HealthGoal[]>([]);
  const [insights, setInsights] = useState<HealthInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHealthData();
  }, []);

  const loadHealthData = async () => {
    try {
      const allMeasurements = getMeasurements();
      setMeasurements(allMeasurements);
      
      // Generate health analytics
      const analytics = generateHealthAnalytics(allMeasurements);
      setHealthScore(analytics.healthScore);
      setMetrics(analytics.metrics);
      setGoals(analytics.goals);
      setInsights(analytics.insights);
      
    } catch (error) {
      console.error('Failed to load health data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateHealthAnalytics = (measurements: Measurement[]): {
    healthScore: number;
    metrics: HealthMetric[];
    goals: HealthGoal[];
    insights: HealthInsight[];
  } => {
    if (measurements.length === 0) {
      return {
        healthScore: 0,
        metrics: [],
        goals: [],
        insights: [{
          id: '1',
          type: 'neutral',
          title: 'Start Your Journey',
          description: 'Take your first measurement to begin receiving personalized health insights.',
          actionable: true,
          action: 'Take Measurement'
        }]
      };
    }

    // Calculate trends and metrics
    const recent = measurements.slice(-10);
    const older = measurements.slice(0, -10);
    
    const avgRecentLength = recent.reduce((sum, m) => sum + m.length, 0) / recent.length;
    const avgOlderLength = older.length > 0 ? older.reduce((sum, m) => sum + m.length, 0) / older.length : avgRecentLength;
    const lengthTrend = avgRecentLength > avgOlderLength ? 'up' : avgRecentLength < avgOlderLength ? 'down' : 'stable';
    
    const avgRecentGirth = recent.reduce((sum, m) => sum + m.girth, 0) / recent.length;
    const avgOlderGirth = older.length > 0 ? older.reduce((sum, m) => sum + m.girth, 0) / older.length : avgRecentGirth;
    const girthTrend = avgRecentGirth > avgOlderGirth ? 'up' : avgRecentGirth < avgOlderGirth ? 'down' : 'stable';

    // Calculate consistency score
    const lengthVariance = recent.reduce((sum, m) => sum + Math.pow(m.length - avgRecentLength, 2), 0) / recent.length;
    const consistencyScore = Math.max(0, 100 - (lengthVariance * 20));

    // Calculate health score
    const trendScore = (lengthTrend === 'up' ? 30 : lengthTrend === 'stable' ? 20 : 10) +
                     (girthTrend === 'up' ? 30 : girthTrend === 'stable' ? 20 : 10);
    const measurementFrequency = measurements.length >= 5 ? 25 : measurements.length * 5;
    const healthScore = Math.round((trendScore + consistencyScore + measurementFrequency) / 3);

    const metrics: HealthMetric[] = [
      {
        id: 'length_avg',
        name: 'Average Length',
        value: avgRecentLength,
        unit: 'inches',
        status: 'good',
        trend: lengthTrend,
        recommendation: lengthTrend === 'up' ? 'Great progress! Keep up your current routine.' : 
                       lengthTrend === 'down' ? 'Consider adjusting your routine or consulting a specialist.' :
                       'Maintain consistency in your measurements and routine.'
      },
      {
        id: 'girth_avg',
        name: 'Average Girth',
        value: avgRecentGirth,
        unit: 'inches',
        status: 'good',
        trend: girthTrend,
        recommendation: girthTrend === 'up' ? 'Excellent girth development. Continue current protocol.' :
                       girthTrend === 'down' ? 'Monitor closely and consider routine adjustments.' :
                       'Stable measurements indicate good consistency.'
      },
      {
        id: 'consistency',
        name: 'Measurement Consistency',
        value: consistencyScore,
        unit: '%',
        status: consistencyScore >= 80 ? 'good' : consistencyScore >= 60 ? 'warning' : 'critical',
        trend: 'stable',
        recommendation: consistencyScore >= 80 ? 'Excellent measurement consistency!' :
                       'Try to maintain more consistent conditions during measurement.'
      },
      {
        id: 'frequency',
        name: 'Measurement Frequency',
        value: measurements.length,
        unit: 'total',
        status: measurements.length >= 10 ? 'good' : measurements.length >= 5 ? 'warning' : 'critical',
        trend: 'up',
        recommendation: measurements.length >= 10 ? 'Good tracking frequency.' :
                       'Consider taking measurements more regularly for better insights.'
      }
    ];

    const goals: HealthGoal[] = [
      {
        id: 'length_goal',
        name: 'Length Target',
        target: avgRecentLength + 0.5,
        current: avgRecentLength,
        unit: 'inches',
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        status: 'on-track'
      },
      {
        id: 'consistency_goal',
        name: 'Consistency Target',
        target: 90,
        current: consistencyScore,
        unit: '%',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        status: consistencyScore >= 85 ? 'on-track' : 'behind'
      }
    ];

    const insights: HealthInsight[] = [
      {
        id: 'trend_insight',
        type: lengthTrend === 'up' ? 'positive' : lengthTrend === 'down' ? 'warning' : 'neutral',
        title: `Length Trend: ${lengthTrend.charAt(0).toUpperCase() + lengthTrend.slice(1)}`,
        description: lengthTrend === 'up' ? 
          'Your recent measurements show positive growth. Keep following your current routine.' :
          lengthTrend === 'down' ? 
          'Recent measurements show a decline. Consider reviewing your routine or taking a rest day.' :
          'Your measurements are stable. This is normal and indicates consistency.',
        actionable: lengthTrend !== 'up',
        action: lengthTrend === 'down' ? 'Review Routine' : undefined
      },
      {
        id: 'consistency_insight',
        type: consistencyScore >= 80 ? 'positive' : 'warning',
        title: 'Measurement Consistency',
        description: consistencyScore >= 80 ?
          'Your measurements are highly consistent, indicating good measurement technique.' :
          'Your measurements vary significantly. Try to maintain consistent conditions and technique.',
        actionable: consistencyScore < 80,
        action: consistencyScore < 80 ? 'View Measurement Tips' : undefined
      },
      {
        id: 'frequency_insight',
        type: measurements.length >= 10 ? 'positive' : 'neutral',
        title: 'Tracking Frequency',
        description: measurements.length >= 10 ?
          'You have a good measurement history for accurate trend analysis.' :
          'Take more measurements over time to get better trend insights.',
        actionable: measurements.length < 10,
        action: measurements.length < 10 ? 'Set Reminder' : undefined
      }
    ];

    return { healthScore, metrics, goals, insights };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': case 'on-track': case 'achieved': return 'success';
      case 'warning': case 'behind': return 'warning';
      case 'critical': return 'destructive';
      default: return 'secondary';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      case 'stable': return <Activity className="w-4 h-4 text-yellow-500" />;
      default: return null;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default: return <Brain className="w-5 h-5 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                  <div className="h-2 bg-muted rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Health Score Overview */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
            Health Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">{healthScore}</div>
              <div className="text-sm text-muted-foreground">Overall Score</div>
            </div>
            <div className="flex-1">
              <Progress value={healthScore} className="h-3 mb-2" />
              <div className="text-sm text-muted-foreground">
                Based on trends, consistency, and measurement frequency
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics.map((metric) => (
              <Card key={metric.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(metric.trend)}
                      <Badge variant={getStatusColor(metric.status) as any} className="text-xs">
                        {metric.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">
                    {metric.value.toFixed(2)} {metric.unit}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {metric.recommendation}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((goal) => {
              const progress = (goal.current / goal.target) * 100;
              const daysLeft = Math.ceil((goal.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              
              return (
                <Card key={goal.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">{goal.name}</CardTitle>
                      <Badge variant={getStatusColor(goal.status) as any} className="text-xs">
                        {goal.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span>{goal.current.toFixed(1)} / {goal.target.toFixed(1)} {goal.unit}</span>
                      </div>
                      <Progress value={Math.min(progress, 100)} className="h-2" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{progress.toFixed(1)}% complete</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Set New Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Button variant="outline">
                  <Target className="w-4 h-4 mr-2" />
                  Create Custom Goal
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="space-y-4">
            {insights.map((insight) => (
              <Card key={insight.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getInsightIcon(insight.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {insight.description}
                      </p>
                      {insight.actionable && insight.action && (
                        <Button variant="outline" size="sm">
                          <Zap className="w-4 h-4 mr-2" />
                          {insight.action}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {insights.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Insights Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Take more measurements to receive personalized health insights.
                </p>
                <Button>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Take Measurement
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};