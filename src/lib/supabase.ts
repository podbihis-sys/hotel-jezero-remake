import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (_supabase) return _supabase;
  if (!isValidUrl(supabaseUrl) || !supabaseAnonKey) return null;
  _supabase = createClient(supabaseUrl, supabaseAnonKey);
  return _supabase;
}

// Keep backward compatibility - lazy getter
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabase();
    if (!client) throw new Error('Supabase is not configured');
    return (client as unknown as Record<string | symbol, unknown>)[prop];
  },
});

// Server-side client with service role (bypasses RLS)
export function createServerClient(): SupabaseClient {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!isValidUrl(supabaseUrl) || !serviceRoleKey) {
    throw new Error('Supabase is not configured');
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });
}
