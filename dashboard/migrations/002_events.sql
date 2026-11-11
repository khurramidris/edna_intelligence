-- Apply after schema.sql. Functions are backend-only; the Worker validates
-- event shape and consent before invoking ingest. No public DB access.
create table if not exists public.edna_events (
  id text primary key,
  visitor_id text not null,
  name text not null,
  occurred_at timestamptz not null,
  product_id text,
  constraint edna_event_names check (name in ('page_viewed','product_viewed','product_added_to_cart','product_removed_from_cart','cart_viewed','checkout_started','checkout_completed','search_submitted','collection_viewed'))
);
create index if not exists edna_events_time on public.edna_events(occurred_at);
create index if not exists edna_events_product_time on public.edna_events(product_id,occurred_at);
alter table public.edna_events enable row level security;
revoke all on public.edna_events from anon, authenticated;
grant select, insert, delete on public.edna_events to service_role;

create or replace function public.edna_ingest_events(records jsonb) returns integer
language plpgsql security invoker set search_path = public as $$
declare inserted integer;
begin
  if jsonb_typeof(records) <> 'array' or jsonb_array_length(records) not between 1 and 50 then
    raise exception 'Invalid event batch';
  end if;
  if exists (select 1 from jsonb_array_elements(records) r where r->>'analyticsConsent' is distinct from 'true') then
    raise exception 'Consent required';
  end if;
  insert into edna_events(id, visitor_id, name, occurred_at, product_id)
  select r->>'id', r->>'visitorId', r->>'name', (r->>'at')::timestamptz, r->>'productId'
  from jsonb_array_elements(records) r
  on conflict(id) do nothing;
  get diagnostics inserted = row_count;
  return inserted;
end $$;

create or replace function public.edna_event_summary() returns jsonb
language sql stable security invoker set search_path = public as $$
with recent as (select * from edna_events where occurred_at >= now() - interval '30 days'),
products as (select product_id as id, count(*) filter(where name='product_viewed') as views,
 count(*) filter(where name='product_added_to_cart') as adds from recent where product_id is not null group by product_id),
days as (select to_char(occurred_at at time zone 'Asia/Karachi','YYYY-MM-DD') as date,count(*) as events from recent group by 1)
select jsonb_build_object(
 'eventCount',count(*), 'observedVisitors',count(distinct visitor_id),
 'productViews',count(*) filter(where name='product_viewed'),
 'cartAdds',count(*) filter(where name='product_added_to_cart'),
 'checkoutStarts',count(*) filter(where name='checkout_started'),
 'checkoutCompletions',count(*) filter(where name='checkout_completed'),
 'products',coalesce((select jsonb_agg(p order by views desc) from (select * from products order by views desc limit 100) p),'[]'::jsonb),
 'daily',coalesce((select jsonb_agg(d order by date) from days d),'[]'::jsonb)
) from recent;
$$;

create or replace function public.edna_prune_events() returns integer
language plpgsql security invoker set search_path = public as $$
declare removed integer;
begin
 delete from edna_events where occurred_at < now() - interval '30 days';
 get diagnostics removed = row_count;
 return removed;
end $$;
revoke all on function public.edna_ingest_events(jsonb) from public, anon, authenticated;
revoke all on function public.edna_event_summary() from public, anon, authenticated;
revoke all on function public.edna_prune_events() from public, anon, authenticated;
grant execute on function public.edna_ingest_events(jsonb) to service_role;
grant execute on function public.edna_event_summary() to service_role;
grant execute on function public.edna_prune_events() to service_role;
