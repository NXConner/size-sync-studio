import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Trophy, 
  Star, 
  Target, 
  TrendingUp, 
  Search, 
  Filter,
  Award,
  Crown,
  Zap,
  Heart,
  Shield,
  BookOpen
} from 'lucide-react';
import { AchievementCard } from './AchievementCard';
import { useAchievements } from '../hooks/useAchievements';
import { Achievement, AchievementCategory, AchievementRarity } from '../types';

interface AchievementDashboardProps {
  userId: string;
}

export const AchievementDashboard: React.FC<AchievementDashboardProps> = ({ userId }) => {
  const {
    userAchievements,
    notifications,
    isLoading,
    getAchievementStats,
    markNotificationAsRead,
    clearAllNotifications,
    getAchievementsByCategory,
    getAchievementsByRarity,
    getUnlockedAchievements,
    getLockedAchievements,
    getAchievementsInProgress,
    getSecretAchievements
  } = useAchievements(userId);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');
  const [selectedRarity, setSelectedRarity] = useState<AchievementRarity | 'all'>('all');
  const [selectedTab, setSelectedTab] = useState<'all' | 'unlocked' | 'locked' | 'progress' | 'secret'>('all');

  const stats = getAchievementStats();

  // Filter achievements based on current filters
  const getFilteredAchievements = (): Achievement[] => {
    if (!userAchievements) return [];

    let filtered = userAchievements.achievements;

    // Apply tab filter
    switch (selectedTab) {
      case 'unlocked':
        filtered = getUnlockedAchievements();
        break;
      case 'locked':
        filtered = getLockedAchievements();
        break;
      case 'progress':
        filtered = getAchievementsInProgress();
        break;
      case 'secret':
        filtered = getSecretAchievements();
        break;
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(a => a.category === selectedCategory);
    }

    // Apply rarity filter
    if (selectedRarity !== 'all') {
      filtered = filtered.filter(a => a.rarity === selectedRarity);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(a => 
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return filtered;
  };

  const filteredAchievements = getFilteredAchievements();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading achievements...</p>
        </div>
      </div>
    );
  }

  if (!userAchievements || !stats) {
    return (
      <div className="text-center py-8">
        <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Achievements Found</h3>
        <p className="text-muted-foreground">Start completing positions to unlock achievements!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.unlockedAchievements}</div>
            <div className="text-sm text-muted-foreground">Unlocked</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.totalPoints}</div>
            <div className="text-sm text-muted-foreground">Total Points</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Crown className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">Level {stats.level}</div>
            <div className="text-sm text-muted-foreground">Current Level</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{Math.round(stats.completionRate)}%</div>
            <div className="text-sm text-muted-foreground">Completion</div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Level Progress
          </CardTitle>
          <CardDescription>
            {stats.experience} / 100 XP to next level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={(stats.experience / 100) * 100} className="h-3" />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>Level {stats.level}</span>
            <span>Level {stats.nextLevel}</span>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      {notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Recent Unlocks
              </span>
              <Button variant="outline" size="sm" onClick={clearAllNotifications}>
                Clear All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {notifications.slice(0, 3).map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{notification.achievement.icon}</div>
                    <div>
                      <div className="font-medium">{notification.achievement.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {notification.achievement.description}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-yellow-100 text-yellow-800">
                      +{notification.achievement.points} points
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search achievements..."
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
                <SelectItem value="position_master">Position Master</SelectItem>
                <SelectItem value="endurance">Endurance</SelectItem>
                <SelectItem value="variety">Variety</SelectItem>
                <SelectItem value="streak">Streak</SelectItem>
                <SelectItem value="time">Time</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="social">Social</SelectItem>
                <SelectItem value="exploration">Exploration</SelectItem>
                <SelectItem value="wellness">Wellness</SelectItem>
                <SelectItem value="special">Special</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedRarity} onValueChange={(value) => setSelectedRarity(value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Rarity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rarities</SelectItem>
                <SelectItem value="common">Common</SelectItem>
                <SelectItem value="uncommon">Uncommon</SelectItem>
                <SelectItem value="rare">Rare</SelectItem>
                <SelectItem value="epic">Epic</SelectItem>
                <SelectItem value="legendary">Legendary</SelectItem>
                <SelectItem value="mythic">Mythic</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedRarity('all');
              setSelectedTab('all');
            }}>
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Achievement Tabs */}
      <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as any)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            All
          </TabsTrigger>
          <TabsTrigger value="unlocked" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Unlocked
          </TabsTrigger>
          <TabsTrigger value="locked" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Locked
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            In Progress
          </TabsTrigger>
          <TabsTrigger value="secret" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Secret
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                showProgress={true}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="unlocked" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                showProgress={false}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="locked" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                showProgress={true}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                showProgress={true}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="secret" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                showProgress={false}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Empty State */}
      {filteredAchievements.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Achievements Found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters or start completing positions to unlock achievements!
            </p>
            <Button onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedRarity('all');
              setSelectedTab('all');
            }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
