import { getMenteDentaSupabase } from './supabase';

export type MenteDentaMessageRole = 'user' | 'assistant' | 'system' | 'tool';

export interface MenteDentaMessage {
  id: string;
  session_id: string;
  role: MenteDentaMessageRole;
  channel: string;
  content: string;
  external_message_id: string | null;
  message_payload: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface SaveMenteDentaMessageInput {
  session_id: string;
  role: MenteDentaMessageRole;
  content: string;
  channel?: string;
  external_message_id?: string | null;
  message_payload?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface MenteDentaHistoryMessage {
  role: MenteDentaMessageRole;
  content: string;
}

export async function saveMessage(
  input: SaveMenteDentaMessageInput,
): Promise<MenteDentaMessage> {
  const { data, error } = await getMenteDentaSupabase()
    .from('mentedenta_messages')
    .insert({
      session_id: input.session_id,
      role: input.role,
      content: input.content,
      channel: input.channel ?? 'web_chat',
      external_message_id: input.external_message_id ?? null,
      message_payload: input.message_payload ?? {},
      metadata: input.metadata ?? {},
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to save MenteDenta message: ${error.message}`);
  }

  return data as MenteDentaMessage;
}

export async function listMessagesBySession(
  sessionId: string,
): Promise<MenteDentaMessage[]> {
  const { data, error } = await getMenteDentaSupabase()
    .from('mentedenta_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to list MenteDenta messages: ${error.message}`);
  }

  return (data ?? []) as MenteDentaMessage[];
}

export async function getRecentMessageHistory(
  sessionId: string,
  limit = 20,
): Promise<MenteDentaHistoryMessage[]> {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error('Message history limit must be a positive integer');
  }

  const { data, error } = await getMenteDentaSupabase()
    .from('mentedenta_messages')
    .select('role, content, created_at')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to get recent MenteDenta message history: ${error.message}`);
  }

  return ((data ?? []) as Array<MenteDentaHistoryMessage & { created_at: string }>)
    .reverse()
    .map(({ role, content }) => ({ role, content }));
}
