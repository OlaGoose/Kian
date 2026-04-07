import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export class MissingServiceRoleKeyError extends Error {
  constructor(message = 'SUPABASE_SERVICE_ROLE_KEY is required') {
    super(message);
    this.name = 'MissingServiceRoleKeyError';
  }
}

export function createServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) {
    throw new MissingServiceRoleKeyError('NEXT_PUBLIC_SUPABASE_URL is required');
  }
  if (!key) {
    throw new MissingServiceRoleKeyError(
      'SUPABASE_SERVICE_ROLE_KEY is required — add it in your hosting project environment (e.g. Vercel → Settings → Environment Variables)'
    );
  }
  return createClient(url, key);
}
