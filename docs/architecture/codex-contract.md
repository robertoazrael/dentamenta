# Contrato de trabajo para Codex — Demo Dentamenta

## Objetivo

Implementar el demo comercial Dentamenta dentro del repo `mentematica.com` usando únicamente la arquitectura definida en `docs/architecture/`.

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
- extraer partes reutilizables del panel actual;
- crear helpers TypeScript;
- consumir variables de ambiente ya documentadas;
- consumir webhooks ya documentados;
- leer y escribir en tablas Supabase ya documentadas.

## Archivos de referencia obligatorios

Antes de programar, Codex debe leer:

- `docs/architecture/overview.md`
- `docs/architecture/database.md`
- `docs/architecture/frontend.md`
- `docs/architecture/integrations.md`
- `docs/architecture/environment.md`
- `docs/architecture/demo-flow.md`
- `docs/sql/001_dentamenta_demo_schema.sql`

## Reglas de seguridad

- El panel demo nunca debe mostrar mensajes sin filtrar por `demo_session_id`.
- El token de acceso al panel demo nunca debe guardar secretos en texto plano.
- El token público debe ser de uso limitado.
- Las operaciones sensibles deben pasar por endpoints server-side cuando sea necesario.
- No exponer service role key al navegador.
- No usar `PUBLIC_` para secretos.

## Regla de compatibilidad

El panel existente de Mentemática no debe romperse.

El demo Dentamenta debe aislarse en rutas, tablas y configuración propias.
