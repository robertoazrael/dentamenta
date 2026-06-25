-- Demo Dentamenta — schema inicial
-- Ejecutar manualmente en Supabase SQL Editor.
-- Este schema asume que la aplicación accede mediante endpoints server-side.
-- No se crean políticas públicas para anon.

create extension if not exists pgcrypto;

create table if not exists public.demo_sessions (
  id uuid primary key default gen_random_uuid(),

  site_slug text not null default 'dentamenta',
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

create table if not exists public.demo_access_tokens (
  id uuid primary key default gen_random_uuid(),

  demo_session_id uuid not null references public.demo_sessions(id) on delete cascade,

  token_hash text not null unique,
  purpose text not null default 'panel_demo'
    check (purpose in ('panel_demo')),

  label text,

  expires_at timestamptz not null default (now() + interval '7 days'),
  used_at timestamptz,
  last_used_at timestamptz,
  use_count integer not null default 0,
  revoked_at timestamptz,

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()
);

create table if not exists public.demo_messages (
  id uuid primary key default gen_random_uuid(),

  demo_session_id uuid not null references public.demo_sessions(id) on delete cascade,

  role text not null
    check (role in ('user', 'assistant', 'system', 'tool')),

  channel text not null default 'web_chat',
  content text not null,

  external_message_id text,
  message_payload jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()
);

create table if not exists public.demo_events (
  id uuid primary key default gen_random_uuid(),

  demo_session_id uuid references public.demo_sessions(id) on delete cascade,

  event_name text not null,
  event_category text not null default 'demo',
  route_path text,
  value_numeric numeric,

  metadata jsonb not null default '{}'::jsonb,

  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_demo_sessions_site_status
  on public.demo_sessions(site_slug, status);

create index if not exists idx_demo_sessions_last_seen
  on public.demo_sessions(last_seen_at desc);

create index if not exists idx_demo_access_tokens_session
  on public.demo_access_tokens(demo_session_id);

create index if not exists idx_demo_access_tokens_expires
  on public.demo_access_tokens(expires_at);

create index if not exists idx_demo_messages_session_created
  on public.demo_messages(demo_session_id, created_at asc);

create index if not exists idx_demo_events_session_occurred
  on public.demo_events(demo_session_id, occurred_at desc);

alter table public.demo_sessions enable row level security;
alter table public.demo_access_tokens enable row level security;
alter table public.demo_messages enable row level security;
alter table public.demo_events enable row level security;

comment on table public.demo_sessions is
  'Sesiones comerciales del demo Dentamenta. Cada prospecto/paciente demo debe tener una sesión.';

comment on table public.demo_access_tokens is
  'Tokens hasheados para acceso limitado al panel demo. Nunca guardar token plano.';

comment on table public.demo_messages is
  'Mensajes del chatbot Dentamenta asociados obligatoriamente a demo_session_id.';

comment on table public.demo_events is
  'Eventos de comportamiento del demo Dentamenta: apertura de chat, envío, panel visto, descarga, etc.';
