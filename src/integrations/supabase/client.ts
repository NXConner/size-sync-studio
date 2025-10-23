import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Read from Vite env at build/runtime (front-end only)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  // Fail fast in development while keeping production builds tree-shakeable
  // eslint-disable-next-line no-console
  console.warn('[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in env. Client features will be disabled.');
}

export const supabase = createClient<Database>(SUPABASE_URL || '', SUPABASE_PUBLISHABLE_KEY || '', {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  }
});