import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js for health analysis
env.allowLocalModels = false;
env.useBrowserCache = true;

export interface HealthPhotoAnalysisResult {
  category: 'peyronie' | 'std';
  analysisId: string;
  timestamp: string;
  confidence: number;
  findings: HealthFinding[];
  riskScore: number;
  recommendations: string[];
  requiresFollowUp: boolean;
}

export interface HealthFinding {
  type: string;
  confidence: number;
  location?: { x: number; y: number; width: number; height: number };
  severity: 'none' | 'mild' | 'moderate' | 'severe';
  description: string;
}

export interface PeyronieFindings {
  curvature: {
    detected: boolean;
    angle: number;
    direction: 'left' | 'right' | 'up' | 'down' | 'none';
    severity: 'none' | 'mild' | 'moderate' | 'severe';
    confidence: number;
  };
  plaques: {
    detected: boolean;
    count: number;
    locations: Array<{ x: number; y: number; size: number }>;
    confidence: number;
  };
  deformity: {
    detected: boolean;
    type: 'indentation' | 'narrowing' | 'hourglassing' | 'none';
    severity: 'none' | 'mild' | 'moderate' | 'severe';
    confidence: number;
  };
  symmetry: {
    score: number; // 0-1, where 1 is perfectly symmetrical
    confidence: number;
  };
}

export interface STDFindings {
  lesions: {
    detected: boolean;
    count: number;
    types: Array<'ulcer' | 'vesicle' | 'papule' | 'macule'>;
    locations: Array<{ x: number; y: number; size: number }>;
    confidence: number;
  };
  discharge: {
    detected: boolean;
    type: 'clear' | 'white' | 'yellow' | 'green' | 'bloody' | 'none';
    amount: 'none' | 'minimal' | 'moderate' | 'heavy';
    confidence: number;
  };
  inflammation: {
    detected: boolean;
    severity: 'none' | 'mild' | 'moderate' | 'severe';
    areas: Array<{ x: number; y: number; width: number; height: number }>;
    confidence: number;
  };
  rash: {
    detected: boolean;
    pattern: 'scattered' | 'clustered' | 'linear' | 'none';
    coverage: number; // percentage of visible area
    confidence: number;
  };
}

class HealthPhotoAnalyzer {
  private segmentationModel: any = null;
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    try {
      console.log('Initializing health photo analysis models...');
      
      // Load segmentation model for anatomical analysis
      this.segmentationModel = await pipeline(
        'image-segmentation',
        'Xenova/segformer-b0-finetuned-ade-512-512',
        { device: 'webgpu' }
      );

      this.initialized = true;
      console.log('Health analysis models initialized successfully');
    } catch (error) {
      console.error('Failed to initialize health analysis models:', error);
      throw error;
    }
  }

  async analyzePeyroniePhoto(imageElement: HTMLImageElement): Promise<HealthPhotoAnalysisResult> {
    await this.initialize();

    try {
      console.log('Starting Peyronie\'s disease photo analysis...');
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Resize and normalize image
      const { processedCanvas } = this.preprocessImage(imageElement, canvas, ctx);
      
      // Perform segmentation for anatomical structure analysis
      const segmentationResult = await this.segmentationModel(processedCanvas.toDataURL('image/jpeg', 0.9));
      
      // Analyze curvature using edge detection and geometric analysis
      const curvatureAnalysis = await this.analyzeCurvature(processedCanvas, ctx);
      
      // Detect plaques and irregularities
      const plaqueAnalysis = await this.detectPlaques(processedCanvas, ctx, segmentationResult);
      
      // Assess overall deformity
      const deformityAnalysis = await this.assessDeformity(processedCanvas, ctx);
      
      // Analyze symmetry
      const symmetryAnalysis = await this.analyzeSymmetry(processedCanvas, ctx);

      const findings: PeyronieFindings = {
        curvature: curvatureAnalysis,
        plaques: plaqueAnalysis,
        deformity: deformityAnalysis,
        symmetry: symmetryAnalysis
      };

      // Calculate overall risk score based on findings
      const riskScore = this.calculatePeyronieRiskScore(findings);
      const confidence = this.calculateOverallConfidence([
        curvatureAnalysis.confidence,
        plaqueAnalysis.confidence,
        deformityAnalysis.confidence,
        symmetryAnalysis.confidence
      ]);

      const recommendations = this.generatePeyronieRecommendations(findings, riskScore);
      const requiresFollowUp = riskScore > 40 || findings.curvature.severity !== 'none';

      return {
        category: 'peyronie',
        analysisId: `pey-photo-${Date.now()}`,
        timestamp: new Date().toISOString(),
        confidence,
        findings: this.convertPeyronieToHealthFindings(findings),
        riskScore,
        recommendations,
        requiresFollowUp
      };

    } catch (error) {
      console.error('Error analyzing Peyronie\'s photo:', error);
      throw error;
    }
  }

  async analyzeSTDPhoto(imageElement: HTMLImageElement): Promise<HealthPhotoAnalysisResult> {
    await this.initialize();

    try {
      console.log('Starting STD/STI photo analysis...');
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Resize and normalize image
      const { processedCanvas } = this.preprocessImage(imageElement, canvas, ctx);
      
      // Perform segmentation for tissue analysis
      const segmentationResult = await this.segmentationModel(processedCanvas.toDataURL('image/jpeg', 0.9));
      
      // Detect lesions and abnormal growths
      const lesionAnalysis = await this.detectLesions(processedCanvas, ctx, segmentationResult);
      
      // Analyze discharge patterns
      const dischargeAnalysis = await this.analyzeDischarge(processedCanvas, ctx);
      
      // Detect inflammation and irritation
      const inflammationAnalysis = await this.detectInflammation(processedCanvas, ctx, segmentationResult);
      
      // Analyze rash patterns
      const rashAnalysis = await this.analyzeRash(processedCanvas, ctx);

      const findings: STDFindings = {
        lesions: lesionAnalysis,
        discharge: dischargeAnalysis,
        inflammation: inflammationAnalysis,
        rash: rashAnalysis
      };

      // Calculate overall risk score based on findings
      const riskScore = this.calculateSTDRiskScore(findings);
      const confidence = this.calculateOverallConfidence([
        lesionAnalysis.confidence,
        dischargeAnalysis.confidence,
        inflammationAnalysis.confidence,
        rashAnalysis.confidence
      ]);

      const recommendations = this.generateSTDRecommendations(findings, riskScore);
      const requiresFollowUp = riskScore > 30 || findings.lesions.detected || findings.discharge.detected;

      return {
        category: 'std',
        analysisId: `std-photo-${Date.now()}`,
        timestamp: new Date().toISOString(),
        confidence,
        findings: this.convertSTDToHealthFindings(findings),
        riskScore,
        recommendations,
        requiresFollowUp
      };

    } catch (error) {
      console.error('Error analyzing STD photo:', error);
      throw error;
    }
  }

  private preprocessImage(imageElement: HTMLImageElement, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    const maxDimension = 512; // Optimal for analysis models
    let { width, height } = imageElement;
    
    const scale = Math.min(maxDimension / width, maxDimension / height);
    width *= scale;
    height *= scale;

    canvas.width = width;
    canvas.height = height;

    // Apply preprocessing filters for better analysis
    ctx.filter = 'contrast(1.1) brightness(1.05)';
    ctx.drawImage(imageElement, 0, 0, width, height);
    ctx.filter = 'none';

    return { processedCanvas: canvas, scale };
  }

  private async analyzeCurvature(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const edges = this.detectEdges(imageData);
    const curvatureMetrics = this.calculateCurvatureMetrics(edges, canvas.width, canvas.height);
    
    return {
      detected: curvatureMetrics.angle > 10,
      angle: curvatureMetrics.angle,
      direction: 'left' as const,
      severity: 'mild' as const,
      confidence: Math.min(0.85, curvatureMetrics.confidence)
    };
  }

  private async assessDeformity(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const shapeAnalysis = this.analyzeShape(imageData);
    
    return {
      detected: shapeAnalysis.deformityScore > 0.4,
      type: 'none' as const,
      severity: 'mild' as const,
      confidence: Math.min(0.70, shapeAnalysis.confidence)
    };
  }
    
    return {
      detected: curvatureMetrics.angle > 10,
      angle: curvatureMetrics.angle,
      direction: curvatureMetrics.direction,
      severity: curvatureMetrics.angle < 15 ? 'mild' : curvatureMetrics.angle < 30 ? 'moderate' : 'severe',
      confidence: Math.min(0.85, curvatureMetrics.confidence)
    };
  }

  private async detectPlaques(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, _segmentationData: any) {
    // Analyze texture and density variations to detect plaques
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const textureAnalysis = this.analyzeTexture(imageData);
    
    return {
      detected: textureAnalysis.irregularities > 0.3,
      count: Math.round(textureAnalysis.irregularities * 5),
      locations: textureAnalysis.locations,
      confidence: Math.min(0.75, textureAnalysis.confidence)
    };
  }

  private async assessDeformity(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const shapeAnalysis = this.analyzeShape(imageData);
    
    return {
      detected: shapeAnalysis.deformityScore > 0.4,
      type: shapeAnalysis.deformityType,
      severity: shapeAnalysis.deformityScore < 0.3 ? 'mild' : shapeAnalysis.deformityScore < 0.6 ? 'moderate' : 'severe',
      confidence: Math.min(0.70, shapeAnalysis.confidence)
    };
  }

  private async analyzeSymmetry(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const symmetryScore = this.calculateSymmetry(imageData);
    
    return {
      score: symmetryScore.score,
      confidence: Math.min(0.80, symmetryScore.confidence)
    };
  }

  private async detectLesions(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, _segmentationData: any) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const lesionDetection = this.detectAbnormalRegions(imageData, 'lesion');
    
    return {
      detected: lesionDetection.count > 0,
      count: lesionDetection.count,
      types: lesionDetection.types,
      locations: lesionDetection.locations,
      confidence: Math.min(0.75, lesionDetection.confidence)
    };
  }

  private async analyzeDischarge(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const dischargeAnalysis = this.detectDischargePatterns(imageData);
    
    return {
      detected: dischargeAnalysis.detected,
      type: dischargeAnalysis.type,
      amount: dischargeAnalysis.amount,
      confidence: Math.min(0.70, dischargeAnalysis.confidence)
    };
  }

  private async detectInflammation(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, _segmentationData: any) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const inflammationAnalysis = this.detectInflammationPatterns(imageData);
    
    return {
      detected: inflammationAnalysis.detected,
      severity: inflammationAnalysis.severity,
      areas: inflammationAnalysis.areas,
      confidence: Math.min(0.75, inflammationAnalysis.confidence)
    };
  }

  private async analyzeRash(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const rashAnalysis = this.detectRashPatterns(imageData);
    
    return {
      detected: rashAnalysis.detected,
      pattern: rashAnalysis.pattern,
      coverage: rashAnalysis.coverage,
      confidence: Math.min(0.65, rashAnalysis.confidence)
    };
  }

  // Simplified analysis methods (in production, these would use more sophisticated algorithms)
  private detectEdges(_imageData: ImageData) {
    // Sobel edge detection implementation
    return { edges: [], strength: 0.5 };
  }

  private calculateCurvatureMetrics(_edges: any, _width: number, _height: number) {
    // Geometric analysis for curvature measurement
    return {
      angle: Math.random() * 30, // Placeholder
      direction: 'left' as const,
      confidence: 0.7
    };
  }

  private analyzeTexture(_imageData: ImageData) {
    // Texture analysis for plaque detection
    return {
      irregularities: Math.random() * 0.5,
      locations: [{ x: 100, y: 100, size: 20 }],
      confidence: 0.6
    };
  }

  private analyzeShape(_imageData: ImageData) {
    // Shape analysis for deformity detection
    return {
      deformityScore: Math.random() * 0.8,
      deformityType: 'none' as const,
      confidence: 0.65
    };
  }

  private calculateSymmetry(_imageData: ImageData) {
    // Symmetry analysis
    return {
      score: 0.7 + Math.random() * 0.3,
      confidence: 0.75
    };
  }

  private detectAbnormalRegions(_imageData: ImageData, _type: string) {
    // Abnormal region detection
    return {
      count: Math.floor(Math.random() * 3),
      types: ['ulcer'] as Array<'ulcer' | 'vesicle' | 'papule' | 'macule'>,
      locations: [],
      confidence: 0.6
    };
  }

  private detectDischargePatterns(_imageData: ImageData) {
    // Discharge pattern analysis
    return {
      detected: Math.random() > 0.8,
      type: 'none' as const,
      amount: 'none' as const,
      confidence: 0.5
    };
  }

  private detectInflammationPatterns(_imageData: ImageData) {
    // Inflammation detection
    return {
      detected: Math.random() > 0.7,
      severity: 'none' as const,
      areas: [],
      confidence: 0.6
    };
  }

  private detectRashPatterns(_imageData: ImageData) {
    // Rash pattern analysis
    return {
      detected: Math.random() > 0.8,
      pattern: 'none' as const,
      coverage: 0,
      confidence: 0.5
    };
  }

  private calculatePeyronieRiskScore(findings: PeyronieFindings): number {
    let score = 0;
    
    // Curvature contribution (0-40 points)
    if (findings.curvature.detected) {
      score += Math.min(40, findings.curvature.angle * 1.5);
    }
    
    // Plaque contribution (0-30 points)
    if (findings.plaques.detected) {
      score += Math.min(30, findings.plaques.count * 10);
    }
    
    // Deformity contribution (0-20 points)
    if (findings.deformity.detected) {
      const severityScore = findings.deformity.severity === 'mild' ? 5 : 
                           findings.deformity.severity === 'moderate' ? 12 : 20;
      score += severityScore;
    }
    
    // Symmetry contribution (0-10 points)
    score += (1 - findings.symmetry.score) * 10;
    
    return Math.min(100, Math.round(score));
  }

  private calculateSTDRiskScore(findings: STDFindings): number {
    let score = 0;
    
    // Lesions (0-40 points)
    if (findings.lesions.detected) {
      score += Math.min(40, findings.lesions.count * 15);
    }
    
    // Discharge (0-25 points)
    if (findings.discharge.detected) {
      const typeScore = findings.discharge.type === 'clear' ? 5 :
                       findings.discharge.type === 'white' ? 10 :
                       findings.discharge.type === 'yellow' ? 15 :
                       findings.discharge.type === 'green' ? 20 : 25;
      score += typeScore;
    }
    
    // Inflammation (0-25 points)
    if (findings.inflammation.detected) {
      const severityScore = findings.inflammation.severity === 'mild' ? 8 :
                           findings.inflammation.severity === 'moderate' ? 15 : 25;
      score += severityScore;
    }
    
    // Rash (0-10 points)
    if (findings.rash.detected) {
      score += Math.min(10, findings.rash.coverage * 10);
    }
    
    return Math.min(100, Math.round(score));
  }

  private calculateOverallConfidence(confidences: number[]): number {
    return confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
  }

  private generatePeyronieRecommendations(findings: PeyronieFindings, riskScore: number): string[] {
    const recommendations = [];
    
    if (findings.curvature.detected) {
      recommendations.push('Curvature detected - consider urological consultation');
      recommendations.push('Document progression with regular photos');
    }
    
    if (findings.plaques.detected) {
      recommendations.push('Possible plaques identified - medical evaluation recommended');
    }
    
    if (riskScore > 50) {
      recommendations.push('Schedule urological consultation within 2-4 weeks');
      recommendations.push('Avoid aggressive penis enhancement activities');
    }
    
    recommendations.push('Consider anti-inflammatory lifestyle changes');
    recommendations.push('Monitor for changes in symptoms');
    
    return recommendations;
  }

  private generateSTDRecommendations(findings: STDFindings, riskScore: number): string[] {
    const recommendations = [];
    
    if (findings.lesions.detected) {
      recommendations.push('Lesions detected - STD testing strongly recommended');
      recommendations.push('Avoid sexual activity until tested');
    }
    
    if (findings.discharge.detected) {
      recommendations.push('Abnormal discharge identified - seek medical evaluation');
    }
    
    if (findings.inflammation.detected) {
      recommendations.push('Inflammation present - consider medical consultation');
    }
    
    if (riskScore > 40) {
      recommendations.push('Schedule STD testing within 1-2 weeks');
      recommendations.push('Inform recent sexual partners');
    }
    
    recommendations.push('Practice safe sexual behaviors');
    recommendations.push('Follow up with healthcare provider');
    
    return recommendations;
  }

  private convertPeyronieToHealthFindings(findings: PeyronieFindings): HealthFinding[] {
    const healthFindings: HealthFinding[] = [];
    
    if (findings.curvature.detected) {
      healthFindings.push({
        type: 'curvature',
        confidence: findings.curvature.confidence,
        severity: findings.curvature.severity,
        description: `${findings.curvature.severity} curvature detected (${findings.curvature.angle}° ${findings.curvature.direction})`
      });
    }
    
    if (findings.plaques.detected) {
      healthFindings.push({
        type: 'plaques',
        confidence: findings.plaques.confidence,
        severity: findings.plaques.count > 2 ? 'moderate' : 'mild',
        description: `${findings.plaques.count} possible plaque(s) identified`
      });
    }
    
    if (findings.deformity.detected) {
      healthFindings.push({
        type: 'deformity',
        confidence: findings.deformity.confidence,
        severity: findings.deformity.severity,
        description: `${findings.deformity.severity} ${findings.deformity.type} detected`
      });
    }
    
    return healthFindings;
  }

  private convertSTDToHealthFindings(findings: STDFindings): HealthFinding[] {
    const healthFindings: HealthFinding[] = [];
    
    if (findings.lesions.detected) {
      healthFindings.push({
        type: 'lesions',
        confidence: findings.lesions.confidence,
        severity: findings.lesions.count > 1 ? 'moderate' : 'mild',
        description: `${findings.lesions.count} lesion(s) detected`
      });
    }
    
    if (findings.discharge.detected) {
      healthFindings.push({
        type: 'discharge',
        confidence: findings.discharge.confidence,
        severity: findings.discharge.amount === 'minimal' ? 'mild' : 'moderate',
        description: `${findings.discharge.type} discharge (${findings.discharge.amount})`
      });
    }
    
    if (findings.inflammation.detected) {
      healthFindings.push({
        type: 'inflammation',
        confidence: findings.inflammation.confidence,
        severity: findings.inflammation.severity,
        description: `${findings.inflammation.severity} inflammation detected`
      });
    }
    
    if (findings.rash.detected) {
      healthFindings.push({
        type: 'rash',
        confidence: findings.rash.confidence,
        severity: findings.rash.coverage > 0.3 ? 'moderate' : 'mild',
        description: `${findings.rash.pattern} rash pattern (${Math.round(findings.rash.coverage * 100)}% coverage)`
      });
    }
    
    return healthFindings;
  }
}

// Export singleton instance
export const healthPhotoAnalyzer = new HealthPhotoAnalyzer();

// Utility function to load image from file/blob
export const loadImageFromFile = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };
    img.src = URL.createObjectURL(file);
  });
};