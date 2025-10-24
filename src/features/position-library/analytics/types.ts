export interface AnalyticsData {
  userId: string;
  period: AnalyticsPeriod;
  startDate: Date;
  endDate: Date;
  lastUpdated: Date;
}

export type AnalyticsPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all_time';

export interface SessionAnalytics {
  totalSessions: number;
  totalDuration: number; // in seconds
  averageSessionDuration: number; // in seconds
  longestSession: number; // in seconds
  shortestSession: number; // in seconds
  sessionsByDay: DailySessionData[];
  sessionsByHour: HourlySessionData[];
  sessionsByWeekday: WeekdaySessionData[];
  sessionsByMonth: MonthlySessionData[];
}

export interface PositionAnalytics {
  totalPositions: number;
  uniquePositions: number;
  mostUsedPositions: PositionUsageData[];
  leastUsedPositions: PositionUsageData[];
  positionsByCategory: CategoryUsageData[];
  positionsByDifficulty: DifficultyUsageData[];
  averagePositionDuration: number; // in seconds
  positionSuccessRate: number; // percentage
  positionRatings: PositionRatingData[];
}

export interface PerformanceAnalytics {
  totalPoints: number;
  level: number;
  experience: number;
  achievementsUnlocked: number;
  totalAchievements: number;
  completionRate: number; // percentage
  streakDays: number;
  longestStreak: number;
  currentStreak: number;
  performanceTrend: PerformanceTrendData[];
  improvementAreas: string[];
  strengths: string[];
}

export interface HealthAnalytics {
  moodTrends: MoodTrendData[];
  energyLevels: EnergyLevelData[];
  stressLevels: StressLevelData[];
  sleepQuality: SleepQualityData[];
  physicalWellness: PhysicalWellnessData[];
  emotionalWellness: EmotionalWellnessData[];
  healthCorrelations: HealthCorrelationData[];
}

export interface RelationshipAnalytics {
  partnerSessions: number;
  partnerSatisfaction: number; // 1-5 scale
  communicationScore: number; // 1-5 scale
  intimacyScore: number; // 1-5 scale
  relationshipTrends: RelationshipTrendData[];
  partnerPreferences: PartnerPreferenceData[];
  sharedAchievements: number;
  collaborativePositions: number;
}

export interface EngagementAnalytics {
  totalTimeSpent: number; // in seconds
  averageSessionLength: number; // in seconds
  peakUsageHours: number[];
  peakUsageDays: string[];
  engagementScore: number; // 0-100
  retentionRate: number; // percentage
  returnRate: number; // percentage
  featureUsage: FeatureUsageData[];
  userJourney: UserJourneyData[];
}

export interface GoalAnalytics {
  goalsSet: number;
  goalsAchieved: number;
  goalCompletionRate: number; // percentage
  activeGoals: GoalData[];
  completedGoals: GoalData[];
  goalProgress: GoalProgressData[];
  goalCategories: GoalCategoryData[];
}

export interface DailySessionData {
  date: string; // YYYY-MM-DD
  sessions: number;
  totalDuration: number;
  averageDuration: number;
  positions: number;
  satisfaction: number; // 1-5 scale
}

export interface HourlySessionData {
  hour: number; // 0-23
  sessions: number;
  totalDuration: number;
  averageDuration: number;
}

export interface WeekdaySessionData {
  weekday: string; // Monday, Tuesday, etc.
  sessions: number;
  totalDuration: number;
  averageDuration: number;
}

export interface MonthlySessionData {
  month: string; // YYYY-MM
  sessions: number;
  totalDuration: number;
  averageDuration: number;
}

export interface PositionUsageData {
  positionId: string;
  positionName: string;
  category: string;
  difficulty: string;
  usageCount: number;
  totalDuration: number;
  averageDuration: number;
  successRate: number; // percentage
  averageRating: number; // 1-5 scale
  lastUsed: Date;
}

export interface CategoryUsageData {
  category: string;
  usageCount: number;
  totalDuration: number;
  averageDuration: number;
  successRate: number;
  averageRating: number;
}

export interface DifficultyUsageData {
  difficulty: string;
  usageCount: number;
  totalDuration: number;
  averageDuration: number;
  successRate: number;
  averageRating: number;
}

export interface PositionRatingData {
  positionId: string;
  positionName: string;
  averageRating: number;
  ratingCount: number;
  ratingDistribution: {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
  };
}

export interface PerformanceTrendData {
  date: string;
  score: number;
  sessions: number;
  positions: number;
  duration: number;
  achievements: number;
}

export interface MoodTrendData {
  date: string;
  mood: string;
  intensity: number; // 1-5 scale
  duration: number; // in minutes
  triggers: string[];
}

export interface EnergyLevelData {
  date: string;
  energyLevel: number; // 1-5 scale
  timeOfDay: string;
  duration: number; // in minutes
}

export interface StressLevelData {
  date: string;
  stressLevel: number; // 1-5 scale
  stressSources: string[];
  copingMethods: string[];
}

export interface SleepQualityData {
  date: string;
  sleepQuality: number; // 1-5 scale
  sleepDuration: number; // in hours
  sleepEfficiency: number; // percentage
}

export interface PhysicalWellnessData {
  date: string;
  flexibility: number; // 1-5 scale
  strength: number; // 1-5 scale
  endurance: number; // 1-5 scale
  painLevel: number; // 1-5 scale
  energyLevel: number; // 1-5 scale
}

export interface EmotionalWellnessData {
  date: string;
  happiness: number; // 1-5 scale
  satisfaction: number; // 1-5 scale
  confidence: number; // 1-5 scale
  anxiety: number; // 1-5 scale
  stress: number; // 1-5 scale
}

export interface HealthCorrelationData {
  factor: string;
  correlation: number; // -1 to 1
  significance: number; // 0 to 1
  description: string;
}

export interface RelationshipTrendData {
  date: string;
  satisfaction: number; // 1-5 scale
  communication: number; // 1-5 scale
  intimacy: number; // 1-5 scale
  connection: number; // 1-5 scale
}

export interface PartnerPreferenceData {
  preference: string;
  frequency: number;
  satisfaction: number; // 1-5 scale
  lastUsed: Date;
}

export interface FeatureUsageData {
  feature: string;
  usageCount: number;
  totalTime: number; // in seconds
  averageTime: number; // in seconds
  lastUsed: Date;
}

export interface UserJourneyData {
  step: string;
  timestamp: Date;
  duration: number; // in seconds
  success: boolean;
  nextStep?: string;
}

export interface GoalData {
  id: string;
  name: string;
  description: string;
  category: string;
  target: number;
  current: number;
  progress: number; // percentage
  deadline: Date;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  createdAt: Date;
  completedAt?: Date;
}

export interface GoalProgressData {
  goalId: string;
  date: string;
  progress: number; // percentage
  value: number;
  notes?: string;
}

export interface GoalCategoryData {
  category: string;
  goalsSet: number;
  goalsAchieved: number;
  completionRate: number; // percentage
  averageProgress: number; // percentage
}

export interface AnalyticsInsights {
  keyInsights: string[];
  recommendations: string[];
  trends: string[];
  patterns: string[];
  opportunities: string[];
  warnings: string[];
  achievements: string[];
  goals: string[];
}

export interface AnalyticsReport {
  period: AnalyticsPeriod;
  startDate: Date;
  endDate: Date;
  generatedAt: Date;
  summary: {
    totalSessions: number;
    totalDuration: number;
    totalPositions: number;
    averageRating: number;
    achievementsUnlocked: number;
    goalsAchieved: number;
  };
  sessionAnalytics: SessionAnalytics;
  positionAnalytics: PositionAnalytics;
  performanceAnalytics: PerformanceAnalytics;
  healthAnalytics: HealthAnalytics;
  relationshipAnalytics: RelationshipAnalytics;
  engagementAnalytics: EngagementAnalytics;
  goalAnalytics: GoalAnalytics;
  insights: AnalyticsInsights;
}
