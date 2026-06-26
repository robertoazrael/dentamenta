-- MenteDenta — schema inicial
-- Ejecutar manualmente en Supabase SQL Editor.
--
-- Principio:
-- Todo mensaje del chatbot debe quedar asociado a session_id.
-- Todo panel debe filtrar por session_id.
-- Nadie debe ver mensajes de otra sesión.
--
-- Contexto:
-- Dentamenta es un consultorio ficticio usado para demostraciones comerciales,
-- pero estas tablas son parte productiva de la infraestructura Mentemática.
-- Por eso se usa el prefijo `mentedenta_` y no un prefijo temporal.
--
-- Seguridad:
-- El frontend NO consulta estas tablas directamente.
-- La app usa endpoints server-side con SUPABASE_SERVICE_ROLE_KEY.
-- RLS queda habilitado y sin políticas públicas amplias.

create extension if not exists pgcrypto;

-- ============================================================
-- Función genérica para updated_at
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- Sesiones MenteDenta
-- ============================================================

create table if not exists public.mentedenta_sessions (
  id uuid primary key default gen_random_uuid(),

  site_slug text not null default 'mentedenta',

  status text not null default 'active'
    check (status in ('active', 'completed', 'expired', 'archived')),

  patient_alias text,
  prospect_name text,
  prospect_email text,
  prospect_phone text,

  scenario text,
  source text not null default 'web',

  started_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  completed_at timestamptz,
  expires_at timestamptz not null default (now() + interval '7 days'),

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_mentedenta_sessions_updated_at on public.mentedenta_sessions;

create trigger trg_mentedenta_sessions_updated_at
before update on public.mentedenta_sessions
for each row
execute function public.set_updated_at();

-- ============================================================
-- Tokens de acceso al panel
-- ============================================================

create table if not exists public.mentedenta_access_tokens (
  id uuid primary key default gen_random_uuid(),

  session_id uuid not null
    references public.mentedenta_sessions(id)
    on delete cascade,

  token_hash text not null unique,

  purpose text not null default 'panel_access'
    check (purpose in ('panel_access')),

  label text,

  expires_at timestamptz not null default (now() + interval '7 days'),
  used_at timestamptz,
  last_used_at timestamptz,
  use_count integer not null default 0 check (use_count >= 0),
  revoked_at timestamptz,

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()
);

-- ============================================================
-- Mensajes del chatbot
-- ============================================================

create table if not exists public.mentedenta_messages (
  id uuid primary key default gen_random_uuid(),

  session_id uuid not null
    references public.mentedenta_sessions(id)
    on delete cascade,

  role text not null
    check (role in ('user', 'assistant', 'system', 'tool')),

  channel text not null default 'web_chat',
  content text not null,

  external_message_id text,

  message_payload jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()
);

-- ============================================================
-- Eventos
-- ============================================================

create table if not exists public.mentedenta_events (
  id uuid primary key default gen_random_uuid(),

  session_id uuid
    references public.mentedenta_sessions(id)
    on delete cascade,

  event_name text not null,
  event_category text not null default 'mentedenta',
  route_path text,
  value_numeric numeric,

  metadata jsonb not null default '{}'::jsonb,

  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- ============================================================
-- Índices
-- ============================================================

create index if not exists idx_mentedenta_sessions_site_status
  on public.mentedenta_sessions(site_slug, status);

create index if not exists idx_mentedenta_sessions_last_seen
  on public.mentedenta_sessions(last_seen_at desc);

create index if not exists idx_mentedenta_sessions_expires
  on public.mentedenta_sessions(expires_at);

create index if not exists idx_mentedenta_access_tokens_session
  on public.mentedenta_access_tokens(session_id);

create index if not exists idx_mentedenta_access_tokens_hash
  on public.mentedenta_access_tokens(token_hash);

create index if not exists idx_mentedenta_access_tokens_expires
  on public.mentedenta_access_tokens(expires_at);

create index if not exists idx_mentedenta_messages_session_created
  on public.mentedenta_messages(session_id, created_at asc);

create index if not exists idx_mentedenta_messages_role
  on public.mentedenta_messages(role);

create index if not exists idx_mentedenta_events_session_occurred
  on public.mentedenta_events(session_id, occurred_at desc);

create index if not exists idx_mentedenta_events_name_occurred
  on public.mentedenta_events(event_name, occurred_at desc);

-- ============================================================
-- RLS
-- ============================================================

alter table public.mentedenta_sessions enable row level security;
alter table public.mentedenta_access_tokens enable row level security;
alter table public.mentedenta_messages enable row level security;
alter table public.mentedenta_events enable row level security;

-- Importante:
-- No se crean políticas para anon/authenticated en esta etapa.
-- La aplicación debe acceder desde endpoints server-side usando service role.
-- Codex no debe agregar políticas públicas sin actualizar docs/architecture/database.md.

-- ============================================================
-- Comentarios
-- ============================================================

comment on table public.mentedenta_sessions is
  'Sesiones productivas de MenteDenta/Dentamenta para experiencias comerciales, seguimiento y futura base CRM.';

comment on column public.mentedenta_sessions.id is
  'Identificador principal de la sesión. Este valor es session_id para chatbot, panel y eventos.';

comment on table public.mentedenta_access_tokens is
  'Tokens hasheados para acceso limitado al panel. Nunca guardar token plano.';

comment on column public.mentedenta_access_tokens.token_hash is
  'Hash del token de acceso. El token plano sólo se entrega al usuario una vez en el link del panel.';

comment on table public.mentedenta_messages is
  'Mensajes del chatbot MenteDenta asociados obligatoriamente a session_id.';

comment on column public.mentedenta_messages.session_id is
  'Llave obligatoria que aísla mensajes por sesión. El panel siempre debe filtrar por esta columna.';

comment on table public.mentedenta_events is
  'Eventos de comportamiento de MenteDenta: apertura de chat, envío, panel visto, descarga, etc.';
