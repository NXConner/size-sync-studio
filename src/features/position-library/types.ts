export interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video' | 'gif';
  name: string;
  description?: string;
  tags: string[];
  isPublic: boolean;
  uploadedBy?: string;
  uploadedAt?: string;
  thumbnail?: string;
}

export interface SexPosition {
  id: string;
  name: string;
  category: PositionCategory;
  difficulty: Difficulty;
  description: string;
  instructions: string[];
  tips: string[];
  benefits: string[];
  requirements: string[];
  duration: {
    min: number; // minimum recommended time in seconds
    max: number; // maximum recommended time in seconds
  };
  tags: string[];
  imageUrl?: string;
  media?: MediaItem[];
  rating?: number;
  views?: number;
  likes?: number;
  isPublic?: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type PositionCategory = 
  | 'missionary' 
  | 'cowgirl' 
  | 'doggy' 
  | 'standing' 
  | 'sitting' 
  | 'kneeling' 
  | 'side' 
  | 'spooning' 
  | 'oral' 
  | 'anal' 
  | 'kinky' 
  | 'tantric' 
  | 'beginner' 
  | 'advanced' 
  | 'acrobatic';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

// Type alias for backward compatibility
export type Position = SexPosition;

export interface GameSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  positions: SessionPosition[];
  totalDuration: number;
  climaxCount: number;
  breakCount: number;
  notes?: string;
}

export interface SessionPosition {
  position: SexPosition;
  startTime: Date;
  endTime?: Date;
  duration: number;
  completed: boolean;
  rating?: number; // 1-5 stars
  notes?: string;
}

export interface GameSettings {
  minPositionTime: number; // seconds
  maxPositionTime: number; // seconds
  categories: PositionCategory[];
  difficulty: Difficulty[];
  randomTimer: boolean;
  breakTime: number; // seconds
}
