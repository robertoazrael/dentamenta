-- MenteDenta — tokens de handoff comercial hacia Mentemática
-- Ejecutar manualmente en Supabase SQL Editor.
--
-- Objetivo:
-- - Permitir tokens con purpose `handoff`.
-- - Mantener `panel` y `demo_entry`.
-- - No guardar tokens planos.
-- - No modificar token_hash ni session_id.

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
check (purpose in ('panel', 'demo_entry', 'handoff'));
