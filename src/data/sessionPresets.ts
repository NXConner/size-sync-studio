import { SessionPreset } from '@/types';

export const sessionPresets: SessionPreset[] = [
  {
    id: 'beginner-length',
    name: 'Beginner Length',
    description: 'Gentle pressure focused on length gains',
    category: 'length',
    pressure: 3,
    duration: 10,
    restPeriods: [2, 4, 6, 8],
    difficulty: 'beginner',
    icon: 'Target',
    safetyTips: [
      'Start with minimal pressure',
      'Release pressure every 2-3 minutes',
      'Stop if you feel any pain',
      'Warm up with a hot towel before starting'
    ],
    warnings: [
      'Never exceed recommended pressure',
      'Stop immediately if you experience pain',
      'Do not exceed session duration'
    ]
  },
  {
    id: 'beginner-girth',
    name: 'Beginner Girth',
    description: 'Low pressure routine for girth development',
    category: 'girth',
    pressure: 4,
    duration: 8,
    restPeriods: [2, 4, 6],
    difficulty: 'beginner',
    icon: 'Circle',
    safetyTips: [
      'Focus on gradual pressure increase',
      'Take breaks every 2 minutes',
      'Monitor circulation carefully',
      'Use proper ring size'
    ],
    warnings: [
      'Watch for discoloration',
      'Never use excessive pressure',
      'Stop if numbness occurs'
    ]
  },
  {
    id: 'intermediate-length',
    name: 'Intermediate Length',
    description: 'Moderate pressure for experienced users',
    category: 'length',
    pressure: 5,
    duration: 15,
    restPeriods: [3, 6, 9, 12],
    difficulty: 'intermediate',
    icon: 'ArrowUp',
    safetyTips: [
      'Maintain consistent pressure',
      'Use longer rest periods',
      'Track your progress carefully',
      'Listen to your body'
    ],
    warnings: [
      'Requires previous experience',
      'Monitor for any adverse effects',
      'Do not rush progression'
    ]
  },
  {
    id: 'intermediate-girth',
    name: 'Intermediate Girth',
    description: 'Enhanced girth routine with controlled pressure',
    category: 'girth',
    pressure: 6,
    duration: 12,
    restPeriods: [3, 6, 9],
    difficulty: 'intermediate',
    icon: 'Maximize',
    safetyTips: [
      'Use graduated pressure increase',
      'Monitor temperature and color',
      'Take adequate rest periods',
      'Maintain proper hygiene'
    ],
    warnings: [
      'Requires experience with beginner routines',
      'Stop if unusual sensations occur',
      'Never skip rest periods'
    ]
  },
  {
    id: 'advanced-combo',
    name: 'Advanced Combination',
    description: 'Advanced routine targeting both length and girth',
    category: 'both',
    pressure: 7,
    duration: 20,
    restPeriods: [4, 8, 12, 16],
    difficulty: 'advanced',
    icon: 'Zap',
    safetyTips: [
      'Only for experienced users',
      'Use multiple pressure stages',
      'Extended warm-up required',
      'Post-session massage recommended'
    ],
    warnings: [
      'For advanced users only',
      'Requires months of experience',
      'High risk if not done properly',
      'Consult guidelines before attempting'
    ]
  },
  {
    id: 'testicle-routine',
    name: 'Testicle Enhancement',
    description: 'Specialized routine for testicle development',
    category: 'testicles',
    pressure: 2,
    duration: 6,
    restPeriods: [2, 4],
    difficulty: 'intermediate',
    icon: 'CircleDot',
    safetyTips: [
      'Use extremely gentle pressure',
      'Very short sessions only',
      'Monitor for any discomfort',
      'Use specialized equipment only'
    ],
    warnings: [
      'Extremely sensitive area',
      'Risk of serious injury',
      'Requires specialized knowledge',
      'Stop immediately if pain occurs'
    ]
  }
];