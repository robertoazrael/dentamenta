# MenteDenta — Contrato de webhook n8n

## Principio

El navegador no llama directamente a n8n.

El flujo correcto es:

Visitante -> Astro endpoint -> n8n webhook -> Astro endpoint -> Supabase/frontend

El endpoint Astro responsable será:

POST /api/mentedenta/message

Ese endpoint llamará a:

MENTEDENTA_WEBHOOK_URL

## Variable requerida

MENTEDENTA_WEBHOOK_URL

Debe apuntar al webhook de n8n encargado de responder mensajes del chatbot MenteDenta.

No debe exponerse al navegador.

No debe usar prefijo PUBLIC_.

## Request enviado desde Astro a n8n

El endpoint POST /api/mentedenta/message enviará a n8n un JSON con esta forma:

    {
      "source": "mentedenta-web",
      "session_id": "uuid",
      "message": "Texto del usuario",
      "scenario": "general",
      "history": [
        {
          "role": "user",
          "content": "Mensaje previo"
        },
        {
          "role": "assistant",
          "content": "Respuesta previa"
        }
      ],
      "metadata": {
        "site": "dentamenta.mentematica.com"
      }
    }

## Campos requeridos

- source
- session_id
- message

## Campos opcionales

- scenario
- history
- metadata

## Response esperado desde n8n

n8n debe responder JSON.

Forma mínima:

    {
      "ok": true,
      "reply": "Respuesta del asistente"
    }

Forma recomendada:

    {
      "ok": true,
      "reply": "Respuesta del asistente",
      "intent": "appointment_request",
      "confidence": 0.82,
      "suggested_actions": [
        "offer_panel_access"
      ],
      "metadata": {
        "summary": "El usuario preguntó por limpieza dental y disponibilidad."
      }
    }

## Intents sugeridos

- general_question
- pricing_question
- appointment_request
- appointment_cancel
- location_question
- emergency_question
- human_contact_request
- unknown

## suggested_actions sugeridas

- offer_panel_access
- ask_for_name
- ask_for_phone
- ask_for_email
- suggest_appointment
- escalate_to_human
- no_action

## Reglas de respuesta

n8n debe:

- devolver siempre JSON válido;
- devolver siempre un campo reply cuando ok sea true;
- no devolver HTML;
- no devolver secretos;
- no inventar session_id;
- no escribir directamente en Supabase en esta etapa, salvo que se documente explícitamente después.

## Manejo de errores

Si n8n falla, debe responder preferentemente:

    {
      "ok": false,
      "error": "Descripción breve del error"
    }

Si n8n no responde o devuelve error, Astro debe responder al usuario con un mensaje amable de fallback y registrar el evento en mentedenta_events.

## Responsabilidades de Astro

El endpoint Astro debe:

- validar session_id;
- guardar el mensaje del usuario en mentedenta_messages;
- llamar a n8n;
- guardar la respuesta del asistente en mentedenta_messages;
- actualizar last_seen_at en mentedenta_sessions;
- registrar eventos relevantes en mentedenta_events;
- devolver reply al frontend.

## Responsabilidades de n8n

n8n debe:

- recibir el mensaje;
- generar la respuesta del asistente;
- clasificar intent cuando sea posible;
- sugerir acciones cuando aplique;
- responder rápido y con JSON válido.

## Prohibido

Codex no debe:

- llamar n8n desde el navegador;
- exponer MENTEDENTA_WEBHOOK_URL;
- hacer que n8n sea la única fuente de verdad de mensajes;
- omitir el guardado en mentedenta_messages;
- cambiar la forma del request/response sin actualizar este documento.
