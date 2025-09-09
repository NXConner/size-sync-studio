import { useState, useEffect } from 'react';

export interface AppPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    reminders: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    dataSharing: boolean;
    analytics: boolean;
  };
  accessibility: {
    fontSize: 'small' | 'medium' | 'large';
    highContrast: boolean;
    reducedMotion: boolean;
  };
  measure: {
    defaultUnit: 'in' | 'cm';
    autoCapture: boolean;
    voiceEnabled: boolean;
    gridEnabled: boolean;
  };
}

const defaultPreferences: AppPreferences = {
  theme: 'system',
  notifications: {
    email: true,
    push: true,
    reminders: true
  },
  privacy: {
    profileVisibility: 'private',
    dataSharing: false,
    analytics: true
  },
  accessibility: {
    fontSize: 'medium',
    highContrast: false,
    reducedMotion: false
  },
  measure: {
    defaultUnit: 'in',
    autoCapture: false,
    voiceEnabled: true,
    gridEnabled: false
  }
};

export function useAppPreferences() {
  const [preferences, setPreferences] = useState<AppPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const saved = localStorage.getItem('appPreferences');
      if (saved) {
        const parsed = JSON.parse(saved);
        setPreferences({ ...defaultPreferences, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (newPreferences: Partial<AppPreferences>) => {
    try {
      const updated = { ...preferences, ...newPreferences };
      localStorage.setItem('appPreferences', JSON.stringify(updated));
      setPreferences(updated);
      return updated;
    } catch (error) {
      console.error('Failed to save preferences:', error);
      throw error;
    }
  };

  const updatePreference = async <K extends keyof AppPreferences>(
    category: K,
    updates: Partial<AppPreferences[K]>
  ) => {
    const newPreferences = {
      ...preferences,
      [category]: { ...(preferences[category] as any), ...updates }
    };
    return savePreferences(newPreferences);
  };

  const resetPreferences = () => {
    localStorage.removeItem('appPreferences');
    setPreferences(defaultPreferences);
  };

  return {
    preferences,
    loading,
    savePreferences,
    updatePreference,
    resetPreferences
  };
}