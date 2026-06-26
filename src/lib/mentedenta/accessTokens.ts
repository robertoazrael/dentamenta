import { getMenteDentaSupabase } from './supabase';
import { generatePanelToken, generatePanelUrl, hashPanelToken } from './tokens';

export type MenteDentaAccessTokenPurpose = 'panel_access';

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

export async function createPanelAccessToken(
  sessionId: string,
): Promise<CreatePanelAccessTokenResult> {
  const token = generatePanelToken();
  const tokenHash = hashPanelToken(token);

  const { data, error } = await getMenteDentaSupabase()
    .from('mentedenta_access_tokens')
    .insert({
      session_id: sessionId,
      token_hash: tokenHash,
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to create MenteDenta access token: ${error.message}`);
  }

  return {
    accessToken: data as MenteDentaAccessToken,
    token,
    panel_url: generatePanelUrl(token),
  };
}

export async function getValidAccessTokenByPlainToken(
  token: string,
): Promise<MenteDentaAccessToken | null> {
  const tokenHash = hashPanelToken(token);

  const { data, error } = await getMenteDentaSupabase()
    .from('mentedenta_access_tokens')
    .select('*')
    .eq('token_hash', tokenHash)
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
