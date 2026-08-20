-- Edge Function rate limiting (resolve-share, share-preview, sign-screenshots).
-- Idempotent: safe if objects already exist on remote Supabase.

create table if not exists public.edge_rate_limits (
  bucket text not null,
  rate_key text not null,
  window_start timestamptz not null,
  hit_count integer not null default 0,
  primary key (bucket, rate_key, window_start)
);

alter table public.edge_rate_limits enable row level security;

create or replace function public.check_and_increment_rate_limit(
  p_bucket text,
  p_rate_key text,
  p_limit integer,
  p_window_seconds integer default 3600
)
returns boolean
language plpgsql
security definer
set search_path to public
set row_security to off
as $$
declare
  v_window_start timestamptz;
  current_count integer;
begin
  if p_bucket = '' or p_rate_key = '' or p_limit < 1 or p_window_seconds < 1 then
    return false;
  end if;

  v_window_start := to_timestamp(
    floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds
  );

  insert into public.edge_rate_limits (bucket, rate_key, window_start, hit_count)
  values (p_bucket, p_rate_key, v_window_start, 1)
  on conflict (bucket, rate_key, window_start)
  do update set hit_count = public.edge_rate_limits.hit_count + 1
  returning hit_count into current_count;

  return current_count <= p_limit;
end;
$$;

create or replace function public.consume_edge_rate_limit(
  p_bucket text,
  p_rate_key text,
  p_limit integer,
  p_window_seconds integer default 60
)
returns boolean
language plpgsql
security definer
set search_path to public
as $$
begin
  return public.check_and_increment_rate_limit(
    p_bucket,
    p_rate_key,
    p_limit,
    p_window_seconds
  );
end;
$$;

grant execute on function public.consume_edge_rate_limit(text, text, integer, integer) to anon, authenticated, service_role;
