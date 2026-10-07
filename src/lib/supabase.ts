import { createClient } from '@supabase/supabase-js';

const meta = typeof import.meta !== 'undefined' ? (import.meta as any) : {};
const supabaseUrl = (meta.env && meta.env.VITE_SUPABASE_URL) || 'https://fqvpoqhobbaolyyeevnp.supabase.co';
const supabaseAnonKey = (meta.env && meta.env.VITE_SUPABASE_ANON_KEY) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxdnBvcWhvYmJhb2x5eWVldm5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4NzYyNjAsImV4cCI6MjEwMjQ1MjI2MH0.FvcyNRQCaG19QdJbdXFjOvoDUW-TvY6C4G2NZwrlBag';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const isSupabaseConfigured = (): boolean => {
  return !!supabaseUrl && !!supabaseAnonKey;
};

