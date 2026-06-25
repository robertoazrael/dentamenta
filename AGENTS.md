# AGENTS.md — Dentamenta / MenteDenta

## Contexto del proyecto

Este repo es un proyecto Astro + Tailwind llamado `dentamenta`.

El sitio es un demo comercial de Mentemática para mostrar cómo funcionaría un chatbot dental y un panel de consultorio.

Flujo esperado:

1. Un visitante entra al sitio como si fuera paciente.
2. El sitio crea una sesión.
3. El visitante conversa con el chatbot.
4. Cada mensaje queda guardado asociado a `session_id`.
5. El sitio llama a un webhook de n8n para obtener la respuesta del asistente.
6. La respuesta también se guarda asociada al mismo `session_id`.
7. El visitante puede abrir un panel con token.
8. El panel muestra sólo los mensajes de esa sesión.

## Regla central de seguridad

* Todo mensaje debe quedar asociado a `session_id`.
* Todo panel debe filtrar por `session_id`.
* Nadie debe ver mensajes de otra sesión.
* El navegador nunca debe leer datos sensibles directamente desde Supabase.
* El navegador nunca debe llamar directamente a n8n.

## Fuente de verdad

Antes de implementar cambios relacionados con MenteDenta, revisar:

* `docs/architecture/codex-contract.md`
* `docs/architecture/overview.md`
* `docs/architecture/database.md`
* `docs/architecture/environment.md`
* `docs/architecture/endpoints.md`
* `docs/architecture/n8n-webhook.md`
* `docs/sql/001_mentedenta_schema.sql`

## Stack

* Astro
* Tailwind
* Supabase/Postgres
* Netlify adapter
* n8n como webhook conversacional

## Reglas de implementación

* No inventar tablas.
* No inventar columnas.
* No inventar variables de ambiente.
* No usar variables `PUBLIC_` para secretos.
* No exponer `SUPABASE_SERVICE_ROLE_KEY`.
* No exponer `MENTEDENTA_TOKEN_PEPPER`.
* No guardar tokens planos.
* No consultar mensajes sin filtrar por `session_id`.
* No usar memoria de n8n como fuente oficial de mensajes.
* La fuente oficial de mensajes es `mentedenta_messages`.
* n8n sólo debe responder al webhook; Astro/Supabase administran sesiones, mensajes, tokens y panel.

## Git

Codex no debe hacer operaciones de git.

No hacer:

* `git checkout`
* `git switch`
* `git commit`
* `git push`
* `git pull`
* `git merge`
* crear ramas

El usuario maneja git manualmente después de revisar y probar cada iteración.

## Estilo de trabajo

* Hacer cambios pequeños.
* Respetar la arquitectura existente.
* No implementar más de lo pedido en cada iteración.
* Ejecutar `pnpm build` cuando se modifique código TypeScript, Astro o configuración del proyecto.
* Reportar archivos modificados y resultado del build.
