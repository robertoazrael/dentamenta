# MenteDenta — Contrato de endpoints

## Principio

El navegador no debe escribir directamente en Supabase ni llamar directamente a n8n.

El frontend debe llamar endpoints internos del sitio Astro.

Los endpoints server-side usan:

- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- MENTEDENTA_WEBHOOK_URL
- MENTEDENTA_TOKEN_PEPPER

## Endpoints previstos

### POST /api/mentedenta/session

Crea una sesión MenteDenta.

Request esperado:

    {
      "source": "web",
      "scenario": "general",
      "metadata": {}
    }

Response esperado:

    {
      "ok": true,
      "session_id": "uuid"
    }

Tabla usada:

- mentedenta_sessions

Eventos sugeridos:

- mentedenta_session_created

Reglas:

- Crear una sesión con status active.
- Registrar source.
- Registrar scenario cuando exista.
- Guardar metadata como JSON.
- Nunca exponer secretos al navegador.

---

### POST /api/mentedenta/message

Recibe un mensaje del visitante, lo guarda, llama a n8n y guarda la respuesta del asistente.

Request esperado:

    {
      "session_id": "uuid",
      "message": "Texto del usuario"
    }

Response esperado:

    {
      "ok": true,
      "session_id": "uuid",
      "reply": "Respuesta del asistente",
      "panel_url": "https://dentamenta.mentematica.com/panel?token=..."
    }

panel_url puede omitirse hasta que exista un flujo de cierre o generación de acceso al panel.

Tablas usadas:

- mentedenta_sessions
- mentedenta_messages
- mentedenta_events
- mentedenta_access_tokens, sólo si se genera acceso al panel

Reglas:

- Siempre validar que session_id exista.
- Siempre guardar el mensaje del usuario con role igual a user.
- Siempre guardar la respuesta del asistente con role igual a assistant.
- Siempre actualizar last_seen_at en mentedenta_sessions.
- Nunca aceptar mensajes vacíos.
- Nunca devolver mensajes de otra sesión.

---

### POST /api/mentedenta/panel-access

Genera un token de acceso al panel para una sesión existente.

Request esperado:

    {
      "session_id": "uuid"
    }

Response esperado:

    {
      "ok": true,
      "panel_url": "https://dentamenta.mentematica.com/panel?token=..."
    }

Tabla usada:

- mentedenta_access_tokens

Reglas:

- El token plano sólo se entrega en la respuesta.
- En Supabase sólo se guarda token_hash.
- El token debe expirar.
- El token debe estar asociado a session_id.
- El token debe generarse con suficiente entropía.
- El token_hash debe calcularse usando MENTEDENTA_TOKEN_PEPPER.

---

### GET /api/mentedenta/panel-data?token=...

Valida el token y devuelve los datos que el panel necesita mostrar.

Response esperado:

    {
      "ok": true,
      "session": {
        "id": "uuid",
        "status": "active",
        "started_at": "timestamp",
        "last_seen_at": "timestamp"
      },
      "messages": [
        {
          "id": "uuid",
          "role": "user",
          "content": "Texto",
          "created_at": "timestamp"
        }
      ],
      "events": []
    }

Tablas usadas:

- mentedenta_access_tokens
- mentedenta_sessions
- mentedenta_messages
- mentedenta_events

Reglas críticas:

- Validar token contra token_hash.
- Rechazar tokens expirados.
- Rechazar tokens revocados.
- Incrementar use_count.
- Actualizar used_at si es el primer uso.
- Actualizar last_used_at.
- Filtrar mensajes exclusivamente por session_id.
- Nunca devolver token_hash.
- Nunca devolver datos de otra sesión.

## Página prevista

### GET /panel?token=...

Página Astro del panel MenteDenta.

Debe cargar datos llamando a:

/api/mentedenta/panel-data?token=...

No debe consultar Supabase directamente desde el navegador.

## Prohibido para Codex

Codex no debe:

- crear rutas diferentes sin actualizar este documento;
- usar prefijos temporales en tablas;
- usar nombres ambiguos de sesión;
- exponer SUPABASE_SERVICE_ROLE_KEY;
- exponer MENTEDENTA_TOKEN_PEPPER;
- guardar tokens planos;
- leer mensajes sin filtrar por session_id;
- llamar n8n directamente desde el navegador.
