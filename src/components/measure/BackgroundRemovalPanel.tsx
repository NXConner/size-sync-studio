import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Wand2, Download, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createBackgroundRemovedPhoto } from '@/lib/backgroundRemoval';
import { useMeasurementHaptics } from '@/hooks/useHaptics';

interface BackgroundRemovalPanelProps {
  currentPhotoBlob?: Blob | null;
  onProcessedPhoto?: (blob: Blob) => void;
  className?: string;
}

export function BackgroundRemovalPanel({ 
  currentPhotoBlob, 
  onProcessedPhoto,
  className = "" 
}: BackgroundRemovalPanelProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [autoRemoveBackground, setAutoRemoveBackground] = useState(false);
  const { toast } = useToast();
  const { successHaptic, errorHaptic } = useMeasurementHaptics();

  const handleRemoveBackground = async () => {
    if (!currentPhotoBlob) {
      toast({
        title: "No Photo Available", 
        description: "Please capture or upload a photo first.",
        variant: "destructive"
      });
      errorHaptic();
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const processed = await createBackgroundRemovedPhoto(
        currentPhotoBlob,
        (progressValue) => setProgress(progressValue)
      );

      setProcessedBlob(processed);
      
      // Create preview URL
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(processed);
      setPreviewUrl(url);
      setShowPreview(true);

      // Notify parent component
      onProcessedPhoto?.(processed);

      successHaptic();
      toast({
        title: "Background Removed!", 
        description: "Professional background removal complete.",
      });

    } catch (error) {
      console.error('Background removal failed:', error);
      errorHaptic();
      toast({
        title: "Background Removal Failed", 
        description: error instanceof Error ? error.message : "Please try again with better lighting.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const downloadProcessed = () => {
    if (!processedBlob) return;

    const url = URL.createObjectURL(processedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `measurement-no-bg-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download Started", 
      description: "Background-removed image is downloading.",
    });
  };

  return (
    <Card className={`animate-fade-in ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-primary" />
          AI Background Removal
          <Badge variant="secondary" className="ml-auto">
            Pro Feature
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Remove backgrounds professionally using advanced AI for cleaner, more focused measurements.
        </div>

        {/* Processing Progress */}
        {isProcessing && (
          <div className="space-y-2 animate-fade-in">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm">Processing with AI...</span>
            </div>
            <Progress value={progress} className="w-full animate-ml-process" />
            <div className="text-xs text-muted-foreground">
              {progress < 30 ? 'Loading AI models...' :
               progress < 70 ? 'Analyzing image...' :
               progress < 95 ? 'Removing background...' : 'Finalizing...'}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Auto-remove on capture</span>
            <Switch 
              checked={autoRemoveBackground} 
              onCheckedChange={setAutoRemoveBackground}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleRemoveBackground}
              disabled={!currentPhotoBlob || isProcessing}
              className="flex-1 animate-hover-scale"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Remove Background
                </>
              )}
            </Button>

            {processedBlob && (
              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                className="animate-hover-scale"
              >
                {showPreview ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            )}

            {processedBlob && (
              <Button
                variant="outline"
                onClick={downloadProcessed}
                className="animate-hover-scale"
              >
                <Download className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Preview */}
        {showPreview && previewUrl && (
          <div className="animate-scale-in border rounded-lg overflow-hidden">
            <img 
              src={previewUrl} 
              alt="Background removed preview"
              className="w-full h-auto max-h-48 object-contain bg-checkerboard"
              style={{
                backgroundImage: `
                  linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
                  linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
                  linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
                  linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)
                `,
                backgroundSize: '16px 16px',
                backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px'
              }}
            />
          </div>
        )}

        {/* Tips */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="font-medium">💡 Pro Tips:</div>
          <div>• Works best with good lighting and contrast</div>
          <div>• Plain backgrounds improve accuracy</div>
          <div>• Processing takes 10-30 seconds</div>
        </div>
      </CardContent>
    </Card>
  );
}