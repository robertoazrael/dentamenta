import type { APIRoute } from 'astro';

import {
  getValidAccessTokenByPlainToken,
  recordAccessTokenUse,
} from '@/lib/mentedenta/accessTokens';
import { listEventsBySession, recordEvent } from '@/lib/mentedenta/events';
import { listMessagesBySession } from '@/lib/mentedenta/messages';
import { getSessionById } from '@/lib/mentedenta/sessions';

function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return Response.json(body, { status });
}

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const token = url.searchParams.get('token')?.trim() ?? '';

  if (token === '') {
    return jsonResponse({ ok: false, error: 'Panel access token is required' }, 400);
  }

  try {
    const accessToken = await getValidAccessTokenByPlainToken(token);

    if (!accessToken) {
      return jsonResponse({
        ok: false,
        error: 'El enlace del panel no es válido o ya expiró.',
      }, 401);
    }

    const session = await getSessionById(accessToken.session_id);

    if (!session) {
      return jsonResponse({ ok: false, error: 'Session not found' }, 404);
    }

    const messages = await listMessagesBySession(accessToken.session_id);
    const events = await listEventsBySession(accessToken.session_id);

    await recordAccessTokenUse(accessToken.id);

    await recordEvent({
      session_id: accessToken.session_id,
      event_name: 'panel_data_viewed',
    });

    return jsonResponse({
      ok: true,
      session: {
        id: session.id,
        status: session.status,
        started_at: session.started_at,
        last_seen_at: session.last_seen_at,
      },
      messages,
      events,
    }, 200);
  } catch (error) {
    console.error('Failed to get MenteDenta panel data', error);
    return jsonResponse({ ok: false, error: 'Unable to get panel data' }, 500);
  }
};
