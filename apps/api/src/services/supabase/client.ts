import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

let anonClient: SupabaseClient | null = null;
let serviceClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!anonClient) {
    anonClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return anonClient;
}

export function getSupabaseServiceClient(): SupabaseClient {
  if (!serviceClient) {
    if (!env.SUPABASE_SERVICE_ROLE_KEY) {
      logger.warn('SUPABASE_SERVICE_ROLE_KEY not configured, falling back to anon client');
      return getSupabaseClient();
    }
    serviceClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return serviceClient;
}

/**
 * Creates an authorized client with user-scoped JWT for strict RLS compliance.
 */
export function getSupabaseUserClient(userToken: string): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    },
  });
}
