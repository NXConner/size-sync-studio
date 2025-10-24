import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Heart, 
  Brain, 
  Users, 
  Clock, 
  Star, 
  Trophy, 
  Download, 
  Calendar,
  Activity,
  Zap,
  Shield,
  Lightbulb,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useAnalytics } from '../hooks/useAnalytics';
import { AnalyticsPeriod } from '../types';

interface AnalyticsDashboardProps {
  userId: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ userId }) => {
  const {
    analyticsData,
    sessionAnalytics,
    positionAnalytics,
    performanceAnalytics,
    healthAnalytics,
    relationshipAnalytics,
    engagementAnalytics,
    goalAnalytics,
    insights,
    isLoading,
    getAnalyticsForPeriod,
    exportAnalytics,
    getPerformanceScore,
    getHealthScore,
    getRelationshipScore
  } = useAnalytics(userId);

  const [selectedPeriod, setSelectedPeriod] = useState<AnalyticsPeriod>('monthly');
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'positions' | 'performance' | 'health' | 'relationship' | 'goals' | 'insights'>('overview');

  const performanceScore = getPerformanceScore();
  const healthScore = getHealthScore();
  const relationshipScore = getRelationshipScore();

  const handlePeriodChange = (period: AnalyticsPeriod) => {
    setSelectedPeriod(period);
    getAnalyticsForPeriod(period);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Analytics Data</h3>
        <p className="text-muted-foreground">Start using the app to see your analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Track your progress and insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
              <SelectItem value="all_time">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportAnalytics} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{sessionAnalytics?.totalSessions || 0}</div>
            <div className="text-sm text-muted-foreground">Total Sessions</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {sessionAnalytics ? Math.round(sessionAnalytics.totalDuration / 3600) : 0}h
            </div>
            <div className="text-sm text-muted-foreground">Total Time</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{positionAnalytics?.uniquePositions || 0}</div>
            <div className="text-sm text-muted-foreground">Unique Positions</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{performanceAnalytics?.level || 0}</div>
            <div className="text-sm text-muted-foreground">Level</div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Performance Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{performanceScore}%</div>
            <Progress value={performanceScore} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">
              Based on completion rate, achievements, and engagement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Health Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{healthScore}%</div>
            <Progress value={healthScore} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">
              Based on mood, energy, and wellness tracking
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Relationship Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{relationshipScore}%</div>
            <Progress value={relationshipScore} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">
              Based on partner satisfaction and communication
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="positions" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Positions
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Health
          </TabsTrigger>
          <TabsTrigger value="relationship" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Relationship
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Goals
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Completed 3 positions today</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Achieved 7-day streak</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">Unlocked new achievement</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Average Session:</span>
                    <span className="text-sm font-medium">
                      {sessionAnalytics ? Math.round(sessionAnalytics.averageSessionDuration / 60) : 0} min
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Success Rate:</span>
                    <span className="text-sm font-medium">
                      {positionAnalytics?.positionSuccessRate || 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Current Streak:</span>
                    <span className="text-sm font-medium">
                      {performanceAnalytics?.currentStreak || 0} days
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Session Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{sessionAnalytics?.totalSessions || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {sessionAnalytics ? Math.round(sessionAnalytics.totalDuration / 3600) : 0}h
                  </div>
                  <div className="text-sm text-muted-foreground">Total Duration</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {sessionAnalytics ? Math.round(sessionAnalytics.averageSessionDuration / 60) : 0}min
                  </div>
                  <div className="text-sm text-muted-foreground">Average Duration</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Positions Tab */}
        <TabsContent value="positions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Position Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{positionAnalytics?.totalPositions || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Positions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{positionAnalytics?.uniquePositions || 0}</div>
                  <div className="text-sm text-muted-foreground">Unique Positions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{positionAnalytics?.positionSuccessRate || 0}%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{performanceAnalytics?.totalPoints || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{performanceAnalytics?.level || 0}</div>
                  <div className="text-sm text-muted-foreground">Current Level</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{performanceAnalytics?.achievementsUnlocked || 0}</div>
                  <div className="text-sm text-muted-foreground">Achievements</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Health Tab */}
        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Health Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold">{healthScore}%</div>
                <div className="text-sm text-muted-foreground">Overall Health Score</div>
                <Progress value={healthScore} className="h-3 mt-2" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Relationship Tab */}
        <TabsContent value="relationship" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relationship Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{relationshipAnalytics?.partnerSessions || 0}</div>
                  <div className="text-sm text-muted-foreground">Partner Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{relationshipAnalytics?.partnerSatisfaction || 0}/5</div>
                  <div className="text-sm text-muted-foreground">Partner Satisfaction</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{relationshipAnalytics?.communicationScore || 0}/5</div>
                  <div className="text-sm text-muted-foreground">Communication</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Goal Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{goalAnalytics?.goalsSet || 0}</div>
                  <div className="text-sm text-muted-foreground">Goals Set</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{goalAnalytics?.goalsAchieved || 0}</div>
                  <div className="text-sm text-muted-foreground">Goals Achieved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{goalAnalytics?.goalCompletionRate || 0}%</div>
                  <div className="text-sm text-muted-foreground">Completion Rate</div>
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
                  <Lightbulb className="h-5 w-5" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {insights?.keyInsights.map((insight, index) => (
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
                  {insights?.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />
                      <span className="text-sm">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {insights?.trends.map((trend, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5" />
                      <span className="text-sm">{trend}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Warnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {insights?.warnings.map((warning, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                      <span className="text-sm">{warning}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
