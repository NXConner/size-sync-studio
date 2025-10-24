import { useState, useEffect, useCallback } from 'react';
import { 
  Challenge, 
  UserChallenge, 
  ChallengeSession, 
  ChallengeLeaderboard, 
  ChallengeTemplate,
  ChallengeStats,
  ChallengeInsights,
  ChallengeEvent,
  ChallengeNotification,
  ChallengeSettings,
  ChallengeReport,
  ChallengeType,
  ChallengeCategory,
  ChallengeDifficulty,
  ChallengeStatus,
  RequirementType,
  RewardType,
  EventType,
  NotificationType
} from '../types';

export const useChallenges = (userId: string) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [templates, setTemplates] = useState<ChallengeTemplate[]>([]);
  const [leaderboards, setLeaderboards] = useState<ChallengeLeaderboard[]>([]);
  const [notifications, setNotifications] = useState<ChallengeNotification[]>([]);
  const [settings, setSettings] = useState<ChallengeSettings | null>(null);
  const [stats, setStats] = useState<ChallengeStats | null>(null);
  const [insights, setInsights] = useState<ChallengeInsights | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize challenges data
  useEffect(() => {
    const initializeChallenges = () => {
      // Mock challenges data
      const mockChallenges: Challenge[] = [
        {
          id: 'daily-missionary',
          name: 'Daily Missionary Master',
          description: 'Complete 3 missionary positions daily for a week',
          type: 'daily',
          category: 'missionary',
          difficulty: 'beginner',
          duration: {
            type: 'days',
            value: 7,
            description: '7 days'
          },
          requirements: [
            {
              id: 'req-1',
              type: 'positions_completed',
              target: 21, // 3 per day for 7 days
              current: 0,
              description: 'Complete 21 missionary positions',
              category: 'missionary',
              isOptional: false,
              weight: 1.0
            }
          ],
          rewards: [
            {
              id: 'reward-1',
              type: 'achievement',
              name: 'Missionary Master',
              description: 'Unlock the Missionary Master achievement',
              value: 100,
              rarity: 'rare',
              isUnlocked: false
            }
          ],
          rules: [
            'Must complete 3 positions per day',
            'Positions must be missionary category',
            'Minimum 5 minutes per position',
            'Track progress daily'
          ],
          isActive: true,
          isFeatured: true,
          isRecurring: false,
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          createdBy: 'system',
          createdAt: new Date(),
          updatedAt: new Date(),
          participants: 45,
          completions: 12,
          successRate: 26.7
        },
        {
          id: 'weekly-variety',
          name: 'Weekly Variety Explorer',
          description: 'Try positions from 5 different categories this week',
          type: 'weekly',
          category: 'variety',
          difficulty: 'intermediate',
          duration: {
            type: 'days',
            value: 7,
            description: '7 days'
          },
          requirements: [
            {
              id: 'req-2',
              type: 'variety_categories',
              target: 5,
              current: 0,
              description: 'Try positions from 5 different categories',
              isOptional: false,
              weight: 1.0
            }
          ],
          rewards: [
            {
              id: 'reward-2',
              type: 'badge',
              name: 'Variety Explorer',
              description: 'Unlock the Variety Explorer badge',
              value: 75,
              rarity: 'uncommon',
              isUnlocked: false
            }
          ],
          rules: [
            'Must try positions from 5 different categories',
            'Each category must have at least 1 position',
            'Track all attempts',
            'Share your experience'
          ],
          isActive: true,
          isFeatured: false,
          isRecurring: true,
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          createdBy: 'system',
          createdAt: new Date(),
          updatedAt: new Date(),
          participants: 32,
          completions: 8,
          successRate: 25.0
        }
      ];

      const mockSettings: ChallengeSettings = {
        enableNotifications: true,
        enableReminders: true,
        enableLeaderboards: true,
        enableRewards: true,
        enableSocial: true,
        autoStart: false,
        autoPause: false,
        reminderFrequency: 'daily',
        notificationTypes: ['challenge_started', 'challenge_completed', 'milestone_reached'],
        privacyLevel: 'public',
        shareProgress: true,
        shareAchievements: true,
        allowInvitations: true,
        maxActiveChallenges: 5,
        challengeDifficulty: ['beginner', 'intermediate'],
        preferredCategories: ['missionary', 'cowgirl', 'standing'],
        timeZone: 'UTC',
        language: 'en'
      };

      setChallenges(mockChallenges);
      setSettings(mockSettings);
      setIsLoading(false);
    };

    initializeChallenges();
  }, []);

  // Start a challenge
  const startChallenge = useCallback((challengeId: string) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return null;

    const userChallenge: UserChallenge = {
      id: `user-challenge-${Date.now()}`,
      challengeId,
      userId,
      status: 'in_progress',
      progress: 0,
      score: 0,
      startedAt: new Date(),
      lastUpdated: new Date(),
      requirements: challenge.requirements.map(req => ({
        requirementId: req.id,
        current: 0,
        target: req.target,
        isCompleted: false,
        progress: 0
      })),
      rewards: [],
      isActive: true,
      isPaused: false
    };

    setUserChallenges(prev => [...prev, userChallenge]);
    
    // Add event
    addChallengeEvent(challengeId, 'started', { challengeName: challenge.name });
    
    // Add notification
    addNotification({
      challengeId,
      type: 'challenge_started',
      title: 'Challenge Started',
      message: `You've started the ${challenge.name} challenge!`,
      priority: 'medium'
    });

    return userChallenge;
  }, [challenges]);

  // Update challenge progress
  const updateChallengeProgress = useCallback((challengeId: string, requirementId: string, value: number) => {
    setUserChallenges(prev => prev.map(uc => {
      if (uc.challengeId !== challengeId) return uc;

      const updatedRequirements = uc.requirements.map(req => {
        if (req.requirementId !== requirementId) return req;

        const newCurrent = Math.min(req.current + value, req.target);
        const isCompleted = newCurrent >= req.target;
        const progress = (newCurrent / req.target) * 100;

        return {
          ...req,
          current: newCurrent,
          isCompleted,
          progress,
          completedAt: isCompleted && !req.isCompleted ? new Date() : req.completedAt
        };
      });

      const overallProgress = updatedRequirements.reduce((sum, req) => sum + req.progress, 0) / updatedRequirements.length;
      const isCompleted = updatedRequirements.every(req => req.isCompleted);
      const status = isCompleted ? 'completed' : 'in_progress';

      // Add event for milestone
      if (overallProgress >= 25 && overallProgress < 50) {
        addChallengeEvent(challengeId, 'milestone', { progress: 25 });
      } else if (overallProgress >= 50 && overallProgress < 75) {
        addChallengeEvent(challengeId, 'milestone', { progress: 50 });
      } else if (overallProgress >= 75 && overallProgress < 100) {
        addChallengeEvent(challengeId, 'milestone', { progress: 75 });
      }

      // Add event for completion
      if (isCompleted && uc.status !== 'completed') {
        addChallengeEvent(challengeId, 'completed', { progress: 100 });
        addNotification({
          challengeId,
          type: 'challenge_completed',
          title: 'Challenge Completed!',
          message: `Congratulations! You've completed the challenge!`,
          priority: 'high'
        });
      }

      return {
        ...uc,
        requirements: updatedRequirements,
        progress: overallProgress,
        status,
        completedAt: isCompleted ? new Date() : uc.completedAt,
        lastUpdated: new Date()
      };
    }));
  }, []);

  // Pause a challenge
  const pauseChallenge = useCallback((challengeId: string, reason?: string) => {
    setUserChallenges(prev => prev.map(uc => 
      uc.challengeId === challengeId 
        ? { 
            ...uc, 
            isPaused: true, 
            pauseReason: reason,
            lastUpdated: new Date()
          }
        : uc
    ));

    addChallengeEvent(challengeId, 'paused', { reason });
  }, []);

  // Resume a challenge
  const resumeChallenge = useCallback((challengeId: string) => {
    setUserChallenges(prev => prev.map(uc => 
      uc.challengeId === challengeId 
        ? { 
            ...uc, 
            isPaused: false, 
            pauseReason: undefined,
            resumeAt: new Date(),
            lastUpdated: new Date()
          }
        : uc
    ));

    addChallengeEvent(challengeId, 'resumed', {});
  }, []);

  // Cancel a challenge
  const cancelChallenge = useCallback((challengeId: string) => {
    setUserChallenges(prev => prev.map(uc => 
      uc.challengeId === challengeId 
        ? { 
            ...uc, 
            status: 'cancelled',
            isActive: false,
            lastUpdated: new Date()
          }
        : uc
    ));

    addChallengeEvent(challengeId, 'cancelled', {});
  }, []);

  // Get challenge templates
  const getChallengeTemplates = useCallback((): ChallengeTemplate[] => {
    return [
      {
        id: 'template-daily-missionary',
        name: 'Daily Missionary Practice',
        description: 'Build consistency with daily missionary positions',
        type: 'daily',
        category: 'missionary',
        difficulty: 'beginner',
        duration: {
          type: 'days',
          value: 7,
          description: '7 days'
        },
        requirements: [
          {
            id: 'req-template-1',
            type: 'positions_completed',
            target: 7,
            current: 0,
            description: 'Complete 7 missionary positions',
            category: 'missionary',
            isOptional: false,
            weight: 1.0
          }
        ],
        rewards: [
          {
            id: 'reward-template-1',
            type: 'achievement',
            name: 'Daily Practice',
            description: 'Unlock the Daily Practice achievement',
            value: 50,
            rarity: 'common',
            isUnlocked: false
          }
        ],
        rules: [
          'Complete 1 missionary position per day',
          'Track your progress',
          'Share your experience'
        ],
        isPopular: true,
        isRecommended: true,
        usageCount: 150,
        successRate: 85.0,
        averageScore: 78.5,
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }, []);

  // Create custom challenge
  const createCustomChallenge = useCallback((challengeData: Omit<Challenge, 'id' | 'createdBy' | 'createdAt' | 'updatedAt' | 'participants' | 'completions' | 'successRate'>) => {
    const newChallenge: Challenge = {
      ...challengeData,
      id: `challenge-${Date.now()}`,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      participants: 0,
      completions: 0,
      successRate: 0
    };

    setChallenges(prev => [newChallenge, ...prev]);
    return newChallenge;
  }, [userId]);

  // Get challenge leaderboard
  const getChallengeLeaderboard = useCallback((challengeId: string): ChallengeLeaderboard | null => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return null;

    // Mock leaderboard data
    const entries = [
      {
        rank: 1,
        userId: 'user1',
        username: 'champion',
        displayName: 'Challenge Champion',
        score: 95,
        progress: 100,
        completedAt: new Date(),
        isCurrentUser: false,
        badges: ['speed_demon', 'perfectionist'],
        achievements: ['first_place', 'perfect_score']
      },
      {
        rank: 2,
        userId: userId,
        username: 'current_user',
        displayName: 'You',
        score: 87,
        progress: 87,
        isCurrentUser: true,
        badges: ['consistent', 'improving'],
        achievements: ['second_place', 'high_score']
      }
    ];

    return {
      challengeId,
      entries,
      totalParticipants: challenge.participants,
      lastUpdated: new Date()
    };
  }, [challenges, userId]);

  // Get challenge stats
  const getChallengeStats = useCallback((): ChallengeStats => {
    const totalChallenges = challenges.length;
    const activeChallenges = userChallenges.filter(uc => uc.status === 'in_progress').length;
    const completedChallenges = userChallenges.filter(uc => uc.status === 'completed').length;
    const totalScore = userChallenges.reduce((sum, uc) => sum + uc.score, 0);
    const averageScore = userChallenges.length > 0 ? totalScore / userChallenges.length : 0;
    const bestScore = Math.max(...userChallenges.map(uc => uc.score), 0);

    return {
      totalChallenges,
      activeChallenges,
      completedChallenges,
      totalScore,
      averageScore,
      bestScore,
      longestStreak: 7,
      currentStreak: 3,
      favoriteCategory: 'missionary',
      favoriteDifficulty: 'beginner',
      totalRewards: 15,
      achievementsUnlocked: 8,
      leaderboardRank: 2,
      participationRate: 75.0,
      successRate: 60.0,
      improvementRate: 25.0
    };
  }, [challenges, userChallenges]);

  // Get challenge insights
  const getChallengeInsights = useCallback((): ChallengeInsights => {
    return {
      keyInsights: [
        'You perform best on beginner challenges',
        'Your favorite category is missionary',
        'You complete 60% of challenges you start',
        'You improve by 25% on average'
      ],
      recommendations: [
        'Try intermediate challenges to push yourself',
        'Explore different categories for variety',
        'Set daily reminders to stay consistent',
        'Join group challenges for motivation'
      ],
      trends: [
        'Increasing completion rate',
        'Growing preference for daily challenges',
        'Improving consistency',
        'More social engagement'
      ],
      patterns: [
        'Best performance on weekdays',
        'Higher success with partner challenges',
        'Consistent improvement over time',
        'Preference for shorter duration challenges'
      ],
      opportunities: [
        'Try advanced challenges',
        'Explore new categories',
        'Join community challenges',
        'Set personal records'
      ],
      warnings: [
        'Avoid overcommitting to too many challenges',
        'Take breaks between intense challenges',
        'Listen to your body and partner',
        'Don\'t compare yourself to others'
      ],
      achievements: [
        'Completed 5 challenges this month',
        'Achieved 7-day streak',
        'Unlocked 3 new achievements',
        'Improved average score by 15%'
      ],
      goals: [
        'Complete 10 challenges this month',
        'Try 3 new categories',
        'Achieve 30-day streak',
        'Reach top 10 in leaderboard'
      ],
      performance: [
        {
          metric: 'Completion Rate',
          value: 60,
          trend: 'up',
          description: 'You complete 60% of challenges',
          recommendation: 'Set smaller, achievable goals'
        },
        {
          metric: 'Average Score',
          value: 78,
          trend: 'up',
          description: 'Your average score is 78/100',
          recommendation: 'Focus on consistency over perfection'
        }
      ],
      improvement: [
        {
          area: 'Endurance',
          current: 65,
          target: 80,
          progress: 81,
          description: 'Build stamina for longer sessions',
          action: 'Try endurance challenges',
          priority: 'medium'
        },
        {
          area: 'Variety',
          current: 40,
          target: 70,
          progress: 57,
          description: 'Explore different position categories',
          action: 'Join variety challenges',
          priority: 'high'
        }
      ]
    };
  }, []);

  // Add challenge event
  const addChallengeEvent = useCallback((challengeId: string, type: EventType, data: any) => {
    const event: ChallengeEvent = {
      id: `event-${Date.now()}`,
      challengeId,
      userId,
      type,
      data,
      timestamp: new Date(),
      description: `Challenge event: ${type}`
    };

    // This would typically be stored in a database
    console.log('Challenge event:', event);
  }, [userId]);

  // Add notification
  const addNotification = useCallback((notificationData: Omit<ChallengeNotification, 'id' | 'createdAt'>) => {
    const notification: ChallengeNotification = {
      ...notificationData,
      id: `notification-${Date.now()}`,
      createdAt: new Date()
    };

    setNotifications(prev => [notification, ...prev]);
  }, []);

  // Mark notification as read
  const markNotificationAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === notificationId 
        ? { ...notification, isRead: true }
        : notification
    ));
  }, []);

  // Update settings
  const updateSettings = useCallback((updates: Partial<ChallengeSettings>) => {
    setSettings(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  // Get available challenges
  const getAvailableChallenges = useCallback(() => {
    return challenges.filter(challenge => 
      challenge.isActive && 
      new Date() >= challenge.startDate && 
      new Date() <= challenge.endDate
    );
  }, [challenges]);

  // Get user's active challenges
  const getActiveChallenges = useCallback(() => {
    return userChallenges.filter(uc => uc.isActive && uc.status === 'in_progress');
  }, [userChallenges]);

  // Get user's completed challenges
  const getCompletedChallenges = useCallback(() => {
    return userChallenges.filter(uc => uc.status === 'completed');
  }, [userChallenges]);

  // Get challenge recommendations
  const getChallengeRecommendations = useCallback(() => {
    const userStats = getChallengeStats();
    const availableChallenges = getAvailableChallenges();
    
    return availableChallenges.filter(challenge => 
      challenge.difficulty === userStats.favoriteDifficulty ||
      challenge.category === userStats.favoriteCategory
    ).slice(0, 5);
  }, [getChallengeStats, getAvailableChallenges]);

  return {
    challenges,
    userChallenges,
    templates,
    leaderboards,
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
    createCustomChallenge,
    getChallengeLeaderboard,
    getChallengeStats,
    getChallengeInsights,
    markNotificationAsRead,
    updateSettings,
    getAvailableChallenges,
    getActiveChallenges,
    getCompletedChallenges,
    getChallengeRecommendations
  };
};
