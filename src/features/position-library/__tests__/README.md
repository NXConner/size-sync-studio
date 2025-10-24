# Position Library Testing Documentation

This directory contains comprehensive unit and integration tests for the Position Library feature and all its sub-features.

## Test Structure

```
__tests__/
├── setup.ts                           # Test setup and mocks
├── integration.test.tsx                # Integration tests
├── achievements/
│   └── useAchievements.test.ts         # Achievement system tests
├── personalization/
│   └── usePersonalization.test.ts      # Personalization tests
├── creator/
│   └── usePositionCreator.test.ts      # Position creator tests
├── analytics/
│   └── useAnalytics.test.ts           # Analytics tests
├── community/
│   └── useCommunity.test.ts           # Community features tests
├── challenges/
│   └── useChallenges.test.ts          # Challenge system tests
└── integration/
    └── usePositionLibraryIntegration.test.ts  # Main integration tests
```

## Running Tests

### Run All Position Library Tests
```bash
npm run test:positions
```

### Run Specific Feature Tests
```bash
# Achievement tests
npm run test src/features/position-library/achievements

# Personalization tests
npm run test src/features/position-library/personalization

# Creator tests
npm run test src/features/position-library/creator

# Analytics tests
npm run test src/features/position-library/analytics

# Community tests
npm run test src/features/position-library/community

# Challenge tests
npm run test src/features/position-library/challenges

# Integration tests
npm run test src/features/position-library/integration
```

### Run Tests with UI
```bash
npm run test:ui
```

## Test Coverage

The tests aim for 80% coverage across:
- Lines of code
- Functions
- Branches
- Statements

## Test Categories

### Unit Tests
- **Hook Tests**: Test custom hooks for state management
- **Component Tests**: Test individual React components
- **Utility Tests**: Test helper functions and utilities

### Integration Tests
- **Feature Integration**: Test how features work together
- **Data Flow**: Test data synchronization between features
- **User Interactions**: Test complete user workflows

## Mocking Strategy

### LocalStorage Mocking
All tests use a consistent localStorage mock to simulate browser storage:

```typescript
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
```

### Component Mocking
Integration tests mock individual feature components to isolate testing:

```typescript
jest.mock('../achievements/components/AchievementDashboard', () => {
  return function MockAchievementDashboard() {
    return <div data-testid="achievement-dashboard">Achievement Dashboard</div>;
  };
});
```

### Date Mocking
Consistent date mocking for predictable test results:

```typescript
const mockDate = new Date('2024-01-01T00:00:00.000Z');
jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
```

## Test Data

### Sample Achievement Data
```typescript
const mockAchievement = {
  id: '1',
  name: 'Test Achievement',
  category: 'exploration',
  type: 'milestone',
  unlockedAt: new Date().toISOString()
};
```

### Sample Position Data
```typescript
const mockPosition = {
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
  tags: ['custom']
};
```

### Sample Session Data
```typescript
const mockSession = {
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
```

## Testing Best Practices

### 1. Test Isolation
- Each test is independent
- Clean up after each test
- Mock external dependencies

### 2. Descriptive Test Names
```typescript
it('should unlock achievement when requirements are met', () => {
  // Test implementation
});
```

### 3. Arrange-Act-Assert Pattern
```typescript
it('should update preferences', () => {
  // Arrange
  const { result } = renderHook(() => usePersonalization());
  
  // Act
  act(() => {
    result.current.updatePreferences({ difficulty: 'advanced' });
  });
  
  // Assert
  expect(result.current.preferences.difficulty).toBe('advanced');
});
```

### 4. Async Testing
```typescript
it('should handle async operations', async () => {
  const { result } = renderHook(() => useAnalytics());
  
  await act(async () => {
    await result.current.trackSession(sessionData);
  });
  
  expect(result.current.analyticsData.totalSessions).toBe(1);
});
```

## Common Test Patterns

### Testing Custom Hooks
```typescript
import { renderHook, act } from '@testing-library/react';
import { useCustomHook } from '../hooks/useCustomHook';

describe('useCustomHook', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useCustomHook());
    expect(result.current.state).toBeDefined();
  });
});
```

### Testing Component Integration
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Component } from '../Component';

describe('Component', () => {
  it('should render and handle interactions', () => {
    render(<Component />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(screen.getByText('Expected Result')).toBeInTheDocument();
  });
});
```

### Testing Data Persistence
```typescript
it('should save data to localStorage', () => {
  const { result } = renderHook(() => useCustomHook());
  
  act(() => {
    result.current.saveData(testData);
  });
  
  expect(localStorageMock.setItem).toHaveBeenCalledWith(
    'expected-key',
    JSON.stringify(testData)
  );
});
```

## Debugging Tests

### Running Individual Tests
```bash
# Run specific test file
npm run test src/features/position-library/achievements/__tests__/useAchievements.test.ts

# Run with verbose output
npm run test -- --verbose

# Run in watch mode
npm run test -- --watch
```

### Debugging Failed Tests
1. Check console output for error messages
2. Use `console.log` in tests for debugging
3. Use `screen.debug()` to see rendered output
4. Check test coverage reports

## Continuous Integration

Tests are designed to run in CI/CD environments:
- No external dependencies
- Deterministic results
- Fast execution
- Comprehensive coverage reporting

## Future Test Enhancements

### Planned Additions
1. **E2E Tests**: Full user workflow testing
2. **Performance Tests**: Load and stress testing
3. **Accessibility Tests**: Screen reader and keyboard navigation
4. **Visual Regression Tests**: UI consistency testing

### Test Automation
1. **Pre-commit Hooks**: Run tests before commits
2. **Pull Request Checks**: Automated test runs
3. **Coverage Gates**: Enforce minimum coverage
4. **Performance Monitoring**: Track test execution time
