import { useCallback } from 'react';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

interface HapticsOptions {
  enabled?: boolean;
  style?: ImpactStyle;
  duration?: number;
}

export function useHaptics() {
  const isCapacitorAvailable = useCallback(() => {
    return typeof window !== 'undefined' && 'Capacitor' in window;
  }, []);

  const isHapticsAvailable = useCallback(async () => {
    if (!isCapacitorAvailable()) return false;
    
    try {
      // Check if haptics is available on this device
      await Haptics.impact({ style: ImpactStyle.Light });
      return true;
    } catch {
      return false;
    }
  }, [isCapacitorAvailable]);

  const impact = useCallback(async (options: HapticsOptions = {}) => {
    const { 
      enabled = true, 
      style = ImpactStyle.Medium 
    } = options;

    if (!enabled || !isCapacitorAvailable()) {
      // Fallback to web vibration API
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        const duration = options.duration || (
          style === ImpactStyle.Light ? 50 :
          style === ImpactStyle.Heavy ? 200 : 100
        );
        navigator.vibrate(duration);
      }
      return;
    }

    try {
      await Haptics.impact({ style });
    } catch (error) {
      console.warn('Haptics not available:', error);
      // Fallback to vibration
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        const duration = options.duration || 100;
        navigator.vibrate(duration);
      }
    }
  }, [isCapacitorAvailable]);

  const notification = useCallback(async (enabled = true) => {
    if (!enabled || !isCapacitorAvailable()) {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([50, 50, 50]);
      }
      return;
    }

    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch (error) {
      console.warn('Haptics notification not available:', error);
    }
  }, [isCapacitorAvailable]);

  const selection = useCallback(async (enabled = true) => {
    if (!enabled || !isCapacitorAvailable()) {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(25);
      }
      return;
    }

    try {
      await Haptics.selectionStart();
    } catch (error) {
      console.warn('Haptics selection not available:', error);
    }
  }, [isCapacitorAvailable]);

  // Measurement-specific haptics
  const measurementFeedback = {
    calibrationPoint: () => impact({ style: ImpactStyle.Light }),
    measurementPoint: () => impact({ style: ImpactStyle.Medium }),
    measurementComplete: () => notification(),
    detectionLock: () => impact({ style: ImpactStyle.Light }),
    autoCapture: () => impact({ style: ImpactStyle.Heavy }),
    errorFeedback: () => {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
    },
    successFeedback: () => {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([50, 50, 50, 50, 100]);
      }
    }
  };

  return {
    impact,
    notification,
    selection,
    measurementFeedback,
    isHapticsAvailable,
    isCapacitorAvailable: isCapacitorAvailable()
  };
}

// Hook for measurement-specific haptic patterns
export function useMeasurementHaptics() {
  const { measurementFeedback, impact, isCapacitorAvailable } = useHaptics();

  const calibrationHaptic = useCallback(() => {
    measurementFeedback.calibrationPoint();
  }, [measurementFeedback]);

  const measurementHaptic = useCallback(() => {
    measurementFeedback.measurementPoint();
  }, [measurementFeedback]);

  const completionHaptic = useCallback(() => {
    measurementFeedback.measurementComplete();
  }, [measurementFeedback]);

  const detectionHaptic = useCallback(() => {
    measurementFeedback.detectionLock();
  }, [measurementFeedback]);

  const autoCaptureHaptic = useCallback(() => {
    measurementFeedback.autoCapture();
  }, [measurementFeedback]);

  const errorHaptic = useCallback(() => {
    measurementFeedback.errorFeedback();
  }, [measurementFeedback]);

  const successHaptic = useCallback(() => {
    measurementFeedback.successFeedback();
  }, [measurementFeedback]);

  const warningHaptic = useCallback(() => {
    impact({ style: ImpactStyle.Medium });
  }, [impact]);

  return {
    calibrationHaptic,
    measurementHaptic,
    completionHaptic,
    detectionHaptic,
    autoCaptureHaptic,
    errorHaptic,
    successHaptic,
    warningHaptic,
    isCapacitorAvailable
  };
}