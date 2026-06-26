# Demo Dentamenta — Integraciones

## n8n

El chatbot Dentamenta se comunicará con n8n mediante webhook público configurado por variable de ambiente.

## Supabase

Supabase será la fuente de verdad para:

- sesiones demo;
- tokens de acceso;
- mensajes;
- eventos del demo.

## Regla

n8n debe registrar o devolver suficiente información para asociar cada mensaje con `session_id`.
