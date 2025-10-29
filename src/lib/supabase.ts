import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface DetectionSession {
  id: string;
  user_id: string | null;
  depression_score: number;
  detected_patterns: any[];
  remedy_suggestions: string[];
  session_duration: number;
  created_at: string;
}
