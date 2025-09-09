import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js for WebGPU acceleration
env.allowLocalModels = false;
env.useBrowserCache = true;

interface DetectionResult {
  confidence: number;
  end1: { x: number; y: number } | null;
  end2: { x: number; y: number } | null;
  widths: number[];
  quality?: {
    brightness: number;
    blurVar: number;
    sizeFraction: number;
    edgeProximity: number;
    score: number;
  };
  curvatureDeg?: number;
  maskImage?: Uint8ClampedArray;
}

interface MLProcessingOptions {
  useWebGPU: boolean;
  confidenceThreshold: number;
  maxProcessingTime: number;
  onProgress?: (progress: number, stage: string) => void;
}

class WebGPUMLEngine {
  private objectDetector: any = null;
  private segmentationModel: any = null;
  private initialized = false;

  async initialize(options: MLProcessingOptions = { useWebGPU: true, confidenceThreshold: 0.5, maxProcessingTime: 5000 }) {
    if (this.initialized) return;

    try {
      options.onProgress?.(10, 'Initializing WebGPU ML Engine...');

      // Initialize object detection pipeline with WebGPU
      this.objectDetector = await pipeline(
        'object-detection', 
        'hustvl/yolos-tiny',
        { 
          device: options.useWebGPU ? 'webgpu' : 'cpu',
          progress_callback: (data: any) => {
            if (data.status === 'progress') {
              options.onProgress?.(10 + data.progress * 0.3, 'Loading object detection model...');
            }
          }
        }
      );

      options.onProgress?.(50, 'Loading segmentation model...');

      // Initialize segmentation model
      this.segmentationModel = await pipeline(
        'image-segmentation',
        'Xenova/segformer-b0-finetuned-ade-512-512',
        { 
          device: options.useWebGPU ? 'webgpu' : 'cpu',
          progress_callback: (data: any) => {
            if (data.status === 'progress') {
              options.onProgress?.(50 + data.progress * 0.4, 'Loading segmentation model...');
            }
          }
        }
      );

      this.initialized = true;
      options.onProgress?.(100, 'WebGPU ML Engine ready!');
      console.log('WebGPU ML Engine initialized successfully');
    } catch (error) {
      console.warn('WebGPU not available, falling back to CPU:', error);
      // Fallback to CPU if WebGPU fails
      await this.initializeCPU(options);
    }
  }

  private async initializeCPU(options: MLProcessingOptions) {
    this.objectDetector = await pipeline('object-detection', 'hustvl/yolos-tiny', { device: 'cpu' });
    this.segmentationModel = await pipeline('image-segmentation', 'Xenova/segformer-b0-finetuned-ade-512-512', { device: 'cpu' });
    this.initialized = true;
    options.onProgress?.(100, 'CPU ML Engine ready!');
  }

  async detectFromImageData(
    imageData: { width: number; height: number; imageData: Uint8ClampedArray },
    options: MLProcessingOptions = { useWebGPU: true, confidenceThreshold: 0.5, maxProcessingTime: 5000 }
  ): Promise<DetectionResult> {
    if (!this.initialized) {
      await this.initialize(options);
    }

    try {
      options.onProgress?.(10, 'Preprocessing image...');

      // Convert ImageData to canvas for processing
      const canvas = document.createElement('canvas');
      canvas.width = imageData.width;
      canvas.height = imageData.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Could not get canvas context');

      const imgData = new ImageData(new Uint8ClampedArray(imageData.imageData), imageData.width, imageData.height);
      ctx.putImageData(imgData, 0, 0);
      
      options.onProgress?.(30, 'Running object detection...');

      // Perform object detection
      const detectionResults = await this.objectDetector(canvas);
      
      options.onProgress?.(60, 'Analyzing results...');

      // Process detection results to find the most likely target object
      const validDetections = detectionResults.filter((det: any) => 
        det.score >= options.confidenceThreshold &&
        (det.label.toLowerCase().includes('person') || 
         det.label.toLowerCase().includes('body') ||
         det.box.width > 50 && det.box.height > 50)
      );

      if (validDetections.length === 0) {
        throw new Error('No suitable objects detected');
      }

      // Take the highest confidence detection
      const bestDetection = validDetections.reduce((best: any, current: any) => 
        current.score > best.score ? current : best
      );

      options.onProgress?.(80, 'Extracting measurements...');

      // Convert bounding box to measurement points
      const box = bestDetection.box;
      const end1 = { x: box.xmin, y: box.ymin + box.height * 0.1 };
      const end2 = { x: box.xmax, y: box.ymin + box.height * 0.9 };

      // Estimate quality metrics
      const quality = await this.calculateQualityMetrics(canvas);
      
      options.onProgress?.(95, 'Generating segmentation mask...');

      // Generate segmentation mask
      const segmentationResult = await this.segmentationModel(canvas);
      let maskImage: Uint8ClampedArray | undefined;
      
      if (segmentationResult && segmentationResult[0]?.mask) {
        maskImage = new Uint8ClampedArray(segmentationResult[0].mask.data);
      }

      options.onProgress?.(100, 'Processing complete!');

      return {
        confidence: bestDetection.score,
        end1,
        end2,
        widths: [box.width * 0.3, box.width * 0.4, box.width * 0.35], // Estimated widths
        quality,
        curvatureDeg: Math.random() * 5 - 2.5, // Placeholder curvature
        maskImage
      };

    } catch (error) {
      console.error('WebGPU ML detection failed:', error);
      throw error;
    }
  }

  private async calculateQualityMetrics(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Calculate brightness
    let totalBrightness = 0;
    for (let i = 0; i < data.length; i += 4) {
      const brightness = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      totalBrightness += brightness;
    }
    const avgBrightness = totalBrightness / (data.length / 4);

    // Estimate blur variance (simplified)
    let variance = 0;
    const samples = Math.min(1000, data.length / 4);
    for (let i = 0; i < samples; i++) {
      const idx = Math.floor(Math.random() * (data.length / 4)) * 4;
      const brightness = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      variance += Math.pow(brightness - avgBrightness, 2);
    }
    const blurVar = variance / samples;

    // Size fraction (object size relative to image)
    const sizeFraction = 0.3; // Placeholder

    // Edge proximity (how close object is to image edges)
    const edgeProximity = 0.1; // Placeholder

    const score = Math.min(1, (avgBrightness / 255 * 0.3) + (blurVar / 10000 * 0.3) + (sizeFraction * 0.4));

    return {
      brightness: avgBrightness,
      blurVar,
      sizeFraction,
      edgeProximity,
      score
    };
  }

  async generateEdges(imageData: { width: number; height: number; imageData: Uint8ClampedArray }) {
    // Fallback to simple edge detection if WebGPU edge detection isn't available
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Could not get canvas context');

    const imgData = new ImageData(new Uint8ClampedArray(imageData.imageData), imageData.width, imageData.height);
    ctx.putImageData(imgData, 0, 0);
    
    // Simple edge detection (Sobel-like)
    const outputData = new Uint8ClampedArray(imageData.imageData.length);
    const data = new Uint8ClampedArray(imageData.imageData);
    
    for (let y = 1; y < imageData.height - 1; y++) {
      for (let x = 1; x < imageData.width - 1; x++) {
        const idx = (y * imageData.width + x) * 4;
        
        // Get surrounding pixels
        const tl = data[((y-1) * imageData.width + (x-1)) * 4];
        const tm = data[((y-1) * imageData.width + x) * 4];
        const tr = data[((y-1) * imageData.width + (x+1)) * 4];
        const ml = data[(y * imageData.width + (x-1)) * 4];
        const mr = data[(y * imageData.width + (x+1)) * 4];
        const bl = data[((y+1) * imageData.width + (x-1)) * 4];
        const bm = data[((y+1) * imageData.width + x) * 4];
        const br = data[((y+1) * imageData.width + (x+1)) * 4];
        
        // Sobel operators
        const gx = -tl - 2*ml - bl + tr + 2*mr + br;
        const gy = -tl - 2*tm - tr + bl + 2*bm + br;
        const magnitude = Math.sqrt(gx*gx + gy*gy);
        
        const edge = Math.min(255, magnitude);
        outputData[idx] = edge;
        outputData[idx + 1] = edge;
        outputData[idx + 2] = edge;
        outputData[idx + 3] = 255;
      }
    }
    
    return {
      width: imageData.width,
      height: imageData.height,
      imageData: outputData
    };
  }

  isWebGPUAvailable(): boolean {
    return 'gpu' in navigator;
  }

  getDeviceInfo() {
    return {
      webgpu: this.isWebGPUAvailable(),
      initialized: this.initialized,
      models: {
        objectDetector: !!this.objectDetector,
        segmentation: !!this.segmentationModel
      }
    };
  }
}

// Export singleton instance
export const webGPUML = new WebGPUMLEngine();
export type { DetectionResult, MLProcessingOptions };