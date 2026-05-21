import { supabase } from '../config/supabase';

export async function saveRecommendation(userId, recommendation) {
  return await supabase.from('recommendations').insert({
    user_id: userId,
    recommendation_text: recommendation.text,
    reason: recommendation.reason,
    severity: recommendation.severity,
  });
}

export async function getLatestRecommendations(userId) {
  return await supabase
    .from('recommendations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);
}