import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Brain,
  TrendingUp,
  Target,
  Lightbulb,
  Zap,
  AlertTriangle,
  ArrowRight,
  Calendar
} from "lucide-react";
import { MLAnalysisResult } from "@/lib/advancedML";

interface PredictiveMeasurementAssistantProps {
  analysisResult: MLAnalysisResult | null;
  measurementHistory: Array<{
    timestamp: number;
    length: number;
    girth: number;
    confidence: number;
  }>;
  onAcceptSuggestion: (type: 'basePoint' | 'tipPoint', point: { x: number; y: number }) => void;
}

interface PredictionInsight {
  type: 'trend' | 'anomaly' | 'recommendation' | 'milestone';
  severity: 'info' | 'warning' | 'success' | 'error';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  action?: () => void;
}

export function PredictiveMeasurementAssistant({
  analysisResult,
  measurementHistory,
  onAcceptSuggestion
}: PredictiveMeasurementAssistantProps) {
  const [insights, setInsights] = useState<PredictionInsight[]>([]);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);

  useEffect(() => {
    if (analysisResult && measurementHistory.length > 0) {
      generatePredictiveInsights();
    }
  }, [analysisResult, measurementHistory]);

  const generatePredictiveInsights = () => {
    const newInsights: PredictionInsight[] = [];

    // Trend Analysis
    if (measurementHistory.length >= 5) {
      const recentMeasurements = measurementHistory.slice(-5);
      const lengthTrend = calculateTrend(recentMeasurements.map(m => m.length));
      const girthTrend = calculateTrend(recentMeasurements.map(m => m.girth));

      if (Math.abs(lengthTrend) > 0.02) {
        newInsights.push({
          type: 'trend',
          severity: lengthTrend > 0 ? 'success' : 'warning',
          title: `Length ${lengthTrend > 0 ? 'Increasing' : 'Decreasing'} Trend`,
          description: `Recent measurements show a ${Math.abs(lengthTrend * 100).toFixed(1)}% ${lengthTrend > 0 ? 'increase' : 'decrease'} in length over last 5 measurements.`,
          confidence: 0.8,
          actionable: false
        });
      }

      if (Math.abs(girthTrend) > 0.02) {
        newInsights.push({
          type: 'trend',
          severity: girthTrend > 0 ? 'success' : 'warning',
          title: `Girth ${girthTrend > 0 ? 'Increasing' : 'Decreasing'} Trend`,
          description: `Recent measurements show a ${Math.abs(girthTrend * 100).toFixed(1)}% ${girthTrend > 0 ? 'increase' : 'decrease'} in girth over last 5 measurements.`,
          confidence: 0.8,
          actionable: false
        });
      }
    }

    // Consistency Analysis
    if (measurementHistory.length >= 3) {
      const consistencyScore = calculateConsistency(measurementHistory.slice(-5));
      
      if (consistencyScore < 0.7) {
        newInsights.push({
          type: 'recommendation',
          severity: 'warning',
          title: 'Measurement Consistency Alert',
          description: `Recent measurements show ${Math.round((1 - consistencyScore) * 100)}% variance. Consider recalibrating or improving measurement technique.`,
          confidence: 0.9,
          actionable: true,
          action: () => console.log('Suggest recalibration')
        });
      }
    }

    // Quality-based insights
    if (analysisResult) {
      if (analysisResult.qualityScore > 0.9) {
        newInsights.push({
          type: 'milestone',
          severity: 'success',
          title: 'Excellent Measurement Quality',
          description: `Current measurement conditions are optimal (${Math.round(analysisResult.qualityScore * 100)}% quality score). This is an ideal time for accurate measurements.`,
          confidence: 0.95,
          actionable: false
        });
      }

      // Environmental suggestions
      if (analysisResult.environmentalFactors.lighting < 0.5) {
        newInsights.push({
          type: 'recommendation',
          severity: 'warning',
          title: 'Improve Lighting Conditions',
          description: 'Current lighting is suboptimal. Better lighting could improve measurement accuracy by up to 15%.',
          confidence: 0.85,
          actionable: true
        });
      }

      if (analysisResult.environmentalFactors.stability < 0.6) {
        newInsights.push({
          type: 'recommendation',
          severity: 'warning',
          title: 'Stabilize Camera Movement',
          description: 'Detected camera shake. Stabilizing your device could improve measurement precision.',
          confidence: 0.9,
          actionable: true
        });
      }

      // Predictive corrections
      if (analysisResult.corrections.basePoint && analysisResult.corrections.basePoint.confidence > 0.7) {
        newInsights.push({
          type: 'recommendation',
          severity: 'info',
          title: 'AI-Suggested Base Point Correction',
          description: `AI detected a more accurate base point with ${Math.round(analysisResult.corrections.basePoint.confidence * 100)}% confidence.`,
          confidence: analysisResult.corrections.basePoint.confidence,
          actionable: true,
          action: () => onAcceptSuggestion('basePoint', analysisResult.corrections.basePoint!)
        });
      }

      if (analysisResult.corrections.tipPoint && analysisResult.corrections.tipPoint.confidence > 0.7) {
        newInsights.push({
          type: 'recommendation',
          severity: 'info',
          title: 'AI-Suggested Tip Point Correction',
          description: `AI detected a more accurate tip point with ${Math.round(analysisResult.corrections.tipPoint.confidence * 100)}% confidence.`,
          confidence: analysisResult.corrections.tipPoint.confidence,
          actionable: true,
          action: () => onAcceptSuggestion('tipPoint', analysisResult.corrections.tipPoint!)
        });
      }
    }

    // Time-based insights
    const timeInsights = generateTimeBasedInsights();
    newInsights.push(...timeInsights);

    setInsights(newInsights);
  };

  const calculateTrend = (values: number[]): number => {
    if (values.length < 2) return 0;
    
    const n = values.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumXX += i * i;
    }
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope / (sumY / n); // Normalize by average value
  };

  const calculateConsistency = (measurements: Array<{ length: number; girth: number }>): number => {
    if (measurements.length < 2) return 1;
    
    const lengths = measurements.map(m => m.length);
    const girths = measurements.map(m => m.girth);
    
    const lengthVariation = calculateCoefficientOfVariation(lengths);
    const girthVariation = calculateCoefficientOfVariation(girths);
    
    // Higher variation = lower consistency
    return Math.max(0, 1 - (lengthVariation + girthVariation) / 2);
  };

  const calculateCoefficientOfVariation = (values: number[]): number => {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);
    return mean > 0 ? standardDeviation / mean : 0;
  };

  const generateTimeBasedInsights = (): PredictionInsight[] => {
    const timeInsights: PredictionInsight[] = [];
    
    if (measurementHistory.length > 0) {
      const lastMeasurement = measurementHistory[measurementHistory.length - 1];
      const timeSinceLastMeasurement = Date.now() - lastMeasurement.timestamp;
      const daysSince = timeSinceLastMeasurement / (1000 * 60 * 60 * 24);
      
      if (daysSince > 7 && measurementHistory.length >= 3) {
        timeInsights.push({
          type: 'recommendation',
          severity: 'info',
          title: 'Regular Measurement Reminder',
          description: `It's been ${Math.round(daysSince)} days since your last measurement. Regular tracking helps identify trends.`,
          confidence: 0.7,
          actionable: true
        });
      }
      
      // Weekly progress insights
      const weeklyMeasurements = measurementHistory.filter(
        m => Date.now() - m.timestamp < 7 * 24 * 60 * 60 * 1000
      );
      
      if (weeklyMeasurements.length >= 5) {
        timeInsights.push({
          type: 'milestone',
          severity: 'success',
          title: 'Consistent Tracking Achievement',
          description: `Great job! You've taken ${weeklyMeasurements.length} measurements this week. Consistent tracking leads to better results.`,
          confidence: 1.0,
          actionable: false
        });
      }
    }
    
    return timeInsights;
  };

  const getInsightIcon = (insight: PredictionInsight) => {
    switch (insight.type) {
      case 'trend': return <TrendingUp className="w-4 h-4" />;
      case 'anomaly': return <AlertTriangle className="w-4 h-4" />;
      case 'recommendation': return <Lightbulb className="w-4 h-4" />;
      case 'milestone': return <Target className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getInsightColor = (severity: string) => {
    switch (severity) {
      case 'success': return 'border-green-200 bg-green-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'error': return 'border-red-200 bg-red-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'success': return 'default';
      case 'warning': return 'secondary';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Measurement Assistant
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {insights.length} insights
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
            >
              {showDetailedAnalysis ? 'Simple' : 'Detailed'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.length === 0 ? (
          <Alert>
            <Brain className="h-4 w-4" />
            <AlertDescription>
              Take a few measurements to get AI-powered insights and recommendations.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            {insights.slice(0, showDetailedAnalysis ? insights.length : 3).map((insight, index) => (
              <Alert key={index} className={getInsightColor(insight.severity)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getInsightIcon(insight)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{insight.title}</span>
                        <Badge 
                          variant={getSeverityBadgeVariant(insight.severity)} 
                          className="text-xs"
                        >
                          {Math.round(insight.confidence * 100)}%
                        </Badge>
                      </div>
                      <AlertDescription className="text-xs">
                        {insight.description}
                      </AlertDescription>
                      {showDetailedAnalysis && (
                        <div className="mt-2">
                          <Progress value={insight.confidence * 100} className="h-1" />
                        </div>
                      )}
                    </div>
                  </div>
                  {insight.actionable && insight.action && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={insight.action}
                      className="flex-shrink-0 ml-2"
                    >
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </Alert>
            ))}
            
            {!showDetailedAnalysis && insights.length > 3 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowDetailedAnalysis(true)}
                className="w-full text-xs"
              >
                Show {insights.length - 3} more insights
              </Button>
            )}
          </div>
        )}

        {/* Predictive Summary */}
        {analysisResult && analysisResult.predictedMeasurements.confidence > 0.5 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              AI Predictions
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-lg font-bold">
                  {analysisResult.predictedMeasurements.length.toFixed(2)}"
                </div>
                <div className="text-xs text-muted-foreground">Predicted Length</div>
                <Progress 
                  value={analysisResult.predictedMeasurements.confidence * 100} 
                  className="h-1 mt-1"
                />
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-lg font-bold">
                  {analysisResult.predictedMeasurements.girth.toFixed(2)}"
                </div>
                <div className="text-xs text-muted-foreground">Predicted Girth</div>
                <Progress 
                  value={analysisResult.predictedMeasurements.confidence * 100} 
                  className="h-1 mt-1"
                />
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        {measurementHistory.length > 0 && showDetailedAnalysis && (
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Measurement Statistics
            </h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center p-2 rounded bg-muted/30">
                <div className="font-mono">{measurementHistory.length}</div>
                <div className="text-muted-foreground">Total</div>
              </div>
              <div className="text-center p-2 rounded bg-muted/30">
                <div className="font-mono">
                  {measurementHistory.filter(m => Date.now() - m.timestamp < 7 * 24 * 60 * 60 * 1000).length}
                </div>
                <div className="text-muted-foreground">This Week</div>
              </div>
              <div className="text-center p-2 rounded bg-muted/30">
                <div className="font-mono">
                  {Math.round(measurementHistory.reduce((sum, m) => sum + m.confidence, 0) / measurementHistory.length * 100)}%
                </div>
                <div className="text-muted-foreground">Avg. Confidence</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}