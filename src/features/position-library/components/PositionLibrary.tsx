import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Shuffle, Heart, Star, Clock } from 'lucide-react';
import { PositionCard } from './PositionCard';
import { PositionDetails } from './PositionDetails';
import { GameTimer } from './GameTimer';
import { GameSession } from './GameSession';
import { SexPosition, PositionCategory, Difficulty } from '../types';
import { sexPositions } from '../data/positions';
import { useGameSession } from '../hooks/useGameSession';

export const PositionLibrary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PositionCategory | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>('all');
  const [selectedPosition, setSelectedPosition] = useState<SexPosition | null>(null);
  const [activeTab, setActiveTab] = useState<'library' | 'game' | 'session'>('library');

  const {
    currentSession,
    isActive,
    currentPosition,
    timeRemaining,
    isPaused,
    startNewSession,
    endSession,
    pauseSession,
    resumeSession,
    addPositionToSession,
    ratePosition,
    addNotesToPosition,
    addClimax,
    addBreak,
    adjustTime,
    resetTimer
  } = useGameSession();

  // Filter positions based on search and filters
  const filteredPositions = useMemo(() => {
    return sexPositions.filter(position => {
      const matchesSearch = position.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           position.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           position.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || position.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || position.difficulty === selectedDifficulty;
      
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [searchTerm, selectedCategory, selectedDifficulty]);

  // Get random position
  const getRandomPosition = () => {
    const randomIndex = Math.floor(Math.random() * filteredPositions.length);
    return filteredPositions[randomIndex];
  };

  // Get unique categories and difficulties for filters
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(sexPositions.map(p => p.category))];
    return uniqueCategories.sort();
  }, []);

  const difficulties = useMemo(() => {
    const uniqueDifficulties = [...new Set(sexPositions.map(p => p.difficulty))];
    return uniqueDifficulties.sort();
  }, []);

  const handleStartGame = () => {
    startNewSession();
    setActiveTab('game');
  };

  const handleAddRandomPosition = () => {
    const randomPosition = getRandomPosition();
    if (randomPosition) {
      addPositionToSession(randomPosition);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-center mb-4">
          <Heart className="inline h-10 w-10 text-primary mr-3" />
          Sex Position Library
        </h1>
        <p className="text-center text-muted-foreground text-lg">
          Discover, learn, and play with an exhaustive collection of intimate positions
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="library" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Library
          </TabsTrigger>
          <TabsTrigger value="game" className="flex items-center gap-2">
            <Shuffle className="h-4 w-4" />
            Random Game
          </TabsTrigger>
          <TabsTrigger value="session" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Session
          </TabsTrigger>
        </TabsList>

        {/* Library Tab */}
        <TabsContent value="library" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search positions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedDifficulty} onValueChange={(value) => setSelectedDifficulty(value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    {difficulties.map(difficulty => (
                      <SelectItem key={difficulty} value={difficulty}>
                        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button onClick={() => setSelectedPosition(getRandomPosition())} variant="outline">
                  <Shuffle className="h-4 w-4 mr-2" />
                  Random Position
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Position Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPositions.map((position) => (
              <PositionCard
                key={position.id}
                position={position}
                isActive={selectedPosition?.id === position.id}
                onSelect={setSelectedPosition}
              />
            ))}
          </div>

          {/* Position Details */}
          {selectedPosition && (
            <PositionDetails
              position={selectedPosition}
              onStartTimer={() => addPositionToSession(selectedPosition)}
              onAddToSession={() => addPositionToSession(selectedPosition)}
              isActive={currentPosition?.id === selectedPosition.id}
              timeRemaining={currentPosition?.id === selectedPosition.id ? timeRemaining : 0}
            />
          )}
        </TabsContent>

        {/* Game Tab */}
        <TabsContent value="game" className="space-y-6">
          {!isActive ? (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Shuffle className="h-6 w-6" />
                  Random Position Game
                </CardTitle>
                <CardDescription>
                  Challenge yourself with random positions and timers. See how many positions you can try!
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-muted rounded-lg">
                    <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="font-semibold">Random Timers</div>
                    <div className="text-sm text-muted-foreground">Each position gets a random time limit</div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <div className="font-semibold">Track Progress</div>
                    <div className="text-sm text-muted-foreground">Rate and note each position</div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <div className="font-semibold">Have Fun</div>
                    <div className="text-sm text-muted-foreground">Explore and enjoy together</div>
                  </div>
                </div>
                
                <Button onClick={handleStartGame} size="lg" className="w-full md:w-auto">
                  <Shuffle className="h-5 w-5 mr-2" />
                  Start New Game
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current Position Timer */}
              {currentPosition && (
                <GameTimer
                  position={currentPosition}
                  isActive={isActive}
                  onTimeUp={() => {
                    // Timer finished, show next position option
                  }}
                  onPause={pauseSession}
                  onResume={resumeSession}
                  onReset={resetTimer}
                  onAddTime={(seconds) => adjustTime(seconds)}
                  onSubtractTime={(seconds) => adjustTime(-seconds)}
                />
              )}

              {/* Game Controls */}
              <Card>
                <CardHeader>
                  <CardTitle>Game Controls</CardTitle>
                  <CardDescription>
                    Manage your position game session
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Button onClick={handleAddRandomPosition} className="w-full">
                      <Shuffle className="h-4 w-4 mr-2" />
                      Random Position
                    </Button>
                    <Button onClick={() => setActiveTab('session')} variant="outline" className="w-full">
                      <Clock className="h-4 w-4 mr-2" />
                      View Session
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button onClick={addClimax} variant="outline" className="w-full">
                      <Heart className="h-4 w-4 mr-2" />
                      Add Climax
                    </Button>
                    <Button onClick={addBreak} variant="outline" className="w-full">
                      <Clock className="h-4 w-4 mr-2" />
                      Take Break
                    </Button>
                  </div>
                  
                  <Button onClick={endSession} variant="destructive" className="w-full">
                    End Session
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Session Tab */}
        <TabsContent value="session" className="space-y-6">
          {currentSession ? (
            <GameSession
              session={currentSession}
              onEndSession={endSession}
              onPauseSession={pauseSession}
              onResumeSession={resumeSession}
              onAddPosition={addPositionToSession}
              onRatePosition={ratePosition}
              onAddNotes={addNotesToPosition}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Active Session</h3>
                <p className="text-muted-foreground mb-4">
                  Start a new game session to begin tracking your positions
                </p>
                <Button onClick={() => setActiveTab('game')}>
                  <Shuffle className="h-4 w-4 mr-2" />
                  Start Game
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
