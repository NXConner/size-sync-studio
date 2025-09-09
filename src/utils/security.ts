// Security utilities for input validation and sanitization

/**
 * Sanitize HTML string to prevent XSS attacks
 */
export function sanitizeHtml(html: string): string {
  const temp = document.createElement('div');
  temp.textContent = html;
  return temp.innerHTML;
}

/**
 * Validate and sanitize numeric input
 */
export function sanitizeNumber(
  input: string | number, 
  options: {
    min?: number;
    max?: number;
    decimals?: number;
    allowNegative?: boolean;
  } = {}
): number | null {
  const num = typeof input === 'string' ? parseFloat(input) : input;
  
  if (isNaN(num) || !isFinite(num)) {
    return null;
  }
  
  if (options.allowNegative === false && num < 0) {
    return null;
  }
  
  if (options.min !== undefined && num < options.min) {
    return options.min;
  }
  
  if (options.max !== undefined && num > options.max) {
    return options.max;
  }
  
  if (options.decimals !== undefined) {
    return Math.round(num * Math.pow(10, options.decimals)) / Math.pow(10, options.decimals);
  }
  
  return num;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Sanitize filename for safe storage
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Rate limiter for preventing spam/abuse
 */
export class RateLimiter {
  private requests = new Map<string, number[]>();
  
  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, [now]);
      return true;
    }
    
    const userRequests = this.requests.get(identifier)!;
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => time > windowStart);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return true;
  }
  
  getRemainingRequests(identifier: string): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(identifier)) {
      return this.maxRequests;
    }
    
    const validRequests = this.requests.get(identifier)!
      .filter(time => time > windowStart);
    
    return Math.max(0, this.maxRequests - validRequests.length);
  }
  
  reset(identifier?: string): void {
    if (identifier) {
      this.requests.delete(identifier);
    } else {
      this.requests.clear();
    }
  }
}

/**
 * Input validation schemas
 */
export const ValidationSchemas = {
  measurement: {
    length: { min: 0, max: 20, decimals: 2 },
    girth: { min: 0, max: 15, decimals: 2 },
    notes: { maxLength: 500 }
  },
  
  calibration: {
    pixelsPerInch: { min: 50, max: 500, decimals: 1 },
    referenceLength: { min: 0.1, max: 50, decimals: 2 }
  },
  
  settings: {
    confidence: { min: 0, max: 1, decimals: 2 },
    interval: { min: 100, max: 10000, decimals: 0 },
    volume: { min: 0, max: 1, decimals: 1 }
  }
};

/**
 * Validate measurement data
 */
export function validateMeasurementData(data: any): {
  valid: boolean;
  errors: string[];
  sanitized?: any;
} {
  const errors: string[] = [];
  const sanitized: any = {};
  
  // Validate length
  const length = sanitizeNumber(data.length, ValidationSchemas.measurement.length);
  if (length === null) {
    errors.push('Invalid length value');
  } else {
    sanitized.length = length;
  }
  
  // Validate girth
  const girth = sanitizeNumber(data.girth, ValidationSchemas.measurement.girth);
  if (girth === null) {
    errors.push('Invalid girth value');
  } else {
    sanitized.girth = girth;
  }
  
  // Validate notes
  if (data.notes && typeof data.notes === 'string') {
    const notes = data.notes.substring(0, ValidationSchemas.measurement.notes.maxLength);
    sanitized.notes = sanitizeHtml(notes);
  }
  
  // Validate date
  const date = new Date(data.date);
  if (isNaN(date.getTime())) {
    errors.push('Invalid date');
  } else {
    sanitized.date = date.toISOString();
  }
  
  return {
    valid: errors.length === 0,
    errors,
    sanitized: errors.length === 0 ? sanitized : undefined
  };
}

/**
 * Content Security Policy helpers
 */
export const CSP = {
  // Generate nonce for inline scripts/styles
  generateNonce(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  },
  
  // Validate that content matches CSP rules
  validateContent(content: string, _type: 'script' | 'style'): boolean {
    const forbiddenPatterns = [
      /javascript:/i,
      /data:/i,
      /vbscript:/i,
      /<script/i,
      /on\w+\s*=/i, // Event handlers
    ];
    
    return !forbiddenPatterns.some(pattern => pattern.test(content));
  }
};

/**
 * Secure storage wrapper
 */
export class SecureStorage {
  private static encrypt(data: string, key: string): string {
    // Simple XOR encryption for demonstration
    // In production, use proper encryption libraries
    const keyBytes = new TextEncoder().encode(key);
    const dataBytes = new TextEncoder().encode(data);
    const encrypted = new Uint8Array(dataBytes.length);
    
    for (let i = 0; i < dataBytes.length; i++) {
      encrypted[i] = dataBytes[i] ^ keyBytes[i % keyBytes.length];
    }
    
    return btoa(String.fromCharCode(...encrypted));
  }
  
  private static decrypt(encryptedData: string, key: string): string {
    try {
      const keyBytes = new TextEncoder().encode(key);
      const encryptedBytes = new Uint8Array(
        atob(encryptedData).split('').map(char => char.charCodeAt(0))
      );
      const decrypted = new Uint8Array(encryptedBytes.length);
      
      for (let i = 0; i < encryptedBytes.length; i++) {
        decrypted[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length];
      }
      
      return new TextDecoder().decode(decrypted);
    } catch {
      throw new Error('Failed to decrypt data');
    }
  }
  
  static setItem(key: string, value: any, encryptionKey?: string): void {
    const serialized = JSON.stringify(value);
    const dataToStore = encryptionKey ? 
      this.encrypt(serialized, encryptionKey) : 
      serialized;
    
    localStorage.setItem(key, dataToStore);
  }
  
  static getItem(key: string, encryptionKey?: string): any {
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    
    try {
      const dataToDeserialize = encryptionKey ? 
        this.decrypt(stored, encryptionKey) : 
        stored;
      
      return JSON.parse(dataToDeserialize);
    } catch {
      return null;
    }
  }
  
  static removeItem(key: string): void {
    localStorage.removeItem(key);
  }
}

/**
 * File validation utilities
 */
export const FileValidator = {
  validateImageFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Invalid file type' };
    }
    
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { valid: false, error: 'File too large' };
    }
    
    // Check filename
    const sanitized = sanitizeFilename(file.name);
    if (sanitized !== file.name) {
      return { valid: false, error: 'Invalid filename' };
    }
    
    return { valid: true };
  },
  
  async validateImageContent(file: File): Promise<{ valid: boolean; error?: string }> {
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        
        // Check dimensions
        if (img.width > 4096 || img.height > 4096) {
          resolve({ valid: false, error: 'Image dimensions too large' });
          return;
        }
        
        if (img.width < 100 || img.height < 100) {
          resolve({ valid: false, error: 'Image dimensions too small' });
          return;
        }
        
        resolve({ valid: true });
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        resolve({ valid: false, error: 'Invalid image file' });
      };
      
      img.src = URL.createObjectURL(file);
    });
  }
};

// Export rate limiter instances for common use cases
export const apiRateLimiter = new RateLimiter(100, 60000); // 100 requests per minute
export const measurementRateLimiter = new RateLimiter(10, 60000); // 10 measurements per minute