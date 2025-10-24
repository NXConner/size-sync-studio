import { renderHook, act } from '@testing-library/react';
import { usePositionCreator } from '../hooks/usePositionCreator';

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

describe('usePositionCreator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should initialize with empty custom positions', () => {
    const { result } = renderHook(() => usePositionCreator());
    
    expect(result.current.customPositions).toEqual([]);
    expect(result.current.templates).toEqual([]);
  });

  it('should load custom positions from localStorage', () => {
    const mockPositions = [
      {
        id: '1',
        name: 'Test Position',
        description: 'Test description',
        instructions: ['Step 1', 'Step 2'],
        tips: ['Tip 1'],
        difficulty: 'beginner',
        category: 'missionary',
        mood: 'romantic',
        duration: 15,
        intensity: 'medium',
        tags: ['custom'],
        isPublic: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockPositions));

    const { result } = renderHook(() => usePositionCreator());
    
    expect(result.current.customPositions).toEqual(mockPositions);
  });

  it('should create custom position', () => {
    const { result } = renderHook(() => usePositionCreator());
    
    const positionData = {
      name: 'Test Position',
      description: 'Test description',
      instructions: ['Step 1', 'Step 2'],
      tips: ['Tip 1'],
      difficulty: 'beginner',
      category: 'missionary',
      mood: 'romantic',
      duration: 15,
      intensity: 'medium',
      tags: ['custom'],
      isPublic: false
    };

    act(() => {
      result.current.createPosition(positionData);
    });

    expect(result.current.customPositions).toHaveLength(1);
    expect(result.current.customPositions[0].name).toBe('Test Position');
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should update custom position', () => {
    const { result } = renderHook(() => usePersonalization());
    
    const positionData = {
      name: 'Test Position',
      description: 'Test description',
      instructions: ['Step 1', 'Step 2'],
      tips: ['Tip 1'],
      difficulty: 'beginner',
      category: 'missionary',
      mood: 'romantic',
      duration: 15,
      intensity: 'medium',
      tags: ['custom'],
      isPublic: false
    };

    act(() => {
      result.current.createPosition(positionData);
    });

    const positionId = result.current.customPositions[0].id;

    act(() => {
      result.current.updatePosition(positionId, { name: 'Updated Position' });
    });

    expect(result.current.customPositions[0].name).toBe('Updated Position');
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should delete custom position', () => {
    const { result } = renderHook(() => usePositionCreator());
    
    const positionData = {
      name: 'Test Position',
      description: 'Test description',
      instructions: ['Step 1', 'Step 2'],
      tips: ['Tip 1'],
      difficulty: 'beginner',
      category: 'missionary',
      mood: 'romantic',
      duration: 15,
      intensity: 'medium',
      tags: ['custom'],
      isPublic: false
    };

    act(() => {
      result.current.createPosition(positionData);
    });

    const positionId = result.current.customPositions[0].id;

    act(() => {
      result.current.deletePosition(positionId);
    });

    expect(result.current.customPositions).toHaveLength(0);
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should create position template', () => {
    const { result } = renderHook(() => usePositionCreator());
    
    const templateData = {
      name: 'Test Template',
      description: 'Test template description',
      instructions: ['Step 1', 'Step 2'],
      tips: ['Tip 1'],
      difficulty: 'beginner',
      category: 'missionary',
      mood: 'romantic',
      duration: 15,
      intensity: 'medium',
      tags: ['template'],
      isPublic: true
    };

    act(() => {
      result.current.createTemplate(templateData);
    });

    expect(result.current.templates).toHaveLength(1);
    expect(result.current.templates[0].name).toBe('Test Template');
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should get position by id', () => {
    const { result } = renderHook(() => usePositionCreator());
    
    const positionData = {
      name: 'Test Position',
      description: 'Test description',
      instructions: ['Step 1', 'Step 2'],
      tips: ['Tip 1'],
      difficulty: 'beginner',
      category: 'missionary',
      mood: 'romantic',
      duration: 15,
      intensity: 'medium',
      tags: ['custom'],
      isPublic: false
    };

    act(() => {
      result.current.createPosition(positionData);
    });

    const positionId = result.current.customPositions[0].id;
    const position = result.current.getPositionById(positionId);

    expect(position).toBeDefined();
    expect(position?.name).toBe('Test Position');
  });

  it('should get positions by category', () => {
    const { result } = renderHook(() => usePositionCreator());
    
    const positionData1 = {
      name: 'Test Position 1',
      description: 'Test description',
      instructions: ['Step 1', 'Step 2'],
      tips: ['Tip 1'],
      difficulty: 'beginner',
      category: 'missionary',
      mood: 'romantic',
      duration: 15,
      intensity: 'medium',
      tags: ['custom'],
      isPublic: false
    };

    const positionData2 = {
      name: 'Test Position 2',
      description: 'Test description',
      instructions: ['Step 1', 'Step 2'],
      tips: ['Tip 1'],
      difficulty: 'beginner',
      category: 'cowgirl',
      mood: 'romantic',
      duration: 15,
      intensity: 'medium',
      tags: ['custom'],
      isPublic: false
    };

    act(() => {
      result.current.createPosition(positionData1);
      result.current.createPosition(positionData2);
    });

    const missionaryPositions = result.current.getPositionsByCategory('missionary');
    expect(missionaryPositions).toHaveLength(1);
    expect(missionaryPositions[0].name).toBe('Test Position 1');
  });

  it('should search positions', () => {
    const { result } = renderHook(() => usePositionCreator());
    
    const positionData1 = {
      name: 'Romantic Position',
      description: 'Test description',
      instructions: ['Step 1', 'Step 2'],
      tips: ['Tip 1'],
      difficulty: 'beginner',
      category: 'missionary',
      mood: 'romantic',
      duration: 15,
      intensity: 'medium',
      tags: ['custom'],
      isPublic: false
    };

    const positionData2 = {
      name: 'Playful Position',
      description: 'Test description',
      instructions: ['Step 1', 'Step 2'],
      tips: ['Tip 1'],
      difficulty: 'beginner',
      category: 'cowgirl',
      mood: 'playful',
      duration: 15,
      intensity: 'medium',
      tags: ['custom'],
      isPublic: false
    };

    act(() => {
      result.current.createPosition(positionData1);
      result.current.createPosition(positionData2);
    });

    const searchResults = result.current.searchPositions('Romantic');
    expect(searchResults).toHaveLength(1);
    expect(searchResults[0].name).toBe('Romantic Position');
  });

  it('should reset custom positions', () => {
    const { result } = renderHook(() => usePositionCreator());
    
    const positionData = {
      name: 'Test Position',
      description: 'Test description',
      instructions: ['Step 1', 'Step 2'],
      tips: ['Tip 1'],
      difficulty: 'beginner',
      category: 'missionary',
      mood: 'romantic',
      duration: 15,
      intensity: 'medium',
      tags: ['custom'],
      isPublic: false
    };

    act(() => {
      result.current.createPosition(positionData);
    });

    act(() => {
      result.current.resetPositions();
    });

    expect(result.current.customPositions).toEqual([]);
    expect(localStorageMock.removeItem).toHaveBeenCalled();
  });
});
