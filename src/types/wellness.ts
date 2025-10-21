export type PoseVisualKey =
  | "facing"
  | "side_by_side"
  | "back_to_back"
  | "seated_embrace"
  | "stacked"
  | "support_stand"
  | "support_kneel"
  | "recline"
  | "lunge_support";

export type WellnessDifficulty = "gentle" | "moderate" | "energetic";

export interface WellnessPosition {
  id: string;
  name: string;
  summary: string;
  howTo: string[]; // ordered steps, concise and non-explicit
  benefits: string[];
  cautions?: string[];
  tags: string[]; // e.g., connection, mobility, balance, breathwork
  difficulty: WellnessDifficulty;
  visualKey: PoseVisualKey;
  recommendedSeconds?: [number, number]; // suggested active time window
}

export interface PlayRound {
  positionId: string;
  seconds: number; // allocated timer seconds
  completed: boolean;
}

export interface PlaySessionRecord {
  id: string;
  startedAt: string; // ISO
  endedAt: string; // ISO
  totalSeconds: number; // cumulative time actually spent
  rounds: PlayRound[];
}
