import type { APIRoute } from 'astro';

import { createPanelAccessToken } from '@/lib/mentedenta/accessTokens';
import { recordEvent } from '@/lib/mentedenta/events';
import { getSessionById } from '@/lib/mentedenta/sessions';

interface PanelAccessRequestBody {
  session_id?: unknown;
}

function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return Response.json(body, { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function readJson(request: Request): Promise<PanelAccessRequestBody> {
  const body: unknown = await request.json();

  if (!isRecord(body)) {
    throw new Error('Request body must be a JSON object');
  }

  return body;
}

export const POST: APIRoute = async ({ request }) => {
  let body: PanelAccessRequestBody;

  try {
    body = await readJson(request);
  } catch {
    return jsonResponse({ ok: false, error: 'Invalid JSON body' }, 400);
  }

  if (typeof body.session_id !== 'string' || body.session_id.trim() === '') {
    return jsonResponse({ ok: false, error: 'session_id is required' }, 400);
  }

  const sessionId = body.session_id.trim();

  try {
    const session = await getSessionById(sessionId);

    if (!session) {
      return jsonResponse({ ok: false, error: 'Session not found' }, 404);
    }

    const { panel_url: panelUrl } = await createPanelAccessToken(sessionId);

    await recordEvent({
      session_id: sessionId,
      event_name: 'panel_access_token_created',
    });

    return jsonResponse({
      ok: true,
      panel_url: panelUrl,
    }, 200);
  } catch (error) {
    console.error('Failed to create MenteDenta panel access token', error);
    return jsonResponse({ ok: false, error: 'Unable to create panel access' }, 500);
  }
};
