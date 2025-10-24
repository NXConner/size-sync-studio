import { Achievement } from '../types';

export const achievements: Achievement[] = [
  // Position Master Badges
  {
    id: 'missionary_master',
    name: 'Missionary Master',
    description: 'Complete all missionary positions',
    category: 'position_master',
    rarity: 'uncommon',
    icon: '💕',
    points: 50,
    requirements: [
      {
        type: 'positions_completed',
        target: 5,
        current: 0,
        description: 'Complete 5 missionary positions',
        category: 'missionary'
      }
    ],
    progress: 0,
    isUnlocked: false,
    tags: ['missionary', 'intimate', 'beginner']
  },
  {
    id: 'cowgirl_master',
    name: 'Cowgirl Master',
    description: 'Complete all cowgirl positions',
    category: 'position_master',
    rarity: 'uncommon',
    icon: '🏇',
    points: 50,
    requirements: [
      {
        type: 'positions_completed',
        target: 4,
        current: 0,
        description: 'Complete 4 cowgirl positions',
        category: 'cowgirl'
      }
    ],
    progress: 0,
    isUnlocked: false,
    tags: ['cowgirl', 'control', 'intimate']
  },
  {
    id: 'doggy_master',
    name: 'Doggy Master',
    description: 'Complete all doggy style positions',
    category: 'position_master',
    rarity: 'uncommon',
    icon: '🐕',
    points: 50,
    requirements: [
      {
        type: 'positions_completed',
        target: 3,
        current: 0,
        description: 'Complete 3 doggy style positions',
        category: 'doggy'
      }
    ],
    progress: 0,
    isUnlocked: false,
    tags: ['doggy', 'passionate', 'intense']
  },
  {
    id: 'oral_master',
    name: 'Oral Master',
    description: 'Complete all oral positions',
    category: 'position_master',
    rarity: 'rare',
    icon: '👄',
    points: 75,
    requirements: [
      {
        type: 'positions_completed',
        target: 3,
        current: 0,
        description: 'Complete 3 oral positions',
        category: 'oral'
      }
    ],
    progress: 0,
    isUnlocked: false,
    tags: ['oral', 'intimate', 'mutual']
  },

  // Endurance Challenges
  {
    id: 'endurance_warrior',
    name: 'Endurance Warrior',
    description: 'Hold a position for 30+ minutes',
    category: 'endurance',
    rarity: 'rare',
    icon: '⏰',
    points: 100,
    requirements: [
      {
        type: 'session_time',
        target: 1800, // 30 minutes in seconds
        current: 0,
        description: 'Hold a single position for 30+ minutes'
      }
    ],
    progress: 0,
    isUnlocked: false,
    tags: ['endurance', 'challenge', 'time']
  },
  {
    id: 'marathon_session',
    name: 'Marathon Session',
    description: 'Complete a 2+ hour session',
    category: 'endurance',
    rarity: 'epic',
    icon: '🏃‍♂️',
    points: 200,
    requirements: [
      {
        type: 'session_time',
        target: 7200, // 2 hours in seconds
        current: 0,
        description: 'Complete a 2+ hour session'
      }
    ],
    progress: 0,
    isUnlocked: false,
    tags: ['endurance', 'marathon', 'dedication']
  },
  {
    id: 'iron_will',
    name: 'Iron Will',
    description: 'Complete 5 positions in a single session',
    category: 'endurance',
    rarity: 'rare',
    icon: '💪',
    points: 150,
    requirements: [
      {
        type: 'positions_completed',
        target: 5,
        current: 0,
        description: 'Complete 5 positions in one session'
      }
    ],
    progress: 0,
    isUnlocked: false,
    tags: ['endurance', 'variety', 'dedication']
  },

  // Variety Seeker
  {
    id: 'variety_seeker',
    name: 'Variety Seeker',
    description: 'Try positions from 5 different categories',
    category: 'variety',
    rarity: 'uncommon',
    icon: '🌈',
    points: 75,
    requirements: [
      {
        type: 'variety_categories',
        target: 5,
        current: 0,
        description: 'Try positions from 5 different categories'
      }
    ],
    progress: 0,
    isUnlocked: false,
    tags: ['variety', 'exploration', 'adventure']
  },
  {
    id: 'category_explorer',
    name: 'Category Explorer',
    description: 'Try positions from all major categories',
    category: 'variety',
    rarity: 'epic',
    icon: '🗺️',
    points: 300,
    requirements: [
      {
        type: 'variety_categories',
        target: 10,
        current: 0,
        description: 'Try positions from all major categories'
      }
    ],
    progress: 0,
    isUnlocked: false,
    tags: ['variety', 'exploration', 'comprehensive']
  },
  {
    id: 'adventure_seeker',
    name: 'Adventure Seeker',
    description: 'Try advanced and expert positions',
    category: 'variety',
    rarity: 'rare',
    icon: '🧗‍♀️',
    points: 125,
    requirements: [
      {
        type: 'positions_completed',
        target: 3,
        current: 0,
        description: 'Complete 3 advanced/expert positions',
        difficulty: 'advanced'
      }
    ],
    progress: 0,
    isUnlocked: false,
    tags: ['variety', 'advanced', 'challenge']
  },

  // Streak Master
  {
    id: 'daily_warrior',
    name: 'Daily Warrior',
    description: 'Complete sessions for 7 consecutive days',
    category: 'streak',
    rarity: 'rare',
    icon: '🔥',
    points: 100,
    requirements: [
      {
        type: 'streak_days',
        target: 7,
        current: 0,
        description: 'Complete sessions for 7 consecutive days',
        timeFrame: 'daily'
      }
    ],
    progress: 0,
    isUnlocked: false,
    tags: ['streak', 'consistency', 'dedication']
  },
  {
    id: 'streak_master',
    name: 'Streak Master',
    description: 'Complete sessions for 30 consecutive days',
    category: 'streak',
    rarity: 'legendary',
    icon: '👑',
    points: 500,
    requirements: [
      {
        type: 'streak_days',
        target: 30,
        current: 0,
        description: 'Complete sessions for 30 consecutive days',
        timeFrame: 'daily'
      }
    ],
    progress: 0,
    isUnlocked: false,
    tags: ['streak', 'mastery', 'legendary']
  },
  {
    id: 'weekend_warrior',
    name: 'Weekend Warrior',
    description: 'Complete sessions for 4 consecutive weekends',
    category: 'streak',
    rarity: 'uncommon',
    icon: '🏖️',
    points: 75,
    requirements: [
      {
        type: 'streak_days',
        target: 4,
        current: 0,
        description: 'Complete sessions for 4 consecutive weekends',
        timeFrame: 'weekly'
      }
    ],
    progress: 0,
    isUnlocked: false,
    tags: ['streak', 'weekend', 'consistency']
  },

  // Time Master
  {
    id: 'time_master',
    name: 'Time Master',
    description: 'Accumulate 100 hours of total session time',
    category: 'time',
    rarity: 'epic',
    icon: '⏳',
    points: 400,
    requirements: [
      {
        type: 'session_time',
        target: 360000, // 100 hours in seconds
        current: 0,
        description: 'Accumulate 100 hours of total session time'
      }
    ],
    progress: 0,
    isUnlocked: false,
    tags: ['time', 'mastery', 'dedication']
  },
  {
    id: 'hour_warrior',
    name: 'Hour Warrior',
    description: 'Accumulate 10 hours of total session time',
    category: 'time',
    rarity: 'uncommon',
    icon: '⏰',
    points: 50,
    requirements: [
      {
        type: 'session_time',
        target: 36000, // 10 hours in seconds
        current: 0,
        description: 'Accumulate 10 hours of total session time'
      }
    ],
    progress: 0,
    isUnlocked: false,
    tags: ['time', 'milestone', 'progress']
  },

  // Rating Expert
  {
    id: 'rating_expert',
    name: 'Rating Expert',
    description: 'Rate 50 positions with detailed feedback',
    category: 'rating',
    rarity: 'rare',
    icon: '⭐',
    points: 150,
    requirements: [
      {
        type: 'positions_rated',
        target: 50,
        current: 0,
        description: 'Rate 50 positions with detailed feedback'
      }
    ],
    progress: 0,
    isUnlocked: false,
    tags: ['rating', 'feedback', 'community']
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Give 5-star ratings to 20 positions',
    category: 'rating',
    rarity: 'uncommon',
    icon: '✨',
    points: 100,
    requirements: [
      {
        type: 'perfect_ratings',
        target: 20,
        current: 0,
        description: 'Give 5-star ratings to 20 positions'
      }
    ],
    progress: 0,
    isUnlocked: false,
    tags: ['rating', 'perfection', 'quality']
  },
  {
    id: 'detailed_reviewer',
    name: 'Detailed Reviewer',
    description: 'Add notes to 25 positions',
    category: 'rating',
    rarity: 'uncommon',
    icon: '📝',
    points: 75,
    requirements: [
      {
        type: 'notes_added',
        target: 25,
        current: 0,
        description: 'Add notes to 25 positions'
      }
    ],
    progress: 0,
    isUnlocked: false,
    tags: ['rating', 'notes', 'detail']
  },

  // Social Achievements
  {
    id: 'partner_sync',
    name: 'Partner Sync',
    description: 'Complete 10 sessions with your partner',
    category: 'social',
    rarity: 'rare',
    icon: '💑',
    points: 200,
    requirements: [
      {
        type: 'partner_sessions',
        target: 10,
        current: 0,
        description: 'Complete 10 sessions with your partner'
      }
    ],
    progress: 0,
    isUnlocked: false,
    tags: ['social', 'partner', 'connection']
  },
  {
    id: 'team_player',
    name: 'Team Player',
    description: 'Complete 5 partner challenges',
    category: 'social',
    rarity: 'uncommon',
    icon: '🤝',
    points: 100,
    requirements: [
      {
        type: 'challenges_completed',
        target: 5,
        current: 0,
        description: 'Complete 5 partner challenges'
      }
    ],
    progress: 0,
    isUnlocked: false,
    tags: ['social', 'teamwork', 'challenge']
  },

  // Exploration Achievements
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Complete your first position',
    category: 'exploration',
    rarity: 'common',
    icon: '👶',
    points: 10,
    requirements: [
      {
        type: 'positions_completed',
        target: 1,
        current: 0,
        description: 'Complete your first position'
      }
    ],
    progress: 0,
    isUnlocked: false,
    tags: ['exploration', 'first', 'milestone']
  },
  {
    id: 'curious_explorer',
    name: 'Curious Explorer',
    description: 'Try 10 different positions',
    category: 'exploration',
    rarity: 'uncommon',
    icon: '🔍',
    points: 75,
    requirements: [
      {
        type: 'positions_completed',
        target: 10,
        current: 0,
        description: 'Try 10 different positions'
      }
    ],
    progress: 0,
    isUnlocked: false,
    tags: ['exploration', 'curiosity', 'variety']
  },
  {
    id: 'adventure_complete',
    name: 'Adventure Complete',
    description: 'Try 50 different positions',
    category: 'exploration',
    rarity: 'epic',
    icon: '🗺️',
    points: 300,
    requirements: [
      {
        type: 'positions_completed',
        target: 50,
        current: 0,
        description: 'Try 50 different positions'
      }
    ],
    progress: 0,
    isUnlocked: false,
    tags: ['exploration', 'adventure', 'comprehensive']
  },

  // Wellness Achievements
  {
    id: 'wellness_warrior',
    name: 'Wellness Warrior',
    description: 'Complete 20 wellness-focused positions',
    category: 'wellness',
    rarity: 'rare',
    icon: '🧘‍♀️',
    points: 150,
    requirements: [
      {
        type: 'positions_completed',
        target: 20,
        current: 0,
        description: 'Complete 20 wellness-focused positions',
        category: 'tantric'
      }
    ],
    progress: 0,
    isUnlocked: false,
    tags: ['wellness', 'mindfulness', 'health']
  },
  {
    id: 'mindful_practitioner',
    name: 'Mindful Practitioner',
    description: 'Complete 10 meditation-focused sessions',
    category: 'wellness',
    rarity: 'uncommon',
    icon: '🧘‍♂️',
    points: 100,
    requirements: [
      {
        type: 'sessions_completed',
        target: 10,
        current: 0,
        description: 'Complete 10 meditation-focused sessions'
      }
    ],
    progress: 0,
    isUnlocked: false,
    tags: ['wellness', 'meditation', 'mindfulness']
  },

  // Special Achievements
  {
    id: 'midnight_warrior',
    name: 'Midnight Warrior',
    description: 'Complete a session between midnight and 3 AM',
    category: 'special',
    rarity: 'rare',
    icon: '🌙',
    points: 100,
    requirements: [
      {
        type: 'sessions_completed',
        target: 1,
        current: 0,
        description: 'Complete a session between midnight and 3 AM'
      }
    ],
    progress: 0,
    isUnlocked: false,
    isSecret: true,
    tags: ['special', 'night', 'secret']
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete a session between 5 AM and 8 AM',
    category: 'special',
    rarity: 'uncommon',
    icon: '🌅',
    points: 75,
    requirements: [
      {
        type: 'sessions_completed',
        target: 1,
        current: 0,
        description: 'Complete a session between 5 AM and 8 AM'
      }
    ],
    progress: 0,
    isUnlocked: false,
    tags: ['special', 'morning', 'early']
  },
  {
    id: 'weekend_warrior_special',
    name: 'Weekend Warrior Special',
    description: 'Complete sessions on both Saturday and Sunday',
    category: 'special',
    rarity: 'uncommon',
    icon: '🏖️',
    points: 100,
    requirements: [
      {
        type: 'sessions_completed',
        target: 2,
        current: 0,
        description: 'Complete sessions on both Saturday and Sunday'
      }
    ],
    progress: 0,
    isUnlocked: false,
    tags: ['special', 'weekend', 'dedication']
  }
];
