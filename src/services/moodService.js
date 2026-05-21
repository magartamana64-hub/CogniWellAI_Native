import { supabase } from '../config/supabase';
import { getTodayDate } from '../utils/dateHelpers';

export async function addMoodLog(
  userId,
  mood,
  stressLevel,
  focusLevel,
  energyLevel,
  sleepQuality
) {
  return await supabase.from('mood_logs').insert({
    user_id: userId,
    mood,
    stress_level: Number(stressLevel),
    focus_level: Number(focusLevel),
    energy_level: Number(energyLevel),
    sleep_quality: sleepQuality,
    log_date: getTodayDate(),
  });
}

export async function getLatestMood(userId) {
  return await supabase
    .from('mood_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
}

export async function getMoodLogsByDateRange(userId, startDate, endDate) {
  return await supabase
    .from('mood_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('log_date', startDate)
    .lte('log_date', endDate)
    .order('log_date', { ascending: true });
}

export async function getMoodLogs(userId) {
  return await supabase
    .from('mood_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
}

export async function updateMoodLog(
  id,
  mood,
  stressLevel,
  focusLevel,
  energyLevel,
  sleepQuality
) {
  return await supabase
    .from('mood_logs')
    .update({
      mood,
      stress_level: Number(stressLevel),
      focus_level: Number(focusLevel),
      energy_level: Number(energyLevel),
      sleep_quality: sleepQuality,
    })
    .eq('id', id);
}

export async function deleteMoodLog(id) {
  return await supabase
    .from('mood_logs')
    .delete()
    .eq('id', id);
}
