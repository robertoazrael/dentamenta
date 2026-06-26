import { getMenteDentaSupabase } from './supabase';

export interface MenteDentaEvent {
  id: string;
  session_id: string | null;
  event_name: string;
  event_category: string;
  route_path: string | null;
  value_numeric: number | null;
  metadata: Record<string, unknown>;
  occurred_at: string;
  created_at: string;
}

export interface RecordMenteDentaEventInput {
  session_id: string | null;
  event_name: string;
  event_category?: string;
  route_path?: string | null;
  value_numeric?: number | null;
  metadata?: Record<string, unknown>;
  occurred_at?: string;
}

export async function recordEvent(
  input: RecordMenteDentaEventInput,
): Promise<MenteDentaEvent> {
  const { data, error } = await getMenteDentaSupabase()
    .from('mentedenta_events')
    .insert({
      session_id: input.session_id,
      event_name: input.event_name,
      event_category: input.event_category ?? 'mentedenta',
      route_path: input.route_path ?? null,
      value_numeric: input.value_numeric ?? null,
      metadata: input.metadata ?? {},
      ...(input.occurred_at ? { occurred_at: input.occurred_at } : {}),
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to record MenteDenta event: ${error.message}`);
  }

  return data as MenteDentaEvent;
}

export async function listEventsBySession(
  sessionId: string,
): Promise<MenteDentaEvent[]> {
  const { data, error } = await getMenteDentaSupabase()
    .from('mentedenta_events')
    .select('*')
    .eq('session_id', sessionId)
    .order('occurred_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to list MenteDenta events: ${error.message}`);
  }

  return (data ?? []) as MenteDentaEvent[];
}
