import type { APIRoute } from 'astro';

import {
  getValidAccessTokenByPlainToken,
  recordAccessTokenUse,
  type MenteDentaHandoffType,
} from '@/lib/mentedenta/accessTokens';
import { getMenteDentaInternalApiKey } from '@/lib/mentedenta/env';
import { getSessionById, type MenteDentaSession } from '@/lib/mentedenta/sessions';

interface HandoffResolveRequestBody {
  token?: unknown;
}

function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return Response.json(body, { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined;
}

function isAuthorized(request: Request): boolean {
  const providedKey = request.headers.get('x-mentedenta-internal-key')?.trim() ?? '';
  return providedKey !== '' && providedKey === getMenteDentaInternalApiKey();
}

async function readJson(request: Request): Promise<HandoffResolveRequestBody> {
  const body: unknown = await request.json();

  if (!isRecord(body)) {
    throw new Error('Request body must be a JSON object');
  }

  return body;
}

function getHandoffType(metadata: Record<string, unknown>, session: MenteDentaSession): MenteDentaHandoffType {
  const metadataType = metadata.handoff_type;

  if (metadataType === 'anonymous' || metadataType === 'identified') {
    return metadataType;
  }

  return session.prospect_email || session.prospect_phone ? 'identified' : 'anonymous';
}

function getSafeSummary(session: MenteDentaSession, handoffType: MenteDentaHandoffType): Record<string, unknown> {
  const sessionMetadata = isRecord(session.metadata) ? session.metadata : {};
  const businessName = optionalString(sessionMetadata.business_name);
  const businessType = optionalString(sessionMetadata.business_type);
  const city = optionalString(sessionMetadata.city);
  const hasEmailOnFile = Boolean(session.prospect_email);
  const hasPhoneOnFile = Boolean(session.prospect_phone);

  return {
    handoff_type: handoffType,
    session: {
      source: session.source,
      scenario: session.scenario,
      is_identified: Boolean(
        session.prospect_name
        || hasEmailOnFile
        || hasPhoneOnFile
        || businessName
        || businessType
        || city
      ),
    },
    prospect: {
      ...(session.prospect_name ? { name: session.prospect_name } : {}),
      ...(businessName ? { business_name: businessName } : {}),
      ...(businessType ? { business_type: businessType } : {}),
      ...(city ? { city } : {}),
      has_email_on_file: hasEmailOnFile,
      has_phone_on_file: hasPhoneOnFile,
      has_contact_on_file: hasEmailOnFile || hasPhoneOnFile,
    },
  };
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

  let body: HandoffResolveRequestBody;

  try {
    body = await readJson(request);
  } catch {
    return jsonResponse({ ok: false, error: 'Invalid JSON body' }, 400);
  }

  if (typeof body.token !== 'string' || body.token.trim() === '') {
    return jsonResponse({ ok: false, error: 'token is required' }, 400);
  }

  try {
    const accessToken = await getValidAccessTokenByPlainToken(body.token.trim(), 'handoff');

    if (!accessToken) {
      return jsonResponse({ ok: false, error: 'Invalid or expired handoff token' }, 401);
    }

    const session = await getSessionById(accessToken.session_id);

    if (!session) {
      return jsonResponse({ ok: false, error: 'Session not found' }, 404);
    }

    await recordAccessTokenUse(accessToken.id);

    return jsonResponse({
      ok: true,
      session_id: accessToken.session_id,
      ...getSafeSummary(session, getHandoffType(accessToken.metadata, session)),
    }, 200);
  } catch (error) {
    console.error('Failed to resolve MenteDenta handoff token', error);
    return jsonResponse({ ok: false, error: 'Unable to resolve handoff token' }, 500);
  }
};
