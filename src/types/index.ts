export type UUID = string;
export type IsoDateString = string;
export type IsoDateTimeString = string;

export type MeasurementOrigin = "manual" | "camera" | "sensor" | "import";
export type MeasurementPrecision = "low" | "medium" | "high";
export type MeasurementFocus = "length" | "girth" | "volume" | "erectionQuality";

export interface MeasurementCalibration {
  referenceMm?: number;
  cardVersion?: string;
  method: "charuco" | "creditCard" | "manual" | "sensor" | "unknown";
  confidence?: number;
  baselinePhotoUrl?: string;
}

export interface PressureSample {
  timestamp: IsoDateTimeString;
  kpa: number;
  temperatureC?: number;
  heartRateBpm?: number;
  perceivedIntensity?: number;
  source: "pump" | "manual" | "simulated";
}

export interface VitalSample {
  timestamp: IsoDateTimeString;
  systolic?: number;
  diastolic?: number;
  spo2?: number;
  mood?: "calm" | "focused" | "tense" | "fatigued";
  notes?: string;
}

export interface MeasurementInjuryScreen {
  bruising?: boolean;
  edema?: boolean;
  numbness?: boolean;
  discoloration?: boolean;
  painLevel?: number;
  escalationRecommended?: boolean;
}

export interface Measurement {
  id: UUID;
  date: IsoDateString;
  origin?: MeasurementOrigin;
  focus?: MeasurementFocus;
  length: number;
  girth: number;
  volumeEstimate?: number;
  baseCircumference?: number;
  midShaftCircumference?: number;
  glansCircumference?: number;
  stiffnessScore?: number;
  confidence?: number;
  precision?: MeasurementPrecision;
  notes?: string;
  sessionId?: UUID;
  photoUrl?: string;
  overlayUrl?: string;
  deviceId?: UUID;
  calibration?: MeasurementCalibration;
  pressureAverages?: {
    peakKpa?: number;
    meanKpa?: number;
    durationMinutes?: number;
  };
  sensorSamples?: PressureSample[];
  vitals?: VitalSample[];
  injuryScreen?: MeasurementInjuryScreen;
  isPreSession?: boolean;
  isPostSession?: boolean;
  tags?: string[];
  createdAt?: IsoDateTimeString;
  updatedAt?: IsoDateTimeString;
}

export type SessionStatus = "draft" | "active" | "paused" | "completed" | "aborted";

export interface SessionBreak {
  start: IsoDateTimeString;
  end?: IsoDateTimeString;
  type?: "cooldown" | "massage" | "restroom" | "other";
  notes?: string;
}

export interface SessionTubeInterval {
  start: IsoDateTimeString;
  end?: IsoDateTimeString;
  targetKpa?: number;
  achievedKpa?: number;
  mode?: "manual" | "pulsed" | "vacuumHold";
  chamberVolumeMl?: number;
}

export interface SessionComplianceScore {
  adherencePercent: number;
  safetyScore: number;
  escalationRequired?: boolean;
  warnings?: string[];
}

export interface SessionIncident {
  timestamp: IsoDateTimeString;
  type: "edema" | "blister" | "numbness" | "pain" | "deviceFailure" | "other";
  severity: "info" | "watch" | "urgent";
  description: string;
  resolved?: boolean;
}

export interface Session {
  id: UUID;
  userId?: UUID;
  date: IsoDateString;
  presetId: UUID;
  presetVersion?: string;
  startTime: IsoDateTimeString;
  endTime?: IsoDateTimeString;
  status: SessionStatus;
  deviceId?: UUID;
  deviceFirmware?: string;
  guidanceMode?: "self" | "partner" | "clinician" | "ai";
  location?: string;
  hydrationLevel?: "low" | "moderate" | "optimal";
  preMeasurement?: Measurement;
  postMeasurement?: Measurement;
  midMeasurements?: Measurement[];
  notes?: string;
  tags?: string[];
  pressureLogs?: PressureSample[];
  vitals?: VitalSample[];
  tubeIntervals?: SessionTubeInterval[];
  breaks?: SessionBreak[];
  incidents?: SessionIncident[];
  compliance?: SessionComplianceScore;
  emergencyStopActivated?: boolean;
  createdAt?: IsoDateTimeString;
  updatedAt?: IsoDateTimeString;
}

export type SessionCategory = "length" | "girth" | "recovery" | "maintenance" | "testicles" | "conditioning";
export type SessionDifficulty = "beginner" | "intermediate" | "advanced" | "clinical";

export interface SessionPreset {
  id: UUID;
  name: string;
  description: string;
  category: SessionCategory;
  focusAreas: MeasurementFocus[];
  totalDurationMinutes: number;
  warmupMinutes?: number;
  activeMinutes: number;
  cooldownMinutes?: number;
  pressureTargetKpa?: number;
  pressureCeilingKpa?: number;
  duration: number;
  restPeriods: number[];
  cadenceSeconds?: number[];
  safetyTips: string[];
  warnings: string[];
  requiredEquipment?: string[];
  contraindications?: string[];
  difficulty: SessionDifficulty;
  icon: string;
  version: string;
  createdAt?: IsoDateTimeString;
  updatedAt?: IsoDateTimeString;
}

export type GoalType = "length" | "girth" | "erectionQuality" | "sessionStreak" | "safetyScore" | "programCompletion";
export type GoalStatus = "active" | "paused" | "completed" | "abandoned";

export interface GoalMilestone {
  id: UUID;
  targetValue: number;
  targetDate?: IsoDateString;
  achievedValue?: number;
  achievedDate?: IsoDateString;
  notes?: string;
}

export interface Goal {
  id: UUID;
  userId?: UUID;
  type: GoalType;
  target: number;
  current: number;
  unit: "cm" | "mm" | "in" | "kpa" | "minutes" | "score";
  baseline?: number;
  deadline?: IsoDateString;
  status: GoalStatus;
  isActive: boolean;
  milestones?: GoalMilestone[];
  createdAt?: IsoDateTimeString;
  updatedAt?: IsoDateTimeString;
}

export interface InjuryReport {
  id: UUID;
  userId?: UUID;
  sessionId?: UUID;
  reportedAt: IsoDateTimeString;
  onsetType: "duringSession" | "postSession" | "historical";
  category: "vascular" | "skin" | "nerve" | "pain" | "other";
  severity: "mild" | "moderate" | "severe";
  description: string;
  photoUrl?: string;
  recommendedAction?: "monitor" | "rest" | "medical" | "emergency";
  escalationStatus?: "pending" | "acknowledged" | "resolved";
  followUpDate?: IsoDateString;
  notes?: string;
  createdAt?: IsoDateTimeString;
  updatedAt?: IsoDateTimeString;
}

export interface ClinicianNote {
  id: UUID;
  authorId: UUID;
  sessionId?: UUID;
  measurementId?: UUID;
  injuryReportId?: UUID;
  createdAt: IsoDateTimeString;
  note: string;
  visibility: "user" | "team" | "clinicianOnly";
  tags?: string[];
}

export interface SupporterAccess {
  id: UUID;
  supporterId: UUID;
  relationship: "partner" | "coach" | "clinician" | "peer";
  accessLevel: "view" | "comment" | "coach" | "admin";
  grantedAt: IsoDateTimeString;
  expiresAt?: IsoDateTimeString;
  permissions: {
    sessions?: boolean;
    measurements?: boolean;
    injuries?: boolean;
    media?: boolean;
    billing?: boolean;
  };
}

export interface ProgramPhase {
  id: UUID;
  name: string;
  startDate?: IsoDateString;
  endDate?: IsoDateString;
  focus: SessionCategory[];
  objectives: string[];
}

export interface ProgramSessionTemplate {
  presetId: UUID;
  cadencePerWeek: number;
  durationWeeks: number;
  orderIndex: number;
  notes?: string;
}

export interface Program {
  id: UUID;
  userId?: UUID;
  name: string;
  description: string;
  status: "draft" | "active" | "completed" | "archived";
  assignedById?: UUID;
  startDate?: IsoDateString;
  endDate?: IsoDateString;
  phases?: ProgramPhase[];
  sessionTemplates?: ProgramSessionTemplate[];
  complianceTargetPercent?: number;
  createdAt?: IsoDateTimeString;
  updatedAt?: IsoDateTimeString;
}

export interface AuditLogEntry {
  id: UUID;
  userId?: UUID;
  actorId: UUID;
  actorRole: "user" | "partner" | "clinician" | "system";
  eventType:
    | "session_created"
    | "session_completed"
    | "measurement_logged"
    | "goal_updated"
    | "injury_reported"
    | "program_assigned"
    | "safety_escalated"
    | "login"
    | "logout";
  targetId?: UUID;
  metadata?: Record<string, unknown>;
  createdAt: IsoDateTimeString;
  ipAddress?: string;
  userAgent?: string;
}

export interface UserProfilePreferences {
  theme?: "dark" | "light" | "highContrast" | "pro";
  wallpaper?: string;
  language?: string;
  units?: "imperial" | "metric";
  safetyRemindersEnabled?: boolean;
  aiCoachEnabled?: boolean;
}

export interface UserProfile {
  id: UUID;
  email?: string;
  displayName?: string;
  birthdate?: IsoDateString;
  createdAt: IsoDateTimeString;
  updatedAt?: IsoDateTimeString;
  goals?: Goal[];
  preferences?: UserProfilePreferences;
  supporterAccess?: SupporterAccess[];
  riskLevel?: "low" | "moderate" | "elevated";
  medicalClearanceDate?: IsoDateString;
}

export * from "./screening";
export * from "./wellness";
