export interface UserPreferences {
  id: string;
  userId: string;
  favoriteCategories: string[];
  preferredDifficulty: string[];
  physicalConsiderations: PhysicalConsiderations;
  partnerProfile?: PartnerProfile;
  moodSettings: MoodSettings;
  timeConstraints: TimeConstraints;
  privacyLevel: PrivacyLevel;
  customTags: CustomTag[];
  favoriteLists: FavoriteList[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PhysicalConsiderations {
  flexibility: 'low' | 'medium' | 'high' | 'expert';
  strength: 'low' | 'medium' | 'high' | 'expert';
  limitations: string[];
  injuries: string[];
  medicalConditions: string[];
  pregnancyStatus?: 'not_pregnant' | 'first_trimester' | 'second_trimester' | 'third_trimester' | 'postpartum';
  ageGroup: '18-25' | '26-35' | '36-45' | '46-55' | '56-65' | '65+';
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface PartnerProfile {
  id: string;
  name: string;
  preferences: string[];
  dislikes: string[];
  physicalConsiderations: PhysicalConsiderations;
  communicationStyle: 'direct' | 'gentle' | 'playful' | 'romantic';
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  favoritePositions: string[];
  avoidedPositions: string[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MoodSettings {
  currentMood: MoodType;
  moodHistory: MoodEntry[];
  moodBasedRecommendations: boolean;
  stressLevel: 'low' | 'medium' | 'high';
  energyLevel: 'low' | 'medium' | 'high';
  emotionalState: 'happy' | 'sad' | 'excited' | 'calm' | 'anxious' | 'romantic' | 'playful';
}

export type MoodType = 
  | 'romantic'
  | 'playful'
  | 'passionate'
  | 'gentle'
  | 'adventurous'
  | 'relaxing'
  | 'energetic'
  | 'intimate'
  | 'kinky'
  | 'wellness';

export interface MoodEntry {
  id: string;
  mood: MoodType;
  timestamp: Date;
  notes?: string;
  duration?: number; // in minutes
}

export interface TimeConstraints {
  preferredSessionLength: {
    min: number; // in minutes
    max: number; // in minutes
  };
  availableTimes: TimeSlot[];
  quickSessionMode: boolean;
  extendedSessionMode: boolean;
  breakTime: number; // in minutes
}

export interface TimeSlot {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isAvailable: boolean;
}

export type PrivacyLevel = 
  | 'public'
  | 'friends'
  | 'partner'
  | 'private';

export interface CustomTag {
  id: string;
  name: string;
  color: string;
  description?: string;
  category: string;
  isPublic: boolean;
  createdAt: Date;
}

export interface FavoriteList {
  id: string;
  name: string;
  description?: string;
  positionIds: string[];
  isPublic: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PersonalizationSettings {
  enableMoodTracking: boolean;
  enablePhysicalTracking: boolean;
  enablePartnerProfiles: boolean;
  enableCustomTags: boolean;
  enableFavoriteLists: boolean;
  enableRecommendations: boolean;
  enableAnalytics: boolean;
  enableNotifications: boolean;
  dataRetentionDays: number;
  shareDataWithPartner: boolean;
}

export interface RecommendationSettings {
  algorithm: 'collaborative' | 'content_based' | 'hybrid' | 'mood_based';
  diversity: 'low' | 'medium' | 'high';
  novelty: 'low' | 'medium' | 'high';
  difficultyProgression: boolean;
  categoryBalance: boolean;
  timeBasedRecommendations: boolean;
  partnerCompatibility: boolean;
  physicalConsiderations: boolean;
  moodBasedFiltering: boolean;
}

export interface PersonalizationStats {
  totalCustomTags: number;
  totalFavoriteLists: number;
  totalPartnerProfiles: number;
  moodEntriesCount: number;
  recommendationsGiven: number;
  recommendationsAccepted: number;
  personalizationScore: number; // 0-100
  lastUpdated: Date;
}

export interface PersonalizationInsights {
  favoriteCategories: string[];
  preferredDifficulty: string;
  mostActiveTimeSlots: TimeSlot[];
  moodPatterns: MoodPattern[];
  physicalLimitations: string[];
  partnerCompatibility: number; // 0-100
  recommendationAccuracy: number; // 0-100
  engagementTrends: EngagementTrend[];
}

export interface MoodPattern {
  mood: MoodType;
  frequency: number;
  averageDuration: number;
  commonTriggers: string[];
  preferredPositions: string[];
}

export interface EngagementTrend {
  date: Date;
  sessions: number;
  positions: number;
  duration: number;
  satisfaction: number;
}
