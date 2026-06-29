import { getMenteDentaSupabase } from './supabase';
import { getMentematicaHandoffBaseUrl } from './env';
import { generatePanelToken, generatePanelUrl, hashPanelToken } from './tokens';

export type MenteDentaAccessTokenPurpose = 'panel' | 'demo_entry' | 'handoff';
export type MenteDentaHandoffType = 'anonymous' | 'identified';

export interface MenteDentaAccessToken {
  id: string;
  session_id: string;
  token_hash: string;
  purpose: MenteDentaAccessTokenPurpose;
  label: string | null;
  expires_at: string;
  used_at: string | null;
  last_used_at: string | null;
  use_count: number;
  revoked_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface CreatePanelAccessTokenResult {
  accessToken: MenteDentaAccessToken;
  token: string;
  panel_url: string;
}

export interface CreateDemoEntryAccessTokenResult {
  accessToken: MenteDentaAccessToken;
  token: string;
}

export interface CreateHandoffAccessTokenResult {
  accessToken: MenteDentaAccessToken;
  token: string;
  handoff_url: string;
  handoff_type: MenteDentaHandoffType;
}

async function createAccessToken(
  sessionId: string,
  purpose: MenteDentaAccessTokenPurpose,
  metadata: Record<string, unknown> = {},
): Promise<{ accessToken: MenteDentaAccessToken; token: string }> {
  const token = generatePanelToken();
  const tokenHash = hashPanelToken(token);

  const { data, error } = await getMenteDentaSupabase()
    .from('mentedenta_access_tokens')
    .insert({
      session_id: sessionId,
      token_hash: tokenHash,
      purpose,
      metadata,
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to create MenteDenta access token: ${error.message}`);
  }

  return {
    accessToken: data as MenteDentaAccessToken,
    token,
  };
}

export async function createPanelAccessToken(
  sessionId: string,
): Promise<CreatePanelAccessTokenResult> {
  const { accessToken, token } = await createAccessToken(sessionId, 'panel');

  return {
    accessToken,
    token,
    panel_url: generatePanelUrl(token),
  };
}

export async function createDemoEntryAccessToken(
  sessionId: string,
): Promise<CreateDemoEntryAccessTokenResult> {
  return createAccessToken(sessionId, 'demo_entry');
}

export function generateHandoffUrl(token: string, handoffType: MenteDentaHandoffType): string {
  const baseUrl = new URL(getMentematicaHandoffBaseUrl());
  const basePath = baseUrl.pathname.replace(/\/$/, '');
  const targetPath = handoffType === 'identified' ? 'gracias' : 'contacto';

  baseUrl.pathname = `${basePath}/${targetPath}`.replace(/\/{2,}/g, '/');
  baseUrl.searchParams.set('handoff_token', token);
  return baseUrl.toString();
}

export async function createHandoffAccessToken(
  sessionId: string,
  handoffType: MenteDentaHandoffType,
  reason = 'sales_interest',
): Promise<CreateHandoffAccessTokenResult> {
  const { accessToken, token } = await createAccessToken(sessionId, 'handoff', {
    target: 'mentematica',
    handoff_type: handoffType,
    reason,
  });

  return {
    accessToken,
    token,
    handoff_url: generateHandoffUrl(token, handoffType),
    handoff_type: handoffType,
  };
}

export async function getValidAccessTokenByPlainToken(
  token: string,
  purpose: MenteDentaAccessTokenPurpose,
): Promise<MenteDentaAccessToken | null> {
  const tokenHash = hashPanelToken(token);

  const { data, error } = await getMenteDentaSupabase()
    .from('mentedenta_access_tokens')
    .select('*')
    .eq('token_hash', tokenHash)
    .eq('purpose', purpose)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to get MenteDenta access token: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const accessToken = data as MenteDentaAccessToken;

  if (accessToken.revoked_at !== null) {
    return null;
  }

  if (new Date(accessToken.expires_at).getTime() <= Date.now()) {
    return null;
  }

  return accessToken;
}

export async function recordAccessTokenUse(
  accessTokenId: string,
): Promise<MenteDentaAccessToken> {
  const { data: currentToken, error: getError } = await getMenteDentaSupabase()
    .from('mentedenta_access_tokens')
    .select('*')
    .eq('id', accessTokenId)
    .single();

  if (getError) {
    throw new Error(`Failed to get MenteDenta access token for usage update: ${getError.message}`);
  }

  const now = new Date().toISOString();
  const accessToken = currentToken as MenteDentaAccessToken;

  const { data, error } = await getMenteDentaSupabase()
    .from('mentedenta_access_tokens')
    .update({
      use_count: accessToken.use_count + 1,
      used_at: accessToken.used_at ?? now,
      last_used_at: now,
    })
    .eq('id', accessTokenId)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to record MenteDenta access token usage: ${error.message}`);
  }

  return data as MenteDentaAccessToken;
}
