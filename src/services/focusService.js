import { supabase } from '../config/supabase';

export async function addFocusSession(userId, goal, durationMinutes, completed) {
  return await supabase.from('focus_sessions').insert({
    user_id: userId,
    goal,
    duration_minutes: Number(durationMinutes),
    completed,
    ended_at: new Date().toISOString(),
  });
}

export async function getFocusSessions(userId) {
  return await supabase
    .from('focus_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false });
}

export async function updateFocusSession(id, goal, durationMinutes, completed) {
  return await supabase
    .from('focus_sessions')
    .update({
      goal,
      duration_minutes: Number(durationMinutes),
      completed,
    })
    .eq('id', id);
}

export async function deleteFocusSession(id) {
  return await supabase
    .from('focus_sessions')
    .delete()
    .eq('id', id);
}
