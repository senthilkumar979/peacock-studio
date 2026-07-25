-- Store Clerk first/last name on user_profiles for member roster display.

alter table public.user_profiles
  add column if not exists first_name text,
  add column if not exists last_name text;

-- Best-effort backfill from existing display_name (first token / remainder).
update public.user_profiles
set
  first_name = nullif(trim(split_part(display_name, ' ', 1)), ''),
  last_name = nullif(
    trim(substr(display_name, length(split_part(display_name, ' ', 1)) + 2)),
    ''
  )
where (first_name is null or first_name = '')
  and display_name is not null
  and position('@' in display_name) = 0
  and display_name !~ '^\s*$';
