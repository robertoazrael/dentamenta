import { getMenteDentaSupabase } from './supabase';

export type MenteDentaSessionStatus = 'active' | 'completed' | 'expired' | 'archived';

export interface MenteDentaSession {
  id: string;
  site_slug: string;
  status: MenteDentaSessionStatus;
  patient_alias: string | null;
  prospect_name: string | null;
  prospect_email: string | null;
  prospect_phone: string | null;
  scenario: string | null;
  source: string;
  started_at: string;
  last_seen_at: string;
  completed_at: string | null;
  expires_at: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CreateMenteDentaSessionInput {
  source: string;
  scenario?: string | null;
  metadata?: Record<string, unknown>;
}

export async function createSession(
  input: CreateMenteDentaSessionInput,
): Promise<MenteDentaSession> {
  const { data, error } = await getMenteDentaSupabase()
    .from('mentedenta_sessions')
    .insert({
      source: input.source,
      scenario: input.scenario ?? null,
      metadata: input.metadata ?? {},
      status: 'active',
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to create MenteDenta session: ${error.message}`);
  }

  return data as MenteDentaSession;
}

export async function getSessionById(sessionId: string): Promise<MenteDentaSession | null> {
  const { data, error } = await getMenteDentaSupabase()
    .from('mentedenta_sessions')
    .select('*')
    .eq('id', sessionId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to get MenteDenta session: ${error.message}`);
  }

  return data as MenteDentaSession | null;
}

export async function updateSessionLastSeen(sessionId: string): Promise<MenteDentaSession> {
  const { data, error } = await getMenteDentaSupabase()
    .from('mentedenta_sessions')
    .update({ last_seen_at: new Date().toISOString() })
    .eq('id', sessionId)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to update MenteDenta session last_seen_at: ${error.message}`);
  }

  return data as MenteDentaSession;
}
