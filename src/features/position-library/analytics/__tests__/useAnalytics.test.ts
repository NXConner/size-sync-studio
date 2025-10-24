import { renderHook, act } from '@testing-library/react';
import { useAnalytics } from '../hooks/useAnalytics';

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

describe('useAnalytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should initialize with empty analytics data', () => {
    const { result } = renderHook(() => useAnalytics());
    
    expect(result.current.analyticsData).toEqual({
      totalSessions: 0,
      totalDuration: 0,
      averageSessionDuration: 0,
      totalPositions: 0,
      averagePositionsPerSession: 0,
      favoritePositions: [],
      difficultyDistribution: {},
      categoryDistribution: {},
      moodDistribution: {},
      intensityDistribution: {},
      timeOfDayDistribution: {},
      dayOfWeekDistribution: {},
      monthlyStats: [],
      weeklyStats: [],
      dailyStats: [],
      positionHistory: [],
      sessionHistory: [],
      achievements: [],
      goals: [],
      insights: []
    });
  });

  it('should load analytics data from localStorage', () => {
    const mockAnalytics = {
      totalSessions: 5,
      totalDuration: 300,
      averageSessionDuration: 60,
      totalPositions: 25,
      averagePositionsPerSession: 5,
      favoritePositions: ['missionary', 'cowgirl'],
      difficultyDistribution: { beginner: 10, intermediate: 15 },
      categoryDistribution: { missionary: 10, cowgirl: 15 },
      moodDistribution: { romantic: 20, playful: 5 },
      intensityDistribution: { low: 5, medium: 15, high: 5 },
      timeOfDayDistribution: { morning: 5, afternoon: 10, evening: 10 },
      dayOfWeekDistribution: { monday: 5, tuesday: 5, wednesday: 5, thursday: 5, friday: 5 },
      monthlyStats: [],
      weeklyStats: [],
      dailyStats: [],
      positionHistory: [],
      sessionHistory: [],
      achievements: [],
      goals: [],
      insights: []
    };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockAnalytics));

    const { result } = renderHook(() => useAnalytics());
    
    expect(result.current.analyticsData.totalSessions).toBe(5);
    expect(result.current.analyticsData.totalDuration).toBe(300);
  });

  it('should track session', () => {
    const { result } = renderHook(() => useAnalytics());
    
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
      result.current.trackSession(sessionData);
    });

    expect(result.current.analyticsData.totalSessions).toBe(1);
    expect(result.current.analyticsData.totalDuration).toBe(3600);
    expect(result.current.analyticsData.totalPositions).toBe(2);
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should track position usage', () => {
    const { result } = renderHook(() => useAnalytics());
    
    const positionData = {
      id: '1',
      name: 'Missionary',
      category: 'missionary',
      difficulty: 'beginner',
      mood: 'romantic',
      intensity: 'medium',
      duration: 15,
      timestamp: new Date().toISOString()
    };

    act(() => {
      result.current.trackPositionUsage(positionData);
    });

    expect(result.current.analyticsData.positionHistory).toHaveLength(1);
    expect(result.current.analyticsData.positionHistory[0].name).toBe('Missionary');
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should update statistics', () => {
    const { result } = renderHook(() => useAnalytics());
    
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
      result.current.trackSession(sessionData);
    });

    expect(result.current.analyticsData.totalSessions).toBe(1);
    expect(result.current.analyticsData.totalDuration).toBe(3600);
    expect(result.current.analyticsData.averageSessionDuration).toBe(3600);
    expect(result.current.analyticsData.totalPositions).toBe(2);
    expect(result.current.analyticsData.averagePositionsPerSession).toBe(2);
  });

  it('should get insights', () => {
    const { result } = renderHook(() => useAnalytics());
    
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
      result.current.trackSession(sessionData);
    });

    const insights = result.current.getInsights();
    expect(insights).toBeDefined();
    expect(Array.isArray(insights)).toBe(true);
  });

  it('should get trends', () => {
    const { result } = renderHook(() => useAnalytics());
    
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
      result.current.trackSession(sessionData);
    });

    const trends = result.current.getTrends('week');
    expect(trends).toBeDefined();
    expect(Array.isArray(trends)).toBe(true);
  });

  it('should get recommendations', () => {
    const { result } = renderHook(() => useAnalytics());
    
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
      result.current.trackSession(sessionData);
    });

    const recommendations = result.current.getRecommendations();
    expect(recommendations).toBeDefined();
    expect(Array.isArray(recommendations)).toBe(true);
  });

  it('should export data', () => {
    const { result } = renderHook(() => useAnalytics());
    
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
      result.current.trackSession(sessionData);
    });

    const exportedData = result.current.exportData();
    expect(exportedData).toBeDefined();
    expect(exportedData.totalSessions).toBe(1);
  });

  it('should reset analytics', () => {
    const { result } = renderHook(() => useAnalytics());
    
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
      result.current.trackSession(sessionData);
    });

    act(() => {
      result.current.resetAnalytics();
    });

    expect(result.current.analyticsData.totalSessions).toBe(0);
    expect(result.current.analyticsData.totalDuration).toBe(0);
    expect(localStorageMock.removeItem).toHaveBeenCalled();
  });
});
