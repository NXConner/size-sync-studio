import { renderHook, act } from '@testing-library/react';
import { usePositionLibraryIntegration } from '../hooks/usePositionLibraryIntegration';

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

describe('usePositionLibraryIntegration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => usePositionLibraryIntegration());
    
    expect(result.current.activeTab).toBe('library');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should set active tab', () => {
    const { result } = renderHook(() => usePositionLibraryIntegration());
    
    act(() => {
      result.current.setActiveTab('achievements');
    });

    expect(result.current.activeTab).toBe('achievements');
  });

  it('should handle loading state', () => {
    const { result } = renderHook(() => usePositionLibraryIntegration());
    
    act(() => {
      result.current.setLoading(true);
    });

    expect(result.current.isLoading).toBe(true);

    act(() => {
      result.current.setLoading(false);
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should handle error state', () => {
    const { result } = renderHook(() => usePositionLibraryIntegration());
    
    const error = new Error('Test error');

    act(() => {
      result.current.setError(error);
    });

    expect(result.current.error).toBe(error);

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('should get feature data', () => {
    const { result } = renderHook(() => usePositionLibraryIntegration());
    
    const achievements = result.current.getFeatureData('achievements');
    const personalization = result.current.getFeatureData('personalization');
    const creator = result.current.getFeatureData('creator');
    const analytics = result.current.getFeatureData('analytics');
    const community = result.current.getFeatureData('community');
    const challenges = result.current.getFeatureData('challenges');

    expect(achievements).toBeDefined();
    expect(personalization).toBeDefined();
    expect(creator).toBeDefined();
    expect(analytics).toBeDefined();
    expect(community).toBeDefined();
    expect(challenges).toBeDefined();
  });

  it('should sync data between features', () => {
    const { result } = renderHook(() => usePositionLibraryIntegration());
    
    const sessionData = {
      id: '1',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 3600000).toISOString(),
      duration: 3600,
      positions: ['missionary', 'cowgirl'],
      difficulty: 'beginner',
      mood: 'romantic',
      intensity: 'medium',
      notes: 'Test session'
    };

    act(() => {
      result.current.syncData('session', sessionData);
    });

    // Check if data was synced to analytics
    const analytics = result.current.getFeatureData('analytics');
    expect(analytics.analyticsData.totalSessions).toBe(1);
  });

  it('should handle feature interactions', () => {
    const { result } = renderHook(() => usePositionLibraryIntegration());
    
    // Simulate unlocking an achievement
    act(() => {
      result.current.handleFeatureInteraction('achievements', 'unlock', {
        id: '1',
        name: 'Test Achievement',
        category: 'exploration',
        type: 'milestone'
      });
    });

    // Check if achievement was unlocked
    const achievements = result.current.getFeatureData('achievements');
    expect(achievements.achievements).toHaveLength(1);
    expect(achievements.achievements[0].name).toBe('Test Achievement');
  });

  it('should get unified recommendations', () => {
    const { result } = renderHook(() => usePositionLibraryIntegration());
    
    const mockPositions = [
      { id: '1', name: 'Missionary', difficulty: 'beginner', category: 'missionary' },
      { id: '2', name: 'Cowgirl', difficulty: 'intermediate', category: 'cowgirl' },
      { id: '3', name: 'Advanced Position', difficulty: 'advanced', category: 'advanced' }
    ];

    const recommendations = result.current.getUnifiedRecommendations(mockPositions);
    expect(recommendations).toBeDefined();
    expect(Array.isArray(recommendations)).toBe(true);
  });

  it('should get cross-feature insights', () => {
    const { result } = renderHook(() => usePositionLibraryIntegration());
    
    const insights = result.current.getCrossFeatureInsights();
    expect(insights).toBeDefined();
    expect(Array.isArray(insights)).toBe(true);
  });

  it('should export all data', () => {
    const { result } = renderHook(() => usePositionLibraryIntegration());
    
    const exportedData = result.current.exportAllData();
    expect(exportedData).toBeDefined();
    expect(exportedData.achievements).toBeDefined();
    expect(exportedData.personalization).toBeDefined();
    expect(exportedData.creator).toBeDefined();
    expect(exportedData.analytics).toBeDefined();
    expect(exportedData.community).toBeDefined();
    expect(exportedData.challenges).toBeDefined();
  });

  it('should reset all data', () => {
    const { result } = renderHook(() => usePositionLibraryIntegration());
    
    // Add some data first
    act(() => {
      result.current.handleFeatureInteraction('achievements', 'unlock', {
        id: '1',
        name: 'Test Achievement',
        category: 'exploration',
        type: 'milestone'
      });
    });

    act(() => {
      result.current.resetAllData();
    });

    const achievements = result.current.getFeatureData('achievements');
    expect(achievements.achievements).toEqual([]);
    expect(localStorageMock.removeItem).toHaveBeenCalled();
  });

  it('should handle feature errors gracefully', () => {
    const { result } = renderHook(() => usePositionLibraryIntegration());
    
    const error = new Error('Feature error');

    act(() => {
      result.current.handleFeatureError('achievements', error);
    });

    expect(result.current.error).toBe(error);
  });

  it('should get feature status', () => {
    const { result } = renderHook(() => usePositionLibraryIntegration());
    
    const status = result.current.getFeatureStatus();
    expect(status).toBeDefined();
    expect(status.achievements).toBeDefined();
    expect(status.personalization).toBeDefined();
    expect(status.creator).toBeDefined();
    expect(status.analytics).toBeDefined();
    expect(status.community).toBeDefined();
    expect(status.challenges).toBeDefined();
  });
});
