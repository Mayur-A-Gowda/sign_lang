import { HandPattern } from '../hooks/useHandTracking';

export interface DepressionIndicators {
  movementSpeed: number;
  gestureVariety: number;
  handPositioning: number;
  repetitiveMotions: number;
  energyLevel: number;
}

export interface DetectionResult {
  score: number;
  indicators: DepressionIndicators;
  confidence: number;
}

export const analyzeHandPatterns = (patterns: HandPattern[]): DetectionResult => {
  if (patterns.length < 10) {
    return {
      score: 0,
      indicators: {
        movementSpeed: 0,
        gestureVariety: 0,
        handPositioning: 0,
        repetitiveMotions: 0,
        energyLevel: 0
      },
      confidence: 0
    };
  }

  // Analyze movement speed (depression: slower movements)
  const movementSpeed = calculateMovementSpeed(patterns);

  // Analyze gesture variety (depression: reduced variety)
  const gestureVariety = calculateGestureVariety(patterns);

  // Analyze hand positioning (depression: lower hand positions)
  const handPositioning = calculateHandPositioning(patterns);

  // Analyze repetitive motions (depression: more repetitive)
  const repetitiveMotions = calculateRepetitiveMotions(patterns);

  // Analyze energy level (depression: lower energy)
  const energyLevel = calculateEnergyLevel(patterns);

  const indicators: DepressionIndicators = {
    movementSpeed,
    gestureVariety,
    handPositioning,
    repetitiveMotions,
    energyLevel
  };

  // Calculate overall depression score (0-100)
  const score = calculateDepressionScore(indicators);

  // Confidence based on sample size
  const confidence = Math.min(patterns.length / 50, 1) * 100;

  return { score, indicators, confidence };
};

const calculateMovementSpeed = (patterns: HandPattern[]): number => {
  let totalSpeed = 0;
  let count = 0;

  for (let i = 1; i < patterns.length; i++) {
    const prev = patterns[i - 1];
    const curr = patterns[i];

    if (prev.landmarks.length > 0 && curr.landmarks.length > 0) {
      const distance = calculateLandmarkDistance(
        prev.landmarks[0],
        curr.landmarks[0]
      );
      const timeDiff = (curr.timestamp - prev.timestamp) / 1000;
      totalSpeed += distance / (timeDiff || 0.001);
      count++;
    }
  }

  const avgSpeed = count > 0 ? totalSpeed / count : 0;
  // Normalize: slower speed = higher depression indicator
  return Math.max(0, Math.min(100, (1 - avgSpeed / 10) * 100));
};

const calculateGestureVariety = (patterns: HandPattern[]): number => {
  const uniquePositions = new Set<string>();

  patterns.forEach(pattern => {
    if (pattern.landmarks.length > 0) {
      const position = JSON.stringify(
        pattern.landmarks[0].slice(0, 5).map((l: any) =>
          Math.round(l.x * 10) + ',' + Math.round(l.y * 10)
        )
      );
      uniquePositions.add(position);
    }
  });

  const variety = uniquePositions.size / patterns.length;
  // Lower variety = higher depression indicator
  return Math.max(0, Math.min(100, (1 - variety) * 100));
};

const calculateHandPositioning = (patterns: HandPattern[]): number => {
  let avgY = 0;
  let count = 0;

  patterns.forEach(pattern => {
    if (pattern.landmarks.length > 0) {
      const wristY = pattern.landmarks[0][0]?.y || 0;
      avgY += wristY;
      count++;
    }
  });

  const averageY = count > 0 ? avgY / count : 0.5;
  // Lower hands (higher Y value) = higher depression indicator
  return Math.max(0, Math.min(100, (averageY - 0.3) * 200));
};

const calculateRepetitiveMotions = (patterns: HandPattern[]): number => {
  let repetitionScore = 0;
  const windowSize = 5;

  for (let i = windowSize; i < patterns.length; i++) {
    const recent = patterns.slice(i - windowSize, i);
    const similarities = recent.map((p1, idx) =>
      recent.slice(idx + 1).map(p2 =>
        calculatePatternSimilarity(p1, p2)
      )
    ).flat();

    const avgSimilarity = similarities.reduce((a, b) => a + b, 0) / (similarities.length || 1);
    repetitionScore += avgSimilarity;
  }

  const normalizedScore = (repetitionScore / (patterns.length - windowSize || 1)) * 100;
  return Math.max(0, Math.min(100, normalizedScore));
};

const calculateEnergyLevel = (patterns: HandPattern[]): number => {
  let totalEnergy = 0;
  let count = 0;

  for (let i = 1; i < patterns.length; i++) {
    const prev = patterns[i - 1];
    const curr = patterns[i];

    if (prev.landmarks.length > 0 && curr.landmarks.length > 0) {
      const movement = calculateLandmarkDistance(
        prev.landmarks[0],
        curr.landmarks[0]
      );
      totalEnergy += movement;
      count++;
    }
  }

  const avgEnergy = count > 0 ? totalEnergy / count : 0;
  // Lower energy = higher depression indicator
  return Math.max(0, Math.min(100, (1 - avgEnergy / 5) * 100));
};

const calculateLandmarkDistance = (landmarks1: any[], landmarks2: any[]): number => {
  let distance = 0;
  const minLength = Math.min(landmarks1.length, landmarks2.length);

  for (let i = 0; i < minLength; i++) {
    const dx = landmarks1[i].x - landmarks2[i].x;
    const dy = landmarks1[i].y - landmarks2[i].y;
    const dz = landmarks1[i].z - landmarks2[i].z;
    distance += Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  return distance / minLength;
};

const calculatePatternSimilarity = (p1: HandPattern, p2: HandPattern): number => {
  if (p1.landmarks.length === 0 || p2.landmarks.length === 0) return 0;

  const distance = calculateLandmarkDistance(p1.landmarks[0], p2.landmarks[0]);
  return Math.max(0, 1 - distance / 2);
};

const calculateDepressionScore = (indicators: DepressionIndicators): number => {
  const weights = {
    movementSpeed: 0.25,
    gestureVariety: 0.20,
    handPositioning: 0.15,
    repetitiveMotions: 0.20,
    energyLevel: 0.20
  };

  const score =
    indicators.movementSpeed * weights.movementSpeed +
    indicators.gestureVariety * weights.gestureVariety +
    indicators.handPositioning * weights.handPositioning +
    indicators.repetitiveMotions * weights.repetitiveMotions +
    indicators.energyLevel * weights.energyLevel;

  return Math.round(Math.max(0, Math.min(100, score)));
};

export const getRemedySuggestions = (score: number): string[] => {
  if (score < 20) {
    return [
      'Maintain your positive mental health with regular social activities',
      'Continue your healthy lifestyle habits including exercise and good sleep',
      'Practice mindfulness and gratitude exercises',
      'Stay connected with friends and family'
    ];
  } else if (score < 40) {
    return [
      'Consider incorporating light exercise into your daily routine (20-30 minutes)',
      'Practice stress management techniques like deep breathing or meditation',
      'Ensure 7-8 hours of quality sleep each night',
      'Engage in hobbies and activities you enjoy',
      'Connect with supportive friends or family members'
    ];
  } else if (score < 60) {
    return [
      'Recommended: Speak with a mental health professional for guidance',
      'Establish a consistent daily routine to provide structure',
      'Engage in regular physical activity (walking, yoga, or other exercises)',
      'Practice cognitive behavioral techniques to challenge negative thoughts',
      'Limit caffeine and alcohol consumption',
      'Join a support group or community activities',
      'Consider journaling to express your feelings'
    ];
  } else if (score < 80) {
    return [
      'Strongly recommended: Consult with a licensed therapist or counselor',
      'Contact a mental health helpline for immediate support',
      'Avoid isolation - reach out to trusted friends or family',
      'Create a safety plan with emergency contacts',
      'Focus on basic self-care: hygiene, nutrition, and sleep',
      'Avoid major life decisions during this period',
      'Consider medication evaluation with a psychiatrist',
      'Engage in gentle activities that bring comfort'
    ];
  } else {
    return [
      'URGENT: Please contact a mental health crisis helpline immediately',
      'National Suicide Prevention Lifeline: 988 (US) or local emergency services',
      'Reach out to a trusted person right away',
      'Visit your nearest emergency room if you have thoughts of self-harm',
      'Do not stay alone - ensure you have someone with you',
      'Schedule an immediate appointment with a mental health professional',
      'Remove any means of self-harm from your environment',
      'Remember: This is temporary, and help is available'
    ];
  }
};
