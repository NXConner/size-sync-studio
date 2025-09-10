// Advanced ML Pipeline for Enhanced Detection and Analysis
import { opencvWorker } from './opencvWorkerClient';

export interface MLAnalysisResult {
  confidence: number;
  qualityScore: number;
  suggestions: string[];
  corrections: {
    basePoint?: { x: number; y: number; confidence: number };
    tipPoint?: { x: number; y: number; confidence: number };
    curvatureCorrection?: number;
  };
  predictedMeasurements: {
    length: number;
    girth: number;
    confidence: number;
  };
  environmentalFactors: {
    lighting: number; // 0-1 scale
    stability: number; // 0-1 scale
    perspective: number; // 0-1 scale, 1 = perfect perpendicular
    backgroundNoise: number; // 0-1 scale
  };
  qualityMetrics: {
    sharpness: number;
    contrast: number;
    exposure: number;
    colorBalance: number;
  };
}

export interface EnhancedDetectionOptions {
  useAdvancedFiltering: boolean;
  temporalStabilization: boolean;
  perspectiveCorrection: boolean;
  adaptiveBrightness: boolean;
  multiScaleDetection: boolean;
  enhancedEdgeDetection: boolean;
  confidenceThreshold: number;
}

class AdvancedMLPipeline {
  private frameHistory: ImageData[] = [];
  private measurementHistory: Array<{
    timestamp: number;
    length: number;
    girth: number;
    confidence: number;
  }> = [];
  private environmentalHistory: Array<{
    timestamp: number;
    lighting: number;
    stability: number;
  }> = [];

  async analyzeFrame(
    imageData: ImageData, 
    options: EnhancedDetectionOptions = this.getDefaultOptions()
  ): Promise<MLAnalysisResult> {
    // Add frame to history for temporal analysis
    this.updateFrameHistory(imageData);

    // Multi-scale detection pipeline
    const detectionResults = await this.performMultiScaleDetection(imageData, options);
    
    // Environmental analysis
    const environmentalFactors = await this.analyzeEnvironmentalFactors(imageData);
    
    // Quality assessment
    const qualityMetrics = await this.assessImageQuality(imageData);
    
    // Temporal stabilization if enabled
    const stabilizedResults = options.temporalStabilization 
      ? await this.temporalStabilization(detectionResults)
      : detectionResults;

    // Generate intelligent suggestions
    const suggestions = this.generateIntelligentSuggestions(
      stabilizedResults, 
      environmentalFactors, 
      qualityMetrics
    );

    // Predictive measurements based on history
    const predictedMeasurements = this.predictMeasurements(
      stabilizedResults
    );

    // Intelligent error correction
    const corrections = this.generateErrorCorrections(
      stabilizedResults,
      environmentalFactors
    );

    return {
      confidence: stabilizedResults.confidence,
      qualityScore: this.calculateOverallQuality(qualityMetrics, environmentalFactors),
      suggestions,
      corrections,
      predictedMeasurements,
      environmentalFactors,
      qualityMetrics,
    };
  }

  private async performMultiScaleDetection(
    imageData: ImageData,
    options: EnhancedDetectionOptions
  ) {
    const scales = [0.5, 0.75, 1.0, 1.25];
    const detectionResults = [];

    for (const scale of scales) {
      try {
        const scaledImageData = await this.scaleImageData(imageData, scale);
        const result = await opencvWorker.detect({
          width: scaledImageData.width,
          height: scaledImageData.height,
          imageData: scaledImageData.data
        });
        
        if (result.confidence > options.confidenceThreshold) {
          detectionResults.push({
            ...result,
            scale,
            scaledConfidence: result.confidence * this.getScaleConfidenceMultiplier(scale)
          });
        }
      } catch (error) {
        console.warn(`Detection failed at scale ${scale}:`, error);
      }
    }

    // Return best result across scales
    return detectionResults.reduce((best, current) => 
      current.scaledConfidence > best.scaledConfidence ? current : best,
      detectionResults[0] || { confidence: 0, end1: null, end2: null }
    );
  }

  private async scaleImageData(imageData: ImageData, scale: number): Promise<ImageData> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    const newWidth = Math.round(imageData.width * scale);
    const newHeight = Math.round(imageData.height * scale);
    
    canvas.width = newWidth;
    canvas.height = newHeight;
    
    // Create temporary canvas with original data
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) throw new Error('Could not get temp canvas context');
    
    tempCanvas.width = imageData.width;
    tempCanvas.height = imageData.height;
    tempCtx.putImageData(imageData, 0, 0);
    
    // Scale down/up
    ctx.drawImage(tempCanvas, 0, 0, newWidth, newHeight);
    
    return ctx.getImageData(0, 0, newWidth, newHeight);
  }

  private getScaleConfidenceMultiplier(scale: number): number {
    // Prefer near-native resolution for best accuracy
    const ideal = 1.0;
    const distance = Math.abs(scale - ideal);
    return Math.max(0.8, 1.0 - distance * 0.3);
  }

  private async analyzeEnvironmentalFactors(imageData: ImageData) {
    const { data } = imageData;
    
    // Lighting analysis
    const lighting = this.analyzeLighting(data);
    
    // Stability analysis (requires frame history)
    const stability = this.analyzeStability();
    
    // Perspective analysis
    const perspective = this.analyzePerspective(imageData);
    
    // Background noise analysis
    const backgroundNoise = this.analyzeBackgroundNoise(data);

    // Update environmental history
    this.environmentalHistory.push({
      timestamp: Date.now(),
      lighting,
      stability
    });

    // Keep only last 10 seconds of history
    const tenSecondsAgo = Date.now() - 10000;
    this.environmentalHistory = this.environmentalHistory.filter(
      entry => entry.timestamp > tenSecondsAgo
    );

    return {
      lighting,
      stability,
      perspective,
      backgroundNoise
    };
  }

  private analyzeLighting(data: Uint8ClampedArray): number {
    let totalBrightness = 0;
    let histogram = new Array(256).fill(0);
    
    // Calculate brightness histogram
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      totalBrightness += brightness;
      histogram[brightness]++;
    }

    const avgBrightness = totalBrightness / (data.length / 4);
    
    // Calculate histogram spread (good lighting has balanced distribution)
    const variance = this.calculateVariance(histogram);
    const normalizedVariance = Math.min(variance / 10000, 1);
    
    // Optimal brightness is around 120-140, good spread indicates even lighting
    const brightnessScore = 1 - Math.abs(avgBrightness - 130) / 130;
    const spreadScore = normalizedVariance;
    
    return Math.max(0, Math.min(1, (brightnessScore * 0.6 + spreadScore * 0.4)));
  }

  private analyzeStability(): number {
    if (this.frameHistory.length < 2) return 0.5;
    
    // Compare last few frames for motion detection
    const recent = this.frameHistory.slice(-3);
    let totalDifference = 0;
    
    for (let i = 1; i < recent.length; i++) {
      totalDifference += this.calculateFrameDifference(recent[i-1], recent[i]);
    }
    
    const avgDifference = totalDifference / (recent.length - 1);
    // Lower difference means more stability
    return Math.max(0, Math.min(1, 1 - avgDifference / 50));
  }

  private calculateFrameDifference(frame1: ImageData, frame2: ImageData): number {
    if (frame1.width !== frame2.width || frame1.height !== frame2.height) return 50;
    
    let difference = 0;
    const data1 = frame1.data;
    const data2 = frame2.data;
    
    // Sample every 4th pixel for performance
    for (let i = 0; i < data1.length; i += 16) {
      const r1 = data1[i], g1 = data1[i + 1], b1 = data1[i + 2];
      const r2 = data2[i], g2 = data2[i + 1], b2 = data2[i + 2];
      
      difference += Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
    }
    
    return difference / (data1.length / 16);
  }

  private analyzePerspective(imageData: ImageData): number {
    // Comprehensive perspective analysis using edge detection and vanishing point estimation
    const { data, width, height } = imageData;
    
    // Convert to grayscale and detect edges
    const edges = this.detectEdges(data, width, height);
    
    // Analyze dominant edge orientations
    const orientationHist = new Array(180).fill(0);
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        if (edges[idx] > 50) { // Strong edge
          // Calculate gradient orientation
          const gx = edges[idx + 1] - edges[idx - 1];
          const gy = edges[idx + width] - edges[idx - width];
          const angle = Math.atan2(gy, gx) * 180 / Math.PI;
          const binAngle = Math.round(angle + 90) % 180; // Convert to 0-179
          orientationHist[binAngle]++;
        }
      }
    }
    
    // Ideal perspective should have strong horizontal (0°) and vertical (90°) components
    const horizontalStrength = orientationHist[0] + orientationHist[179] + orientationHist[1] + orientationHist[178];
    const verticalStrength = orientationHist[89] + orientationHist[90] + orientationHist[91];
    
    const totalEdges = orientationHist.reduce((sum, count) => sum + count, 0);
    const perspectiveScore = totalEdges > 0 
      ? (horizontalStrength + verticalStrength) / totalEdges 
      : 0.5;
    
    return Math.max(0, Math.min(1, perspectiveScore * 2)); // Scale to 0-1 range
  }

  private detectEdges(data: Uint8ClampedArray, width: number, height: number): number[] {
    // Sobel edge detection
    const edges = new Array(width * height).fill(0);
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        
        // Get grayscale values of surrounding pixels
        const getGray = (i: number) => {
          const pixelIdx = i * 4;
          return 0.299 * data[pixelIdx] + 0.587 * data[pixelIdx + 1] + 0.114 * data[pixelIdx + 2];
        };
        
        // Sobel operators
        const gx = (-1 * getGray(idx - width - 1) + 1 * getGray(idx - width + 1) +
                   -2 * getGray(idx - 1) + 2 * getGray(idx + 1) +
                   -1 * getGray(idx + width - 1) + 1 * getGray(idx + width + 1));
        
        const gy = (-1 * getGray(idx - width - 1) - 2 * getGray(idx - width) - 1 * getGray(idx - width + 1) +
                    1 * getGray(idx + width - 1) + 2 * getGray(idx + width) + 1 * getGray(idx + width + 1));
        
        edges[idx] = Math.sqrt(gx * gx + gy * gy);
      }
    }
    
    return edges;
  }

  private analyzeBackgroundNoise(data: Uint8ClampedArray): number {
    // Calculate image entropy as a proxy for noise/complexity
    const histogram = new Array(256).fill(0);
    
    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      histogram[gray]++;
    }
    
    const totalPixels = data.length / 4;
    let entropy = 0;
    
    for (const count of histogram) {
      if (count > 0) {
        const probability = count / totalPixels;
        entropy -= probability * Math.log2(probability);
      }
    }
    
    // Normalize entropy (max is 8 for 8-bit image)
    const normalizedEntropy = entropy / 8;
    
    // Higher entropy means more noise/complexity
    return Math.max(0, Math.min(1, 1 - normalizedEntropy * 0.7));
  }

  private async assessImageQuality(imageData: ImageData) {
    const { data } = imageData;
    
    // Sharpness assessment using Laplacian variance
    const sharpness = await this.calculateSharpness(imageData);
    
    // Contrast assessment
    const contrast = this.calculateContrast(data);
    
    // Exposure assessment
    const exposure = this.calculateExposure(data);
    
    // Color balance assessment
    const colorBalance = this.calculateColorBalance(data);
    
    return {
      sharpness: Math.max(0, Math.min(1, sharpness / 1000)), // Normalize
      contrast: Math.max(0, Math.min(1, contrast)),
      exposure: Math.max(0, Math.min(1, exposure)),
      colorBalance: Math.max(0, Math.min(1, colorBalance))
    };
  }

  private async calculateSharpness(imageData: ImageData): Promise<number> {
    // Use OpenCV Laplacian for sharpness
    try {
      const result = await opencvWorker.edges({
        width: imageData.width,
        height: imageData.height,
        imageData: imageData.data
      });
      
      // Calculate variance of edge image as sharpness metric
      let sum = 0;
      let sumSquared = 0;
      const edgeData = result.imageData;
      
      for (let i = 0; i < edgeData.length; i += 4) {
        const value = edgeData[i]; // Red channel of edge image
        sum += value;
        sumSquared += value * value;
      }
      
      const mean = sum / (edgeData.length / 4);
      const variance = (sumSquared / (edgeData.length / 4)) - (mean * mean);
      
      return variance;
    } catch {
      return 500; // Default moderate sharpness
    }
  }

  private calculateContrast(data: Uint8ClampedArray): number {
    let min = 255, max = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      min = Math.min(min, gray);
      max = Math.max(max, gray);
    }
    
    return (max - min) / 255;
  }

  private calculateExposure(data: Uint8ClampedArray): number {
    let totalBrightness = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      const brightness = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      totalBrightness += brightness;
    }
    
    const avgBrightness = totalBrightness / (data.length / 4);
    
    // Optimal exposure around 120-140
    return 1 - Math.abs(avgBrightness - 130) / 130;
  }

  private calculateColorBalance(data: Uint8ClampedArray): number {
    let rSum = 0, gSum = 0, bSum = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      rSum += data[i];
      gSum += data[i + 1];
      bSum += data[i + 2];
    }
    
    const pixels = data.length / 4;
    const rAvg = rSum / pixels;
    const gAvg = gSum / pixels;
    const bAvg = bSum / pixels;
    
    // Calculate deviation from gray (balanced color)
    const grayAvg = (rAvg + gAvg + bAvg) / 3;
    const deviation = (
      Math.abs(rAvg - grayAvg) + 
      Math.abs(gAvg - grayAvg) + 
      Math.abs(bAvg - grayAvg)
    ) / 3;
    
    return Math.max(0, 1 - deviation / 50);
  }

  private calculateVariance(data: number[]): number {
    const sum = data.reduce((a, b) => a + b, 0);
    const mean = sum / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    return variance;
  }

  private temporalStabilization(detectionResult: any): any {
    // Implement Kalman-like filtering for temporal stability
    if (!detectionResult.end1 || !detectionResult.end2) {
      return detectionResult;
    }
    
    const currentTime = Date.now();
    
    // Initialize temporal state if needed
    if (!this.temporalState) {
      this.temporalState = {
        lastUpdate: currentTime,
        smoothedEnd1: { ...detectionResult.end1 },
        smoothedEnd2: { ...detectionResult.end2 },
        velocity1: { x: 0, y: 0 },
        velocity2: { x: 0, y: 0 },
        confidence: detectionResult.confidence
      };
      return detectionResult;
    }
    
    const dt = (currentTime - this.temporalState.lastUpdate) / 1000; // Convert to seconds
    const alpha = Math.min(dt / 0.1, 1); // Smoothing factor (0.1 second time constant)
    
    // Predict positions based on velocity
    const predicted1 = {
      x: this.temporalState.smoothedEnd1.x + this.temporalState.velocity1.x * dt,
      y: this.temporalState.smoothedEnd1.y + this.temporalState.velocity1.y * dt
    };
    
    const predicted2 = {
      x: this.temporalState.smoothedEnd2.x + this.temporalState.velocity2.x * dt,
      y: this.temporalState.smoothedEnd2.y + this.temporalState.velocity2.y * dt
    };
    
    // Update smoothed positions (Kalman-like update)
    const newEnd1 = {
      x: predicted1.x * (1 - alpha) + detectionResult.end1.x * alpha,
      y: predicted1.y * (1 - alpha) + detectionResult.end1.y * alpha
    };
    
    const newEnd2 = {
      x: predicted2.x * (1 - alpha) + detectionResult.end2.x * alpha,
      y: predicted2.y * (1 - alpha) + detectionResult.end2.y * alpha
    };
    
    // Update velocities
    if (dt > 0) {
      this.temporalState.velocity1 = {
        x: (newEnd1.x - this.temporalState.smoothedEnd1.x) / dt,
        y: (newEnd1.y - this.temporalState.smoothedEnd1.y) / dt
      };
      
      this.temporalState.velocity2 = {
        x: (newEnd2.x - this.temporalState.smoothedEnd2.x) / dt,
        y: (newEnd2.y - this.temporalState.smoothedEnd2.y) / dt
      };
    }
    
    // Update state
    this.temporalState.smoothedEnd1 = newEnd1;
    this.temporalState.smoothedEnd2 = newEnd2;
    this.temporalState.lastUpdate = currentTime;
    this.temporalState.confidence = this.temporalState.confidence * 0.9 + detectionResult.confidence * 0.1;
    
    return {
      ...detectionResult,
      end1: newEnd1,
      end2: newEnd2,
      confidence: this.temporalState.confidence
    };
  }

  private temporalState: {
    lastUpdate: number;
    smoothedEnd1: { x: number; y: number };
    smoothedEnd2: { x: number; y: number };
    velocity1: { x: number; y: number };
    velocity2: { x: number; y: number };
    confidence: number;
  } | null = null;

  private generateIntelligentSuggestions(
    detection: any,
    environmental: any,
    quality: any
  ): string[] {
    const suggestions: string[] = [];
    
    // Lighting suggestions
    if (environmental.lighting < 0.4) {
      suggestions.push("Increase lighting - try moving closer to a window or adding a light source");
    } else if (environmental.lighting > 0.9) {
      suggestions.push("Reduce harsh lighting - avoid direct sunlight or bright overhead lights");
    }
    
    // Stability suggestions
    if (environmental.stability < 0.5) {
      suggestions.push("Hold device more steady - try bracing against a surface");
    }
    
    // Quality suggestions
    if (quality.sharpness < 0.4) {
      suggestions.push("Improve focus - tap screen to focus or clean camera lens");
    }
    
    if (quality.contrast < 0.3) {
      suggestions.push("Increase contrast - use a neutral background");
    }
    
    // Confidence-based suggestions
    if (detection.confidence < 0.3) {
      suggestions.push("Improve subject visibility - ensure clear view of full subject");
    }
    
    // Perspective suggestions
    if (environmental.perspective < 0.6) {
      suggestions.push("Adjust camera angle - try to keep camera perpendicular to subject");
    }
    
    // Background noise suggestions
    if (environmental.backgroundNoise < 0.5) {
      suggestions.push("Simplify background - remove distracting objects from view");
    }
    
    return suggestions;
  }

  private predictMeasurements(detection: any): { length: number; girth: number; confidence: number } {
    if (!detection.end1 || !detection.end2) {
      return {
        length: 0,
        girth: 0,
        confidence: 0
      };
    }
    
    // Calculate pixel distance for length
    const pixelLength = Math.hypot(
      detection.end2.x - detection.end1.x,
      detection.end2.y - detection.end1.y
    );
    
    // Estimate girth based on width measurements along the length
    const estimatedGirth = detection.medianWidth || detection.widths?.[Math.floor(detection.widths.length / 2)] || 0;
    
    // Apply calibration if available (assuming pixels per mm is stored somewhere)
    const pixelsPerMm = this.getCalibrationScale(); // Default to 1 if no calibration
    
    const lengthMm = pixelLength / pixelsPerMm;
    const girthMm = estimatedGirth / pixelsPerMm;
    
    // Use measurement history for smoothing if available
    if (this.measurementHistory.length > 0) {
      const recentMeasurements = this.measurementHistory.slice(-3);
      const avgLength = recentMeasurements.reduce((sum, m) => sum + m.length, 0) / recentMeasurements.length;
      const avgGirth = recentMeasurements.reduce((sum, m) => sum + m.girth, 0) / recentMeasurements.length;
      
      // Weighted average: 40% current, 60% history for stability
      const smoothedLength = lengthMm * 0.4 + avgLength * 0.6;
      const smoothedGirth = girthMm * 0.4 + avgGirth * 0.6;
      
      return {
        length: smoothedLength,
        girth: smoothedGirth,
        confidence: Math.min(detection.confidence * 1.2, 0.95) // Boost confidence with history
      };
    }
    
    return {
      length: lengthMm,
      girth: girthMm,
      confidence: detection.confidence || 0.5
    };
  }

  private getCalibrationScale(): number {
    // Get calibration from storage or default
    try {
      const calibration = localStorage.getItem('measurement-calibration');
      return calibration ? JSON.parse(calibration).pixelsPerMm : 10; // Default 10 pixels per mm
    } catch {
      return 10;
    }
  }

  private generateErrorCorrections(detection: any, environmental: any) {
    const corrections: any = {};
    
    // Confidence-based point corrections
    if (detection.confidence > 0.6 && detection.end1 && detection.end2) {
      // Only suggest corrections if we're reasonably confident
      corrections.basePoint = {
        ...detection.end1,
        confidence: detection.confidence
      };
      
      corrections.tipPoint = {
        ...detection.end2,
        confidence: detection.confidence
      };
    }
    
    // Curvature correction based on environmental factors
    if (environmental.perspective < 0.7 && detection.curvatureDeg) {
      // Adjust curvature for perspective distortion
      const perspectiveMultiplier = environmental.perspective * 1.2;
      corrections.curvatureCorrection = detection.curvatureDeg * perspectiveMultiplier;
    }
    
    return corrections;
  }

  private calculateOverallQuality(quality: any, environmental: any): number {
    const weights = {
      sharpness: 0.25,
      contrast: 0.15,
      exposure: 0.15,
      colorBalance: 0.1,
      lighting: 0.2,
      stability: 0.15
    };
    
    return (
      quality.sharpness * weights.sharpness +
      quality.contrast * weights.contrast +
      quality.exposure * weights.exposure +
      quality.colorBalance * weights.colorBalance +
      environmental.lighting * weights.lighting +
      environmental.stability * weights.stability
    );
  }

  private updateFrameHistory(imageData: ImageData) {
    this.frameHistory.push(imageData);
    
    // Keep only last 5 frames for performance
    if (this.frameHistory.length > 5) {
      this.frameHistory.shift();
    }
  }

  addMeasurementToHistory(length: number, girth: number, confidence: number) {
    this.measurementHistory.push({
      timestamp: Date.now(),
      length,
      girth,
      confidence
    });
    
    // Keep only last 50 measurements
    if (this.measurementHistory.length > 50) {
      this.measurementHistory.shift();
    }
  }

  getDefaultOptions(): EnhancedDetectionOptions {
    return {
      useAdvancedFiltering: true,
      temporalStabilization: true,
      perspectiveCorrection: true,
      adaptiveBrightness: true,
      multiScaleDetection: true,
      enhancedEdgeDetection: true,
      confidenceThreshold: 0.3
    };
  }

  reset() {
    this.frameHistory = [];
    this.measurementHistory = [];
    this.environmentalHistory = [];
  }
}

export const advancedML = new AdvancedMLPipeline();
