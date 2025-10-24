import { renderHook, act } from '@testing-library/react';
import { usePersonalization } from '../hooks/usePersonalization';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('usePersonalization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should initialize with default preferences', () => {
    const { result } = renderHook(() => usePersonalization());
    
    expect(result.current.preferences).toEqual({
      difficulty: 'beginner',
      categories: [],
      mood: 'romantic',
      duration: 15,
      intensity: 'medium',
      customTags: [],
      privacy: 'private'
    });
    expect(result.current.partnerProfiles).toEqual([]);
  });

  it('should load preferences from localStorage', () => {
    const mockPreferences = {
      difficulty: 'intermediate',
      categories: ['missionary', 'cowgirl'],
      mood: 'playful',
      duration: 30,
      intensity: 'high',
      customTags: ['favorite'],
      privacy: 'public'
    };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockPreferences));

    const { result } = renderHook(() => usePersonalization());
    
    expect(result.current.preferences).toEqual(mockPreferences);
  });

  it('should update preferences', () => {
    const { result } = renderHook(() => usePersonalization());
    
    act(() => {
      result.current.updatePreferences({ difficulty: 'advanced' });
    });

    expect(result.current.preferences.difficulty).toBe('advanced');
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should add partner profile', () => {
    const { result } = renderHook(() => usePersonalization());
    
    const partnerProfile = {
      id: '1',
      name: 'Test Partner',
      preferences: {
        difficulty: 'beginner',
        categories: ['missionary'],
        mood: 'romantic',
        duration: 15,
        intensity: 'low',
        customTags: [],
        privacy: 'private'
      },
      notes: 'Test notes',
      createdAt: new Date().toISOString()
    };

    act(() => {
      result.current.addPartnerProfile(partnerProfile);
    });

    expect(result.current.partnerProfiles).toHaveLength(1);
    expect(result.current.partnerProfiles[0].name).toBe('Test Partner');
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should update partner profile', () => {
    const { result } = renderHook(() => usePersonalization());
    
    const partnerProfile = {
      id: '1',
      name: 'Test Partner',
      preferences: {
        difficulty: 'beginner',
        categories: ['missionary'],
        mood: 'romantic',
        duration: 15,
        intensity: 'low',
        customTags: [],
        privacy: 'private'
      },
      notes: 'Test notes',
      createdAt: new Date().toISOString()
    };

    act(() => {
      result.current.addPartnerProfile(partnerProfile);
    });

    act(() => {
      result.current.updatePartnerProfile('1', { name: 'Updated Partner' });
    });

    expect(result.current.partnerProfiles[0].name).toBe('Updated Partner');
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should delete partner profile', () => {
    const { result } = renderHook(() => usePersonalization());
    
    const partnerProfile = {
      id: '1',
      name: 'Test Partner',
      preferences: {
        difficulty: 'beginner',
        categories: ['missionary'],
        mood: 'romantic',
        duration: 15,
        intensity: 'low',
        customTags: [],
        privacy: 'private'
      },
      notes: 'Test notes',
      createdAt: new Date().toISOString()
    };

    act(() => {
      result.current.addPartnerProfile(partnerProfile);
    });

    act(() => {
      result.current.deletePartnerProfile('1');
    });

    expect(result.current.partnerProfiles).toHaveLength(0);
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should get recommendations based on preferences', () => {
    const { result } = renderHook(() => usePersonalization());
    
    const mockPositions = [
      { id: '1', name: 'Missionary', difficulty: 'beginner', category: 'missionary' },
      { id: '2', name: 'Cowgirl', difficulty: 'intermediate', category: 'cowgirl' },
      { id: '3', name: 'Advanced Position', difficulty: 'advanced', category: 'advanced' }
    ];

    act(() => {
      result.current.updatePreferences({ difficulty: 'beginner', categories: ['missionary'] });
    });

    const recommendations = result.current.getRecommendations(mockPositions);
    expect(recommendations).toHaveLength(1);
    expect(recommendations[0].name).toBe('Missionary');
  });

  it('should get mood-based recommendations', () => {
    const { result } = renderHook(() => usePersonalization());
    
    const mockPositions = [
      { id: '1', name: 'Romantic Position', mood: 'romantic' },
      { id: '2', name: 'Playful Position', mood: 'playful' },
      { id: '3', name: 'Intimate Position', mood: 'intimate' }
    ];

    act(() => {
      result.current.updatePreferences({ mood: 'romantic' });
    });

    const recommendations = result.current.getMoodRecommendations(mockPositions);
    expect(recommendations).toHaveLength(1);
    expect(recommendations[0].name).toBe('Romantic Position');
  });

  it('should reset preferences', () => {
    const { result } = renderHook(() => usePersonalization());
    
    act(() => {
      result.current.updatePreferences({ difficulty: 'advanced' });
    });

    act(() => {
      result.current.resetPreferences();
    });

    expect(result.current.preferences.difficulty).toBe('beginner');
    expect(localStorageMock.removeItem).toHaveBeenCalled();
  });
});
