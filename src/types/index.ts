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
  status: "active" | "completed" | "cancelled";
  // Added tracking fields
  pressureLogs?: Array<{
    timestamp: string; // ISO time
    pressure: number; // kPa or chosen unit
  }>;
  tubeIntervals?: Array<{
    start: string; // ISO time in tube start
    end?: string; // ISO time in tube end
  }>;
  breaks?: Array<{
    start: string; // ISO time break start
    end?: string; // ISO time break end
  }>;
}

export interface SessionPreset {
  id: string;
  name: string;
  description: string;
  category: "length" | "girth" | "both" | "testicles";
  pressure: number; // kPa or similar unit
  duration: number; // minutes
  restPeriods: number[];
  safetyTips: string[];
  warnings: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  icon: string;
}

export interface Goal {
  id: string;
  type: "length" | "girth";
  target: number;
  current: number;
  deadline?: string;
  isActive: boolean;
}

export * from './screening';
