import { getWHOStandard } from '@/services/whoStandardsService';

interface CalculationInput {
  ageInMonths: number;
  gender: 'male' | 'female';
  height: number;
  weight: number;
  midArmCircumference: number;
  headCircumference: number;
  shouldCalculateBMI?: boolean;
  shouldCalculateHeadCirc?: boolean;
  shouldCalculateMidArm?: boolean;
}

interface CalculationResult {
  ageInMonths: number;
  gender: string;
  height: {
    actual: number;
    expected: number;
    sd: number;
    centile: number | null;
  };
  weight: {
    actual: number;
    expected: number;
    sd: number;
    centile: number;
  };
  headCircumference: {
    actual: number;
    expected: number;
    sd: number;
    centile: number | null;
  };
  midArmCircumference: {
    actual: number;
    expected: number;
    sd: number;
    centile: number;
  };
  bmi: {
    actual: number;
    expected: number | null;
    sd: number | null;
    centile: number | null;
  };
  shouldCalculateBMI?: boolean;
  shouldCalculateHeadCirc?: boolean;
  shouldCalculateMidArm?: boolean;
}

// Convert months to days for database lookup
const monthsToDays = (months: number): number => Math.round(months * 30.44);

// Calculate Z-score using LMS method
const calculateZScore = (value: number, l: number | null, m: number, s: number | null): number => {
  if (s === null || s === 0) {
    // Fallback to simple standard deviation if LMS not available
    return (value - m) / (m * 0.1); // Approximate 10% coefficient of variation
  }

  if (l === null || l === 0) {
    // When L=0, use simplified formula
    return Math.log(value / m) / s;
  }

  // Full LMS formula: Z = ((value/M)^L - 1) / (L * S)
  return (Math.pow(value / m, l) - 1) / (l * s);
};

// Convert Z-score to centile using normal distribution approximation
const zScoreToCentile = (z: number): number => {
  // Simplified approximation for centile calculation
  if (z <= -3) return 0.1;
  if (z <= -2) return 2.3;
  if (z <= -1.5) return 6.7;
  if (z <= -1) return 15.9;
  if (z <= -0.5) return 30.9;
  if (z <= 0) return 50;
  if (z <= 0.5) return 69.1;
  if (z <= 1) return 84.1;
  if (z <= 1.5) return 93.3;
  if (z <= 2) return 97.7;
  if (z <= 3) return 99.9;
  return 99.9;
};

export const calculateAnthropometry = async (input: CalculationInput): Promise<CalculationResult> => {
  console.log('Calculating anthropometry for:', input);
  
  const ageDays = monthsToDays(input.ageInMonths);
  
  // Fetch WHO standards from database - only fetch what we need
  const promises = [
    getWHOStandard({ parameter: 'height', gender: input.gender, ageDays }),
    getWHOStandard({ parameter: 'weight', gender: input.gender, ageDays })
  ];

  if (input.shouldCalculateHeadCirc) {
    promises.push(getWHOStandard({ parameter: 'head_circumference', gender: input.gender, ageDays }));
  }

  if (input.shouldCalculateMidArm) {
    promises.push(getWHOStandard({ parameter: 'arm_circumference', gender: input.gender, ageDays }));
  }

  if (input.shouldCalculateBMI) {
    promises.push(getWHOStandard({ parameter: 'bmi', gender: input.gender, ageDays }));
  }

  const results = await Promise.all(promises);
  
  let heightStandard = results[0];
  let weightStandard = results[1];
  let headCircStandard = null;
  let armCircStandard = null;
  let bmiStandard = null;

  let resultIndex = 2;
  if (input.shouldCalculateHeadCirc) {
    headCircStandard = results[resultIndex++];
  }
  if (input.shouldCalculateMidArm) {
    armCircStandard = results[resultIndex++];
  }
  if (input.shouldCalculateBMI) {
    bmiStandard = results[resultIndex++];
  }

  console.log('WHO standards retrieved:', {
    height: heightStandard,
    weight: weightStandard,
    headCirc: headCircStandard,
    armCirc: armCircStandard,
    bmi: bmiStandard
  });

  // Calculate BMI only if needed
  const heightInMeters = input.height / 100;
  const bmi = (input.shouldCalculateBMI && heightInMeters > 0) ? input.weight / (heightInMeters * heightInMeters) : 0;

  // Calculate Z-scores using WHO LMS method when available
  const heightZScore = heightStandard 
    ? calculateZScore(input.height, heightStandard.lmsParams?.l || null, heightStandard.meanValue, heightStandard.lmsParams?.s || null)
    : 0;

  const weightZScore = weightStandard 
    ? calculateZScore(input.weight, weightStandard.lmsParams?.l || null, weightStandard.meanValue, weightStandard.lmsParams?.s || null)
    : 0;

  const headCircZScore = (headCircStandard && input.shouldCalculateHeadCirc)
    ? calculateZScore(input.headCircumference, headCircStandard.lmsParams?.l || null, headCircStandard.meanValue, headCircStandard.lmsParams?.s || null)
    : 0;

  const armCircZScore = (armCircStandard && input.shouldCalculateMidArm)
    ? calculateZScore(input.midArmCircumference, armCircStandard.lmsParams?.l || null, armCircStandard.meanValue, armCircStandard.lmsParams?.s || null)
    : 0;

  const bmiZScore = (bmiStandard && input.shouldCalculateBMI && bmi > 0)
    ? calculateZScore(bmi, bmiStandard.lmsParams?.l || null, bmiStandard.meanValue, bmiStandard.lmsParams?.s || null)
    : null;

  return {
    ageInMonths: input.ageInMonths,
    gender: input.gender,
    height: {
      actual: input.height,
      expected: heightStandard?.meanValue || 0,
      sd: heightZScore,
      centile: input.height > 0 ? zScoreToCentile(heightZScore) : null
    },
    weight: {
      actual: input.weight,
      expected: weightStandard?.meanValue || 0,
      sd: weightZScore,
      centile: zScoreToCentile(weightZScore)
    },
    headCircumference: {
      actual: input.headCircumference,
      expected: headCircStandard?.meanValue || 0,
      sd: headCircZScore,
      centile: (input.headCircumference > 0 && input.shouldCalculateHeadCirc) ? zScoreToCentile(headCircZScore) : null
    },
    midArmCircumference: {
      actual: input.midArmCircumference,
      expected: armCircStandard?.meanValue || 0,
      sd: armCircZScore,
      centile: (input.shouldCalculateMidArm) ? zScoreToCentile(armCircZScore) : null
    },
    bmi: {
      actual: bmi,
      expected: bmiStandard?.meanValue || null,
      sd: bmiZScore,
      centile: bmiZScore ? zScoreToCentile(bmiZScore) : null
    },
    shouldCalculateBMI: input.shouldCalculateBMI,
    shouldCalculateHeadCirc: input.shouldCalculateHeadCirc,
    shouldCalculateMidArm: input.shouldCalculateMidArm
  };
};
