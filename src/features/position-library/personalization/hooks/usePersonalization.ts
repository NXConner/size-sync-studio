import { useState, useEffect, useCallback } from 'react';
import { 
  UserPreferences, 
  PhysicalConsiderations, 
  PartnerProfile, 
  MoodSettings, 
  TimeConstraints,
  CustomTag,
  FavoriteList,
  PersonalizationSettings,
  RecommendationSettings,
  PersonalizationStats,
  PersonalizationInsights,
  MoodType,
  MoodEntry
} from '../types';

export const usePersonalization = (userId: string) => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [settings, setSettings] = useState<PersonalizationSettings | null>(null);
  const [recommendationSettings, setRecommendationSettings] = useState<RecommendationSettings | null>(null);
  const [stats, setStats] = useState<PersonalizationStats | null>(null);
  const [insights, setInsights] = useState<PersonalizationInsights | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize personalization data
  useEffect(() => {
    const initializePersonalization = () => {
      const defaultPreferences: UserPreferences = {
        id: `preferences-${userId}`,
        userId,
        favoriteCategories: [],
        preferredDifficulty: ['beginner'],
        physicalConsiderations: {
          flexibility: 'medium',
          strength: 'medium',
          limitations: [],
          injuries: [],
          medicalConditions: [],
          ageGroup: '26-35',
          fitnessLevel: 'intermediate'
        },
        moodSettings: {
          currentMood: 'romantic',
          moodHistory: [],
          moodBasedRecommendations: true,
          stressLevel: 'medium',
          energyLevel: 'medium',
          emotionalState: 'happy'
        },
        timeConstraints: {
          preferredSessionLength: { min: 15, max: 60 },
          availableTimes: [],
          quickSessionMode: true,
          extendedSessionMode: false,
          breakTime: 5
        },
        privacyLevel: 'private',
        customTags: [],
        favoriteLists: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const defaultSettings: PersonalizationSettings = {
        enableMoodTracking: true,
        enablePhysicalTracking: true,
        enablePartnerProfiles: true,
        enableCustomTags: true,
        enableFavoriteLists: true,
        enableRecommendations: true,
        enableAnalytics: true,
        enableNotifications: true,
        dataRetentionDays: 365,
        shareDataWithPartner: false
      };

      const defaultRecommendationSettings: RecommendationSettings = {
        algorithm: 'hybrid',
        diversity: 'medium',
        novelty: 'medium',
        difficultyProgression: true,
        categoryBalance: true,
        timeBasedRecommendations: true,
        partnerCompatibility: true,
        physicalConsiderations: true,
        moodBasedFiltering: true
      };

      setPreferences(defaultPreferences);
      setSettings(defaultSettings);
      setRecommendationSettings(defaultRecommendationSettings);
      setIsLoading(false);
    };

    initializePersonalization();
  }, [userId]);

  // Update preferences
  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    setPreferences(prev => prev ? {
      ...prev,
      ...updates,
      updatedAt: new Date()
    } : null);
  }, []);

  // Update physical considerations
  const updatePhysicalConsiderations = useCallback((considerations: Partial<PhysicalConsiderations>) => {
    setPreferences(prev => prev ? {
      ...prev,
      physicalConsiderations: {
        ...prev.physicalConsiderations,
        ...considerations
      },
      updatedAt: new Date()
    } : null);
  }, []);

  // Add partner profile
  const addPartnerProfile = useCallback((partnerProfile: PartnerProfile) => {
    setPreferences(prev => prev ? {
      ...prev,
      partnerProfile,
      updatedAt: new Date()
    } : null);
  }, []);

  // Update partner profile
  const updatePartnerProfile = useCallback((updates: Partial<PartnerProfile>) => {
    setPreferences(prev => prev && prev.partnerProfile ? {
      ...prev,
      partnerProfile: {
        ...prev.partnerProfile,
        ...updates,
        updatedAt: new Date()
      },
      updatedAt: new Date()
    } : null);
  }, []);

  // Update mood
  const updateMood = useCallback((mood: MoodType, notes?: string) => {
    const moodEntry: MoodEntry = {
      id: `mood-${Date.now()}`,
      mood,
      timestamp: new Date(),
      notes
    };

    setPreferences(prev => prev ? {
      ...prev,
      moodSettings: {
        ...prev.moodSettings,
        currentMood: mood,
        moodHistory: [...prev.moodSettings.moodHistory, moodEntry]
      },
      updatedAt: new Date()
    } : null);
  }, []);

  // Add custom tag
  const addCustomTag = useCallback((tag: Omit<CustomTag, 'id' | 'createdAt'>) => {
    const newTag: CustomTag = {
      ...tag,
      id: `tag-${Date.now()}`,
      createdAt: new Date()
    };

    setPreferences(prev => prev ? {
      ...prev,
      customTags: [...prev.customTags, newTag],
      updatedAt: new Date()
    } : null);
  }, []);

  // Update custom tag
  const updateCustomTag = useCallback((tagId: string, updates: Partial<CustomTag>) => {
    setPreferences(prev => prev ? {
      ...prev,
      customTags: prev.customTags.map(tag => 
        tag.id === tagId ? { ...tag, ...updates } : tag
      ),
      updatedAt: new Date()
    } : null);
  }, []);

  // Delete custom tag
  const deleteCustomTag = useCallback((tagId: string) => {
    setPreferences(prev => prev ? {
      ...prev,
      customTags: prev.customTags.filter(tag => tag.id !== tagId),
      updatedAt: new Date()
    } : null);
  }, []);

  // Add favorite list
  const addFavoriteList = useCallback((list: Omit<FavoriteList, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newList: FavoriteList = {
      ...list,
      id: `list-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setPreferences(prev => prev ? {
      ...prev,
      favoriteLists: [...prev.favoriteLists, newList],
      updatedAt: new Date()
    } : null);
  }, []);

  // Update favorite list
  const updateFavoriteList = useCallback((listId: string, updates: Partial<FavoriteList>) => {
    setPreferences(prev => prev ? {
      ...prev,
      favoriteLists: prev.favoriteLists.map(list => 
        list.id === listId ? { ...list, ...updates, updatedAt: new Date() } : list
      ),
      updatedAt: new Date()
    } : null);
  }, []);

  // Delete favorite list
  const deleteFavoriteList = useCallback((listId: string) => {
    setPreferences(prev => prev ? {
      ...prev,
      favoriteLists: prev.favoriteLists.filter(list => list.id !== listId),
      updatedAt: new Date()
    } : null);
  }, []);

  // Add position to favorite list
  const addPositionToFavoriteList = useCallback((listId: string, positionId: string) => {
    setPreferences(prev => prev ? {
      ...prev,
      favoriteLists: prev.favoriteLists.map(list => 
        list.id === listId 
          ? { 
              ...list, 
              positionIds: [...list.positionIds, positionId],
              updatedAt: new Date()
            }
          : list
      ),
      updatedAt: new Date()
    } : null);
  }, []);

  // Remove position from favorite list
  const removePositionFromFavoriteList = useCallback((listId: string, positionId: string) => {
    setPreferences(prev => prev ? {
      ...prev,
      favoriteLists: prev.favoriteLists.map(list => 
        list.id === listId 
          ? { 
              ...list, 
              positionIds: list.positionIds.filter(id => id !== positionId),
              updatedAt: new Date()
            }
          : list
      ),
      updatedAt: new Date()
    } : null);
  }, []);

  // Update settings
  const updateSettings = useCallback((updates: Partial<PersonalizationSettings>) => {
    setSettings(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  // Update recommendation settings
  const updateRecommendationSettings = useCallback((updates: Partial<RecommendationSettings>) => {
    setRecommendationSettings(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  // Get personalized recommendations
  const getPersonalizedRecommendations = useCallback((limit: number = 10) => {
    if (!preferences || !recommendationSettings) return [];

    // This would integrate with the position library to get recommendations
    // For now, return a placeholder
    return [];
  }, [preferences, recommendationSettings]);

  // Get mood-based recommendations
  const getMoodBasedRecommendations = useCallback((mood: MoodType, limit: number = 5) => {
    if (!preferences) return [];

    // This would filter positions based on mood
    // For now, return a placeholder
    return [];
  }, [preferences]);

  // Get partner-compatible recommendations
  const getPartnerCompatibleRecommendations = useCallback((limit: number = 5) => {
    if (!preferences || !preferences.partnerProfile) return [];

    // This would filter positions based on partner preferences
    // For now, return a placeholder
    return [];
  }, [preferences]);

  // Get physical-consideration recommendations
  const getPhysicalConsiderationRecommendations = useCallback((limit: number = 5) => {
    if (!preferences) return [];

    // This would filter positions based on physical considerations
    // For now, return a placeholder
    return [];
  }, [preferences]);

  // Calculate personalization score
  const calculatePersonalizationScore = useCallback((): number => {
    if (!preferences) return 0;

    let score = 0;
    const maxScore = 100;

    // Favorite categories (20 points)
    if (preferences.favoriteCategories.length > 0) score += 20;
    else if (preferences.favoriteCategories.length > 3) score += 10;

    // Physical considerations (20 points)
    if (preferences.physicalConsiderations.limitations.length > 0) score += 10;
    if (preferences.physicalConsiderations.injuries.length > 0) score += 10;

    // Partner profile (20 points)
    if (preferences.partnerProfile) score += 20;

    // Custom tags (15 points)
    if (preferences.customTags.length > 0) score += 15;

    // Favorite lists (15 points)
    if (preferences.favoriteLists.length > 0) score += 15;

    // Mood tracking (10 points)
    if (preferences.moodSettings.moodHistory.length > 0) score += 10;

    return Math.min(score, maxScore);
  }, [preferences]);

  // Get personalization insights
  const getPersonalizationInsights = useCallback((): PersonalizationInsights | null => {
    if (!preferences) return null;

    const favoriteCategories = preferences.favoriteCategories;
    const preferredDifficulty = preferences.preferredDifficulty[0] || 'beginner';
    const mostActiveTimeSlots = preferences.timeConstraints.availableTimes.filter(slot => slot.isAvailable);
    const physicalLimitations = preferences.physicalConsiderations.limitations;

    // Calculate mood patterns
    const moodPatterns = preferences.moodSettings.moodHistory.reduce((patterns, entry) => {
      const existing = patterns.find(p => p.mood === entry.mood);
      if (existing) {
        existing.frequency++;
        existing.averageDuration = (existing.averageDuration + (entry.duration || 0)) / 2;
      } else {
        patterns.push({
          mood: entry.mood,
          frequency: 1,
          averageDuration: entry.duration || 0,
          commonTriggers: [],
          preferredPositions: []
        });
      }
      return patterns;
    }, [] as any[]);

    return {
      favoriteCategories,
      preferredDifficulty,
      mostActiveTimeSlots,
      moodPatterns,
      physicalLimitations,
      partnerCompatibility: preferences.partnerProfile ? 85 : 0,
      recommendationAccuracy: 75, // This would be calculated based on actual usage
      engagementTrends: [] // This would be calculated based on actual usage
    };
  }, [preferences]);

  return {
    preferences,
    settings,
    recommendationSettings,
    stats,
    insights,
    isLoading,
    updatePreferences,
    updatePhysicalConsiderations,
    addPartnerProfile,
    updatePartnerProfile,
    updateMood,
    addCustomTag,
    updateCustomTag,
    deleteCustomTag,
    addFavoriteList,
    updateFavoriteList,
    deleteFavoriteList,
    addPositionToFavoriteList,
    removePositionFromFavoriteList,
    updateSettings,
    updateRecommendationSettings,
    getPersonalizedRecommendations,
    getMoodBasedRecommendations,
    getPartnerCompatibleRecommendations,
    getPhysicalConsiderationRecommendations,
    calculatePersonalizationScore,
    getPersonalizationInsights
  };
};
