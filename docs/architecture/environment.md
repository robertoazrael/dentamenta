# Demo Dentamenta — Variables de ambiente

## Variables públicas permitidas

Estas variables pueden estar expuestas al navegador:

- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`
- `PUBLIC_DENTAMENTA_DEMO_WEBHOOK_URL`
- `PUBLIC_DEMO_PANEL_BASE_URL`

## Variables privadas

Estas variables NO deben llevar prefijo `PUBLIC_`:

- `SUPABASE_SERVICE_ROLE_KEY`
- `N8N_BASE_URL`
- `N8N_API_MASTER_KEY`

## Regla

Codex no debe crear variables nuevas sin actualizar este documento.
