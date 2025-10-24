// Position Library API Exports

export { default as apiClient } from './client';
export { apiClient } from './client';

export type {
  ApiResponse,
  PaginatedResponse,
  CreateAchievementRequest,
  UpdateAchievementRequest,
  AchievementResponse,
  UpdatePreferencesRequest,
  CreatePartnerProfileRequest,
  UpdatePartnerProfileRequest,
  PartnerProfileResponse,
  CreatePositionRequest,
  UpdatePositionRequest,
  PositionResponse,
  TrackSessionRequest,
  TrackPositionUsageRequest,
  AnalyticsResponse,
  CreatePostRequest,
  UpdatePostRequest,
  CreateCommentRequest,
  PostResponse,
  CommentResponse,
  CreateChallengeRequest,
  UpdateChallengeRequest,
  ChallengeResponse,
  SearchRequest,
  FilterRequest,
  ExportDataRequest,
  ImportDataRequest,
  SyncRequest,
  SyncResponse
} from './types';

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api',
  VERSION: 'v1',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Achievement endpoints
  ACHIEVEMENTS: '/achievements',
  ACHIEVEMENT_BY_ID: (id: string) => `/achievements/${id}`,
  UNLOCK_ACHIEVEMENT: (id: string) => `/achievements/${id}/unlock`,
  UPDATE_ACHIEVEMENT_PROGRESS: (id: string) => `/achievements/${id}/progress`,

  // Personalization endpoints
  PREFERENCES: '/personalization/preferences',
  PARTNER_PROFILES: '/personalization/partner-profiles',
  PARTNER_PROFILE_BY_ID: (id: string) => `/personalization/partner-profiles/${id}`,

  // Position Creator endpoints
  CUSTOM_POSITIONS: '/positions/custom',
  CUSTOM_POSITION_BY_ID: (id: string) => `/positions/custom/${id}`,
  PUBLIC_POSITIONS: '/positions/public',

  // Analytics endpoints
  ANALYTICS: '/analytics',
  TRACK_SESSION: '/analytics/sessions',
  TRACK_POSITION_USAGE: '/analytics/positions',
  ANALYTICS_INSIGHTS: '/analytics/insights',
  ANALYTICS_TRENDS: '/analytics/trends',
  ANALYTICS_RECOMMENDATIONS: '/analytics/recommendations',

  // Community endpoints
  POSTS: '/community/posts',
  POST_BY_ID: (id: string) => `/community/posts/${id}`,
  LIKE_POST: (id: string) => `/community/posts/${id}/like`,
  UNLIKE_POST: (id: string) => `/community/posts/${id}/unlike`,
  POST_COMMENTS: (postId: string) => `/community/posts/${postId}/comments`,
  COMMENTS: '/community/comments',
  COMMENT_BY_ID: (id: string) => `/community/comments/${id}`,

  // Challenge endpoints
  CHALLENGES: '/challenges',
  CHALLENGE_BY_ID: (id: string) => `/challenges/${id}`,
  START_CHALLENGE: (id: string) => `/challenges/${id}/start`,
  COMPLETE_CHALLENGE: (id: string) => `/challenges/${id}/complete`,
  UPDATE_CHALLENGE_PROGRESS: (id: string) => `/challenges/${id}/progress`,

  // Search and Filter endpoints
  SEARCH_POSITIONS: '/search/positions',
  FILTER_POSITIONS: '/search/positions/filter',

  // Export/Import endpoints
  EXPORT: '/export',
  IMPORT: '/import',

  // Sync endpoints
  SYNC: '/sync',

  // Health check
  HEALTH: '/health',
} as const;

// API Error Types
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// API Response Helpers
export const isApiError = (response: any): response is ApiError => {
  return response instanceof ApiError;
};

export const handleApiResponse = <T>(response: any): T => {
  if (response.success) {
    return response.data;
  } else {
    throw new ApiError(response.error || 'Unknown API error', response.status);
  }
};

// API Request Helpers
export const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, item.toString()));
      } else {
        searchParams.append(key, value.toString());
      }
    }
  });

  return searchParams.toString();
};

export const buildUrl = (baseUrl: string, endpoint: string, params?: Record<string, any>): string => {
  const url = `${baseUrl}${endpoint}`;
  
  if (params) {
    const queryString = buildQueryString(params);
    return queryString ? `${url}?${queryString}` : url;
  }
  
  return url;
};

// API Middleware
export const withRetry = async <T>(
  fn: () => Promise<T>,
  attempts: number = API_CONFIG.RETRY_ATTEMPTS,
  delay: number = API_CONFIG.RETRY_DELAY
): Promise<T> => {
  let lastError: Error;

  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (i < attempts - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }

  throw lastError!;
};

export const withTimeout = async <T>(
  fn: () => Promise<T>,
  timeout: number = API_CONFIG.TIMEOUT
): Promise<T> => {
  return Promise.race([
    fn(),
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new ApiError('Request timeout')), timeout);
    })
  ]);
};

// API Cache
export class ApiCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl: number = 300000): void { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const apiCache = new ApiCache();
