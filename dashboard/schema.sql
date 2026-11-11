-- Backend-only storage. No browser key has access to business data.
create table if not exists public.edna_state (
  id text primary key check (id = 'edna'),
  revision bigint not null default 0,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.edna_state enable row level security;
revoke all on public.edna_state from anon, authenticated;
grant select, insert, update on public.edna_state to service_role;
