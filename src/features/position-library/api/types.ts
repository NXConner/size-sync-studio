// API Request/Response Types for Position Library

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Achievement API Types
export interface CreateAchievementRequest {
  name: string;
  category: string;
  type: string;
  description?: string;
  requirements: string[];
  rewards: string[];
  difficulty: string;
  isPublic: boolean;
}

export interface UpdateAchievementRequest {
  name?: string;
  description?: string;
  requirements?: string[];
  rewards?: string[];
  difficulty?: string;
  isPublic?: boolean;
}

export interface AchievementResponse {
  id: string;
  name: string;
  category: string;
  type: string;
  description?: string;
  requirements: string[];
  rewards: string[];
  difficulty: string;
  isPublic: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
  createdAt: string;
  updatedAt: string;
}

// Personalization API Types
export interface UpdatePreferencesRequest {
  difficulty?: string;
  categories?: string[];
  mood?: string;
  duration?: number;
  intensity?: string;
  customTags?: string[];
  privacy?: string;
}

export interface CreatePartnerProfileRequest {
  name: string;
  preferences: {
    difficulty: string;
    categories: string[];
    mood: string;
    duration: number;
    intensity: string;
    customTags: string[];
    privacy: string;
  };
  notes?: string;
}

export interface UpdatePartnerProfileRequest {
  name?: string;
  preferences?: {
    difficulty?: string;
    categories?: string[];
    mood?: string;
    duration?: number;
    intensity?: string;
    customTags?: string[];
    privacy?: string;
  };
  notes?: string;
}

export interface PartnerProfileResponse {
  id: string;
  name: string;
  preferences: {
    difficulty: string;
    categories: string[];
    mood: string;
    duration: number;
    intensity: string;
    customTags: string[];
    privacy: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Position Creator API Types
export interface CreatePositionRequest {
  name: string;
  description: string;
  instructions: string[];
  tips: string[];
  difficulty: string;
  category: string;
  mood: string;
  duration: number;
  intensity: string;
  tags: string[];
  isPublic: boolean;
}

export interface UpdatePositionRequest {
  name?: string;
  description?: string;
  instructions?: string[];
  tips?: string[];
  difficulty?: string;
  category?: string;
  mood?: string;
  duration?: number;
  intensity?: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface PositionResponse {
  id: string;
  name: string;
  description: string;
  instructions: string[];
  tips: string[];
  difficulty: string;
  category: string;
  mood: string;
  duration: number;
  intensity: string;
  tags: string[];
  isPublic: boolean;
  authorId?: string;
  createdAt: string;
  updatedAt: string;
}

// Analytics API Types
export interface TrackSessionRequest {
  startTime: string;
  endTime: string;
  duration: number;
  positions: string[];
  difficulty: string;
  mood: string;
  intensity: string;
  notes?: string;
}

export interface TrackPositionUsageRequest {
  positionId: string;
  positionName: string;
  category: string;
  difficulty: string;
  mood: string;
  intensity: string;
  duration: number;
  timestamp: string;
}

export interface AnalyticsResponse {
  totalSessions: number;
  totalDuration: number;
  averageSessionDuration: number;
  totalPositions: number;
  averagePositionsPerSession: number;
  favoritePositions: string[];
  difficultyDistribution: Record<string, number>;
  categoryDistribution: Record<string, number>;
  moodDistribution: Record<string, number>;
  intensityDistribution: Record<string, number>;
  timeOfDayDistribution: Record<string, number>;
  dayOfWeekDistribution: Record<string, number>;
  monthlyStats: Array<{
    month: string;
    sessions: number;
    duration: number;
    positions: number;
  }>;
  weeklyStats: Array<{
    week: string;
    sessions: number;
    duration: number;
    positions: number;
  }>;
  dailyStats: Array<{
    date: string;
    sessions: number;
    duration: number;
    positions: number;
  }>;
}

// Community API Types
export interface CreatePostRequest {
  title: string;
  content: string;
  tags: string[];
  isPublic: boolean;
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface CreateCommentRequest {
  content: string;
  postId: string;
}

export interface PostResponse {
  id: string;
  title: string;
  content: string;
  author: string;
  tags: string[];
  likes: number;
  comments: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommentResponse {
  id: string;
  content: string;
  author: string;
  postId: string;
  createdAt: string;
  updatedAt: string;
}

// Challenge API Types
export interface CreateChallengeRequest {
  name: string;
  description: string;
  type: string;
  difficulty: string;
  duration: number;
  requirements: string[];
  rewards: string[];
}

export interface UpdateChallengeRequest {
  name?: string;
  description?: string;
  type?: string;
  difficulty?: string;
  duration?: number;
  requirements?: string[];
  rewards?: string[];
}

export interface ChallengeResponse {
  id: string;
  name: string;
  description: string;
  type: string;
  difficulty: string;
  duration: number;
  requirements: string[];
  rewards: string[];
  status: string;
  progress: number;
  maxProgress: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Search and Filter Types
export interface SearchRequest {
  query?: string;
  category?: string;
  difficulty?: string;
  mood?: string;
  tags?: string[];
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterRequest {
  categories?: string[];
  difficulties?: string[];
  moods?: string[];
  intensities?: string[];
  tags?: string[];
  isPublic?: boolean;
  authorId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

// Export/Import Types
export interface ExportDataRequest {
  features: string[];
  format: 'json' | 'csv' | 'pdf';
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface ImportDataRequest {
  data: any;
  features: string[];
  overwrite?: boolean;
}

// Sync Types
export interface SyncRequest {
  lastSync: string;
  features: string[];
}

export interface SyncResponse {
  data: any;
  lastSync: string;
  conflicts?: Array<{
    id: string;
    type: string;
    local: any;
    remote: any;
  }>;
}
