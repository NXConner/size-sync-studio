import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, Target, Zap, Eye, CheckCircle, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function InstructionPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Instructions & Guide
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="camera" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="camera">Camera</TabsTrigger>
            <TabsTrigger value="auto">Auto</TabsTrigger>
            <TabsTrigger value="measure">Measure</TabsTrigger>
            <TabsTrigger value="tips">Tips</TabsTrigger>
          </TabsList>
          
          <TabsContent value="camera" className="space-y-4 mt-4">
            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Camera Setup
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">1</Badge>
                  <div>
                    <div className="font-medium">Allow camera permissions</div>
                    <div className="text-muted-foreground">Grant camera access when prompted by browser</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">2</Badge>
                  <div>
                    <div className="font-medium">Choose back camera</div>
                    <div className="text-muted-foreground">Use "environment" facing mode for better quality</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">3</Badge>
                  <div>
                    <div className="font-medium">Ensure good lighting</div>
                    <div className="text-muted-foreground">Bright, even lighting improves detection accuracy</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">4</Badge>
                  <div>
                    <div className="font-medium">Hold device steady</div>
                    <div className="text-muted-foreground">Minimize shake for better edge detection</div>
                  </div>
                </div>
              </div>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Position camera perpendicular to subject to minimize perspective distortion
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
          
          <TabsContent value="auto" className="space-y-4 mt-4">
            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Auto Detection & Measurement
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">Auto-Detect</Badge>
                  <div>
                    <div className="font-medium">Automatic edge detection</div>
                    <div className="text-muted-foreground">AI identifies subject boundaries and length automatically</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">Auto-Capture</Badge>
                  <div>
                    <div className="font-medium">Stability-based capture</div>
                    <div className="text-muted-foreground">Captures when measurement is stable and high-quality</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">Confidence</Badge>
                  <div>
                    <div className="font-medium">Quality scoring (0-100%)</div>
                    <div className="text-muted-foreground">Green = good detection, Red = poor quality</div>
                  </div>
                </div>
              </div>
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Auto-capture triggers when confidence ≥ 85% for 1.5 seconds consecutively
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
          
          <TabsContent value="measure" className="space-y-4 mt-4">
            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <Target className="w-4 h-4" />
                Manual Measurement
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">1</Badge>
                  <div>
                    <div className="font-medium">Calibrate first</div>
                    <div className="text-muted-foreground">Use credit card (3.375") or ruler for scale reference</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">2</Badge>
                  <div>
                    <div className="font-medium">Mark base point</div>
                    <div className="text-muted-foreground">Click at the base/root of the subject</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">3</Badge>
                  <div>
                    <div className="font-medium">Mark tip point</div>
                    <div className="text-muted-foreground">Click at the tip/end of the subject</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">4</Badge>
                  <div>
                    <div className="font-medium">Adjust girth width</div>
                    <div className="text-muted-foreground">Drag girth line to match mid-shaft width</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="tips" className="space-y-4 mt-4">
            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Pro Tips
              </h3>
              <div className="space-y-2 text-sm">
                <div>• <strong>Keyboard shortcuts:</strong> D = Auto-detect, C = Capture, F = Freeze, S = Snap toggle</div>
                <div>• <strong>Snap-to-edge:</strong> Points automatically align to detected edges when enabled</div>
                <div>• <strong>Grid overlay:</strong> Use grid for alignment and perspective checking</div>
                <div>• <strong>Voice coach:</strong> Enable for audio feedback and guidance</div>
                <div>• <strong>Previous overlay:</strong> Compare with past measurements for consistency</div>
                <div>• <strong>Quality indicators:</strong> Watch brightness, blur, size, and edge proximity scores</div>
                <div>• <strong>Stability ring:</strong> Visual indicator shows measurement stability level</div>
                <div>• <strong>Freeze frame:</strong> Pause video feed for precise manual adjustments</div>
              </div>
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  For best results: good lighting, steady camera, perpendicular angle, and proper calibration
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}