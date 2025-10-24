import { useState, useCallback, useRef } from 'react';
import { SexPosition, GameSession, SessionPosition, GameSettings } from '../types';

export const useGameSession = (initialSettings?: Partial<GameSettings>) => {
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [currentPosition, setCurrentPosition] = useState<SexPosition | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartTimeRef = useRef<Date | null>(null);

  const defaultSettings: GameSettings = {
    minPositionTime: 300, // 5 minutes
    maxPositionTime: 1800, // 30 minutes
    categories: ['missionary', 'cowgirl', 'doggy', 'standing', 'sitting', 'side', 'oral'],
    difficulty: ['beginner', 'intermediate', 'advanced'],
    randomTimer: true,
    breakTime: 300 // 5 minutes
  };

  const settings = { ...defaultSettings, ...initialSettings };

  const generateRandomTime = useCallback((position: SexPosition): number => {
    const minTime = Math.max(settings.minPositionTime, position.duration.min);
    const maxTime = Math.min(settings.maxPositionTime, position.duration.max);
    return Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;
  }, [settings]);

  const startNewSession = useCallback(() => {
    const newSession: GameSession = {
      id: `session-${Date.now()}`,
      startTime: new Date(),
      positions: [],
      totalDuration: 0,
      climaxCount: 0,
      breakCount: 0
    };
    
    setCurrentSession(newSession);
    setIsActive(true);
    sessionStartTimeRef.current = new Date();
  }, []);

  const endSession = useCallback(() => {
    if (currentSession) {
      const endTime = new Date();
      const updatedSession = {
        ...currentSession,
        endTime,
        totalDuration: Math.floor((endTime.getTime() - currentSession.startTime.getTime()) / 1000)
      };
      
      setCurrentSession(updatedSession);
      setIsActive(false);
      setCurrentPosition(null);
      setTimeRemaining(0);
      setIsPaused(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [currentSession]);

  const pauseSession = useCallback(() => {
    setIsPaused(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resumeSession = useCallback(() => {
    setIsPaused(false);
    if (currentPosition && timeRemaining > 0) {
      startTimer();
    }
  }, [currentPosition, timeRemaining]);

  const startTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const onTimeUp = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (currentPosition && currentSession) {
      // Mark current position as completed
      const updatedPositions = currentSession.positions.map(pos => 
        pos.position.id === currentPosition.id 
          ? { ...pos, completed: true, endTime: new Date() }
          : pos
      );
      
      setCurrentSession(prev => prev ? {
        ...prev,
        positions: updatedPositions
      } : null);
    }
    
    setCurrentPosition(null);
    setTimeRemaining(0);
  }, [currentPosition, currentSession]);

  const addPositionToSession = useCallback((position: SexPosition) => {
    if (!currentSession) return;

    const randomTime = generateRandomTime(position);
    const newSessionPosition: SessionPosition = {
      position,
      startTime: new Date(),
      duration: 0,
      completed: false
    };

    const updatedSession = {
      ...currentSession,
      positions: [...currentSession.positions, newSessionPosition]
    };

    setCurrentSession(updatedSession);
    setCurrentPosition(position);
    setTimeRemaining(randomTime);
    setIsPaused(false);
    
    startTimer();
  }, [currentSession, generateRandomTime, startTimer]);

  const removePosition = useCallback((positionId: string) => {
    if (!currentSession) return;

    const updatedPositions = currentSession.positions.filter(
      pos => pos.position.id !== positionId
    );

    setCurrentSession(prev => prev ? {
      ...prev,
      positions: updatedPositions
    } : null);
  }, [currentSession]);

  const ratePosition = useCallback((positionId: string, rating: number) => {
    if (!currentSession) return;

    const updatedPositions = currentSession.positions.map(pos =>
      pos.position.id === positionId ? { ...pos, rating } : pos
    );

    setCurrentSession(prev => prev ? {
      ...prev,
      positions: updatedPositions
    } : null);
  }, [currentSession]);

  const addNotesToPosition = useCallback((positionId: string, notes: string) => {
    if (!currentSession) return;

    const updatedPositions = currentSession.positions.map(pos =>
      pos.position.id === positionId ? { ...pos, notes } : pos
    );

    setCurrentSession(prev => prev ? {
      ...prev,
      positions: updatedPositions
    } : null);
  }, [currentSession]);

  const addClimax = useCallback(() => {
    if (!currentSession) return;

    setCurrentSession(prev => prev ? {
      ...prev,
      climaxCount: prev.climaxCount + 1
    } : null);
  }, [currentSession]);

  const addBreak = useCallback(() => {
    if (!currentSession) return;

    setCurrentSession(prev => prev ? {
      ...prev,
      breakCount: prev.breakCount + 1
    } : null);
  }, [currentSession]);

  const adjustTime = useCallback((seconds: number) => {
    setTimeRemaining(prev => Math.max(0, prev + seconds));
  }, []);

  const resetTimer = useCallback(() => {
    if (currentPosition) {
      const randomTime = generateRandomTime(currentPosition);
      setTimeRemaining(randomTime);
      setIsPaused(false);
    }
  }, [currentPosition, generateRandomTime]);

  const getSessionStats = useCallback(() => {
    if (!currentSession) return null;

    const completedPositions = currentSession.positions.filter(p => p.completed);
    const totalDuration = currentSession.positions.reduce((sum, pos) => sum + pos.duration, 0);
    const averageRating = completedPositions.length > 0 
      ? completedPositions.reduce((sum, pos) => sum + (pos.rating || 0), 0) / completedPositions.length
      : 0;

    return {
      totalPositions: currentSession.positions.length,
      completedPositions: completedPositions.length,
      totalDuration,
      averageRating,
      climaxCount: currentSession.climaxCount,
      breakCount: currentSession.breakCount
    };
  }, [currentSession]);

  return {
    // State
    currentSession,
    isActive,
    currentPosition,
    timeRemaining,
    isPaused,
    settings,
    
    // Actions
    startNewSession,
    endSession,
    pauseSession,
    resumeSession,
    addPositionToSession,
    removePosition,
    ratePosition,
    addNotesToPosition,
    addClimax,
    addBreak,
    adjustTime,
    resetTimer,
    
    // Utils
    getSessionStats
  };
};
