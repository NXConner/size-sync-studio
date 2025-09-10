import { getMeasurements } from '@/utils/storage'
import { getScreeningResults } from '@/utils/screeningCalculator'

export type Recommendation = { id: string; text: string }

export function generateRecommendations(): Recommendation[] {
  const recs: Recommendation[] = []
  const ms = getMeasurements().slice().sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const last = ms[ms.length - 1]
  const first = ms[0]
  if (first && last) {
    const dL = last.length - first.length
    const dG = last.girth - first.girth
    if (dL > 0.5) recs.push({ id: 'len-progress', text: 'Sustained length gains detected. Maintain protocol; avoid overtraining.' })
    if (dG > 0.5) recs.push({ id: 'girth-progress', text: 'Girth gains trending up. Ensure adequate recovery and hydration.' })
    if (dL < -0.3 || dG < -0.3) recs.push({ id: 'decline', text: 'Recent decline noted; review calibration and consistency.' })
  }
  const results = getScreeningResults()
  if (results.length) {
    const latest = results[0]
    if (latest.riskScore >= 50) recs.push({ id: 'risk-follow', text: 'Moderate or higher screening risk. Consider scheduling a provider consult.' })
  }
  if (recs.length === 0) recs.push({ id: 'baseline', text: 'Keep logging regular measurements to improve insight quality.' })
  return recs
}

