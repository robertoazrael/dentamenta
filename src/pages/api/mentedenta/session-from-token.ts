import type { APIRoute } from 'astro';

import {
  getValidAccessTokenByPlainToken,
  recordAccessTokenUse,
} from '@/lib/mentedenta/accessTokens';
import { recordEvent } from '@/lib/mentedenta/events';

interface SessionFromTokenRequestBody {
  token?: unknown;
}

function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return Response.json(body, { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function readJson(request: Request): Promise<SessionFromTokenRequestBody> {
  const body: unknown = await request.json();

  if (!isRecord(body)) {
    throw new Error('Request body must be a JSON object');
  }

  return body;
}

export const POST: APIRoute = async ({ request }) => {
  let body: SessionFromTokenRequestBody;

  try {
    body = await readJson(request);
  } catch {
    return jsonResponse({ ok: false, error: 'Invalid JSON body' }, 400);
  }

  if (typeof body.token !== 'string' || body.token.trim() === '') {
    return jsonResponse({ ok: false, error: 'token is required' }, 400);
  }

  try {
    const accessToken = await getValidAccessTokenByPlainToken(body.token.trim(), 'demo_entry');

    if (!accessToken) {
      return jsonResponse({
        ok: false,
        error: 'El enlace demo no es válido o ya expiró.',
      }, 401);
    }

    await recordAccessTokenUse(accessToken.id);

    await recordEvent({
      session_id: accessToken.session_id,
      event_name: 'prepared_demo_link_opened',
    });

    return jsonResponse({
      ok: true,
      session_id: accessToken.session_id,
    }, 200);
  } catch (error) {
    console.error('Failed to resolve MenteDenta prepared demo token', error);
    return jsonResponse({ ok: false, error: 'Unable to open prepared demo link' }, 500);
  }
};
