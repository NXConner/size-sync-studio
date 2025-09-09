import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Activity, 
  Target, 
  Brain, 
  Zap, 
  Eye,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  LineChart,
  Camera
} from "lucide-react";
import { MLAnalysisResult } from "@/lib/advancedML";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart as RechartsPieChart, Cell, BarChart, Bar, ResponsiveContainer } from "recharts";

interface AdvancedAnalyticsPanelProps {
  analysisResult: MLAnalysisResult | null;
  measurementHistory: Array<{
    timestamp: number;
    length: number;
    girth: number;
    confidence: number;
  }>;
  isAnalyzing: boolean;
  onToggleAdvancedMode: (enabled: boolean) => void;
  advancedModeEnabled: boolean;
}

export function AdvancedAnalyticsPanel({
  analysisResult,
  measurementHistory,
  isAnalyzing,
  onToggleAdvancedMode,
  advancedModeEnabled
}: AdvancedAnalyticsPanelProps) {
  const [selectedMetric, setSelectedMetric] = useState<'quality' | 'environmental' | 'predictions'>('quality');

  const getQualityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-500';
    if (score >= 0.6) return 'text-yellow-500';
    if (score >= 0.4) return 'text-orange-500';
    return 'text-red-500';
  };

  const getQualityBadgeVariant = (score: number) => {
    if (score >= 0.8) return 'default';
    if (score >= 0.6) return 'secondary';
    return 'destructive';
  };

  const formatTrendData = () => {
    return measurementHistory.slice(-20).map((entry, index) => ({
      index,
      length: entry.length,
      girth: entry.girth,
      confidence: entry.confidence * 100,
      timestamp: new Date(entry.timestamp).toLocaleTimeString()
    }));
  };

  const formatQualityData = () => {
    if (!analysisResult) return [];
    
    return [
      { name: 'Sharpness', value: Math.round(analysisResult.qualityMetrics.sharpness * 100), color: '#8884d8' },
      { name: 'Contrast', value: Math.round(analysisResult.qualityMetrics.contrast * 100), color: '#82ca9d' },
      { name: 'Exposure', value: Math.round(analysisResult.qualityMetrics.exposure * 100), color: '#ffc658' },
      { name: 'Color Balance', value: Math.round(analysisResult.qualityMetrics.colorBalance * 100), color: '#ff7c7c' },
    ];
  };

  const formatEnvironmentalData = () => {
    if (!analysisResult) return [];
    
    return [
      { name: 'Lighting', score: analysisResult.environmentalFactors.lighting },
      { name: 'Stability', score: analysisResult.environmentalFactors.stability },
      { name: 'Perspective', score: analysisResult.environmentalFactors.perspective },
      { name: 'Background', score: 1 - analysisResult.environmentalFactors.backgroundNoise },
    ];
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Advanced Analytics
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={advancedModeEnabled ? "default" : "outline"}>
              {advancedModeEnabled ? "AI Enhanced" : "Basic Mode"}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onToggleAdvancedMode(!advancedModeEnabled)}
            >
              <Zap className="w-4 h-4 mr-1" />
              {advancedModeEnabled ? "Disable AI" : "Enable AI"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!advancedModeEnabled ? (
          <Alert>
            <Brain className="h-4 w-4" />
            <AlertDescription>
              Enable AI mode for advanced analysis, quality assessment, intelligent suggestions, and predictive measurements.
            </AlertDescription>
          </Alert>
        ) : (
          <Tabs value={selectedMetric} onValueChange={(value) => setSelectedMetric(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="quality">Quality Analysis</TabsTrigger>
              <TabsTrigger value="environmental">Environment</TabsTrigger>
              <TabsTrigger value="predictions">Predictions</TabsTrigger>
            </TabsList>

            <TabsContent value="quality" className="space-y-4 mt-4">
              {isAnalyzing ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Activity className="w-4 h-4 animate-pulse" />
                  Analyzing image quality...
                </div>
              ) : analysisResult ? (
                <>
                  {/* Overall Quality Score */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="w-4 h-4" />
                        <span className="text-sm font-medium">Overall Quality</span>
                      </div>
                      <div className={`text-2xl font-bold ${getQualityColor(analysisResult.qualityScore)}`}>
                        {Math.round(analysisResult.qualityScore * 100)}%
                      </div>
                      <Progress value={analysisResult.qualityScore * 100} className="h-2 mt-2" />
                    </Card>
                    
                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4" />
                        <span className="text-sm font-medium">Confidence</span>
                      </div>
                      <div className={`text-2xl font-bold ${getQualityColor(analysisResult.confidence)}`}>
                        {Math.round(analysisResult.confidence * 100)}%
                      </div>
                      <Progress value={analysisResult.confidence * 100} className="h-2 mt-2" />
                    </Card>
                  </div>

                  {/* Quality Metrics Breakdown */}
                  <div>
                    <h4 className="font-medium mb-3">Quality Metrics Breakdown</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <RechartsPieChart>
                        <Pie
                          dataKey="value"
                          data={formatQualityData()}
                          cx="50%"
                          cy="50%"
                          outerRadius={60}
                          fill="#8884d8"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {formatQualityData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Individual Metrics */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Sharpness</span>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={analysisResult.qualityMetrics.sharpness * 100} 
                          className="w-20 h-2" 
                        />
                        <span className="text-xs font-mono w-8">
                          {Math.round(analysisResult.qualityMetrics.sharpness * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Contrast</span>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={analysisResult.qualityMetrics.contrast * 100} 
                          className="w-20 h-2" 
                        />
                        <span className="text-xs font-mono w-8">
                          {Math.round(analysisResult.qualityMetrics.contrast * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Exposure</span>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={analysisResult.qualityMetrics.exposure * 100} 
                          className="w-20 h-2" 
                        />
                        <span className="text-xs font-mono w-8">
                          {Math.round(analysisResult.qualityMetrics.exposure * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Color Balance</span>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={analysisResult.qualityMetrics.colorBalance * 100} 
                          className="w-20 h-2" 
                        />
                        <span className="text-xs font-mono w-8">
                          {Math.round(analysisResult.qualityMetrics.colorBalance * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <Alert>
                  <Camera className="h-4 w-4" />
                  <AlertDescription>
                    Start measurement analysis to see quality metrics
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="environmental" className="space-y-4 mt-4">
              {analysisResult ? (
                <>
                  <div>
                    <h4 className="font-medium mb-3">Environmental Factors</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={formatEnvironmentalData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 1]} />
                        <Tooltip 
                          formatter={(value: number) => [`${Math.round(value * 100)}%`, 'Score']}
                        />
                        <Bar dataKey="score" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Intelligent Suggestions */}
                  {analysisResult.suggestions.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">AI Recommendations</h4>
                      <div className="space-y-2">
                        {analysisResult.suggestions.map((suggestion, index) => (
                          <Alert key={index}>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>{suggestion}</AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Alert>
                  <Activity className="h-4 w-4" />
                  <AlertDescription>
                    Environmental analysis will appear here during measurement
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="predictions" className="space-y-4 mt-4">
              {analysisResult && analysisResult.predictedMeasurements.confidence > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm font-medium">Predicted Length</span>
                      </div>
                      <div className="text-xl font-bold">
                        {analysisResult.predictedMeasurements.length.toFixed(2)}"
                      </div>
                      <Badge 
                        variant={getQualityBadgeVariant(analysisResult.predictedMeasurements.confidence)}
                        className="text-xs mt-1"
                      >
                        {Math.round(analysisResult.predictedMeasurements.confidence * 100)}% confident
                      </Badge>
                    </Card>
                    
                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="w-4 h-4" />
                        <span className="text-sm font-medium">Predicted Girth</span>
                      </div>
                      <div className="text-xl font-bold">
                        {analysisResult.predictedMeasurements.girth.toFixed(2)}"
                      </div>
                      <Badge 
                        variant={getQualityBadgeVariant(analysisResult.predictedMeasurements.confidence)}
                        className="text-xs mt-1"
                      >
                        {Math.round(analysisResult.predictedMeasurements.confidence * 100)}% confident
                      </Badge>
                    </Card>
                  </div>

                  {/* Measurement Trend */}
                  {measurementHistory.length > 1 && (
                    <div>
                      <h4 className="font-medium mb-3">Measurement Trend</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <RechartsLineChart data={formatTrendData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="index" />
                          <YAxis />
                          <Tooltip 
                            labelFormatter={(index) => `Measurement ${index + 1}`}
                            formatter={(value: number, name: string) => [
                              name === 'confidence' ? `${value.toFixed(0)}%` : `${value.toFixed(2)}"`,
                              name === 'confidence' ? 'Confidence' : name.charAt(0).toUpperCase() + name.slice(1)
                            ]}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="length" 
                            stroke="#8884d8" 
                            strokeWidth={2}
                            name="length"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="girth" 
                            stroke="#82ca9d" 
                            strokeWidth={2}
                            name="girth"
                          />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Error Corrections */}
                  {analysisResult.corrections && Object.keys(analysisResult.corrections).length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">AI Corrections Available</h4>
                      <div className="space-y-2">
                        {analysisResult.corrections.basePoint && (
                          <Alert>
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription>
                              Suggested base point adjustment available (confidence: {Math.round(analysisResult.corrections.basePoint.confidence * 100)}%)
                            </AlertDescription>
                          </Alert>
                        )}
                        {analysisResult.corrections.tipPoint && (
                          <Alert>
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription>
                              Suggested tip point adjustment available (confidence: {Math.round(analysisResult.corrections.tipPoint.confidence * 100)}%)
                            </AlertDescription>
                          </Alert>
                        )}
                        {analysisResult.corrections.curvatureCorrection && (
                          <Alert>
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription>
                              Perspective-corrected curvature: {analysisResult.corrections.curvatureCorrection.toFixed(1)}°
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Alert>
                  <LineChart className="h-4 w-4" />
                  <AlertDescription>
                    Take more measurements to see AI predictions and trends
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}

// Re-export Pie component from recharts for the PieChart
import { Pie } from 'recharts';