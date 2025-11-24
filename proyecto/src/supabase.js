import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://arlljuehdffgusjczfss.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybGxqdWVoZGZmZ3VzamN6ZnNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwMDc4MDgsImV4cCI6MjA3OTU4MzgwOH0.dFR7RKm4Vl_snOiV4me9sBRmzwE9ydoAxxpZjdaht-Q';

export const supabase = createClient(supabaseUrl, supabaseKey);
