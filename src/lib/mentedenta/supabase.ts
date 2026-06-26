import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { getMenteDentaEnv } from './env';

let serverClient: SupabaseClient | undefined;

export function getMenteDentaSupabase(): SupabaseClient {
  if (serverClient) {
    return serverClient;
  }

  const env = getMenteDentaEnv();

  serverClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });

  return serverClient;
}
