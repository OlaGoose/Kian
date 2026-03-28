/**
 * A simple Supabase client for use at build time (generateStaticParams, etc.)
 * Does NOT use cookies — only for read-only public data fetching.
 */
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createBuildClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
