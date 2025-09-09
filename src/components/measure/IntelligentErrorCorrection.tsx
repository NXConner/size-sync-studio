import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Zap,
  Target,
  Eye,
  TrendingUp
} from "lucide-react";
import { MLAnalysisResult } from "@/lib/advancedML";

interface ErrorCorrectionSuggestion {
  id: string;
  type: 'perspective' | 'lighting' | 'stability' | 'calibration' | 'detection' | 'outlier';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  confidence: number;
  autoFixAvailable: boolean;
  correction?: {
    basePoint?: { x: number; y: number };
    tipPoint?: { x: number; y: number };
    scaleAdjustment?: number;
    angleCorrection?: number;
  };
  onApply?: () => void;
  onDismiss?: () => void;
}

interface IntelligentErrorCorrectionProps {
  analysisResult: MLAnalysisResult | null;
  basePoint: { x: number; y: number } | null;
  tipPoint: { x: number; y: number } | null;
  pixelsPerInch: number;
  measurementHistory: Array<{
    timestamp: number;
    length: number;
    girth: number;
    confidence: number;
  }>;
  onApplyCorrection: (type: string, correction: any) => void;
  onDismissError: (errorId: string) => void;
}

export function IntelligentErrorCorrection({
  analysisResult,
  basePoint,
  tipPoint,
  pixelsPerInch,
  measurementHistory,
  onApplyCorrection,
  onDismissError
}: IntelligentErrorCorrectionProps) {
  const [errorSuggestions, setErrorSuggestions] = useState<ErrorCorrectionSuggestion[]>([]);
  const [dismissedErrors, setDismissedErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (analysisResult) {
      generateErrorSuggestions();
    }
  }, [analysisResult, basePoint, tipPoint, measurementHistory]);

  const generateErrorSuggestions = () => {
    if (!analysisResult) return;

    const suggestions: ErrorCorrectionSuggestion[] = [];

    // Perspective correction errors
    if (analysisResult.environmentalFactors.perspective < 0.6) {
      suggestions.push({
        id: 'perspective-correction',
        type: 'perspective',
        severity: analysisResult.environmentalFactors.perspective < 0.4 ? 'high' : 'medium',
        title: 'Perspective Distortion Detected',
        description: `Camera angle may be causing ${Math.round((1 - analysisResult.environmentalFactors.perspective) * 100)}% measurement distortion. Consider repositioning camera perpendicular to subject.`,
        confidence: 0.85,
        autoFixAvailable: true,
        correction: {
          scaleAdjustment: 1 / (analysisResult.environmentalFactors.perspective + 0.3),
          angleCorrection: Math.acos(analysisResult.environmentalFactors.perspective) * (180 / Math.PI)
        },
        onApply: () => applyPerspectiveCorrection(analysisResult.environmentalFactors.perspective)
      });
    }

    // Lighting correction errors
    if (analysisResult.environmentalFactors.lighting < 0.4) {
      suggestions.push({
        id: 'lighting-correction',
        type: 'lighting',
        severity: analysisResult.environmentalFactors.lighting < 0.2 ? 'critical' : 'high',
        title: 'Poor Lighting Conditions',
        description: `Insufficient lighting detected (${Math.round(analysisResult.environmentalFactors.lighting * 100)}% quality). This may affect measurement accuracy by up to 20%.`,
        confidence: 0.9,
        autoFixAvailable: false,
        onApply: () => suggestLightingImprovement()
      });
    }

    // Stability correction errors
    if (analysisResult.environmentalFactors.stability < 0.5) {
      suggestions.push({
        id: 'stability-correction',
        type: 'stability',
        severity: analysisResult.environmentalFactors.stability < 0.3 ? 'high' : 'medium',
        title: 'Camera Movement Detected',
        description: `Camera shake reducing measurement precision by approximately ${Math.round((1 - analysisResult.environmentalFactors.stability) * 30)}%. Consider stabilizing device.`,
        confidence: 0.8,
        autoFixAvailable: false,
        onApply: () => suggestStabilization()
      });
    }

    // Detection accuracy errors
    if (analysisResult.confidence < 0.6 && basePoint && tipPoint) {
      suggestions.push({
        id: 'detection-accuracy',
        type: 'detection',
        severity: analysisResult.confidence < 0.4 ? 'critical' : 'high',
        title: 'Low Detection Confidence',
        description: `AI detection confidence is ${Math.round(analysisResult.confidence * 100)}%. Measurement points may need manual adjustment for accuracy.`,
        confidence: 1 - analysisResult.confidence,
        autoFixAvailable: analysisResult.corrections.basePoint || analysisResult.corrections.tipPoint ? true : false,
        correction: {
          basePoint: analysisResult.corrections.basePoint,
          tipPoint: analysisResult.corrections.tipPoint
        },
        onApply: () => applyDetectionCorrection()
      });
    }

    // Outlier detection based on measurement history
    if (measurementHistory.length >= 3) {
      const outlierResult = detectMeasurementOutliers();
      if (outlierResult.isOutlier) {
        suggestions.push({
          id: 'outlier-detection',  
          type: 'outlier',
          severity: outlierResult.severity,
          title: 'Measurement Outlier Detected',
          description: outlierResult.description,
          confidence: outlierResult.confidence,
          autoFixAvailable: false,
          onApply: () => suggestOutlierAction()
        });
      }
    }
    if (measurementHistory.length >= 3) {
        const outlierAnalysis = detectMeasurementOutliers();
        if (outlierAnalysis.isOutlier) {
        suggestions.push({
          id: 'outlier-detection',
          type: 'outlier',
          severity: outlierAnalysis.severity,
          title: 'Measurement Outlier Detected',
          description: outlierAnalysis.description,
          confidence: outlierAnalysis.confidence,
          autoFixAvailable: false,
          onApply: () => suggestOutlierAction()
        });
      }
    }

    // Calibration accuracy errors
    if (pixelsPerInch < 50 || pixelsPerInch > 200) {
      suggestions.push({
        id: 'calibration-accuracy',
        type: 'calibration',
        severity: 'medium',
        title: 'Calibration May Need Review',
        description: `Current scale (${pixelsPerInch.toFixed(1)} px/in) seems ${pixelsPerInch < 50 ? 'too low' : 'too high'}. Consider recalibrating with a known reference.`,
        confidence: 0.7,
        autoFixAvailable: false,
        onApply: () => suggestRecalibration()
      });
    }

    // Quality-based corrections
    if (analysisResult.qualityMetrics.sharpness < 0.4) {
      suggestions.push({
        id: 'sharpness-correction',
        type: 'detection',
        severity: 'medium',
        title: 'Image Sharpness Low',
        description: `Low image sharpness (${Math.round(analysisResult.qualityMetrics.sharpness * 100)}%) may affect edge detection accuracy. Check focus and clean lens.`,
        confidence: 0.8,
        autoFixAvailable: false,
        onApply: () => suggestSharpnessImprovement()
      });
    }

    // Filter out dismissed errors
    const filteredSuggestions = suggestions.filter(s => !dismissedErrors.has(s.id));
    setErrorSuggestions(filteredSuggestions);
  };

  const detectMeasurementOutliers = () => {
    if (measurementHistory.length < 3) {
      return { isOutlier: false, severity: 'low' as const, description: '', confidence: 0 };
    }

    const recent = measurementHistory.slice(-5);
    const lengths = recent.map(m => m.length);
    const girths = recent.map(m => m.girth);

    const lengthMean = lengths.reduce((sum, val) => sum + val, 0) / lengths.length;
    const girthMean = girths.reduce((sum, val) => sum + val, 0) / girths.length;

    const lengthStd = Math.sqrt(
      lengths.reduce((sum, val) => sum + Math.pow(val - lengthMean, 2), 0) / lengths.length
    );
    const girthStd = Math.sqrt(
      girths.reduce((sum, val) => sum + Math.pow(val - girthMean, 2), 0) / girths.length
    );

    const latestLength = lengths[lengths.length - 1];
    const latestGirth = girths[girths.length - 1];

    const lengthZScore = lengthStd > 0 ? Math.abs(latestLength - lengthMean) / lengthStd : 0;
    const girthZScore = girthStd > 0 ? Math.abs(latestGirth - girthMean) / girthStd : 0;

    const maxZScore = Math.max(lengthZScore, girthZScore);

    if (maxZScore > 2.5) {
      return {
        isOutlier: true,
        severity: maxZScore > 3.5 ? 'critical' as const : 'high' as const,
        description: `Current measurement differs significantly from recent history (${maxZScore.toFixed(1)} standard deviations). This may indicate measurement error or significant change.`,
        confidence: Math.min(0.95, maxZScore / 4)
      };
    }

    return { isOutlier: false, severity: 'low' as const, description: '', confidence: 0 };
  };

  const applyPerspectiveCorrection = (perspectiveFactor: number) => {
    onApplyCorrection('perspective', {
      scaleAdjustment: 1 / (perspectiveFactor + 0.3),
      message: 'Perspective correction applied'
    });
  };

  const applyDetectionCorrection = () => {
    if (analysisResult?.corrections.basePoint) {
      onApplyCorrection('basePoint', analysisResult.corrections.basePoint);
    }
    if (analysisResult?.corrections.tipPoint) {
      onApplyCorrection('tipPoint', analysisResult.corrections.tipPoint);
    }
  };

  const suggestLightingImprovement = () => {
    onApplyCorrection('suggestion', {
      type: 'lighting',
      message: 'Move closer to window or add light source'
    });
  };

  const suggestStabilization = () => {
    onApplyCorrection('suggestion', {
      type: 'stability',
      message: 'Brace device against surface or use both hands'
    });
  };

  const suggestRecalibration = () => {
    onApplyCorrection('suggestion', {
      type: 'calibration',
      message: 'Use credit card or ruler for recalibration'
    });
  };

  const suggestSharpnessImprovement = () => {
    onApplyCorrection('suggestion', {
      type: 'sharpness',
      message: 'Tap screen to focus and clean camera lens'
    });
  };

  const suggestOutlierAction = () => {
    onApplyCorrection('suggestion', {
      type: 'outlier',
      message: 'Review measurement or take additional measurement for verification'
    });
  };

  const handleDismissError = (errorId: string) => {
    setDismissedErrors(prev => new Set([...prev, errorId]));
    onDismissError(errorId);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'medium': return <Eye className="w-4 h-4 text-yellow-500" />;
      case 'low': return <Target className="w-4 h-4 text-blue-500" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Intelligent Error Correction
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {errorSuggestions.length} issues detected
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {errorSuggestions.length === 0 ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              No correction issues detected. Measurement conditions are optimal.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            {errorSuggestions.map((suggestion) => (
              <Alert key={suggestion.id} className={getSeverityColor(suggestion.severity)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getSeverityIcon(suggestion.severity)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{suggestion.title}</span>
                        <Badge 
                          variant={getSeverityBadge(suggestion.severity) as any}
                          className="text-xs"
                        >
                          {suggestion.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(suggestion.confidence * 100)}%
                        </Badge>
                      </div>
                      <AlertDescription className="text-xs mb-2">
                        {suggestion.description}
                      </AlertDescription>
                      <div className="flex items-center gap-2">
                        {suggestion.autoFixAvailable && suggestion.onApply && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={suggestion.onApply}
                            className="text-xs h-6"
                          >
                            <Zap className="w-3 h-3 mr-1" />
                            Auto Fix
                          </Button>
                        )}
                        {!suggestion.autoFixAvailable && suggestion.onApply && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={suggestion.onApply}
                            className="text-xs h-6"
                          >
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Suggest
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleDismissError(suggestion.id)}
                          className="text-xs h-6"
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}

        {/* Summary Statistics */}
        {errorSuggestions.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="text-center p-2 rounded bg-red-100">
                <div className="font-mono text-red-700">
                  {errorSuggestions.filter(s => s.severity === 'critical').length}
                </div>
                <div className="text-red-600">Critical</div>
              </div>
              <div className="text-center p-2 rounded bg-orange-100">
                <div className="font-mono text-orange-700">
                  {errorSuggestions.filter(s => s.severity === 'high').length}
                </div>
                <div className="text-orange-600">High</div>
              </div>
              <div className="text-center p-2 rounded bg-yellow-100">
                <div className="font-mono text-yellow-700">
                  {errorSuggestions.filter(s => s.severity === 'medium').length}
                </div>
                <div className="text-yellow-600">Medium</div>
              </div>
              <div className="text-center p-2 rounded bg-blue-100">
                <div className="font-mono text-blue-700">
                  {errorSuggestions.filter(s => s.autoFixAvailable).length}
                </div>
                <div className="text-blue-600">Auto-Fix</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}