import { 
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

// API Client Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';
const API_VERSION = 'v1';

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/${API_VERSION}`;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Achievement API Methods
  async getAchievements(params?: { page?: number; limit?: number; category?: string }): Promise<PaginatedResponse<AchievementResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);

    return this.request<AchievementResponse[]>(`/achievements?${queryParams.toString()}`);
  }

  async getAchievement(id: string): Promise<ApiResponse<AchievementResponse>> {
    return this.request<AchievementResponse>(`/achievements/${id}`);
  }

  async createAchievement(data: CreateAchievementRequest): Promise<ApiResponse<AchievementResponse>> {
    return this.request<AchievementResponse>('/achievements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAchievement(id: string, data: UpdateAchievementRequest): Promise<ApiResponse<AchievementResponse>> {
    return this.request<AchievementResponse>(`/achievements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAchievement(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/achievements/${id}`, {
      method: 'DELETE',
    });
  }

  async unlockAchievement(id: string): Promise<ApiResponse<AchievementResponse>> {
    return this.request<AchievementResponse>(`/achievements/${id}/unlock`, {
      method: 'POST',
    });
  }

  async updateAchievementProgress(id: string, progress: number): Promise<ApiResponse<AchievementResponse>> {
    return this.request<AchievementResponse>(`/achievements/${id}/progress`, {
      method: 'PUT',
      body: JSON.stringify({ progress }),
    });
  }

  // Personalization API Methods
  async getPreferences(): Promise<ApiResponse<any>> {
    return this.request<any>('/personalization/preferences');
  }

  async updatePreferences(data: UpdatePreferencesRequest): Promise<ApiResponse<any>> {
    return this.request<any>('/personalization/preferences', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getPartnerProfiles(): Promise<ApiResponse<PartnerProfileResponse[]>> {
    return this.request<PartnerProfileResponse[]>('/personalization/partner-profiles');
  }

  async getPartnerProfile(id: string): Promise<ApiResponse<PartnerProfileResponse>> {
    return this.request<PartnerProfileResponse>(`/personalization/partner-profiles/${id}`);
  }

  async createPartnerProfile(data: CreatePartnerProfileRequest): Promise<ApiResponse<PartnerProfileResponse>> {
    return this.request<PartnerProfileResponse>('/personalization/partner-profiles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePartnerProfile(id: string, data: UpdatePartnerProfileRequest): Promise<ApiResponse<PartnerProfileResponse>> {
    return this.request<PartnerProfileResponse>(`/personalization/partner-profiles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePartnerProfile(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/personalization/partner-profiles/${id}`, {
      method: 'DELETE',
    });
  }

  // Position Creator API Methods
  async getCustomPositions(params?: { page?: number; limit?: number; category?: string }): Promise<PaginatedResponse<PositionResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);

    return this.request<PositionResponse[]>(`/positions/custom?${queryParams.toString()}`);
  }

  async getCustomPosition(id: string): Promise<ApiResponse<PositionResponse>> {
    return this.request<PositionResponse>(`/positions/custom/${id}`);
  }

  async createPosition(data: CreatePositionRequest): Promise<ApiResponse<PositionResponse>> {
    return this.request<PositionResponse>('/positions/custom', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePosition(id: string, data: UpdatePositionRequest): Promise<ApiResponse<PositionResponse>> {
    return this.request<PositionResponse>(`/positions/custom/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePosition(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/positions/custom/${id}`, {
      method: 'DELETE',
    });
  }

  async getPublicPositions(params?: { page?: number; limit?: number; category?: string }): Promise<PaginatedResponse<PositionResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);

    return this.request<PositionResponse[]>(`/positions/public?${queryParams.toString()}`);
  }

  // Analytics API Methods
  async getAnalytics(): Promise<ApiResponse<AnalyticsResponse>> {
    return this.request<AnalyticsResponse>('/analytics');
  }

  async trackSession(data: TrackSessionRequest): Promise<ApiResponse<void>> {
    return this.request<void>('/analytics/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async trackPositionUsage(data: TrackPositionUsageRequest): Promise<ApiResponse<void>> {
    return this.request<void>('/analytics/positions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAnalyticsInsights(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/analytics/insights');
  }

  async getAnalyticsTrends(period: 'day' | 'week' | 'month' | 'year'): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(`/analytics/trends?period=${period}`);
  }

  async getAnalyticsRecommendations(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/analytics/recommendations');
  }

  // Community API Methods
  async getPosts(params?: { page?: number; limit?: number; category?: string; tags?: string[] }): Promise<PaginatedResponse<PostResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.tags) queryParams.append('tags', params.tags.join(','));

    return this.request<PostResponse[]>(`/community/posts?${queryParams.toString()}`);
  }

  async getPost(id: string): Promise<ApiResponse<PostResponse>> {
    return this.request<PostResponse>(`/community/posts/${id}`);
  }

  async createPost(data: CreatePostRequest): Promise<ApiResponse<PostResponse>> {
    return this.request<PostResponse>('/community/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePost(id: string, data: UpdatePostRequest): Promise<ApiResponse<PostResponse>> {
    return this.request<PostResponse>(`/community/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePost(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/community/posts/${id}`, {
      method: 'DELETE',
    });
  }

  async likePost(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/community/posts/${id}/like`, {
      method: 'POST',
    });
  }

  async unlikePost(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/community/posts/${id}/unlike`, {
      method: 'DELETE',
    });
  }

  async getComments(postId: string): Promise<ApiResponse<CommentResponse[]>> {
    return this.request<CommentResponse[]>(`/community/posts/${postId}/comments`);
  }

  async createComment(data: CreateCommentRequest): Promise<ApiResponse<CommentResponse>> {
    return this.request<CommentResponse>('/community/comments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateComment(id: string, content: string): Promise<ApiResponse<CommentResponse>> {
    return this.request<CommentResponse>(`/community/comments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  }

  async deleteComment(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/community/comments/${id}`, {
      method: 'DELETE',
    });
  }

  // Challenge API Methods
  async getChallenges(params?: { page?: number; limit?: number; type?: string; difficulty?: string }): Promise<PaginatedResponse<ChallengeResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.difficulty) queryParams.append('difficulty', params.difficulty);

    return this.request<ChallengeResponse[]>(`/challenges?${queryParams.toString()}`);
  }

  async getChallenge(id: string): Promise<ApiResponse<ChallengeResponse>> {
    return this.request<ChallengeResponse>(`/challenges/${id}`);
  }

  async createChallenge(data: CreateChallengeRequest): Promise<ApiResponse<ChallengeResponse>> {
    return this.request<ChallengeResponse>('/challenges', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateChallenge(id: string, data: UpdateChallengeRequest): Promise<ApiResponse<ChallengeResponse>> {
    return this.request<ChallengeResponse>(`/challenges/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteChallenge(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/challenges/${id}`, {
      method: 'DELETE',
    });
  }

  async startChallenge(id: string): Promise<ApiResponse<ChallengeResponse>> {
    return this.request<ChallengeResponse>(`/challenges/${id}/start`, {
      method: 'POST',
    });
  }

  async completeChallenge(id: string): Promise<ApiResponse<ChallengeResponse>> {
    return this.request<ChallengeResponse>(`/challenges/${id}/complete`, {
      method: 'POST',
    });
  }

  async updateChallengeProgress(id: string, progress: number): Promise<ApiResponse<ChallengeResponse>> {
    return this.request<ChallengeResponse>(`/challenges/${id}/progress`, {
      method: 'PUT',
      body: JSON.stringify({ progress }),
    });
  }

  // Search and Filter Methods
  async searchPositions(query: SearchRequest): Promise<PaginatedResponse<PositionResponse>> {
    const queryParams = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    return this.request<PositionResponse[]>(`/search/positions?${queryParams.toString()}`);
  }

  async filterPositions(filters: FilterRequest): Promise<PaginatedResponse<PositionResponse>> {
    return this.request<PositionResponse[]>('/search/positions/filter', {
      method: 'POST',
      body: JSON.stringify(filters),
    });
  }

  // Export/Import Methods
  async exportData(request: ExportDataRequest): Promise<ApiResponse<Blob>> {
    return this.request<Blob>('/export', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async importData(request: ImportDataRequest): Promise<ApiResponse<void>> {
    return this.request<void>('/import', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Sync Methods
  async syncData(request: SyncRequest): Promise<ApiResponse<SyncResponse>> {
    return this.request<SyncResponse>('/sync', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Health Check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.request<{ status: string; timestamp: string }>('/health');
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
