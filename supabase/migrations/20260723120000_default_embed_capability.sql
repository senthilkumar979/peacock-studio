-- Enable embed by default for members and backfill existing rows.
-- Prior default_member_capabilities() set embed:false; growth default is now true.
-- Workspace admins can still revoke Embed via the members UI after this.

create or replace function public.default_member_capabilities()
returns jsonb
language sql
immutable
as $$
  select jsonb_build_object(
    'create', true,
    'edit', true,
    'delete', false,
    'share', true,
    'export', true,
    'embed', true
  );
$$;

-- Backfill: anyone still on embed:false (admins or members) gets embed enabled.
update public.organization_members
set
  capabilities = jsonb_set(coalesce(capabilities, '{}'::jsonb), '{embed}', 'true'::jsonb, true),
  updated_at = now()
where coalesce((capabilities ->> 'embed')::boolean, false) = false;
