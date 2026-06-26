import type { APIRoute } from 'astro';

import { recordEvent } from '@/lib/mentedenta/events';
import { createSession } from '@/lib/mentedenta/sessions';

interface SessionRequestBody {
  source?: unknown;
  scenario?: unknown;
  metadata?: unknown;
}

function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return Response.json(body, { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function readOptionalJson(request: Request): Promise<SessionRequestBody> {
  const rawBody = await request.text();

  if (rawBody.trim() === '') {
    return {};
  }

  const body: unknown = JSON.parse(rawBody);

  if (!isRecord(body)) {
    throw new Error('Request body must be a JSON object');
  }

  return body;
}

export const POST: APIRoute = async ({ request }) => {
  let body: SessionRequestBody;

  try {
    body = await readOptionalJson(request);
  } catch {
    return jsonResponse({ ok: false, error: 'Invalid JSON body' }, 400);
  }

  if (body.source !== undefined && typeof body.source !== 'string') {
    return jsonResponse({ ok: false, error: 'source must be a string' }, 400);
  }

  if (body.scenario !== undefined && typeof body.scenario !== 'string') {
    return jsonResponse({ ok: false, error: 'scenario must be a string' }, 400);
  }

  if (body.metadata !== undefined && !isRecord(body.metadata)) {
    return jsonResponse({ ok: false, error: 'metadata must be a JSON object' }, 400);
  }

  const source = body.source?.trim() || 'dentamenta_web';
  const scenario = body.scenario?.trim() || 'patient_demo';
  const metadata = body.metadata ?? {};

  try {
    const session = await createSession({
      source,
      scenario,
      metadata,
    });

    await recordEvent({
      session_id: session.id,
      event_name: 'mentedenta_session_created',
    });

    return jsonResponse({
      ok: true,
      session_id: session.id,
    }, 200);
  } catch (error) {
    console.error('Failed to create MenteDenta session', error);
    return jsonResponse({ ok: false, error: 'Unable to create session' }, 500);
  }
};
