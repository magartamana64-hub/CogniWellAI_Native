export function calculateFocusScore(totalScreenTime, socialMediaTime, stressLevel, focusLevel) {
  let score = 100;

  if (totalScreenTime > 420) score -= 25;
  if (socialMediaTime > 180) score -= 20;
  if (stressLevel >= 4) score -= 15;
  if (focusLevel <= 2) score -= 15;

  return Math.max(score, 0);
}