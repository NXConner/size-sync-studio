export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon: string;
  points: number;
  requirements: AchievementRequirement[];
  unlockedAt?: Date;
  progress: number; // 0-100
  isUnlocked: boolean;
  isSecret?: boolean; // Hidden until unlocked
  tags: string[];
}

export type AchievementCategory = 
  | 'position_master'
  | 'endurance'
  | 'variety'
  | 'streak'
  | 'time'
  | 'rating'
  | 'social'
  | 'exploration'
  | 'wellness'
  | 'special';

export type AchievementRarity = 
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'mythic';

export interface AchievementRequirement {
  type: RequirementType;
  target: number;
  current: number;
  description: string;
  category?: string;
  difficulty?: string;
  timeFrame?: 'daily' | 'weekly' | 'monthly' | 'all_time';
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
  | 'community_contributions';

export interface AchievementProgress {
  achievementId: string;
  currentProgress: number;
  targetProgress: number;
  percentage: number;
  lastUpdated: Date;
  isCompleted: boolean;
}

export interface UserAchievements {
  userId: string;
  achievements: Achievement[];
  totalPoints: number;
  level: number;
  experience: number;
  nextLevelExperience: number;
  unlockedCount: number;
  totalCount: number;
  recentUnlocks: Achievement[];
  progress: AchievementProgress[];
}

export interface AchievementNotification {
  id: string;
  achievement: Achievement;
  unlockedAt: Date;
  isRead: boolean;
  message: string;
}

export interface AchievementStats {
  totalAchievements: number;
  unlockedAchievements: number;
  completionRate: number;
  totalPoints: number;
  level: number;
  experience: number;
  nextLevel: number;
  nextLevelExperience: number;
  recentUnlocks: number;
  streakDays: number;
  longestStreak: number;
  favoriteCategory: string;
  mostRareAchievement: Achievement;
}
