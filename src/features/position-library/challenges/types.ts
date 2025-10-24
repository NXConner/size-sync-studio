export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: ChallengeType;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  duration: ChallengeDuration;
  requirements: ChallengeRequirement[];
  rewards: ChallengeReward[];
  rules: string[];
  isActive: boolean;
  isFeatured: boolean;
  isRecurring: boolean;
  startDate: Date;
  endDate: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  participants: number;
  completions: number;
  successRate: number;
}

export type ChallengeType = 
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'seasonal'
  | 'special'
  | 'partner'
  | 'endurance'
  | 'variety'
  | 'streak'
  | 'exploration';

export type ChallengeCategory = 
  | 'missionary'
  | 'cowgirl'
  | 'doggy'
  | 'standing'
  | 'sitting'
  | 'side'
  | 'oral'
  | 'kinky'
  | 'tantric'
  | 'wellness'
  | 'communication'
  | 'endurance'
  | 'flexibility'
  | 'strength'
  | 'creativity';

export type ChallengeDifficulty = 
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'expert'
  | 'master';

export interface ChallengeDuration {
  type: 'minutes' | 'hours' | 'days' | 'weeks' | 'sessions';
  value: number;
  description: string;
}

export interface ChallengeRequirement {
  id: string;
  type: RequirementType;
  target: number;
  current: number;
  description: string;
  category?: string;
  difficulty?: string;
  timeFrame?: 'daily' | 'weekly' | 'monthly' | 'all_time';
  isOptional: boolean;
  weight: number; // 0-1, for scoring
}

export type RequirementType = 
  | 'positions_completed'
  | 'positions_rated'
  | 'session_time'
  | 'streak_days'
  | 'variety_categories'
  | 'perfect_ratings'
  | 'notes_added'
  | 'sessions_completed'
  | 'challenges_completed'
  | 'partner_sessions'
  | 'custom_positions_created'
  | 'community_contributions'
  | 'achievements_unlocked'
  | 'goals_achieved'
  | 'mood_entries'
  | 'wellness_sessions';

export interface ChallengeReward {
  id: string;
  type: RewardType;
  name: string;
  description: string;
  value: number;
  icon?: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  isUnlocked: boolean;
  unlockedAt?: Date;
}

export type RewardType = 
  | 'points'
  | 'achievement'
  | 'badge'
  | 'unlock'
  | 'title'
  | 'accessory'
  | 'feature'
  | 'content';

export interface UserChallenge {
  id: string;
  challengeId: string;
  userId: string;
  status: ChallengeStatus;
  progress: number; // 0-100
  score: number;
  startedAt: Date;
  completedAt?: Date;
  lastUpdated: Date;
  notes?: string;
  requirements: UserChallengeRequirement[];
  rewards: ChallengeReward[];
  isActive: boolean;
  isPaused: boolean;
  pauseReason?: string;
  resumeAt?: Date;
}

export type ChallengeStatus = 
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'paused'
  | 'cancelled'
  | 'expired';

export interface UserChallengeRequirement {
  requirementId: string;
  current: number;
  target: number;
  isCompleted: boolean;
  completedAt?: Date;
  progress: number; // 0-100
}

export interface ChallengeSession {
  id: string;
  challengeId: string;
  userId: string;
  sessionId: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in seconds
  positions: string[];
  score: number;
  notes?: string;
  isCompleted: boolean;
}

export interface ChallengeLeaderboard {
  challengeId: string;
  entries: LeaderboardEntry[];
  totalParticipants: number;
  lastUpdated: Date;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  displayName: string;
  avatar?: string;
  score: number;
  progress: number;
  completedAt?: Date;
  isCurrentUser: boolean;
  badges: string[];
  achievements: string[];
}

export interface ChallengeTemplate {
  id: string;
  name: string;
  description: string;
  type: ChallengeType;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  duration: ChallengeDuration;
  requirements: ChallengeRequirement[];
  rewards: ChallengeReward[];
  rules: string[];
  isPopular: boolean;
  isRecommended: boolean;
  usageCount: number;
  successRate: number;
  averageScore: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChallengeStats {
  totalChallenges: number;
  activeChallenges: number;
  completedChallenges: number;
  totalScore: number;
  averageScore: number;
  bestScore: number;
  longestStreak: number;
  currentStreak: number;
  favoriteCategory: string;
  favoriteDifficulty: string;
  totalRewards: number;
  achievementsUnlocked: number;
  leaderboardRank: number;
  participationRate: number;
  successRate: number;
  improvementRate: number;
}

export interface ChallengeInsights {
  keyInsights: string[];
  recommendations: string[];
  trends: string[];
  patterns: string[];
  opportunities: string[];
  warnings: string[];
  achievements: string[];
  goals: string[];
  performance: PerformanceInsight[];
  improvement: ImprovementInsight[];
}

export interface PerformanceInsight {
  metric: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  description: string;
  recommendation?: string;
}

export interface ImprovementInsight {
  area: string;
  current: number;
  target: number;
  progress: number;
  description: string;
  action: string;
  priority: 'low' | 'medium' | 'high';
}

export interface ChallengeEvent {
  id: string;
  challengeId: string;
  userId: string;
  type: EventType;
  data: any;
  timestamp: Date;
  description: string;
}

export type EventType = 
  | 'started'
  | 'progress'
  | 'milestone'
  | 'completed'
  | 'failed'
  | 'paused'
  | 'resumed'
  | 'cancelled'
  | 'reward_earned'
  | 'achievement_unlocked'
  | 'leaderboard_update';

export interface ChallengeNotification {
  id: string;
  userId: string;
  challengeId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
}

export type NotificationType = 
  | 'challenge_started'
  | 'challenge_completed'
  | 'challenge_failed'
  | 'challenge_expired'
  | 'milestone_reached'
  | 'reward_earned'
  | 'leaderboard_update'
  | 'reminder'
  | 'invitation'
  | 'achievement';

export interface ChallengeSettings {
  enableNotifications: boolean;
  enableReminders: boolean;
  enableLeaderboards: boolean;
  enableRewards: boolean;
  enableSocial: boolean;
  autoStart: boolean;
  autoPause: boolean;
  reminderFrequency: 'daily' | 'weekly' | 'monthly';
  notificationTypes: NotificationType[];
  privacyLevel: 'public' | 'friends' | 'private';
  shareProgress: boolean;
  shareAchievements: boolean;
  allowInvitations: boolean;
  maxActiveChallenges: number;
  challengeDifficulty: ChallengeDifficulty[];
  preferredCategories: ChallengeCategory[];
  timeZone: string;
  language: string;
}

export interface ChallengeReport {
  id: string;
  challengeId: string;
  userId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  generatedAt: Date;
  summary: {
    totalChallenges: number;
    completedChallenges: number;
    totalScore: number;
    averageScore: number;
    totalTime: number;
    totalRewards: number;
    achievements: number;
  };
  performance: {
    bestCategory: string;
    bestDifficulty: string;
    improvementRate: number;
    consistency: number;
    engagement: number;
  };
  insights: ChallengeInsights;
  recommendations: string[];
  goals: string[];
  nextSteps: string[];
}
