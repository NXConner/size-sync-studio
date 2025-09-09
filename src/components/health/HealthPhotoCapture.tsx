import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  Upload, 
  Trash2, 
  Eye, 
  EyeOff, 
  Shield, 
  Brain,
  CheckCircle,
  AlertTriangle,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMeasurementHaptics } from "@/hooks/useHaptics";
import { 
  healthPhotoAnalyzer, 
  loadImageFromFile, 
  HealthPhotoAnalysisResult
} from "@/lib/healthPhotoAnalysis";
import { removeBackground } from "@/lib/backgroundRemoval";

interface HealthPhotoCaptureProps {
  category: 'peyronie' | 'std';
  onAnalysisComplete: (result: HealthPhotoAnalysisResult) => void;
  onPhotoCapture?: (photoUrl: string) => void;
}

export const HealthPhotoCapture = ({ 
  category, 
  onAnalysisComplete, 
  onPhotoCapture 
}: HealthPhotoCaptureProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [capturedPhoto, setCapturedPhoto] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<HealthPhotoAnalysisResult | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [backgroundRemoved, setBackgroundRemoved] = useState(false);
  const [processingBackground, setProcessingBackground] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const { successHaptic, errorHaptic } = useMeasurementHaptics();

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please check permissions or use file upload.",
        variant: "destructive"
      });
      errorHaptic();
    }
  }, [toast, errorHaptic]);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    const photoUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedPhoto(photoUrl);
    onPhotoCapture?.(photoUrl);
    stopCamera();
    successHaptic();
    
    toast({
      title: "Photo Captured",
      description: "Photo captured successfully. Ready for analysis."
    });
  }, [stopCamera, successHaptic, toast, onPhotoCapture]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file.",
        variant: "destructive"
      });
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 10MB.",
        variant: "destructive"
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const photoUrl = e.target?.result as string;
      setCapturedPhoto(photoUrl);
      onPhotoCapture?.(photoUrl);
      successHaptic();
    };
    reader.readAsDataURL(file);
  }, [toast, successHaptic, onPhotoCapture]);

  const removePhotoBackground = useCallback(async () => {
    if (!capturedPhoto) return;
    
    setProcessingBackground(true);
    
    try {
      // Convert data URL to blob
      const response = await fetch(capturedPhoto);
      const blob = await response.blob();
      
      // Load as image element
      const imageElement = await loadImageFromFile(new File([blob], 'photo.jpg'));
      
      // Remove background
      const processedBlob = await removeBackground(imageElement);
      
      // Convert back to data URL
      const processedUrl = URL.createObjectURL(processedBlob);
      const reader = new FileReader();
      reader.onload = () => {
        setCapturedPhoto(reader.result as string);
        setBackgroundRemoved(true);
        URL.revokeObjectURL(processedUrl);
        
        toast({
          title: "Background Removed",
          description: "Photo processed for enhanced privacy."
        });
        successHaptic();
      };
      reader.readAsDataURL(processedBlob);
      
    } catch (error) {
      console.error('Error removing background:', error);
      toast({
        title: "Processing Error",
        description: "Could not remove background. Original photo will be used.",
        variant: "destructive"
      });
      errorHaptic();
    } finally {
      setProcessingBackground(false);
    }
  }, [capturedPhoto, toast, successHaptic, errorHaptic]);

  const analyzePhoto = useCallback(async () => {
    if (!capturedPhoto) return;
    
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    try {
      // Convert data URL to image element
      const response = await fetch(capturedPhoto);
      const blob = await response.blob();
      const imageElement = await loadImageFromFile(new File([blob], 'photo.jpg'));
      
      // Progress simulation
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => Math.min(prev + 10, 90));
      }, 500);
      
      let result: HealthPhotoAnalysisResult;
      
      if (category === 'peyronie') {
        result = await healthPhotoAnalyzer.analyzePeyroniePhoto(imageElement);
      } else {
        result = await healthPhotoAnalyzer.analyzeSTDPhoto(imageElement);
      }
      
      clearInterval(progressInterval);
      setAnalysisProgress(100);
      
      setAnalysisResult(result);
      onAnalysisComplete(result);
      successHaptic();
      
      toast({
        title: "Analysis Complete",
        description: `Photo analysis completed with ${Math.round(result.confidence * 100)}% confidence.`
      });
      
    } catch (error) {
      console.error('Error analyzing photo:', error);
      toast({
        title: "Analysis Error",
        description: "Could not analyze photo. Please try again or consult a healthcare provider.",
        variant: "destructive"
      });
      errorHaptic();
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
    }
  }, [capturedPhoto, category, onAnalysisComplete, successHaptic, errorHaptic, toast]);

  const clearPhoto = useCallback(() => {
    setCapturedPhoto("");
    setAnalysisResult(null);
    setBackgroundRemoved(false);
    setShowPreview(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'none': return 'default';
      case 'mild': return 'secondary';
      case 'moderate': return 'secondary'; // Using secondary instead of warning
      case 'severe': return 'destructive';
      default: return 'outline';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'default'; // Using default instead of success
    if (confidence >= 0.6) return 'secondary'; // Using secondary instead of warning
    return 'destructive';
  };

  const getCategoryTitle = () => {
    return category === 'peyronie' ? "Peyronie's Disease" : "STD/STI";
  };

  const getCategoryDescription = () => {
    return category === 'peyronie' 
      ? "Capture a photo for AI-powered curvature and plaque analysis"
      : "Capture a photo for AI-powered symptom and lesion detection";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            {getCategoryTitle()} Photo Analysis
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {getCategoryDescription()}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Privacy Notice:</strong> All analysis is performed locally in your browser. 
              Photos are not uploaded to any server. Background removal is available for additional privacy.
            </AlertDescription>
          </Alert>

          {!capturedPhoto && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button onClick={startCamera} className="h-20">
                  <Camera className="w-6 h-6 mr-2" />
                  Use Camera
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  className="h-20"
                >
                  <Upload className="w-6 h-6 mr-2" />
                  Upload Photo
                </Button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}

          {videoRef.current?.srcObject && (
            <div className="space-y-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full max-w-md mx-auto rounded-lg"
              />
              <Button onClick={capturePhoto} className="w-full">
                <Camera className="w-4 h-4 mr-2" />
                Capture Photo
              </Button>
            </div>
          )}

          {capturedPhoto && (
            <div className="space-y-4">
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Captured Photo</h4>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPreview(!showPreview)}
                    >
                      {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {showPreview ? 'Hide' : 'Show'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearPhoto}
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear
                    </Button>
                  </div>
                </div>
                
                {showPreview && (
                  <img
                    src={capturedPhoto}
                    alt="Captured photo for analysis"
                    className="w-full max-w-md mx-auto rounded-lg border"
                  />
                )}
                
                {backgroundRemoved && (
                  <Badge variant="outline" className="mt-2">
                    <Shield className="w-3 h-3 mr-1" />
                    Background Removed
                  </Badge>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={removePhotoBackground}
                  disabled={processingBackground || backgroundRemoved}
                  variant="outline"
                  className="flex-1"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {processingBackground ? 'Processing...' : 
                   backgroundRemoved ? 'Background Removed' : 'Remove Background'}
                </Button>
                
                <Button
                  onClick={analyzePhoto}
                  disabled={isAnalyzing}
                  className="flex-1"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Photo'}
                </Button>
              </div>

              {isAnalyzing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Analyzing photo...</span>
                    <span>{analysisProgress}%</span>
                  </div>
                  <Progress value={analysisProgress} />
                </div>
              )}
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </CardContent>
      </Card>

      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary mb-1">
                  {analysisResult.riskScore}
                </div>
                <div className="text-sm text-muted-foreground">Risk Score</div>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold mb-1">
                  <Badge variant={getConfidenceColor(analysisResult.confidence)}>
                    {Math.round(analysisResult.confidence * 100)}%
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">Confidence</div>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold mb-1">
                  {analysisResult.findings.length}
                </div>
                <div className="text-sm text-muted-foreground">Findings</div>
              </div>
            </div>

            {analysisResult.findings.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Detected Findings:</h4>
                {analysisResult.findings.map((finding, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="mt-1">
                      {finding.severity === 'none' ? (
                        <Info className="w-4 h-4 text-blue-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium capitalize">{finding.type}</span>
                        <Badge variant={getSeverityColor(finding.severity)}>
                          {finding.severity}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(finding.confidence * 100)}% confidence
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {finding.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {analysisResult.recommendations.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">AI Recommendations:</h4>
                <ul className="space-y-2">
                  {analysisResult.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {recommendation}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysisResult.requiresFollowUp && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Medical Follow-up Recommended:</strong> Based on the analysis results, 
                  consider consulting with a healthcare provider for proper evaluation and diagnosis.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};