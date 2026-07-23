-- Dedicated embed share links (unique token per resource) + channel column.

alter table public.share_links
  add column if not exists channel text not null default 'link';

alter table public.share_links
  drop constraint if exists share_links_channel_check;

alter table public.share_links
  add constraint share_links_channel_check
  check (channel in ('link', 'embed'));

-- Embeds are always readonly presentation links.
update public.share_links
set channel = 'link'
where channel is null or btrim(channel) = '';

drop index if exists public.share_links_active_resource_uidx;

create unique index share_links_active_resource_uidx
  on public.share_links (organization_id, resource_type, resource_id, access_mode, channel)
  where revoked_at is null;

-- Include channel in public resolve payload for clients that care.
create or replace function public.resolve_share_link(p_token text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  link public.share_links;
begin
  link := public.get_active_share_link(p_token);
  if link.id is null then
    return null;
  end if;

  return jsonb_build_object(
    'token', link.token,
    'organizationId', link.organization_id,
    'resourceType', link.resource_type,
    'resourceId', link.resource_id,
    'accessMode', link.access_mode,
    'channel', link.channel,
    'settings', coalesce(link.settings, '{}'::jsonb)
  );
end;
$$;

grant execute on function public.resolve_share_link(text) to anon, authenticated;
