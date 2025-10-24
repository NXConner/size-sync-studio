import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, Play, Pause, RotateCcw, Plus, Minus } from 'lucide-react';
import { SexPosition } from '../types';

interface GameTimerProps {
  position: SexPosition;
  isActive: boolean;
  onTimeUp: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onAddTime: (seconds: number) => void;
  onSubtractTime: (seconds: number) => void;
}

export const GameTimer: React.FC<GameTimerProps> = ({
  position,
  isActive,
  onTimeUp,
  onPause,
  onResume,
  onReset,
  onAddTime,
  onSubtractTime
}) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [totalTime, setTotalTime] = useState<number>(0);

  // Initialize timer with random time within position's duration range
  useEffect(() => {
    if (!isActive && timeRemaining === 0) {
      const minTime = position.duration.min;
      const maxTime = position.duration.max;
      const randomTime = Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;
      setTimeRemaining(randomTime);
      setTotalTime(randomTime);
    }
  }, [isActive, position.duration, timeRemaining]);

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && !isPaused && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            onTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, timeRemaining, onTimeUp]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePause = useCallback(() => {
    if (isPaused) {
      setIsPaused(false);
      onResume();
    } else {
      setIsPaused(true);
      onPause();
    }
  }, [isPaused, onPause, onResume]);

  const handleReset = useCallback(() => {
    const minTime = position.duration.min;
    const maxTime = position.duration.max;
    const randomTime = Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;
    setTimeRemaining(randomTime);
    setTotalTime(randomTime);
    setIsPaused(false);
    onReset();
  }, [position.duration, onReset]);

  const handleAddTime = useCallback((seconds: number) => {
    setTimeRemaining(prev => prev + seconds);
    setTotalTime(prev => prev + seconds);
    onAddTime(seconds);
  }, [onAddTime]);

  const handleSubtractTime = useCallback((seconds: number) => {
    setTimeRemaining(prev => Math.max(0, prev - seconds));
    onSubtractTime(seconds);
  }, [onSubtractTime]);

  const progress = totalTime > 0 ? ((totalTime - timeRemaining) / totalTime) * 100 : 0;

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Clock className="h-6 w-6" />
          Position Timer
        </CardTitle>
        <CardDescription>
          {position.name} - {position.difficulty} difficulty
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Time Display */}
        <div className="text-center">
          <div className={`text-6xl font-bold mb-2 ${
            timeRemaining <= 60 ? 'text-red-500' : 
            timeRemaining <= 300 ? 'text-yellow-500' : 'text-primary'
          }`}>
            {formatTime(timeRemaining)}
          </div>
          <div className="text-sm text-muted-foreground">
            {isPaused ? 'Paused' : isActive ? 'Time Remaining' : 'Ready to Start'}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Control Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={handlePause}
            disabled={!isActive || timeRemaining === 0}
            variant={isPaused ? "default" : "outline"}
            className="flex items-center gap-2"
          >
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
          
          <Button
            onClick={handleReset}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>

        {/* Time Adjustment */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-center">Adjust Time</div>
          <div className="flex gap-2">
            <Button
              onClick={() => handleAddTime(60)}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-1" />
              +1 min
            </Button>
            <Button
              onClick={() => handleAddTime(300)}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-1" />
              +5 min
            </Button>
            <Button
              onClick={() => handleSubtractTime(60)}
              variant="outline"
              size="sm"
              className="flex-1"
              disabled={timeRemaining <= 60}
            >
              <Minus className="h-4 w-4 mr-1" />
              -1 min
            </Button>
            <Button
              onClick={() => handleSubtractTime(300)}
              variant="outline"
              size="sm"
              className="flex-1"
              disabled={timeRemaining <= 300}
            >
              <Minus className="h-4 w-4 mr-1" />
              -5 min
            </Button>
          </div>
        </div>

        {/* Status Messages */}
        {timeRemaining === 0 && isActive && (
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-lg font-semibold text-green-800">
              Time's Up! 🎉
            </div>
            <div className="text-sm text-green-600">
              Great job! Ready for the next position?
            </div>
          </div>
        )}

        {timeRemaining <= 60 && timeRemaining > 0 && (
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-sm font-medium text-yellow-800">
              ⏰ Final minute! Make it count!
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
