import { useState, useEffect, useCallback } from 'react';
import { Achievement, UserAchievements, AchievementProgress, AchievementNotification, AchievementStats } from '../types';
import { achievements } from '../data/achievements';

export const useAchievements = (userId: string) => {
  const [userAchievements, setUserAchievements] = useState<UserAchievements | null>(null);
  const [notifications, setNotifications] = useState<AchievementNotification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize user achievements
  useEffect(() => {
    const initializeAchievements = () => {
      const userAchievementsData: UserAchievements = {
        userId,
        achievements: achievements.map(achievement => ({
          ...achievement,
          progress: 0,
          isUnlocked: false
        })),
        totalPoints: 0,
        level: 1,
        experience: 0,
        nextLevelExperience: 100,
        unlockedCount: 0,
        totalCount: achievements.length,
        recentUnlocks: [],
        progress: []
      };

      setUserAchievements(userAchievementsData);
      setIsLoading(false);
    };

    initializeAchievements();
  }, [userId]);

  // Calculate experience and level
  const calculateLevel = useCallback((totalPoints: number) => {
    const level = Math.floor(totalPoints / 100) + 1;
    const experience = totalPoints % 100;
    const nextLevelExperience = 100 - experience;
    return { level, experience, nextLevelExperience };
  }, []);

  // Update achievement progress
  const updateAchievementProgress = useCallback((
    achievementId: string,
    progress: number,
    requirementType: string,
    value: number
  ) => {
    if (!userAchievements) return;

    setUserAchievements(prev => {
      if (!prev) return prev;

      const updatedAchievements = prev.achievements.map(achievement => {
        if (achievement.id !== achievementId) return achievement;

        const updatedRequirements = achievement.requirements.map(req => {
          if (req.type === requirementType) {
            return { ...req, current: Math.min(req.current + value, req.target) };
          }
          return req;
        });

        const totalProgress = updatedRequirements.reduce((sum, req) => sum + req.current, 0);
        const totalTarget = updatedRequirements.reduce((sum, req) => sum + req.target, 0);
        const progressPercentage = Math.min((totalProgress / totalTarget) * 100, 100);

        const isUnlocked = updatedRequirements.every(req => req.current >= req.target);

        return {
          ...achievement,
          requirements: updatedRequirements,
          progress: progressPercentage,
          isUnlocked,
          unlockedAt: isUnlocked && !achievement.isUnlocked ? new Date() : achievement.unlockedAt
        };
      });

      const unlockedAchievements = updatedAchievements.filter(a => a.isUnlocked);
      const newUnlocks = updatedAchievements.filter(a => a.isUnlocked && !prev.achievements.find(pa => pa.id === a.id && pa.isUnlocked));
      const totalPoints = unlockedAchievements.reduce((sum, a) => sum + a.points, 0);
      const { level, experience, nextLevelExperience } = calculateLevel(totalPoints);

      // Add notifications for new unlocks
      if (newUnlocks.length > 0) {
        const newNotifications = newUnlocks.map(achievement => ({
          id: `notification-${achievement.id}-${Date.now()}`,
          achievement,
          unlockedAt: new Date(),
          isRead: false,
          message: `🎉 Achievement Unlocked: ${achievement.name}!`
        }));

        setNotifications(prev => [...prev, ...newNotifications]);
      }

      return {
        ...prev,
        achievements: updatedAchievements,
        totalPoints,
        level,
        experience,
        nextLevelExperience,
        unlockedCount: unlockedAchievements.length,
        recentUnlocks: newUnlocks
      };
    });
  }, [userAchievements, calculateLevel]);

  // Get achievement statistics
  const getAchievementStats = useCallback((): AchievementStats | null => {
    if (!userAchievements) return null;

    const unlockedAchievements = userAchievements.achievements.filter(a => a.isUnlocked);
    const completionRate = (userAchievements.unlockedCount / userAchievements.totalCount) * 100;
    const mostRareAchievement = unlockedAchievements.reduce((rarest, current) => 
      getRarityValue(current.rarity) > getRarityValue(rarest.rarity) ? current : rarest
    , unlockedAchievements[0] || userAchievements.achievements[0]);

    const favoriteCategory = getFavoriteCategory(unlockedAchievements);
    const streakDays = calculateStreakDays(userAchievements.achievements);

    return {
      totalAchievements: userAchievements.totalCount,
      unlockedAchievements: userAchievements.unlockedCount,
      completionRate,
      totalPoints: userAchievements.totalPoints,
      level: userAchievements.level,
      experience: userAchievements.experience,
      nextLevel: userAchievements.level + 1,
      nextLevelExperience: userAchievements.nextLevelExperience,
      recentUnlocks: userAchievements.recentUnlocks.length,
      streakDays,
      longestStreak: streakDays,
      favoriteCategory,
      mostRareAchievement
    };
  }, [userAchievements]);

  // Mark notification as read
  const markNotificationAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Get achievements by category
  const getAchievementsByCategory = useCallback((category: string) => {
    if (!userAchievements) return [];
    return userAchievements.achievements.filter(a => a.category === category);
  }, [userAchievements]);

  // Get achievements by rarity
  const getAchievementsByRarity = useCallback((rarity: string) => {
    if (!userAchievements) return [];
    return userAchievements.achievements.filter(a => a.rarity === rarity);
  }, [userAchievements]);

  // Get unlocked achievements
  const getUnlockedAchievements = useCallback(() => {
    if (!userAchievements) return [];
    return userAchievements.achievements.filter(a => a.isUnlocked);
  }, [userAchievements]);

  // Get locked achievements
  const getLockedAchievements = useCallback(() => {
    if (!userAchievements) return [];
    return userAchievements.achievements.filter(a => !a.isUnlocked);
  }, [userAchievements]);

  // Get achievements in progress
  const getAchievementsInProgress = useCallback(() => {
    if (!userAchievements) return [];
    return userAchievements.achievements.filter(a => !a.isUnlocked && a.progress > 0);
  }, [userAchievements]);

  // Get secret achievements
  const getSecretAchievements = useCallback(() => {
    if (!userAchievements) return [];
    return userAchievements.achievements.filter(a => a.isSecret);
  }, [userAchievements]);

  return {
    userAchievements,
    notifications,
    isLoading,
    updateAchievementProgress,
    getAchievementStats,
    markNotificationAsRead,
    clearAllNotifications,
    getAchievementsByCategory,
    getAchievementsByRarity,
    getUnlockedAchievements,
    getLockedAchievements,
    getAchievementsInProgress,
    getSecretAchievements
  };
};

// Helper functions
const getRarityValue = (rarity: string): number => {
  const rarityValues = {
    'common': 1,
    'uncommon': 2,
    'rare': 3,
    'epic': 4,
    'legendary': 5,
    'mythic': 6
  };
  return rarityValues[rarity as keyof typeof rarityValues] || 0;
};

const getFavoriteCategory = (achievements: Achievement[]): string => {
  const categoryCounts = achievements.reduce((counts, achievement) => {
    counts[achievement.category] = (counts[achievement.category] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  return Object.entries(categoryCounts).reduce((favorite, [category, count]) => 
    count > (categoryCounts[favorite] || 0) ? category : favorite
  , 'exploration');
};

const calculateStreakDays = (achievements: Achievement[]): number => {
  // This would need to be implemented based on actual session data
  // For now, return a placeholder
  return 0;
};
