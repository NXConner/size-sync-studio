import { useState, useEffect } from 'react';
import { MeasureLayoutType } from '@/components/measure/MeasureLayoutSelector';

const LAYOUT_STORAGE_KEY = 'measure-layout-preference';

export function useMeasureLayout() {
  const [currentLayout, setCurrentLayout] = useState<MeasureLayoutType>(() => {
    try {
      const stored = localStorage.getItem(LAYOUT_STORAGE_KEY);
      return (stored as MeasureLayoutType) || 'default';
    } catch {
      return 'default';
    }
  });

  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>(() => {
    if (typeof window === 'undefined') return 'desktop';
    
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) setDeviceType('mobile');
      else if (width < 1024) setDeviceType('tablet');
      else setDeviceType('desktop');
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const changeLayout = (layout: MeasureLayoutType) => {
    setCurrentLayout(layout);
    try {
      localStorage.setItem(LAYOUT_STORAGE_KEY, layout);
    } catch (error) {
      console.warn('Failed to save layout preference:', error);
    }
  };

  // Auto-suggest layout based on device type
  const getSuggestedLayout = (): MeasureLayoutType => {
    switch (deviceType) {
      case 'mobile':
        return 'mobile-stack';
      case 'tablet':
        return 'tablet-landscape';
      case 'desktop':
        return 'default';
      default:
        return 'default';
    }
  };

  return {
    currentLayout,
    deviceType,
    changeLayout,
    getSuggestedLayout
  };
}