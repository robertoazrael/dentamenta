import type { APIRoute } from 'astro';

import { createDemoEntryAccessToken } from '@/lib/mentedenta/accessTokens';
import { getMenteDentaInternalApiKey } from '@/lib/mentedenta/env';
import { recordEvent } from '@/lib/mentedenta/events';
import { createSession } from '@/lib/mentedenta/sessions';

interface PreparedLinkRequestBody {
  source?: unknown;
  scenario?: unknown;
  prospect?: unknown;
  metadata?: unknown;
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

function getSafeMetadata(value: unknown, prospect: ProspectInput): Record<string, unknown> {
  if (value !== undefined && value !== null && !isRecord(value)) {
    throw new Error('metadata must be a JSON object');
  }

  const metadata = value && isRecord(value) ? value : {};
  const safeMetadata: Record<string, unknown> = {};

  for (const key of ['demo_type', 'campaign'] as const) {
    const safeValue = optionalString(metadata[key], `metadata.${key}`);

    if (safeValue) {
      safeMetadata[key] = safeValue;
    }
  }

  if (prospect.business_name) {
    safeMetadata.business_name = prospect.business_name;
  }

  if (prospect.business_type) {
    safeMetadata.business_type = prospect.business_type;
  }

  if (prospect.city) {
    safeMetadata.city = prospect.city;
  }

  return safeMetadata;
}

async function readJson(request: Request): Promise<PreparedLinkRequestBody> {
  const body: unknown = await request.json();

  if (!isRecord(body)) {
    throw new Error('Request body must be a JSON object');
  }

  return body;
}

function isAuthorized(request: Request): boolean {
  const providedKey = request.headers.get('x-mentedenta-internal-key')?.trim() ?? '';
  return providedKey !== '' && providedKey === getMenteDentaInternalApiKey();
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

  let body: PreparedLinkRequestBody;
  let prospect: ProspectInput;
  let metadata: Record<string, unknown>;

  try {
    body = await readJson(request);

    if (body.source !== undefined && typeof body.source !== 'string') {
      return jsonResponse({ ok: false, error: 'source must be a string' }, 400);
    }

    if (body.scenario !== undefined && typeof body.scenario !== 'string') {
      return jsonResponse({ ok: false, error: 'scenario must be a string' }, 400);
    }

    prospect = getProspect(body.prospect);
    metadata = getSafeMetadata(body.metadata, prospect);
  } catch (error) {
    return jsonResponse({
      ok: false,
      error: error instanceof Error ? error.message : 'Invalid JSON body',
    }, 400);
  }

  const source = body.source?.trim() || 'mentematica_prepared_demo';
  const scenario = body.scenario?.trim() || 'patient_demo';

  try {
    const session = await createSession({
      source,
      scenario,
      metadata,
      prospect_name: prospect.name ?? null,
      prospect_email: prospect.email ?? null,
      prospect_phone: prospect.phone ?? null,
    });
    const { token } = await createDemoEntryAccessToken(session.id);
    const demoUrl = new URL(new URL(request.url).origin);
    demoUrl.searchParams.set('demo_token', token);

    await recordEvent({
      session_id: session.id,
      event_name: 'prepared_demo_link_created',
      metadata: {
        source,
        scenario,
      },
    });

    return jsonResponse({
      ok: true,
      session_id: session.id,
      demo_url: demoUrl.toString(),
    }, 200);
  } catch (error) {
    console.error('Failed to create MenteDenta prepared link', error);
    return jsonResponse({ ok: false, error: 'Unable to create prepared link' }, 500);
  }
};
