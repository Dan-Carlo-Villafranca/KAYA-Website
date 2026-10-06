import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = "https://tjqogirsbqqxkiegzxbf.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Oln0JL7lS3uBPEm2x-dMhA_VphyBdCX";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Retrieves current active user profile and role
 */
export async function getCurrentUser() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) return null;

  // Read role from profiles table first, fallback to user_metadata
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', session.user.id)
    .single();

  return {
    ...session.user,
    role: profile?.role || session.user.user_metadata?.role || 'jobseeker'
  };
}