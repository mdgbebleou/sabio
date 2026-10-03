import { supabase } from './supabase';

export async function fetchParentData(userId: string) {
  const { data, error } = await supabase
    .from('parents')
    .select(`
      *,
      students (
        id,
        first_name,
        last_name,
        class_name,
        fees (status, balance),
        grades (*)
      )
    `)
    .eq('auth_id', userId)
    .single();

  if (error) {
    console.error('Error fetching parent data:', error.message);
    return null;
  }
  return data;
}