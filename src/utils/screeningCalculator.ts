import { ScreeningQuestion, ScreeningResponse, ScreeningResult } from '@/types/screening';
import { screeningRecommendations } from '@/data/screeningQuestions';

export function calculateRiskScore(
  questions: ScreeningQuestion[],
  responses: ScreeningResponse[]
): number {
  let totalScore = 0;
  let maxPossibleScore = 0;

  questions.forEach(question => {
    const response = responses.find(r => r.questionId === question.id);
    maxPossibleScore += question.riskWeight * 10; // Max risk per question

    if (response) {
      let questionScore = 0;

      switch (question.type) {
        case 'yes-no':
          questionScore = response.answer === 'yes' ? question.riskWeight * 10 : 0;
          break;
        
        case 'multiple-choice':
          if (question.options && typeof response.answer === 'string') {
            const optionIndex = question.options.indexOf(response.answer);
            if (optionIndex !== -1) {
              // Higher index = higher risk for most questions
              const riskMultiplier = optionIndex / (question.options.length - 1);
              questionScore = question.riskWeight * 10 * riskMultiplier;
            }
          }
          break;
        
        case 'scale':
          if (typeof response.answer === 'number' && question.scaleMin && question.scaleMax) {
            // For satisfaction scales, lower = higher risk
            const normalizedValue = (response.answer - question.scaleMin) / (question.scaleMax - question.scaleMin);
            const riskMultiplier = question.id.includes('satisfaction') ? (1 - normalizedValue) : normalizedValue;
            questionScore = question.riskWeight * 10 * riskMultiplier;
          }
          break;
      }

      totalScore += questionScore;
    }
  });

  return maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
}

export function determineRiskLevel(riskScore: number): 'low' | 'moderate' | 'high' | 'critical' {
  if (riskScore < 25) return 'low';
  if (riskScore < 50) return 'moderate';
  if (riskScore < 75) return 'high';
  return 'critical';
}

export function getRecommendations(
  category: 'peyronie' | 'std',
  riskLevel: 'low' | 'moderate' | 'high' | 'critical'
) {
  return screeningRecommendations[category]?.find(rec => rec.level === riskLevel);
}

export function generateScreeningResult(
  category: 'peyronie' | 'std',
  questions: ScreeningQuestion[],
  responses: ScreeningResponse[],
  completedBy: string = 'User'
): ScreeningResult {
  const riskScore = calculateRiskScore(questions, responses);
  const riskLevel = determineRiskLevel(riskScore);
  const recommendation = getRecommendations(category, riskLevel);

  return {
    id: `${category}-${Date.now()}`,
    category,
    date: new Date().toISOString(),
    responses,
    riskScore,
    riskLevel,
    recommendations: recommendation?.actions || [],
    followUpRequired: recommendation?.medicalConsultation || false,
    completedBy,
  };
}

export function saveScreeningResult(result: ScreeningResult) {
  try {
    const existingResults = getScreeningResults();
    const updatedResults = [result, ...existingResults];
    localStorage.setItem('screening-results', JSON.stringify(updatedResults));
  } catch (error) {
    console.error('Failed to save screening result:', error);
  }
}

export function getScreeningResults(): ScreeningResult[] {
  try {
    const stored = localStorage.getItem('screening-results');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load screening results:', error);
    return [];
  }
}

export function getLatestScreeningResult(category: 'peyronie' | 'std'): ScreeningResult | null {
  const results = getScreeningResults();
  return results.find(result => result.category === category) || null;
}

export function deleteScreeningResult(resultId: string) {
  try {
    const existingResults = getScreeningResults();
    const filteredResults = existingResults.filter(result => result.id !== resultId);
    localStorage.setItem('screening-results', JSON.stringify(filteredResults));
  } catch (error) {
    console.error('Failed to delete screening result:', error);
  }
}