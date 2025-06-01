import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://muccbbmwukqbkrwfosec.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11Y2NiYm13dWtxYmtyd2Zvc2VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2ODUzNzMsImV4cCI6MjA2NDI2MTM3M30.IN4wfBs74iMvsv-RRzl4zqxYmTB2fzqjqIq6J1q5aoI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);