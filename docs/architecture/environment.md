# Demo Dentamenta — Variables de ambiente

## Regla principal

El navegador no debe hablar directamente con Supabase ni con webhooks sensibles de n8n.

El frontend debe llamar endpoints internos del sitio, por ejemplo:

- `/api/mentedenta/session`
- `/api/mentedenta/message`
- `/api/panel-access`

Los endpoints server-side son responsables de hablar con Supabase y n8n.

## Variables requeridas

### `SUPABASE_URL`

URL del proyecto Supabase.

Uso:

- server-side
- endpoints Astro
- lectura/escritura de tablas demo

No debe llevar prefijo `PUBLIC_`.

### `SUPABASE_SERVICE_ROLE_KEY`

Llave privada de Supabase para operaciones server-side.

Uso:

- crear sesiones demo;
- guardar mensajes;
- validar tokens;
- leer mensajes para el panel demo.

Nunca debe exponerse al navegador.

### `MENTEDENTA_WEBHOOK_URL`

Webhook de n8n para enviar mensajes del chatbot Dentamenta.

Uso:

- llamado desde `/api/mentedenta/message`.

No debe llevar prefijo `PUBLIC_`.

### `MENTEDENTA_PANEL_BASE_URL`

URL base del panel demo.

Valor esperado:

`https://dentamenta.mentematica.com/panel`

Uso:

- construir links de acceso al panel demo.

### `MENTEDENTA_TOKEN_PEPPER`

Secreto privado usado para hashear tokens de acceso al panel demo.

Uso:

- generar `token_hash`;
- validar tokens recibidos en URL.

Nunca debe exponerse al navegador.

## Variables opcionales

### `N8N_BASE_URL`

URL base privada de n8n para integraciones server-side.

### `N8N_API_MASTER_KEY`

Llave privada para llamadas controladas a n8n.

## Prohibido

Codex no debe crear nuevas variables de ambiente sin actualizar este documento y `.env.example`.
