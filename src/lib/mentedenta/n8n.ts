import { getMenteDentaEnv } from './env';
import type { MenteDentaHistoryMessage } from './messages';

export interface MenteDentaWebhookRequest {
  source: string;
  session_id: string;
  message: string;
  scenario: string | null;
  history: MenteDentaHistoryMessage[];
  metadata: Record<string, unknown>;
}

export interface MenteDentaWebhookResponse {
  ok: true;
  reply: string;
}

function isWebhookResponse(value: unknown): value is MenteDentaWebhookResponse {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const response = value as Record<string, unknown>;
  return response.ok === true
    && typeof response.reply === 'string'
    && response.reply.trim() !== '';
}

export async function callMenteDentaWebhook(
  payload: MenteDentaWebhookRequest,
): Promise<MenteDentaWebhookResponse> {
  const response = await fetch(getMenteDentaEnv().MENTEDENTA_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`MenteDenta webhook failed with HTTP ${response.status}`);
  }

  let body: unknown;

  try {
    body = await response.json();
  } catch {
    throw new Error('MenteDenta webhook returned invalid JSON');
  }

  if (!isWebhookResponse(body)) {
    throw new Error('MenteDenta webhook returned an invalid response');
  }

  return {
    ok: true,
    reply: body.reply,
  };
}
