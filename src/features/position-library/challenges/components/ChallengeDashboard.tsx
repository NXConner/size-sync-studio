import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Trophy, 
  Target, 
  Clock, 
  Star, 
  Users, 
  TrendingUp, 
  Award, 
  Zap,
  Play,
  Pause,
  Square,
  CheckCircle,
  AlertCircle,
  Calendar,
  BarChart3,
  Crown,
  Medal,
  Flame,
  BookOpen,
  Settings,
  Bell,
  Eye,
  Plus,
  Filter,
  Search
} from 'lucide-react';
import { useChallenges } from '../hooks/useChallenges';
import { ChallengeType, ChallengeCategory, ChallengeDifficulty } from '../types';

interface ChallengeDashboardProps {
  userId: string;
}

export const ChallengeDashboard: React.FC<ChallengeDashboardProps> = ({ userId }) => {
  const {
    challenges,
    userChallenges,
    templates,
    notifications,
    settings,
    stats,
    insights,
    isLoading,
    startChallenge,
    updateChallengeProgress,
    pauseChallenge,
    resumeChallenge,
    cancelChallenge,
    getChallengeTemplates,
    getChallengeLeaderboard,
    getChallengeStats,
    getChallengeInsights,
    markNotificationAsRead,
    updateSettings,
    getAvailableChallenges,
    getActiveChallenges,
    getCompletedChallenges,
    getChallengeRecommendations
  } = useChallenges(userId);

  const [activeTab, setActiveTab] = useState<'overview' | 'active' | 'available' | 'completed' | 'leaderboard' | 'insights' | 'settings'>('overview');
  const [selectedCategory, setSelectedCategory] = useState<ChallengeCategory | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<ChallengeDifficulty | 'all'>('all');
  const [selectedType, setSelectedType] = useState<ChallengeType | 'all'>('all');

  const challengeStats = getChallengeStats();
  const challengeInsights = getChallengeInsights();
  const availableChallenges = getAvailableChallenges();
  const activeChallenges = getActiveChallenges();
  const completedChallenges = getCompletedChallenges();
  const recommendations = getChallengeRecommendations();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading challenges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Challenges</h2>
          <p className="text-muted-foreground">
            Push yourself and achieve new goals
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Notifications ({notifications.filter(n => !n.isRead).length})
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{challengeStats.completedChallenges}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{challengeStats.activeChallenges}</div>
            <div className="text-sm text-muted-foreground">Active</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{challengeStats.totalScore}</div>
            <div className="text-sm text-muted-foreground">Total Score</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Flame className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{challengeStats.currentStreak}</div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Active
          </TabsTrigger>
          <TabsTrigger value="available" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Available
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Completed
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Success Rate</span>
                    <span>{challengeStats.successRate}%</span>
                  </div>
                  <Progress value={challengeStats.successRate} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Average Score</span>
                    <span>{challengeStats.averageScore.toFixed(1)}</span>
                  </div>
                  <Progress value={challengeStats.averageScore} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Improvement Rate</span>
                    <span>{challengeStats.improvementRate}%</span>
                  </div>
                  <Progress value={challengeStats.improvementRate} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-yellow-500" />
                    <div>
                      <div className="font-medium">Challenge Master</div>
                      <div className="text-sm text-muted-foreground">Completed 5 challenges</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Flame className="h-5 w-5 text-red-500" />
                    <div>
                      <div className="font-medium">Streak Master</div>
                      <div className="text-sm text-muted-foreground">7-day challenge streak</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-purple-500" />
                    <div>
                      <div className="font-medium">High Scorer</div>
                      <div className="text-sm text-muted-foreground">Achieved 90+ score</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recommended Challenges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.map((challenge) => (
                  <Card key={challenge.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{challenge.type}</Badge>
                        <Badge className={challenge.difficulty === 'beginner' ? 'bg-green-100 text-green-800' : 
                                       challenge.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                       challenge.difficulty === 'advanced' ? 'bg-orange-100 text-orange-800' :
                                       'bg-red-100 text-red-800'}>
                          {challenge.difficulty}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{challenge.name}</CardTitle>
                      <CardDescription>{challenge.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Duration:</span>
                          <span>{challenge.duration.description}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Participants:</span>
                          <span>{challenge.participants}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Success Rate:</span>
                          <span>{challenge.successRate}%</span>
                        </div>
                        <Button 
                          className="w-full mt-3"
                          onClick={() => startChallenge(challenge.id)}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Start Challenge
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Challenges Tab */}
        <TabsContent value="active" className="space-y-4">
          <div className="space-y-4">
            {activeChallenges.map((userChallenge) => {
              const challenge = challenges.find(c => c.id === userChallenge.challengeId);
              if (!challenge) return null;

              return (
                <Card key={userChallenge.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{challenge.name}</CardTitle>
                        <CardDescription>{challenge.description}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{challenge.type}</Badge>
                        <Badge className={challenge.difficulty === 'beginner' ? 'bg-green-100 text-green-800' : 
                                       challenge.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                       challenge.difficulty === 'advanced' ? 'bg-orange-100 text-orange-800' :
                                       'bg-red-100 text-red-800'}>
                          {challenge.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{Math.round(userChallenge.progress)}%</span>
                      </div>
                      <Progress value={userChallenge.progress} className="h-3" />
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Requirements:</h4>
                      {userChallenge.requirements.map((req) => (
                        <div key={req.requirementId} className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            {req.isCompleted ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                            )}
                            <span className={req.isCompleted ? 'text-green-600' : ''}>
                              {req.current}/{req.target}
                            </span>
                          </span>
                          <span className="text-muted-foreground">
                            {Math.round(req.progress)}%
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => pauseChallenge(userChallenge.challengeId)}
                      >
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => cancelChallenge(userChallenge.challengeId)}
                      >
                        <Square className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        className="ml-auto"
                        onClick={() => updateChallengeProgress(userChallenge.challengeId, 'req-1', 1)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Update Progress
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {activeChallenges.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Active Challenges</h3>
                  <p className="text-muted-foreground mb-4">
                    Start a challenge to begin your journey
                  </p>
                  <Button onClick={() => setActiveTab('available')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Browse Challenges
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Available Challenges Tab */}
        <TabsContent value="available" className="space-y-4">
          <div className="flex items-center gap-4">
            <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as any)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="missionary">Missionary</SelectItem>
                <SelectItem value="cowgirl">Cowgirl</SelectItem>
                <SelectItem value="doggy">Doggy</SelectItem>
                <SelectItem value="standing">Standing</SelectItem>
                <SelectItem value="oral">Oral</SelectItem>
                <SelectItem value="tantric">Tantric</SelectItem>
                <SelectItem value="wellness">Wellness</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedDifficulty} onValueChange={(value) => setSelectedDifficulty(value as any)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={(value) => setSelectedType(value as any)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="special">Special</SelectItem>
                <SelectItem value="partner">Partner</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableChallenges.map((challenge) => (
              <Card key={challenge.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{challenge.type}</Badge>
                    <Badge className={challenge.difficulty === 'beginner' ? 'bg-green-100 text-green-800' : 
                                   challenge.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                   challenge.difficulty === 'advanced' ? 'bg-orange-100 text-orange-800' :
                                   'bg-red-100 text-red-800'}>
                      {challenge.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{challenge.name}</CardTitle>
                  <CardDescription>{challenge.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Duration:</span>
                      <span>{challenge.duration.description}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Participants:</span>
                      <span>{challenge.participants}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Success Rate:</span>
                      <span>{challenge.successRate}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Ends:</span>
                      <span>{challenge.endDate.toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Requirements:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {challenge.requirements.map((req) => (
                        <li key={req.id} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                          {req.description}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button 
                    className="w-full"
                    onClick={() => startChallenge(challenge.id)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Challenge
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Completed Challenges Tab */}
        <TabsContent value="completed" className="space-y-4">
          <div className="space-y-4">
            {completedChallenges.map((userChallenge) => {
              const challenge = challenges.find(c => c.id === userChallenge.challengeId);
              if (!challenge) return null;

              return (
                <Card key={userChallenge.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{challenge.name}</CardTitle>
                        <CardDescription>{challenge.description}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                        <Badge variant="outline">{challenge.type}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{userChallenge.score}</div>
                        <div className="text-sm text-muted-foreground">Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{Math.round(userChallenge.progress)}%</div>
                        <div className="text-sm text-muted-foreground">Progress</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {userChallenge.completedAt ? 
                            Math.ceil((userChallenge.completedAt.getTime() - userChallenge.startedAt.getTime()) / (1000 * 60 * 60 * 24)) : 
                            0
                          }
                        </div>
                        <div className="text-sm text-muted-foreground">Days</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{userChallenge.rewards.length}</div>
                        <div className="text-sm text-muted-foreground">Rewards</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Rewards Earned:</h4>
                      <div className="flex flex-wrap gap-2">
                        {userChallenge.rewards.map((reward) => (
                          <Badge key={reward.id} variant="outline" className="flex items-center gap-1">
                            <Award className="h-3 w-3" />
                            {reward.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {completedChallenges.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Completed Challenges</h3>
                  <p className="text-muted-foreground mb-4">
                    Complete your first challenge to see it here
                  </p>
                  <Button onClick={() => setActiveTab('available')}>
                    <Target className="h-4 w-4 mr-2" />
                    Browse Challenges
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Global Leaderboard</CardTitle>
              <CardDescription>
                See how you rank against other participants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Crown className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <div className="font-medium">Challenge Champion</div>
                      <div className="text-sm text-muted-foreground">@champion</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">95</div>
                    <div className="text-sm text-muted-foreground">Score</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Medal className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">You</div>
                      <div className="text-sm text-muted-foreground">@current_user</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">87</div>
                    <div className="text-sm text-muted-foreground">Score</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Award className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-medium">Consistent Performer</div>
                      <div className="text-sm text-muted-foreground">@performer</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">82</div>
                    <div className="text-sm text-muted-foreground">Score</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {challengeInsights?.keyInsights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span className="text-sm">{insight}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {challengeInsights?.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Zap className="h-4 w-4 text-yellow-500 mt-0.5" />
                      <span className="text-sm">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {challengeInsights?.performance.map((perf, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{perf.metric}</span>
                        <span>{perf.value}</span>
                      </div>
                      <Progress value={perf.value} className="h-2" />
                      <p className="text-xs text-muted-foreground">{perf.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Improvement Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {challengeInsights?.improvement.map((improvement, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{improvement.area}</span>
                        <span>{improvement.current}/{improvement.target}</span>
                      </div>
                      <Progress value={improvement.progress} className="h-2" />
                      <p className="text-xs text-muted-foreground">{improvement.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Challenge Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">Enable Notifications</label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about challenge updates
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings?.enableNotifications || false}
                    onChange={(e) => updateSettings?.({ enableNotifications: e.target.checked })}
                    className="h-4 w-4"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">Enable Reminders</label>
                    <p className="text-sm text-muted-foreground">
                      Get daily reminders for active challenges
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings?.enableReminders || false}
                    onChange={(e) => updateSettings?.({ enableReminders: e.target.checked })}
                    className="h-4 w-4"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">Enable Leaderboards</label>
                    <p className="text-sm text-muted-foreground">
                      Show your rank on leaderboards
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings?.enableLeaderboards || false}
                    onChange={(e) => updateSettings?.({ enableLeaderboards: e.target.checked })}
                    className="h-4 w-4"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">Share Progress</label>
                    <p className="text-sm text-muted-foreground">
                      Allow others to see your challenge progress
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings?.shareProgress || false}
                    onChange={(e) => updateSettings?.({ shareProgress: e.target.checked })}
                    className="h-4 w-4"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
