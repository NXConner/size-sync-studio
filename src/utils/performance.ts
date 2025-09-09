// Performance utilities for optimization

interface CompressionOptions {
  quality: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: 'jpeg' | 'webp' | 'png';
}

/**
 * Compress image blob with configurable quality and dimensions
 */
export async function compressImage(
  file: Blob,
  options: CompressionOptions = { quality: 0.8 }
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    img.onload = () => {
      try {
        let { width, height } = img;
        
        // Apply dimension constraints
        if (options.maxWidth && width > options.maxWidth) {
          height = (height * options.maxWidth) / width;
          width = options.maxWidth;
        }
        
        if (options.maxHeight && height > options.maxHeight) {
          width = (width * options.maxHeight) / height;
          height = options.maxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Use better image rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        const mimeType = options.format === 'png' ? 'image/png' : 
                        options.format === 'webp' ? 'image/webp' : 'image/jpeg';
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Image compression failed'));
            }
          },
          mimeType,
          options.quality
        );
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Debounce function calls to improve performance
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Throttle function calls to limit execution frequency
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Memory usage monitor
 */
export class MemoryMonitor {
  private static instance: MemoryMonitor;
  private cleanupFunctions: (() => void)[] = [];
  
  static getInstance(): MemoryMonitor {
    if (!MemoryMonitor.instance) {
      MemoryMonitor.instance = new MemoryMonitor();
    }
    return MemoryMonitor.instance;
  }
  
  addCleanup(cleanup: () => void): void {
    this.cleanupFunctions.push(cleanup);
  }
  
  cleanup(): void {
    this.cleanupFunctions.forEach(fn => {
      try {
        fn();
      } catch (error) {
        console.warn('Cleanup function failed:', error);
      }
    });
    this.cleanupFunctions = [];
  }
  
  getMemoryInfo(): any {
    if ('memory' in performance) {
      return (performance as any).memory;
    }
    return null;
  }
  
  logMemoryUsage(label: string = 'Memory'): void {
    const memory = this.getMemoryInfo();
    if (memory) {
      console.log(`${label}:`, {
        used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)} MB`,
        total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)} MB`,
        limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)} MB`
      });
    }
  }
}

/**
 * Image preloader with caching
 */
export class ImagePreloader {
  private cache = new Map<string, HTMLImageElement>();
  private loading = new Map<string, Promise<HTMLImageElement>>();
  
  async preload(src: string): Promise<HTMLImageElement> {
    // Return cached image
    if (this.cache.has(src)) {
      return this.cache.get(src)!;
    }
    
    // Return existing loading promise
    if (this.loading.has(src)) {
      return this.loading.get(src)!;
    }
    
    // Start new loading process
    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        this.cache.set(src, img);
        this.loading.delete(src);
        resolve(img);
      };
      
      img.onerror = () => {
        this.loading.delete(src);
        reject(new Error(`Failed to load image: ${src}`));
      };
      
      img.src = src;
    });
    
    this.loading.set(src, promise);
    return promise;
  }
  
  clearCache(): void {
    this.cache.clear();
    this.loading.clear();
  }
  
  getCacheSize(): number {
    return this.cache.size;
  }
}

/**
 * Virtual scrolling implementation for large lists
 */
export interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  totalItems: number;
  overscan?: number;
}

export class VirtualScroller {
  private options: VirtualScrollOptions;
  
  constructor(options: VirtualScrollOptions) {
    this.options = { overscan: 5, ...options };
  }
  
  getVisibleRange(scrollTop: number): { start: number; end: number } {
    const { itemHeight, containerHeight, totalItems, overscan = 5 } = this.options;
    
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(totalItems - 1, start + visibleCount + overscan * 2);
    
    return { start, end };
  }
  
  getItemStyle(index: number): React.CSSProperties {
    return {
      position: 'absolute',
      top: index * this.options.itemHeight,
      height: this.options.itemHeight,
      width: '100%'
    };
  }
  
  getTotalHeight(): number {
    return this.options.totalItems * this.options.itemHeight;
  }
}

/**
 * Lazy loading hook for images
 */
export function createLazyLoader() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        }
      });
    },
    {
      rootMargin: '50px 0px',
      threshold: 0.01
    }
  );
  
  return {
    observe: (element: HTMLImageElement) => observer.observe(element),
    disconnect: () => observer.disconnect()
  };
}

/**
 * Performance timing utility
 */
export class PerformanceTimer {
  private marks = new Map<string, number>();
  
  mark(name: string): void {
    this.marks.set(name, performance.now());
  }
  
  measure(startMark: string, endMark?: string): number {
    const start = this.marks.get(startMark);
    if (!start) throw new Error(`Mark '${startMark}' not found`);
    
    const end = endMark ? this.marks.get(endMark) : performance.now();
    if (endMark && !end) throw new Error(`Mark '${endMark}' not found`);
    
    return (end as number) - start;
  }
  
  clearMarks(): void {
    this.marks.clear();
  }
  
  getAllMarks(): Map<string, number> {
    return new Map(this.marks);
  }
}

// Export singleton instances
export const memoryMonitor = MemoryMonitor.getInstance();
export const imagePreloader = new ImagePreloader();
export const performanceTimer = new PerformanceTimer();