import { renderHook, act } from '@testing-library/react';
import { useChallenges } from '../hooks/useChallenges';

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

describe('useChallenges', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should initialize with empty challenges', () => {
    const { result } = renderHook(() => useChallenges());
    
    expect(result.current.challenges).toEqual([]);
    expect(result.current.activeChallenges).toEqual([]);
    expect(result.current.completedChallenges).toEqual([]);
  });

  it('should load challenges from localStorage', () => {
    const mockChallenges = [
      {
        id: '1',
        name: 'Test Challenge',
        description: 'Test description',
        type: 'endurance',
        difficulty: 'beginner',
        duration: 30,
        requirements: ['Complete 5 positions'],
        rewards: ['Achievement badge'],
        status: 'active',
        progress: 0,
        maxProgress: 100,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockChallenges));

    const { result } = renderHook(() => useChallenges());
    
    expect(result.current.challenges).toEqual(mockChallenges);
  });

  it('should create challenge', () => {
    const { result } = renderHook(() => useChallenges());
    
    const challengeData = {
      name: 'Test Challenge',
      description: 'Test description',
      type: 'endurance',
      difficulty: 'beginner',
      duration: 30,
      requirements: ['Complete 5 positions'],
      rewards: ['Achievement badge']
    };

    act(() => {
      result.current.createChallenge(challengeData);
    });

    expect(result.current.challenges).toHaveLength(1);
    expect(result.current.challenges[0].name).toBe('Test Challenge');
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should start challenge', () => {
    const { result } = renderHook(() => useChallenges());
    
    const challengeData = {
      name: 'Test Challenge',
      description: 'Test description',
      type: 'endurance',
      difficulty: 'beginner',
      duration: 30,
      requirements: ['Complete 5 positions'],
      rewards: ['Achievement badge']
    };

    act(() => {
      result.current.createChallenge(challengeData);
    });

    const challengeId = result.current.challenges[0].id;

    act(() => {
      result.current.startChallenge(challengeId);
    });

    expect(result.current.challenges[0].status).toBe('active');
    expect(result.current.activeChallenges).toHaveLength(1);
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should complete challenge', () => {
    const { result } = renderHook(() => useChallenges());
    
    const challengeData = {
      name: 'Test Challenge',
      description: 'Test description',
      type: 'endurance',
      difficulty: 'beginner',
      duration: 30,
      requirements: ['Complete 5 positions'],
      rewards: ['Achievement badge']
    };

    act(() => {
      result.current.createChallenge(challengeData);
    });

    const challengeId = result.current.challenges[0].id;

    act(() => {
      result.current.startChallenge(challengeId);
    });

    act(() => {
      result.current.completeChallenge(challengeId);
    });

    expect(result.current.challenges[0].status).toBe('completed');
    expect(result.current.completedChallenges).toHaveLength(1);
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should update challenge progress', () => {
    const { result } = renderHook(() => useChallenges());
    
    const challengeData = {
      name: 'Test Challenge',
      description: 'Test description',
      type: 'endurance',
      difficulty: 'beginner',
      duration: 30,
      requirements: ['Complete 5 positions'],
      rewards: ['Achievement badge']
    };

    act(() => {
      result.current.createChallenge(challengeData);
    });

    const challengeId = result.current.challenges[0].id;

    act(() => {
      result.current.startChallenge(challengeId);
    });

    act(() => {
      result.current.updateProgress(challengeId, 50);
    });

    expect(result.current.challenges[0].progress).toBe(50);
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should get challenges by type', () => {
    const { result } = renderHook(() => useChallenges());
    
    const challengeData1 = {
      name: 'Endurance Challenge',
      description: 'Test description',
      type: 'endurance',
      difficulty: 'beginner',
      duration: 30,
      requirements: ['Complete 5 positions'],
      rewards: ['Achievement badge']
    };

    const challengeData2 = {
      name: 'Exploration Challenge',
      description: 'Test description',
      type: 'exploration',
      difficulty: 'beginner',
      duration: 30,
      requirements: ['Try 3 new positions'],
      rewards: ['Explorer badge']
    };

    act(() => {
      result.current.createChallenge(challengeData1);
      result.current.createChallenge(challengeData2);
    });

    const enduranceChallenges = result.current.getChallengesByType('endurance');
    expect(enduranceChallenges).toHaveLength(1);
    expect(enduranceChallenges[0].name).toBe('Endurance Challenge');
  });

  it('should get challenges by difficulty', () => {
    const { result } = renderHook(() => useChallenges());
    
    const challengeData1 = {
      name: 'Beginner Challenge',
      description: 'Test description',
      type: 'endurance',
      difficulty: 'beginner',
      duration: 30,
      requirements: ['Complete 5 positions'],
      rewards: ['Achievement badge']
    };

    const challengeData2 = {
      name: 'Advanced Challenge',
      description: 'Test description',
      type: 'endurance',
      difficulty: 'advanced',
      duration: 30,
      requirements: ['Complete 10 positions'],
      rewards: ['Advanced badge']
    };

    act(() => {
      result.current.createChallenge(challengeData1);
      result.current.createChallenge(challengeData2);
    });

    const beginnerChallenges = result.current.getChallengesByDifficulty('beginner');
    expect(beginnerChallenges).toHaveLength(1);
    expect(beginnerChallenges[0].name).toBe('Beginner Challenge');
  });

  it('should get active challenges', () => {
    const { result } = renderHook(() => useChallenges());
    
    const challengeData = {
      name: 'Test Challenge',
      description: 'Test description',
      type: 'endurance',
      difficulty: 'beginner',
      duration: 30,
      requirements: ['Complete 5 positions'],
      rewards: ['Achievement badge']
    };

    act(() => {
      result.current.createChallenge(challengeData);
    });

    const challengeId = result.current.challenges[0].id;

    act(() => {
      result.current.startChallenge(challengeId);
    });

    const activeChallenges = result.current.getActiveChallenges();
    expect(activeChallenges).toHaveLength(1);
    expect(activeChallenges[0].name).toBe('Test Challenge');
  });

  it('should get completed challenges', () => {
    const { result } = renderHook(() => useChallenges());
    
    const challengeData = {
      name: 'Test Challenge',
      description: 'Test description',
      type: 'endurance',
      difficulty: 'beginner',
      duration: 30,
      requirements: ['Complete 5 positions'],
      rewards: ['Achievement badge']
    };

    act(() => {
      result.current.createChallenge(challengeData);
    });

    const challengeId = result.current.challenges[0].id;

    act(() => {
      result.current.startChallenge(challengeId);
    });

    act(() => {
      result.current.completeChallenge(challengeId);
    });

    const completedChallenges = result.current.getCompletedChallenges();
    expect(completedChallenges).toHaveLength(1);
    expect(completedChallenges[0].name).toBe('Test Challenge');
  });

  it('should get challenge by id', () => {
    const { result } = renderHook(() => useChallenges());
    
    const challengeData = {
      name: 'Test Challenge',
      description: 'Test description',
      type: 'endurance',
      difficulty: 'beginner',
      duration: 30,
      requirements: ['Complete 5 positions'],
      rewards: ['Achievement badge']
    };

    act(() => {
      result.current.createChallenge(challengeData);
    });

    const challengeId = result.current.challenges[0].id;
    const challenge = result.current.getChallengeById(challengeId);

    expect(challenge).toBeDefined();
    expect(challenge?.name).toBe('Test Challenge');
  });

  it('should delete challenge', () => {
    const { result } = renderHook(() => useChallenges());
    
    const challengeData = {
      name: 'Test Challenge',
      description: 'Test description',
      type: 'endurance',
      difficulty: 'beginner',
      duration: 30,
      requirements: ['Complete 5 positions'],
      rewards: ['Achievement badge']
    };

    act(() => {
      result.current.createChallenge(challengeData);
    });

    const challengeId = result.current.challenges[0].id;

    act(() => {
      result.current.deleteChallenge(challengeId);
    });

    expect(result.current.challenges).toHaveLength(0);
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should reset challenges', () => {
    const { result } = renderHook(() => useChallenges());
    
    const challengeData = {
      name: 'Test Challenge',
      description: 'Test description',
      type: 'endurance',
      difficulty: 'beginner',
      duration: 30,
      requirements: ['Complete 5 positions'],
      rewards: ['Achievement badge']
    };

    act(() => {
      result.current.createChallenge(challengeData);
    });

    act(() => {
      result.current.resetChallenges();
    });

    expect(result.current.challenges).toEqual([]);
    expect(localStorageMock.removeItem).toHaveBeenCalled();
  });
});
