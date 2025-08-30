export interface Measurement {
  id: string;
  date: string;
  length: number;
  girth: number;
  notes?: string;
  sessionId?: string;
  photoUrl?: string;
  isPreSession?: boolean;
}

export interface Session {
  id: string;
  date: string;
  presetId: string;
  startTime: string;
  endTime?: string;
  preMeasurement?: Measurement;
  postMeasurement?: Measurement;
  notes?: string;
  status: 'active' | 'completed' | 'cancelled';
}

export interface SessionPreset {
  id: string;
  name: string;
  description: string;
  category: 'length' | 'girth' | 'both' | 'testicles';
  pressure: number; // kPa or similar unit
  duration: number; // minutes
  restPeriods: number[];
  safetyTips: string[];
  warnings: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  icon: string;
}

export interface Goal {
  id: string;
  type: 'length' | 'girth';
  target: number;
  current: number;
  deadline?: string;
  isActive: boolean;
}

export interface SafetyAlert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  message: string;
  timestamp: string;
  acknowledged: boolean;
}