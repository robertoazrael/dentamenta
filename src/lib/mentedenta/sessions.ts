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
  prospect_name?: string | null;
  prospect_email?: string | null;
  prospect_phone?: string | null;
}

export interface UpdateMenteDentaSessionProspectInput {
  prospect_name?: string;
  prospect_email?: string;
  prospect_phone?: string;
  business_name?: string;
  business_type?: string;
  city?: string;
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
      prospect_name: input.prospect_name ?? null,
      prospect_email: input.prospect_email ?? null,
      prospect_phone: input.prospect_phone ?? null,
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

export async function updateSessionProspectData(
  sessionId: string,
  input: UpdateMenteDentaSessionProspectInput,
): Promise<MenteDentaSession> {
  const session = await getSessionById(sessionId);

  if (!session) {
    throw new Error('MenteDenta session not found');
  }

  const metadata = {
    ...(session.metadata ?? {}),
  };

  if (input.business_name) {
    metadata.business_name = input.business_name;
  }

  if (input.business_type) {
    metadata.business_type = input.business_type;
  }

  if (input.city) {
    metadata.city = input.city;
  }

  const updatePayload = {
    prospect_name: input.prospect_name || session.prospect_name,
    prospect_email: input.prospect_email || session.prospect_email,
    prospect_phone: input.prospect_phone || session.prospect_phone,
    metadata,
  };

  const { data, error } = await getMenteDentaSupabase()
    .from('mentedenta_sessions')
    .update(updatePayload)
    .eq('id', sessionId)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to update MenteDenta session prospect data: ${error.message}`);
  }

  return data as MenteDentaSession;
}
