// Conduct Score Utility - 40 Point System
// Use this in all components that display conduct scores

export const CONDUCT_MAX_SCORE = 40;

export const getConductColor = (score: number): string => {
  if (score >= 36) return 'text-green-600';   // A
  if (score >= 32) return 'text-blue-600';    // B
  if (score >= 28) return 'text-yellow-600';  // C
  if (score >= 24) return 'text-orange-500';  // D
  return 'text-red-600';                       // F
};

export const getConductBgColor = (score: number): string => {
  if (score >= 36) return 'bg-green-500';
  if (score >= 32) return 'bg-blue-500';
  if (score >= 28) return 'bg-yellow-500';
  if (score >= 24) return 'bg-orange-500';
  return 'bg-red-500';
};

export const getConductGrade = (score: number): string => {
  if (score >= 36) return 'A';
  if (score >= 32) return 'B';
  if (score >= 28) return 'C';
  if (score >= 24) return 'D';
  return 'F';
};

export const getConductStatus = (score: number): string => {
  if (score >= 36) return 'Excellent';
  if (score >= 32) return 'Good';
  if (score >= 28) return 'Fair';
  if (score >= 24) return 'Warning';
  return 'Critical';
};

export const formatConductScore = (score: number): string => {
  return `${score}/${CONDUCT_MAX_SCORE}`;
};

export const getConductPercentage = (score: number): number => {
  return (score / CONDUCT_MAX_SCORE) * 100;
};
