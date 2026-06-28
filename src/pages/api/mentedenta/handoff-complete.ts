import type { APIRoute } from 'astro';

import {
  getValidAccessTokenByPlainToken,
  recordAccessTokenUse,
} from '@/lib/mentedenta/accessTokens';
import { getMenteDentaInternalApiKey } from '@/lib/mentedenta/env';
import { recordEvent } from '@/lib/mentedenta/events';
import { updateSessionProspectData } from '@/lib/mentedenta/sessions';

interface HandoffCompleteRequestBody {
  token?: unknown;
  prospect?: unknown;
  message?: unknown;
}

interface ProspectInput {
  name?: string;
  email?: string;
  phone?: string;
  business_name?: string;
  business_type?: string;
  city?: string;
}

function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return Response.json(body, { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function optionalString(value: unknown, fieldName: string): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw new Error(`${fieldName} must be a string`);
  }

  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

function isAuthorized(request: Request): boolean {
  const providedKey = request.headers.get('x-mentedenta-internal-key')?.trim() ?? '';
  return providedKey !== '' && providedKey === getMenteDentaInternalApiKey();
}

function getProspect(value: unknown): ProspectInput {
  if (value === undefined || value === null) {
    return {};
  }

  if (!isRecord(value)) {
    throw new Error('prospect must be a JSON object');
  }

  return {
    name: optionalString(value.name, 'prospect.name'),
    email: optionalString(value.email, 'prospect.email'),
    phone: optionalString(value.phone, 'prospect.phone'),
    business_name: optionalString(value.business_name, 'prospect.business_name'),
    business_type: optionalString(value.business_type, 'prospect.business_type'),
    city: optionalString(value.city, 'prospect.city'),
  };
}

async function readJson(request: Request): Promise<HandoffCompleteRequestBody> {
  const body: unknown = await request.json();

  if (!isRecord(body)) {
    throw new Error('Request body must be a JSON object');
  }

  return body;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    if (!isAuthorized(request)) {
      return jsonResponse({ ok: false, error: 'Unauthorized' }, 401);
    }
  } catch (error) {
    console.error('Failed to validate MenteDenta internal API key', error);
    return jsonResponse({ ok: false, error: 'Internal endpoint is not configured' }, 500);
  }

  let body: HandoffCompleteRequestBody;
  let prospect: ProspectInput;
  let message: string | undefined;

  try {
    body = await readJson(request);
    prospect = getProspect(body.prospect);
    message = optionalString(body.message, 'message');
  } catch (error) {
    return jsonResponse({
      ok: false,
      error: error instanceof Error ? error.message : 'Invalid JSON body',
    }, 400);
  }

  if (typeof body.token !== 'string' || body.token.trim() === '') {
    return jsonResponse({ ok: false, error: 'token is required' }, 400);
  }

  try {
    const accessToken = await getValidAccessTokenByPlainToken(body.token.trim(), 'handoff');

    if (!accessToken) {
      return jsonResponse({ ok: false, error: 'Invalid or expired handoff token' }, 401);
    }

    const session = await updateSessionProspectData(accessToken.session_id, {
      prospect_name: prospect.name,
      prospect_email: prospect.email,
      prospect_phone: prospect.phone,
      business_name: prospect.business_name,
      business_type: prospect.business_type,
      city: prospect.city,
    });

    await recordAccessTokenUse(accessToken.id);

    await recordEvent({
      session_id: session.id,
      event_name: 'mentematica_handoff_completed',
      metadata: {
        has_message: Boolean(message),
        has_email_on_file: Boolean(session.prospect_email),
        has_phone_on_file: Boolean(session.prospect_phone),
        has_contact_on_file: Boolean(session.prospect_email || session.prospect_phone),
      },
    });

    return jsonResponse({
      ok: true,
      session_id: session.id,
    }, 200);
  } catch (error) {
    console.error('Failed to complete MenteDenta handoff', error);
    return jsonResponse({ ok: false, error: 'Unable to complete handoff' }, 500);
  }
};
