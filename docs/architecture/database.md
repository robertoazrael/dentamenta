# Demo Dentamenta — Base de datos

## Archivo SQL fuente

La definición ejecutable vive en:

`docs/sql/001_dentamenta_demo_schema.sql`

Ese archivo es la fuente de verdad para Supabase.

## Tablas

### `demo_sessions`

Representa una experiencia demo individual.

Cada prospecto que conversa con el chatbot debe tener una sesión.

Campo principal:

- `id`: este valor es el `demo_session_id`.

Regla:

Todo mensaje y todo acceso al panel demo deben estar asociados a una sesión.

### `demo_access_tokens`

Guarda tokens de acceso al panel demo.

Regla crítica:

Nunca guardar el token plano.

Sólo se guarda `token_hash`.

El token plano sólo se entrega una vez al usuario como parte del link:

`/demo/panel?token=...`

### `demo_messages`

Guarda mensajes del chatbot.

Regla crítica:

Todo mensaje debe tener `demo_session_id`.

Roles válidos:

- `user`
- `assistant`
- `system`
- `tool`

### `demo_events`

Guarda eventos de uso del demo.

Ejemplos:

- `demo_session_created`
- `chat_opened`
- `chat_message_sent`
- `chat_message_received`
- `panel_opened`
- `panel_token_invalid`
- `panel_csv_downloaded`


## Trigger de actualización

La tabla `demo_sessions` tiene columna `updated_at`.

El archivo SQL crea la función:

`public.set_updated_at()`

y el trigger:

`trg_demo_sessions_updated_at`

para actualizar `updated_at` automáticamente en cada cambio de la sesión.

## Seguridad

Las tablas tienen RLS habilitado.

No se crean políticas públicas para `anon`.

El acceso debe ocurrir desde endpoints server-side usando `SUPABASE_SERVICE_ROLE_KEY`.

## Regla para Codex

Codex no debe:

- consultar mensajes sin filtrar por `demo_session_id`;
- leer tokens planos;
- guardar tokens planos;
- crear políticas públicas amplias;
- usar Supabase directamente desde el navegador para leer mensajes del panel.
