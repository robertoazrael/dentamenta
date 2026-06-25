# Contrato de trabajo para Codex — MenteDenta / Dentamenta

## Objetivo

Implementar la experiencia comercial Dentamenta dentro del repo dentamenta usando únicamente la arquitectura definida en docs/architecture.

Dentamenta funciona como consultorio ficticio para demostraciones comerciales, pero las tablas MenteDenta son infraestructura productiva de Mentemática y semilla del CRM futuro.

## Prohibido

Codex no debe inventar:

- tablas nuevas no documentadas;
- columnas nuevas no documentadas;
- variables de ambiente nuevas no documentadas;
- rutas públicas nuevas no documentadas;
- webhooks nuevos no documentados;
- lógica alternativa de tokens;
- otro sistema de autenticación;
- otro proveedor de base de datos;
- otro framework frontend;
- dependencias nuevas sin justificación explícita.

## Permitido

Codex puede:

- crear componentes Astro;
- crear páginas Astro;
- reutilizar estilos Tailwind existentes;
- crear helpers TypeScript;
- consumir variables de ambiente ya documentadas;
- consumir webhooks ya documentados;
- leer y escribir en tablas Supabase ya documentadas mediante endpoints server-side.

## Archivos de referencia obligatorios

Antes de programar, Codex debe leer:

- docs/architecture/overview.md
- docs/architecture/database.md
- docs/architecture/frontend.md
- docs/architecture/integrations.md
- docs/architecture/environment.md
- docs/architecture/demo-flow.md
- docs/architecture/endpoints.md
- docs/architecture/n8n-webhook.md
- docs/sql/001_mentedenta_schema.sql

## Reglas de seguridad

- El panel nunca debe mostrar mensajes sin filtrar por session_id.
- El token de acceso al panel nunca debe guardarse en texto plano.
- El token público debe ser de uso limitado.
- Las operaciones sensibles deben pasar por endpoints server-side.
- No exponer service role key al navegador.
- No exponer MENTEDENTA_TOKEN_PEPPER.
- No usar PUBLIC_ para secretos.
- No consultar Supabase directamente desde el navegador para datos sensibles del panel.
- No llamar n8n directamente desde el navegador.

## Regla de compatibilidad

El sitio Dentamenta existente no debe romperse.

La implementación MenteDenta debe aislarse en rutas, tablas y configuración propias.
