-- MenteDenta — normalización de purpose en tokens de acceso
-- Ejecutar manualmente en Supabase SQL Editor.
--
-- Objetivo:
-- - Migrar valores antiguos `panel_access` a `panel`.
-- - Permitir únicamente `panel` y `demo_entry`.
-- - Dejar `panel` como valor default.
--
-- Seguridad:
-- No guarda tokens planos.
-- No modifica token_hash.
-- No cambia la relación session_id.

do $$
declare
  constraint_record record;
begin
  for constraint_record in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public'
      and rel.relname = 'mentedenta_access_tokens'
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%purpose%'
  loop
    execute format(
      'alter table public.mentedenta_access_tokens drop constraint if exists %I',
      constraint_record.conname
    );
  end loop;
end $$;

update public.mentedenta_access_tokens
set purpose = 'panel'
where purpose = 'panel_access';

alter table public.mentedenta_access_tokens
alter column purpose set default 'panel';

alter table public.mentedenta_access_tokens
drop constraint if exists mentedenta_access_tokens_purpose_check;

alter table public.mentedenta_access_tokens
add constraint mentedenta_access_tokens_purpose_check
check (purpose in ('panel', 'demo_entry'));
