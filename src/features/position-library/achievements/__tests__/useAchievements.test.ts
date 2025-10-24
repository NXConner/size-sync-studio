import { renderHook, act } from '@testing-library/react';
import { useAchievements } from '../hooks/useAchievements';

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

describe('useAchievements', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should initialize with empty achievements', () => {
    const { result } = renderHook(() => useAchievements());
    
    expect(result.current.achievements).toEqual([]);
    expect(result.current.progress).toEqual({});
    expect(result.current.unlockedCount).toBe(0);
  });

  it('should load achievements from localStorage', () => {
    const mockAchievements = [
      { id: '1', name: 'Test Achievement', category: 'exploration', type: 'milestone', unlockedAt: new Date().toISOString() }
    ];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockAchievements));

    const { result } = renderHook(() => useAchievements());
    
    expect(result.current.achievements).toEqual(mockAchievements);
    expect(result.current.unlockedCount).toBe(1);
  });

  it('should unlock achievement', () => {
    const { result } = renderHook(() => useAchievements());
    
    act(() => {
      result.current.unlockAchievement('1', 'Test Achievement', 'exploration', 'milestone');
    });

    expect(result.current.achievements).toHaveLength(1);
    expect(result.current.achievements[0].name).toBe('Test Achievement');
    expect(result.current.unlockedCount).toBe(1);
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should update progress', () => {
    const { result } = renderHook(() => useAchievements());
    
    act(() => {
      result.current.updateProgress('1', 50);
    });

    expect(result.current.progress['1']).toBe(50);
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should check if achievement is unlocked', () => {
    const { result } = renderHook(() => useAchievements());
    
    act(() => {
      result.current.unlockAchievement('1', 'Test Achievement', 'exploration', 'milestone');
    });

    expect(result.current.isUnlocked('1')).toBe(true);
    expect(result.current.isUnlocked('2')).toBe(false);
  });

  it('should get achievements by category', () => {
    const { result } = renderHook(() => useAchievements());
    
    act(() => {
      result.current.unlockAchievement('1', 'Test Achievement 1', 'exploration', 'milestone');
      result.current.unlockAchievement('2', 'Test Achievement 2', 'endurance', 'milestone');
    });

    const explorationAchievements = result.current.getAchievementsByCategory('exploration');
    expect(explorationAchievements).toHaveLength(1);
    expect(explorationAchievements[0].name).toBe('Test Achievement 1');
  });

  it('should get recent achievements', () => {
    const { result } = renderHook(() => useAchievements());
    
    act(() => {
      result.current.unlockAchievement('1', 'Test Achievement 1', 'exploration', 'milestone');
      result.current.unlockAchievement('2', 'Test Achievement 2', 'endurance', 'milestone');
    });

    const recentAchievements = result.current.getRecentAchievements(1);
    expect(recentAchievements).toHaveLength(1);
    expect(recentAchievements[0].name).toBe('Test Achievement 2');
  });

  it('should reset achievements', () => {
    const { result } = renderHook(() => useAchievements());
    
    act(() => {
      result.current.unlockAchievement('1', 'Test Achievement', 'exploration', 'milestone');
      result.current.updateProgress('2', 50);
    });

    act(() => {
      result.current.resetAchievements();
    });

    expect(result.current.achievements).toEqual([]);
    expect(result.current.progress).toEqual({});
    expect(result.current.unlockedCount).toBe(0);
    expect(localStorageMock.removeItem).toHaveBeenCalled();
  });
});
