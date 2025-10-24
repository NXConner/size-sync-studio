import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Play, Pause, Square, RotateCcw, Trophy, Heart, Star } from 'lucide-react';
import { SexPosition, GameSession as GameSessionType, SessionPosition } from '../types';

interface GameSessionProps {
  session: GameSessionType;
  onEndSession: () => void;
  onPauseSession: () => void;
  onResumeSession: () => void;
  onAddPosition: (position: SexPosition) => void;
  onRatePosition: (positionId: string, rating: number) => void;
  onAddNotes: (positionId: string, notes: string) => void;
}

export const GameSession: React.FC<GameSessionProps> = ({
  session,
  onEndSession,
  onPauseSession,
  onResumeSession,
  onAddPosition,
  onRatePosition,
  onAddNotes
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused) {
        setCurrentTime(new Date());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getSessionDuration = () => {
    const endTime = session.endTime || currentTime;
    return Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000);
  };

  const getCompletedPositions = () => {
    return session.positions.filter(p => p.completed).length;
  };

  const getAverageRating = () => {
    const ratedPositions = session.positions.filter(p => p.rating);
    if (ratedPositions.length === 0) return 0;
    const totalRating = ratedPositions.reduce((sum, p) => sum + (p.rating || 0), 0);
    return (totalRating / ratedPositions.length).toFixed(1);
  };

  const handlePauseToggle = () => {
    if (isPaused) {
      setIsPaused(false);
      onResumeSession();
    } else {
      setIsPaused(true);
      onPauseSession();
    }
  };

  return (
    <div className="space-y-6">
      {/* Session Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-6 w-6 text-primary" />
                Game Session
              </CardTitle>
              <CardDescription>
                Started {session.startTime.toLocaleTimeString()}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isPaused ? "secondary" : "default"}>
                {isPaused ? "Paused" : "Active"}
              </Badge>
              <Button
                onClick={handlePauseToggle}
                variant="outline"
                size="sm"
              >
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                {isPaused ? "Resume" : "Pause"}
              </Button>
              <Button
                onClick={onEndSession}
                variant="destructive"
                size="sm"
              >
                <Square className="h-4 w-4" />
                End Session
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Session Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{formatDuration(getSessionDuration())}</div>
            <div className="text-sm text-muted-foreground">Total Time</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{getCompletedPositions()}</div>
            <div className="text-sm text-muted-foreground">Positions Completed</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{getAverageRating()}</div>
            <div className="text-sm text-muted-foreground">Average Rating</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{session.climaxCount}</div>
            <div className="text-sm text-muted-foreground">Climaxes</div>
          </CardContent>
        </Card>
      </div>

      {/* Position History */}
      <Card>
        <CardHeader>
          <CardTitle>Position History</CardTitle>
          <CardDescription>
            Track your progress through different positions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {session.positions.map((position, index) => (
              <div key={position.position.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{position.position.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {position.position.category} • {position.position.difficulty}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {position.completed && (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Completed
                      </Badge>
                    )}
                    {position.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">{position.rating}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Duration</div>
                    <div className="font-medium">{formatDuration(position.duration)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Started</div>
                    <div className="font-medium">{position.startTime.toLocaleTimeString()}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Ended</div>
                    <div className="font-medium">
                      {position.endTime ? position.endTime.toLocaleTimeString() : 'In Progress'}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Progress</div>
                    <div className="font-medium">
                      {position.completed ? '100%' : 'In Progress'}
                    </div>
                  </div>
                </div>

                {position.notes && (
                  <div className="mt-3 p-3 bg-muted rounded-lg">
                    <div className="text-sm font-medium mb-1">Notes:</div>
                    <div className="text-sm text-muted-foreground">{position.notes}</div>
                  </div>
                )}

                {/* Rating and Notes Controls */}
                {position.completed && (
                  <div className="mt-3 flex gap-2">
                    <div className="flex items-center gap-1">
                      <span className="text-sm">Rate:</span>
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <Button
                          key={rating}
                          variant={position.rating === rating ? "default" : "outline"}
                          size="sm"
                          onClick={() => onRatePosition(position.position.id, rating)}
                          className="h-8 w-8 p-0"
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {session.positions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <div>No positions added yet</div>
                <div className="text-sm">Start by selecting a position to begin your session</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Session Summary */}
      {session.positions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Session Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {session.positions.length}
                </div>
                <div className="text-sm text-muted-foreground">Total Positions</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {getCompletedPositions()}
                </div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {session.positions.length - getCompletedPositions()}
                </div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
