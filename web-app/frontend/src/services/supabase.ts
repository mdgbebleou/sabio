import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dxgcmmhsctsaxcpdmzzp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4Z2NtbWhzY3RzYXhjcGRtenpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzNjcxNDcsImV4cCI6MjEwNTk0MzE0N30.-Vpxu1fORVS8mal-3uk4ouEVJVuoKujKqlYYtkh3K5M';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
