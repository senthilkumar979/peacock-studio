-- Fix PL/pgSQL ambiguity: window_start variable shadowed the table column.
create or replace function public.check_and_increment_rate_limit(
  p_bucket text,
  p_rate_key text,
  p_limit integer,
  p_window_seconds integer default 3600
)
returns boolean
language plpgsql
security definer
set search_path = public
set row_security = off
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
