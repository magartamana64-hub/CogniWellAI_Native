import { supabase } from '../config/supabase';

export async function registerUser(email, password, fullName) {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
}

export async function loginUser(email, password) {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function logoutUser() {
  return await supabase.auth.signOut();
}

export async function updateUserProfile(metadata) {
  return await supabase.auth.updateUser({
    data: metadata,
  });
}

export async function changeUserPassword(password) {
  return await supabase.auth.updateUser({
    password,
  });
}

export async function verifyCurrentPassword(email, password) {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function sendPasswordReset(email) {
  return await supabase.auth.resetPasswordForEmail(email.trim());
}
