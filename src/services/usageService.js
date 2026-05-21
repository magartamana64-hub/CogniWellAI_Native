import { supabase } from '../config/supabase';
import { getTodayDate } from '../utils/dateHelpers';

export async function addUsageLog(userId, appName, category, durationMinutes) {
  return await supabase.from('usage_logs').insert({
    user_id: userId,
    app_name: appName,
    category,
    duration_minutes: Number(durationMinutes),
    log_date: getTodayDate(),
  });
}

export async function getTodayUsageLogs(userId) {
  return await supabase
    .from('usage_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('log_date', getTodayDate())
    .order('created_at', { ascending: false });
}

export async function getUsageLogsByDateRange(userId, startDate, endDate) {
  return await supabase
    .from('usage_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('log_date', startDate)
    .lte('log_date', endDate)
    .order('log_date', { ascending: true });
}

export async function updateUsageLog(id, appName, category, durationMinutes) {
  return await supabase
    .from('usage_logs')
    .update({
      app_name: appName,
      category,
      duration_minutes: Number(durationMinutes),
    })
    .eq('id', id);
}

export async function deleteUsageLog(id) {
  return await supabase
    .from('usage_logs')
    .delete()
    .eq('id', id);
}
