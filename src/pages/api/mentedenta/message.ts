import type { APIRoute } from 'astro';

import { recordEvent } from '@/lib/mentedenta/events';
import { getRecentMessageHistory, saveMessage } from '@/lib/mentedenta/messages';
import { callMenteDentaWebhook } from '@/lib/mentedenta/n8n';
import { sanitizeMenteDentaText } from '@/lib/mentedenta/sanitize';
import { getSessionById, updateSessionLastSeen } from '@/lib/mentedenta/sessions';

const FALLBACK_REPLY = 'En este momento tuve un problema para responder, pero tu mensaje quedó registrado.';

interface MessageRequestBody {
  session_id?: unknown;
  message?: unknown;
  scenario?: unknown;
  metadata?: unknown;
}

function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return Response.json(body, { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function readJson(request: Request): Promise<MessageRequestBody> {
  const body: unknown = await request.json();

  if (!isRecord(body)) {
    throw new Error('Request body must be a JSON object');
  }

  return body;
}

export const POST: APIRoute = async ({ request }) => {
  let body: MessageRequestBody;

  try {
    body = await readJson(request);
  } catch {
    return jsonResponse({ ok: false, error: 'Invalid JSON body' }, 400);
  }

  if (typeof body.session_id !== 'string' || body.session_id.trim() === '') {
    return jsonResponse({ ok: false, error: 'session_id is required' }, 400);
  }

  if (typeof body.message !== 'string' || body.message.trim() === '') {
    return jsonResponse({ ok: false, error: 'message is required' }, 400);
  }

  if (body.scenario !== undefined && typeof body.scenario !== 'string') {
    return jsonResponse({ ok: false, error: 'scenario must be a string' }, 400);
  }

  if (body.metadata !== undefined && !isRecord(body.metadata)) {
    return jsonResponse({ ok: false, error: 'metadata must be a JSON object' }, 400);
  }

  const sessionId = body.session_id.trim();
  const message = body.message.trim();
  const scenario = body.scenario?.trim() || 'patient_demo';
  const metadata = body.metadata ?? {};
  const sanitizedUserMessage = sanitizeMenteDentaText(message);

  try {
    const session = await getSessionById(sessionId);

    if (!session) {
      return jsonResponse({ ok: false, error: 'Session not found' }, 404);
    }

    const history = await getRecentMessageHistory(sessionId);
    const sanitizedHistory = history.map((historyMessage) => ({
      ...historyMessage,
      content: sanitizeMenteDentaText(historyMessage.content).content,
    }));

    await saveMessage({
      session_id: sessionId,
      role: 'user',
      content: sanitizedUserMessage.content,
      metadata: {
        sanitization: sanitizedUserMessage.metadata,
      },
    });

    await recordEvent({
      session_id: sessionId,
      event_name: 'chat_message_sent',
    });

    let reply: string;

    try {
      const webhookResponse = await callMenteDentaWebhook({
        source: 'dentamenta_web',
        session_id: sessionId,
        message: sanitizedUserMessage.content,
        scenario,
        history: sanitizedHistory,
        metadata,
      });

      reply = webhookResponse.reply;
    } catch (error) {
      console.error('MenteDenta webhook failed', error);

      await recordEvent({
        session_id: sessionId,
        event_name: 'chat_webhook_error',
      });

      reply = FALLBACK_REPLY;
    }

    const sanitizedAssistantReply = sanitizeMenteDentaText(reply);

    await saveMessage({
      session_id: sessionId,
      role: 'assistant',
      content: sanitizedAssistantReply.content,
      metadata: {
        sanitization: sanitizedAssistantReply.metadata,
      },
    });

    await updateSessionLastSeen(sessionId);

    await recordEvent({
      session_id: sessionId,
      event_name: 'chat_message_received',
    });

    return jsonResponse({
      ok: true,
      session_id: sessionId,
      reply: sanitizedAssistantReply.content,
    }, 200);
  } catch (error) {
    console.error('Failed to process MenteDenta message', error);
    return jsonResponse({ ok: false, error: 'Unable to process message' }, 500);
  }
};
