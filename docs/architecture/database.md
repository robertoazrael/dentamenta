# Demo Dentamenta — Base de datos

## Tablas previstas

- `demo_sessions`
- `demo_access_tokens`
- `demo_events`
- `demo_messages`

## Regla principal

Todo mensaje del chatbot debe quedar asociado a un `demo_session_id`.

Todo panel demo debe filtrar por `demo_session_id`.

Nadie debe ver mensajes de otra sesión.

## Decisión pendiente

Definir SQL exacto en:

`docs/sql/001_dentamenta_demo_schema.sql`
