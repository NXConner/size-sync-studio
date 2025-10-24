import { SexPosition } from '../types';

export const sexPositions: SexPosition[] = [
  // Missionary Variations
  {
    id: 'missionary-classic',
    name: 'Classic Missionary',
    category: 'missionary',
    difficulty: 'beginner',
    description: 'The most traditional and intimate position with face-to-face contact.',
    instructions: [
      'Partner lies on their back with legs spread',
      'You position yourself between their legs',
      'Support your weight on your arms or elbows',
      'Maintain eye contact and gentle kissing',
      'Use slow, deep thrusts for maximum intimacy'
    ],
    tips: [
      'Place a pillow under their lower back for better angle',
      'Use your hands to caress their body',
      'Vary your rhythm and depth',
      'Communicate about what feels good'
    ],
    benefits: [
      'Maximum intimacy and eye contact',
      'Easy to kiss and talk',
      'Good for emotional connection',
      'Allows for gentle, loving pace'
    ],
    requirements: [
      'Comfortable bed or surface',
      'Good communication',
      'Flexibility in hips'
    ],
    duration: { min: 300, max: 1800 },
    tags: ['intimate', 'romantic', 'face-to-face', 'beginner-friendly']
  },
  {
    id: 'missionary-elevated',
    name: 'Elevated Missionary',
    category: 'missionary',
    difficulty: 'intermediate',
    description: 'Missionary with the receiving partner\'s legs elevated for deeper penetration.',
    instructions: [
      'Partner lies on back with legs raised',
      'Hold their legs up or use pillows for support',
      'Enter from above with deeper angle',
      'Use your hands to support their legs',
      'Maintain steady rhythm'
    ],
    tips: [
      'Use pillows to support their legs if needed',
      'Communicate about depth and comfort',
      'Try different leg positions',
      'Focus on G-spot stimulation'
    ],
    benefits: [
      'Deeper penetration',
      'Better G-spot access',
      'More intense sensations',
      'Visual connection maintained'
    ],
    requirements: [
      'Good hip flexibility',
      'Strong leg muscles',
      'Comfortable surface'
    ],
    duration: { min: 240, max: 1200 },
    tags: ['deep', 'intense', 'G-spot', 'flexible']
  },

  // Cowgirl Variations
  {
    id: 'cowgirl-classic',
    name: 'Classic Cowgirl',
    category: 'cowgirl',
    difficulty: 'beginner',
    description: 'Partner on top with full control over rhythm and depth.',
    instructions: [
      'You lie on your back',
      'Partner straddles you facing forward',
      'They control the rhythm and depth',
      'Support their hips with your hands',
      'Let them guide the movement'
    ],
    tips: [
      'Use your hands to guide their hips',
      'Communicate about speed and depth',
      'Try different angles of movement',
      'Support their back if needed'
    ],
    benefits: [
      'Partner has full control',
      'Great for clitoral stimulation',
      'Intimate eye contact',
      'Allows for creativity'
    ],
    requirements: [
      'Good knee strength',
      'Hip flexibility',
      'Communication skills'
    ],
    duration: { min: 300, max: 1500 },
    tags: ['control', 'clitoral', 'intimate', 'creative']
  },
  {
    id: 'cowgirl-reverse',
    name: 'Reverse Cowgirl',
    category: 'cowgirl',
    difficulty: 'intermediate',
    description: 'Partner on top facing away for different sensations and visual appeal.',
    instructions: [
      'You lie on your back',
      'Partner straddles you facing away',
      'They control the movement',
      'You can guide their hips',
      'Try different angles and depths'
    ],
    tips: [
      'Use mirrors for visual stimulation',
      'Guide their movement with your hands',
      'Try leaning forward or backward',
      'Communicate about sensations'
    ],
    benefits: [
      'Visual appeal',
      'Different angle of penetration',
      'Partner maintains control',
      'Can be very arousing'
    ],
    requirements: [
      'Good balance',
      'Hip flexibility',
      'Strong core muscles'
    ],
    duration: { min: 240, max: 1200 },
    tags: ['visual', 'control', 'different-angle', 'arousing']
  },

  // Doggy Style Variations
  {
    id: 'doggy-classic',
    name: 'Classic Doggy Style',
    category: 'doggy',
    difficulty: 'beginner',
    description: 'Traditional position from behind with deep penetration.',
    instructions: [
      'Partner gets on hands and knees',
      'You position behind them',
      'Hold their hips for support',
      'Use steady, deep thrusts',
      'Maintain good communication'
    ],
    tips: [
      'Use pillows under their chest for comfort',
      'Try different angles and depths',
      'Use your hands to caress their body',
      'Communicate about what feels good'
    ],
    benefits: [
      'Deep penetration',
      'Visual appeal',
      'Good for G-spot stimulation',
      'Allows for hair pulling and spanking'
    ],
    requirements: [
      'Good knee support',
      'Hip flexibility',
      'Strong arms for support'
    ],
    duration: { min: 300, max: 1200 },
    tags: ['deep', 'visual', 'G-spot', 'dominant']
  },
  {
    id: 'doggy-prone',
    name: 'Prone Doggy',
    category: 'doggy',
    difficulty: 'intermediate',
    description: 'Partner lies flat with legs together for tight, intimate sensation.',
    instructions: [
      'Partner lies flat on stomach',
      'Legs together for tight fit',
      'You position on top',
      'Use gentle, slow movements',
      'Maintain intimate contact'
    ],
    tips: [
      'Start very slowly',
      'Use plenty of lubrication',
      'Communicate about comfort',
      'Try different angles'
    ],
    benefits: [
      'Very tight sensation',
      'Intimate and close',
      'Good for slow, sensual sex',
      'Less physically demanding'
    ],
    requirements: [
      'Good communication',
      'Patience',
      'Comfortable surface'
    ],
    duration: { min: 240, max: 900 },
    tags: ['tight', 'intimate', 'sensual', 'slow']
  },

  // Standing Positions
  {
    id: 'standing-against-wall',
    name: 'Standing Against Wall',
    category: 'standing',
    difficulty: 'intermediate',
    description: 'Passionate standing position with partner against wall.',
    instructions: [
      'Partner stands against wall',
      'You lift them or they support themselves',
      'Enter from standing position',
      'Use wall for support and leverage',
      'Maintain balance and communication'
    ],
    tips: [
      'Use wall for support',
      'Communicate about comfort and safety',
      'Try different heights and angles',
      'Take breaks if needed'
    ],
    benefits: [
      'Very passionate and intense',
      'Good for quick sessions',
      'Visual appeal',
      'Requires strength and balance'
    ],
    requirements: [
      'Good strength and balance',
      'Flexibility',
      'Strong wall support'
    ],
    duration: { min: 120, max: 600 },
    tags: ['passionate', 'intense', 'quick', 'strength']
  },
  {
    id: 'standing-bent-over',
    name: 'Standing Bent Over',
    category: 'standing',
    difficulty: 'intermediate',
    description: 'Partner bends over surface while you enter from behind.',
    instructions: [
      'Partner bends over bed, table, or counter',
      'You position behind them',
      'Hold their hips for support',
      'Use steady thrusts',
      'Maintain good communication'
    ],
    tips: [
      'Choose appropriate height surface',
      'Use your hands for support',
      'Communicate about comfort',
      'Try different angles'
    ],
    benefits: [
      'Good for quick sessions',
      'Visual appeal',
      'Different angle of penetration',
      'Can be very arousing'
    ],
    requirements: [
      'Good balance',
      'Appropriate height surface',
      'Hip flexibility'
    ],
    duration: { min: 180, max: 900 },
    tags: ['quick', 'visual', 'different-angle', 'arousing']
  },

  // Sitting Positions
  {
    id: 'sitting-lap',
    name: 'Sitting in Lap',
    category: 'sitting',
    difficulty: 'beginner',
    description: 'Intimate sitting position with partner in your lap.',
    instructions: [
      'You sit on edge of bed or chair',
      'Partner sits in your lap facing you',
      'They control the movement',
      'Hold each other close',
      'Use gentle, rocking motions'
    ],
    tips: [
      'Choose comfortable seating',
      'Use pillows for support',
      'Communicate about comfort',
      'Try different angles'
    ],
    benefits: [
      'Very intimate and close',
      'Face-to-face contact',
      'Partner has control',
      'Good for emotional connection'
    ],
    requirements: [
      'Comfortable seating',
      'Good communication',
      'Hip flexibility'
    ],
    duration: { min: 300, max: 1200 },
    tags: ['intimate', 'close', 'control', 'emotional']
  },
  {
    id: 'sitting-reverse-lap',
    name: 'Reverse Sitting in Lap',
    category: 'sitting',
    difficulty: 'intermediate',
    description: 'Partner sits in lap facing away for different sensations.',
    instructions: [
      'You sit on edge of bed or chair',
      'Partner sits in your lap facing away',
      'They control the movement',
      'You can guide their hips',
      'Try different angles and depths'
    ],
    tips: [
      'Use mirrors for visual stimulation',
      'Guide their movement',
      'Communicate about sensations',
      'Try leaning forward or backward'
    ],
    benefits: [
      'Different angle of penetration',
      'Visual appeal',
      'Partner maintains control',
      'Can be very arousing'
    ],
    requirements: [
      'Good balance',
      'Comfortable seating',
      'Hip flexibility'
    ],
    duration: { min: 240, max: 900 },
    tags: ['different-angle', 'visual', 'control', 'arousing']
  },

  // Side Positions
  {
    id: 'side-spooning',
    name: 'Spooning',
    category: 'spooning',
    difficulty: 'beginner',
    description: 'Intimate side position with both partners lying on their sides.',
    instructions: [
      'Both partners lie on their sides',
      'One partner behind the other',
      'Enter from behind',
      'Use gentle, rocking motions',
      'Maintain intimate contact'
    ],
    tips: [
      'Use pillows for comfort',
      'Communicate about angles',
      'Try different leg positions',
      'Focus on intimacy'
    ],
    benefits: [
      'Very intimate and comfortable',
      'Good for slow, sensual sex',
      'Less physically demanding',
      'Great for cuddling after'
    ],
    requirements: [
      'Good communication',
      'Comfortable surface',
      'Hip flexibility'
    ],
    duration: { min: 300, max: 1500 },
    tags: ['intimate', 'comfortable', 'sensual', 'cuddling']
  },
  {
    id: 'side-facing',
    name: 'Side Facing',
    category: 'side',
    difficulty: 'intermediate',
    description: 'Both partners on their sides facing each other.',
    instructions: [
      'Both partners lie on their sides facing each other',
      'Interlock legs for stability',
      'Enter at comfortable angle',
      'Use gentle, rocking motions',
      'Maintain eye contact'
    ],
    tips: [
      'Use pillows for support',
      'Try different leg positions',
      'Communicate about comfort',
      'Focus on intimacy'
    ],
    benefits: [
      'Face-to-face intimacy',
      'Comfortable and sustainable',
      'Good for emotional connection',
      'Less physically demanding'
    ],
    requirements: [
      'Good communication',
      'Comfortable surface',
      'Hip flexibility'
    ],
    duration: { min: 300, max: 1800 },
    tags: ['face-to-face', 'comfortable', 'emotional', 'sustainable']
  },

  // Oral Positions
  {
    id: 'oral-69',
    name: '69 Position',
    category: 'oral',
    difficulty: 'intermediate',
    description: 'Mutual oral pleasure with both partners giving and receiving.',
    instructions: [
      'Position yourselves so both can give oral',
      'One partner on top, one on bottom',
      'Coordinate your movements',
      'Communicate about what feels good',
      'Take turns focusing on each other'
    ],
    tips: [
      'Communicate about preferences',
      'Take turns focusing',
      'Use your hands for additional stimulation',
      'Don\'t rush - enjoy the experience'
    ],
    benefits: [
      'Mutual pleasure',
      'Intimate and connected',
      'Good for foreplay',
      'Builds anticipation'
    ],
    requirements: [
      'Good communication',
      'Flexibility',
      'Comfortable surface'
    ],
    duration: { min: 300, max: 1200 },
    tags: ['mutual', 'intimate', 'foreplay', 'anticipation']
  },
  {
    id: 'oral-sitting',
    name: 'Sitting Oral',
    category: 'oral',
    difficulty: 'beginner',
    description: 'Comfortable sitting position for oral pleasure.',
    instructions: [
      'One partner sits on edge of bed or chair',
      'Other partner kneels or sits between legs',
      'Use hands and mouth for stimulation',
      'Communicate about preferences',
      'Take your time and enjoy'
    ],
    tips: [
      'Use pillows for comfort',
      'Communicate about what feels good',
      'Use your hands for additional stimulation',
      'Don\'t rush the experience'
    ],
    benefits: [
      'Comfortable and sustainable',
      'Good for extended sessions',
      'Intimate and personal',
      'Allows for creativity'
    ],
    requirements: [
      'Good communication',
      'Comfortable seating',
      'Patience'
    ],
    duration: { min: 300, max: 1800 },
    tags: ['comfortable', 'sustainable', 'intimate', 'creative']
  },

  // Advanced/Acrobatic Positions
  {
    id: 'lotus-position',
    name: 'Lotus Position',
    category: 'tantric',
    difficulty: 'expert',
    description: 'Advanced tantric position for deep spiritual and physical connection.',
    instructions: [
      'Partner sits in your lap facing you',
      'Wrap legs around your back',
      'Hold each other close',
      'Use slow, deep breathing',
      'Focus on energy exchange'
    ],
    tips: [
      'Practice flexibility beforehand',
      'Use slow, deep breathing',
      'Focus on energy connection',
      'Communicate about comfort'
    ],
    benefits: [
      'Deep spiritual connection',
      'Intense physical sensations',
      'Good for tantric practice',
      'Builds intimacy'
    ],
    requirements: [
      'Excellent flexibility',
      'Strong core muscles',
      'Good communication',
      'Patience and practice'
    ],
    duration: { min: 600, max: 3600 },
    tags: ['tantric', 'spiritual', 'intense', 'advanced']
  },
  {
    id: 'wheelbarrow',
    name: 'Wheelbarrow',
    category: 'acrobatic',
    difficulty: 'expert',
    description: 'Advanced position requiring strength and balance.',
    instructions: [
      'Partner gets on hands and knees',
      'You lift their legs from behind',
      'Support their weight carefully',
      'Enter from standing position',
      'Maintain balance and communication'
    ],
    tips: [
      'Ensure you have enough strength',
      'Communicate about comfort and safety',
      'Use wall for support if needed',
      'Take breaks as needed'
    ],
    benefits: [
      'Very intense and passionate',
      'Requires trust and communication',
      'Good for adventurous couples',
      'Can be very arousing'
    ],
    requirements: [
      'Excellent strength and balance',
      'Good communication',
      'Trust between partners',
      'Comfortable surface'
    ],
    duration: { min: 60, max: 300 },
    tags: ['acrobatic', 'intense', 'trust', 'adventurous']
  },

  // Kinky Positions
  {
    id: 'bondage-basic',
    name: 'Basic Bondage',
    category: 'kinky',
    difficulty: 'intermediate',
    description: 'Introduction to light bondage play with restraints.',
    instructions: [
      'Discuss boundaries and safe words first',
      'Use soft restraints or scarves',
      'Ensure circulation is not cut off',
      'Communicate throughout',
      'Have safety scissors nearby'
    ],
    tips: [
      'Always discuss boundaries first',
      'Use safe words',
      'Check circulation regularly',
      'Start with light restraints'
    ],
    benefits: [
      'Adds excitement and anticipation',
      'Builds trust between partners',
      'Can enhance sensations',
      'Good for exploring power dynamics'
    ],
    requirements: [
      'Good communication',
      'Trust between partners',
      'Safety equipment',
      'Clear boundaries'
    ],
    duration: { min: 300, max: 1800 },
    tags: ['kinky', 'trust', 'excitement', 'power-dynamics']
  },
  {
    id: 'role-play-dominance',
    name: 'Role Play Dominance',
    category: 'kinky',
    difficulty: 'intermediate',
    description: 'Consensual role play with power dynamics.',
    instructions: [
      'Discuss roles and boundaries',
      'Establish safe words',
      'One partner takes dominant role',
      'Other partner takes submissive role',
      'Communicate throughout'
    ],
    tips: [
      'Discuss fantasies and limits',
      'Use safe words consistently',
      'Check in regularly',
      'Debrief after the session'
    ],
    benefits: [
      'Explores fantasies safely',
      'Builds trust and communication',
      'Can enhance intimacy',
      'Good for breaking routine'
    ],
    requirements: [
      'Excellent communication',
      'Trust between partners',
      'Clear boundaries',
      'Safe words'
    ],
    duration: { min: 600, max: 3600 },
    tags: ['role-play', 'trust', 'fantasy', 'communication']
  }
];
