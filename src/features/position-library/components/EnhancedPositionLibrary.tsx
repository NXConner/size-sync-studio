import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Shuffle, 
  Heart, 
  Star, 
  Clock,
  Camera,
  Video,
  Image as ImageIcon,
  Sparkles,
  Zap,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Upload,
  Eye,
  Bookmark,
  Share2,
  Download,
  List,
  Grid
} from 'lucide-react';
import { AnimatedPositionCard } from './AnimatedPositionCard';
import { MediaGallery } from './MediaGallery';
import { MediaUploadModal } from './MediaUploadModal';
import { AnimationEffects, SparkleEffect, HeartEffect } from './AnimationEffects';
import { SexPosition, PositionCategory, Difficulty } from '../types';
import { sexPositions } from '../data/positions';
import { useGameSession } from '../hooks/useGameSession';
import { cn } from '@/lib/utils';

export const EnhancedPositionLibrary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PositionCategory | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>('all');
  const [selectedPosition, setSelectedPosition] = useState<SexPosition | null>(null);
  const [activeTab, setActiveTab] = useState<'library' | 'game' | 'session' | 'media'>('library');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);

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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

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

  // Handle favorites
  const toggleFavorite = (position: SexPosition) => {
    setFavorites(prev => 
      prev.includes(position.id) 
        ? prev.filter(id => id !== position.id)
        : [...prev, position.id]
    );
  };

  // Handle bookmarks
  const toggleBookmark = (position: SexPosition) => {
    setBookmarks(prev => 
      prev.includes(position.id) 
        ? prev.filter(id => id !== position.id)
        : [...prev, position.id]
    );
  };

  // Handle media upload
  const handleMediaUpload = (media: any[]) => {
    console.log('Uploaded media:', media);
    setShowMediaUpload(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card shadow-sm border-b sticky top-0 z-10"
      >
        <div className="container mx-auto py-6 px-4 max-w-7xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                <Heart className="inline h-10 w-10 text-primary mr-3" />
                Enhanced Position Library
              </h1>
              <p className="text-muted-foreground mt-1">
                Discover, learn, and share intimate positions with animations and media
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAnimationsEnabled(!animationsEnabled)}
                className={cn(
                  "transition-colors",
                  animationsEnabled ? "bg-pink-100 text-pink-700" : ""
                )}
              >
                <Sparkles className="w-4 h-4 mr-1" />
                {animationsEnabled ? 'Animations On' : 'Animations Off'}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
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
            <TabsTrigger value="media" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Media
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

                  <div className="flex space-x-2">
                    <Button onClick={() => setSelectedPosition(getRandomPosition())} variant="outline">
                      <Shuffle className="h-4 w-4 mr-2" />
                      Random
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    >
                      {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Position Grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={cn(
                viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              )}
            >
              <AnimatePresence>
                {filteredPositions.map((position, index) => (
                  <motion.div
                    key={position.id}
                    variants={animationsEnabled ? itemVariants : {}}
                    layout
                    className={cn(
                      viewMode === 'list' && "max-w-4xl mx-auto"
                    )}
                  >
                    <AnimationEffects
                      effect={animationsEnabled ? "sparkles" : "none"}
                      intensity="low"
                    >
                      <AnimatedPositionCard
                        position={position}
                        onSelect={setSelectedPosition}
                        onFavorite={toggleFavorite}
                        onBookmark={toggleBookmark}
                        isFavorite={favorites.includes(position.id)}
                        isBookmarked={bookmarks.includes(position.id)}
                        showMedia={true}
                        autoPlay={false}
                      />
                    </AnimationEffects>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Position Details */}
            {selectedPosition && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {selectedPosition.name}
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleFavorite(selectedPosition)}
                        >
                          <Heart className={cn(
                            "w-4 h-4",
                            favorites.includes(selectedPosition.id) && "fill-current text-red-500"
                          )} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleBookmark(selectedPosition)}
                        >
                          <Bookmark className={cn(
                            "w-4 h-4",
                            bookmarks.includes(selectedPosition.id) && "fill-current text-blue-500"
                          )} />
                        </Button>
                      </div>
                    </CardTitle>
                    <CardDescription>{selectedPosition.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Media Gallery */}
                    {selectedPosition.media && selectedPosition.media.length > 0 && (
                      <div className="mb-6">
                        <MediaGallery
                          media={selectedPosition.media}
                          positionName={selectedPosition.name}
                          showControls={true}
                          autoPlay={false}
                          className="mb-4"
                        />
                      </div>
                    )}

                    {/* Position Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-2">Instructions</h4>
                        <ol className="list-decimal list-inside space-y-1 text-sm">
                          {selectedPosition.instructions.map((instruction, index) => (
                            <li key={index}>{instruction}</li>
                          ))}
                        </ol>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Tips</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {selectedPosition.tips.map((tip, index) => (
                            <li key={index}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedPosition.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2 mt-6">
                      <Button
                        onClick={() => addPositionToSession(selectedPosition)}
                        className="bg-pink-500 hover:bg-pink-600"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Add to Session
                      </Button>
                      <Button variant="outline">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                      <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>

          {/* Game Tab */}
          <TabsContent value="game" className="space-y-6">
            {!isActive ? (
              <SparkleEffect>
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
              </SparkleEffect>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Current Position Timer */}
                {currentPosition && (
                  <HeartEffect>
                    <Card>
                      <CardHeader>
                        <CardTitle>Current Position</CardTitle>
                        <CardDescription>{currentPosition.name}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <div className="text-4xl font-bold text-pink-600 mb-4">
                            {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                          </div>
                          <div className="flex justify-center space-x-2">
                            <Button onClick={pauseSession} disabled={isPaused}>
                              <Pause className="w-4 h-4 mr-2" />
                              Pause
                            </Button>
                            <Button onClick={resumeSession} disabled={!isPaused}>
                              <Play className="w-4 h-4 mr-2" />
                              Resume
                            </Button>
                            <Button onClick={resetTimer} variant="outline">
                              <Clock className="w-4 h-4 mr-2" />
                              Reset
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </HeartEffect>
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
              <Card>
                <CardHeader>
                  <CardTitle>Current Session</CardTitle>
                  <CardDescription>
                    Track your progress and performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-pink-600">{currentSession.positions.length}</div>
                      <div className="text-sm text-muted-foreground">Positions Tried</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{currentSession.climaxCount}</div>
                      <div className="text-sm text-muted-foreground">Climaxes</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{currentSession.breakCount}</div>
                      <div className="text-sm text-muted-foreground">Breaks</div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold">Session Positions</h4>
                    <div className="space-y-2">
                      {currentSession.positions.map((sessionPosition, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <div className="font-medium">{sessionPosition.position.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {Math.floor(sessionPosition.duration / 60)}:{(sessionPosition.duration % 60).toString().padStart(2, '0')}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {sessionPosition.rating && (
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={cn(
                                      "w-4 h-4",
                                      i < sessionPosition.rating! ? "text-yellow-500 fill-current" : "text-gray-300"
                                    )}
                                  />
                                ))}
                              </div>
                            )}
                            <Badge variant={sessionPosition.completed ? "default" : "secondary"}>
                              {sessionPosition.completed ? "Completed" : "In Progress"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
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

          {/* Media Tab */}
          <TabsContent value="media" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Personal Media Library
                </CardTitle>
                <CardDescription>
                  Upload and manage your personal pictures and GIFs for positions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Your Personal Media
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Upload your own pictures and GIFs to personalize positions
                  </p>
                  <Button
                    onClick={() => setShowMediaUpload(true)}
                    className="bg-pink-500 hover:bg-pink-600"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Media
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Media Upload Modal */}
      <MediaUploadModal
        positionId={selectedPosition?.id || ''}
        positionName={selectedPosition?.name || ''}
        onUpload={handleMediaUpload}
        isOpen={showMediaUpload}
        onClose={() => setShowMediaUpload(false)}
      />
    </div>
  );
};