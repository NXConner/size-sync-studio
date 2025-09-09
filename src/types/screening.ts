// Health Screening Types
export interface ScreeningQuestion {
  id: string;
  category: 'peyronie' | 'std' | 'general';
  question: string;
  type: 'yes-no' | 'multiple-choice' | 'scale' | 'text';
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: { min: string; max: string };
  required: boolean;
  followUpQuestions?: string[];
  riskWeight: number; // 0-10 scale for risk assessment
}

export interface ScreeningResponse {
  questionId: string;
  answer: string | number;
  timestamp: string;
}

export interface ScreeningResult {
  id: string;
  category: 'peyronie' | 'std' | 'general';
  date: string;
  responses: ScreeningResponse[];
  riskScore: number; // 0-100 calculated risk score
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  recommendations: string[];
  followUpRequired: boolean;
  completedBy: string;
  notes?: string;
  // Photo analysis results
  photoAnalysis?: {
    analysisId: string;
    photoRiskScore: number;
    findings: Array<{
      type: string;
      severity: 'none' | 'mild' | 'moderate' | 'severe';
      confidence: number;
      description: string;
    }>;
    combinedRiskScore: number; // Questionnaire + photo analysis combined
    aiRecommendations: string[];
  };
}

export interface ScreeningRecommendation {
  level: 'low' | 'moderate' | 'high' | 'critical';
  title: string;
  description: string;
  actions: string[];
  urgency: 'routine' | 'soon' | 'urgent' | 'immediate';
  medicalConsultation: boolean;
}