import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dxgcmmhsctsaxcpdmzzp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4Z2NtbWhzY3RzYXhjcGRtenpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzNjcxNDcsImV4cCI6MjEwNTk0MzE0N30.-Vpxu1fORVS8mal-3uk4ouEVJVuoKujKqlYYtkh3K5M';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * System-wide helper to fetch table data with newest records automatically on top.
 * Usage across your pages: const { data } = await fetchSortedProfiles('profiles');
 */
export async function fetchSortedProfiles(tableName: string = 'profiles') {
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching sorted data from ${tableName}:`, error);
    throw error;
  }
  return data;
}