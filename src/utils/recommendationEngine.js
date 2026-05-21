export function formatAIResponse(result) {
  if (!result) {
    return 'AI analysis unavailable.';
  }

  const recommendations = result.recommendations || [];

  return `
Focus Score: ${result.focus_score}/100

Risk Level: ${result.risk_level}

Total Screen Time: ${result.total_screen_time} minutes

Social Media Usage: ${result.social_media_time} minutes

Recommendations:
${recommendations.map((item) => `- ${item}`).join('\n')}
  `;
}
