import { 
  getVoiceEnabled, 
  playComplimentWithContext, 
  playCustomLine,
  getCustomVoiceLines,
  getUseCustomVoiceLines 
} from './audio';

interface MeasurementContext {
  length_in: number;
  length_cm: number;
  girth_in: number;
  girth_cm: number;
  confidence: number;
  qualityScore?: number;
  previousMeasurement?: {
    length: number;
    girth: number;
  };
  environmentalFactors?: {
    lighting: number;
    stability: number;
    perspective: number;
  };
}

interface CoachingTips {
  setup: string[];
  positioning: string[];
  calibration: string[];
  measurement: string[];
  improvement: string[];
  encouragement: string[];
  progress: string[];
}

const ADVANCED_COACHING_TIPS: CoachingTips = {
  setup: [
    "Great! Let's get you set up for the most accurate measurement possible.",
    "Perfect lighting and positioning will give you the best results.",
    "Take your time with setup - accuracy is more important than speed.",
    "Make sure you're in a well-lit area with good contrast."
  ],
  positioning: [
    "Hold your device steady and perpendicular to the subject.",
    "Try to maintain a consistent distance from your previous measurements.",
    "Keep the camera at the same height as the subject for best accuracy.",
    "Avoid shadows that might interfere with the measurement."
  ],
  calibration: [
    "Calibration is key to accurate measurements. Use a credit card for best results.",
    "Make sure your calibration object is clearly visible and in focus.",
    "Place the calibration reference at the same distance as your measurement subject.",
    "A standard credit card is exactly 3.375 inches long - perfect for calibration."
  ],
  measurement: [
    "Excellent positioning! The measurement looks very accurate.",
    "Try to keep your hands steady for the clearest image possible.",
    "Great job maintaining consistent lighting throughout the measurement.",
    "The system is detecting good edge definition - this will be accurate."
  ],
  improvement: [
    "Try moving to better lighting for improved accuracy.",
    "Consider using a plain background to help with edge detection.",
    "Steady your device against a surface if possible for sharper images.",
    "Make sure the entire subject is visible in the frame."
  ],
  encouragement: [
    "You're doing great! Consistency is key for tracking progress.",
    "Excellent technique! Your measurements are looking very precise.",
    "Perfect! The more consistent your method, the better your tracking will be.",
    "Outstanding work! Your measurement technique is really improving."
  ],
  progress: [
    "Your measurement consistency has improved significantly!",
    "Great progress tracking! Keep up the excellent work.",
    "Your technique is getting more refined with each measurement.",
    "Fantastic improvement in your measurement precision!"
  ]
};

class VoiceCoachingEngine {
  private lastCoachingTime = 0;
  private coachingCooldown = 5000; // 5 seconds between coaching tips
  private sessionTips: Set<string> = new Set();
  
  async provideSetupCoaching() {
    if (!this.shouldProvideCoaching()) return;
    
    const tip = this.getRandomTip('setup');
    await this.speakCoaching(tip);
  }
  
  async providePositioningCoaching(environmentalFactors?: MeasurementContext['environmentalFactors']) {
    if (!this.shouldProvideCoaching()) return;
    
    let tip = this.getRandomTip('positioning');
    
    // Customize tip based on environmental factors
    if (environmentalFactors) {
      if (environmentalFactors.lighting < 0.5) {
        tip = "The lighting could be improved. Try moving closer to a window or adding more light.";
      } else if (environmentalFactors.stability < 0.7) {
        tip = "Try to hold your device more steady. Consider bracing it against a surface.";
      } else if (environmentalFactors.perspective < 0.8) {
        tip = "Adjust your camera angle to be more perpendicular to the subject for better accuracy.";
      }
    }
    
    await this.speakCoaching(tip);
  }
  
  async provideCalibrationCoaching() {
    if (!this.shouldProvideCoaching()) return;
    
    const tip = this.getRandomTip('calibration');
    await this.speakCoaching(tip);
  }
  
  async provideMeasurementCoaching(context: MeasurementContext) {
    if (!this.shouldProvideCoaching()) return;
    
    let tip = this.getRandomTip('measurement');
    
    // Provide context-specific coaching
    if (context.confidence < 0.5) {
      tip = "The detection confidence is low. Try improving lighting or moving closer.";
    } else if (context.confidence > 0.8) {
      tip = this.getRandomTip('encouragement');
    }
    
    await this.speakCoaching(tip);
  }
  
  async provideProgressCoaching(context: MeasurementContext) {
    if (!context.previousMeasurement || !this.shouldProvideCoaching()) return;
    
    const lengthChange = context.length_in - context.previousMeasurement.length;
    const girthChange = context.girth_in - context.previousMeasurement.girth;
    
    let tip = "";
    
    if (Math.abs(lengthChange) < 0.05 && Math.abs(girthChange) < 0.05) {
      tip = "Consistent measurements! Your technique is very reliable.";
    } else if (lengthChange > 0.1 || girthChange > 0.1) {
      tip = "Great progress detected! Keep up the excellent work.";
    } else if (lengthChange < -0.1 || girthChange < -0.1) {
      tip = "Remember, measurements can vary. Consistency in technique is most important.";
    } else {
      tip = this.getRandomTip('progress');
    }
    
    await this.speakCoaching(tip);
  }
  
  async provideQualityCoaching(context: MeasurementContext) {
    if (!context.qualityScore || !this.shouldProvideCoaching()) return;
    
    let tip = "";
    
    if (context.qualityScore < 0.4) {
      tip = "The image quality could be improved. Try better lighting and steadier positioning.";
    } else if (context.qualityScore > 0.8) {
      tip = "Excellent image quality! This measurement will be very accurate.";
    } else {
      tip = this.getRandomTip('improvement');
    }
    
    await this.speakCoaching(tip);
  }
  
  async provideMeasurementResults(context: MeasurementContext) {
    if (!getVoiceEnabled()) return;
    
    // Use custom voice lines if enabled, otherwise use standard compliments
    if (getUseCustomVoiceLines()) {
      const customLines = getCustomVoiceLines();
      if (customLines.length > 0) {
        await playComplimentWithContext(context);
        return;
      }
    }
    
    // Standard measurement announcement
    const lengthText = context.length_in > 10 ? 
      `${context.length_cm.toFixed(1)} centimeters` : 
      `${context.length_in.toFixed(1)} inches`;
    
    const girthText = context.girth_in > 10 ? 
      `${context.girth_cm.toFixed(1)} centimeters` : 
      `${context.girth_in.toFixed(1)} inches`;
    
    const announcement = `Measurement complete. Length: ${lengthText}. Girth: ${girthText}. Confidence: ${Math.round(context.confidence * 100)} percent.`;
    
    await this.speakText(announcement);
    
    // Follow up with coaching if appropriate
    setTimeout(() => {
      this.provideProgressCoaching(context);
    }, 2000);
  }
  
  private shouldProvideCoaching(): boolean {
    if (!getVoiceEnabled()) return false;
    
    const now = Date.now();
    if (now - this.lastCoachingTime < this.coachingCooldown) return false;
    
    this.lastCoachingTime = now;
    return true;
  }
  
  private getRandomTip(category: keyof CoachingTips): string {
    const tips = ADVANCED_COACHING_TIPS[category];
    const availableTips = tips.filter(tip => !this.sessionTips.has(tip));
    
    if (availableTips.length === 0) {
      // Reset session tips if we've used them all
      this.sessionTips.clear();
      return tips[Math.floor(Math.random() * tips.length)];
    }
    
    const selectedTip = availableTips[Math.floor(Math.random() * availableTips.length)];
    this.sessionTips.add(selectedTip);
    return selectedTip;
  }
  
  private async speakCoaching(text: string) {
    await this.speakText(text);
  }
  
  private async speakText(text: string) {
    try {
      await playCustomLine(text);
    } catch (error) {
      console.warn('Voice coaching failed:', error);
    }
  }
  
  // Reset coaching session (call when starting new measurement session)
  resetSession() {
    this.sessionTips.clear();
    this.lastCoachingTime = 0;
  }
  
  // Adjust coaching frequency
  setCoachingCooldown(milliseconds: number) {
    this.coachingCooldown = Math.max(1000, milliseconds); // Minimum 1 second
  }
}

// Export singleton instance
export const voiceCoaching = new VoiceCoachingEngine();

// Export types
export type { MeasurementContext, CoachingTips };

// Helper function for easy integration
export async function provideMeasurementCoaching(
  stage: 'setup' | 'positioning' | 'calibration' | 'measurement' | 'quality' | 'results' | 'progress',
  context?: Partial<MeasurementContext>
) {
  switch (stage) {
    case 'setup':
      await voiceCoaching.provideSetupCoaching();
      break;
    case 'positioning':
      await voiceCoaching.providePositioningCoaching(context?.environmentalFactors);
      break;
    case 'calibration':
      await voiceCoaching.provideCalibrationCoaching();
      break;
    case 'measurement':
      if (context) {
        await voiceCoaching.provideMeasurementCoaching(context as MeasurementContext);
      }
      break;
    case 'quality':
      if (context) {
        await voiceCoaching.provideQualityCoaching(context as MeasurementContext);
      }
      break;
    case 'results':
      if (context) {
        await voiceCoaching.provideMeasurementResults(context as MeasurementContext);
      }
      break;
    case 'progress':
      if (context) {
        await voiceCoaching.provideProgressCoaching(context as MeasurementContext);
      }
      break;
  }
}