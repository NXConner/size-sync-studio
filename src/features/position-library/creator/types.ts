export interface CustomPosition {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  instructions: string[];
  tips: string[];
  benefits: string[];
  requirements: string[];
  duration: {
    min: number;
    max: number;
  };
  tags: string[];
  images: PositionImage[];
  videos: PositionVideo[];
  isPublic: boolean;
  isVerified: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  views: number;
  shares: number;
  rating: number;
  reviewCount: number;
}

export interface PositionImage {
  id: string;
  url: string;
  caption?: string;
  isPrivate: boolean;
  uploadedAt: Date;
  size: number;
  type: 'instruction' | 'example' | 'diagram';
}

export interface PositionVideo {
  id: string;
  url: string;
  caption?: string;
  isPrivate: boolean;
  uploadedAt: Date;
  duration: number;
  size: number;
  type: 'tutorial' | 'demonstration' | 'instruction';
}

export interface PositionTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  instructions: string[];
  tips: string[];
  benefits: string[];
  requirements: string[];
  duration: {
    min: number;
    max: number;
  };
  tags: string[];
}

export interface CreatorSettings {
  allowPublicSharing: boolean;
  allowPartnerSharing: boolean;
  autoSave: boolean;
  saveInterval: number; // in seconds
  maxImages: number;
  maxVideos: number;
  maxImageSize: number; // in MB
  maxVideoSize: number; // in MB
  allowedImageTypes: string[];
  allowedVideoTypes: string[];
  requireVerification: boolean;
  enableComments: boolean;
  enableRatings: boolean;
}

export interface CreatorStats {
  totalPositions: number;
  publicPositions: number;
  privatePositions: number;
  totalViews: number;
  totalLikes: number;
  totalShares: number;
  averageRating: number;
  mostPopularPosition: CustomPosition | null;
  recentActivity: CreatorActivity[];
}

export interface CreatorActivity {
  id: string;
  type: 'created' | 'updated' | 'shared' | 'liked' | 'viewed';
  positionId: string;
  positionName: string;
  timestamp: Date;
  details?: string;
}

export interface PositionDraft {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  instructions: string[];
  tips: string[];
  benefits: string[];
  requirements: string[];
  duration: {
    min: number;
    max: number;
  };
  tags: string[];
  images: PositionImage[];
  videos: PositionVideo[];
  isPublic: boolean;
  lastSaved: Date;
  version: number;
}

export interface PositionReview {
  id: string;
  positionId: string;
  reviewerId: string;
  rating: number;
  comment: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PositionShare {
  id: string;
  positionId: string;
  sharedWith: string;
  shareType: 'partner' | 'friend' | 'public';
  message?: string;
  createdAt: Date;
  expiresAt?: Date;
}

export interface CreatorWorkspace {
  id: string;
  name: string;
  description?: string;
  positions: string[];
  collaborators: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PositionCollaboration {
  id: string;
  positionId: string;
  collaboratorId: string;
  role: 'owner' | 'editor' | 'viewer';
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
    canShare: boolean;
    canPublish: boolean;
  };
  invitedAt: Date;
  acceptedAt?: Date;
  status: 'pending' | 'accepted' | 'declined' | 'revoked';
}

export interface PositionVersion {
  id: string;
  positionId: string;
  version: number;
  changes: string[];
  createdBy: string;
  createdAt: Date;
  isCurrent: boolean;
  rollbackData: Partial<CustomPosition>;
}

export interface PositionAnalytics {
  positionId: string;
  views: number;
  likes: number;
  shares: number;
  saves: number;
  ratings: number[];
  averageRating: number;
  demographics: {
    ageGroups: Record<string, number>;
    genders: Record<string, number>;
    locations: Record<string, number>;
  };
  engagement: {
    timeSpent: number;
    completionRate: number;
    returnRate: number;
  };
  feedback: {
    positive: number;
    negative: number;
    suggestions: string[];
  };
}
