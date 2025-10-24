export interface CommunityUser {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  joinDate: Date;
  isVerified: boolean;
  isModerator: boolean;
  isAdmin: boolean;
  stats: UserStats;
  preferences: UserPreferences;
  privacy: PrivacySettings;
}

export interface UserStats {
  totalSessions: number;
  totalPositions: number;
  totalTime: number; // in seconds
  achievements: number;
  level: number;
  experience: number;
  followers: number;
  following: number;
  posts: number;
  likes: number;
  comments: number;
  shares: number;
}

export interface UserPreferences {
  showActivity: boolean;
  showAchievements: boolean;
  showStats: boolean;
  allowMessages: boolean;
  allowFollows: boolean;
  allowComments: boolean;
  allowShares: boolean;
  notificationSettings: NotificationSettings;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  activityVisibility: 'public' | 'friends' | 'private';
  statsVisibility: 'public' | 'friends' | 'private';
  allowFriendRequests: boolean;
  allowMessages: boolean;
  allowTags: boolean;
}

export interface NotificationSettings {
  newFollowers: boolean;
  newMessages: boolean;
  newComments: boolean;
  newLikes: boolean;
  newShares: boolean;
  newAchievements: boolean;
  newChallenges: boolean;
  weeklyDigest: boolean;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  author: CommunityUser;
  type: PostType;
  title: string;
  content: string;
  images?: string[];
  videos?: string[];
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
  views: number;
  isPublic: boolean;
  isPinned: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
  editedAt?: Date;
}

export type PostType = 
  | 'achievement'
  | 'tip'
  | 'question'
  | 'review'
  | 'challenge'
  | 'milestone'
  | 'general';

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  author: CommunityUser;
  content: string;
  likes: number;
  replies: PostComment[];
  parentId?: string;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostLike {
  id: string;
  postId: string;
  userId: string;
  createdAt: Date;
}

export interface PostShare {
  id: string;
  postId: string;
  userId: string;
  message?: string;
  createdAt: Date;
}

export interface CommunityChallenge {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  category: string;
  requirements: ChallengeRequirement[];
  rewards: ChallengeReward[];
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  isFeatured: boolean;
  participants: number;
  completions: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ChallengeType = 
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'special'
  | 'community'
  | 'partner';

export interface ChallengeRequirement {
  type: 'positions' | 'sessions' | 'time' | 'achievements' | 'streak';
  target: number;
  description: string;
  category?: string;
  difficulty?: string;
}

export interface ChallengeReward {
  type: 'points' | 'achievement' | 'badge' | 'unlock';
  value: number;
  name: string;
  description: string;
  icon?: string;
}

export interface UserChallenge {
  id: string;
  challengeId: string;
  userId: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  progress: number; // 0-100
  startedAt: Date;
  completedAt?: Date;
  notes?: string;
}

export interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  members: number;
  posts: number;
  isPublic: boolean;
  isVerified: boolean;
  rules: string[];
  moderators: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupMembership {
  id: string;
  groupId: string;
  userId: string;
  role: 'member' | 'moderator' | 'admin';
  joinedAt: Date;
  isActive: boolean;
}

export interface CommunityMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'file';
  attachments?: string[];
  isRead: boolean;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  type: EventType;
  startDate: Date;
  endDate: Date;
  location?: string;
  isVirtual: boolean;
  maxParticipants?: number;
  participants: number;
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type EventType = 
  | 'workshop'
  | 'challenge'
  | 'meetup'
  | 'webinar'
  | 'contest'
  | 'social';

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  status: 'registered' | 'attended' | 'cancelled';
  registeredAt: Date;
  attendedAt?: Date;
}

export interface CommunityReport {
  id: string;
  reporterId: string;
  reportedUserId?: string;
  reportedPostId?: string;
  reportedCommentId?: string;
  type: ReportType;
  reason: string;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewedBy?: string;
  reviewedAt?: Date;
  resolution?: string;
  createdAt: Date;
}

export type ReportType = 
  | 'spam'
  | 'harassment'
  | 'inappropriate'
  | 'fake'
  | 'other';

export interface CommunityModeration {
  id: string;
  moderatorId: string;
  action: ModerationAction;
  targetType: 'user' | 'post' | 'comment' | 'group';
  targetId: string;
  reason: string;
  duration?: number; // in days
  isActive: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export type ModerationAction = 
  | 'warn'
  | 'mute'
  | 'ban'
  | 'delete'
  | 'hide'
  | 'lock';

export interface CommunityInsights {
  totalUsers: number;
  activeUsers: number;
  totalPosts: number;
  totalComments: number;
  totalLikes: number;
  totalShares: number;
  engagementRate: number;
  topPosts: CommunityPost[];
  topUsers: CommunityUser[];
  trendingTags: string[];
  popularCategories: string[];
  growthMetrics: GrowthMetrics;
}

export interface GrowthMetrics {
  newUsers: number;
  newPosts: number;
  newComments: number;
  newLikes: number;
  newShares: number;
  period: 'daily' | 'weekly' | 'monthly';
  startDate: Date;
  endDate: Date;
}

export interface CommunitySettings {
  allowPublicPosts: boolean;
  allowAnonymousPosts: boolean;
  requireModeration: boolean;
  allowUserGroups: boolean;
  allowEvents: boolean;
  allowChallenges: boolean;
  allowMessaging: boolean;
  allowSharing: boolean;
  maxPostLength: number;
  maxCommentLength: number;
  maxImagesPerPost: number;
  maxVideosPerPost: number;
  moderationLevel: 'low' | 'medium' | 'high' | 'strict';
}

export interface CommunityFeed {
  posts: CommunityPost[];
  hasMore: boolean;
  nextCursor?: string;
  lastUpdated: Date;
}

export interface CommunitySearch {
  query: string;
  filters: SearchFilters;
  results: SearchResults;
  totalResults: number;
  searchTime: number; // in milliseconds
}

export interface SearchFilters {
  type?: PostType[];
  category?: string[];
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  author?: string;
  isVerified?: boolean;
}

export interface SearchResults {
  posts: CommunityPost[];
  users: CommunityUser[];
  groups: CommunityGroup[];
  challenges: CommunityChallenge[];
  events: CommunityEvent[];
}
